package com.lumine.server.auth

import com.lumine.server.user.AuthProvider
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestTemplate
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.util.UriComponentsBuilder

data class VerifiedProviderUser(
    val providerUserId: String,
    val displayName: String?
)

interface ProviderTokenVerifier {
    fun verify(provider: AuthProvider, request: NativeLoginExchangeRequest): VerifiedProviderUser
}

@Component
class DelegatingProviderTokenVerifier(
    private val googleProviderTokenVerifier: GoogleProviderTokenVerifier,
    private val kakaoProviderTokenVerifier: KakaoProviderTokenVerifier
) : ProviderTokenVerifier {
    override fun verify(provider: AuthProvider, request: NativeLoginExchangeRequest): VerifiedProviderUser =
        when (provider) {
            AuthProvider.GOOGLE -> googleProviderTokenVerifier.verify(request)
            AuthProvider.KAKAO -> kakaoProviderTokenVerifier.verify(request)
        }
}

@Component
class GoogleProviderTokenVerifier(
    private val authProperties: AuthProperties,
    @Qualifier("authRestTemplate") private val restTemplate: RestTemplate
) {
    fun verify(request: NativeLoginExchangeRequest): VerifiedProviderUser {
        val idToken = request.idToken?.trim().orEmpty()
        if (idToken.isBlank()) {
            throw unauthorized("Google id token is required.")
        }

        val acceptedClientIds = authProperties.google.acceptedClientIds()
        if (acceptedClientIds.isEmpty()) {
            throw misconfigured("Google client id is not configured.")
        }

        val tokenInfo = getTokenInfo(idToken)
        val providerUserId = tokenInfo["sub"]?.toString()?.takeIf { it.isNotBlank() }
            ?: throw unauthorized("Google id token does not contain subject.")
        val audience = tokenInfo["aud"]?.toString()?.takeIf { it.isNotBlank() }
            ?: throw unauthorized("Google id token does not contain audience.")

        if (audience !in acceptedClientIds) {
            throw unauthorized("Google id token audience is not allowed.")
        }

        return VerifiedProviderUser(
            providerUserId = providerUserId,
            displayName = tokenInfo["name"]?.toString()?.takeIf { it.isNotBlank() }
        )
    }

    private fun getTokenInfo(idToken: String): Map<String, Any> {
        val uri = UriComponentsBuilder.fromUriString(authProperties.google.tokenInfoUrl)
            .queryParam("id_token", idToken)
            .build()
            .toUri()

        return try {
            restTemplate.getForObject(uri, Map::class.java)?.toStringAnyMap()
                ?: throw unauthorized("Google id token verification failed.")
        } catch (error: RestClientException) {
            throw unauthorized("Google id token verification failed.")
        }
    }
}

@Component
class KakaoProviderTokenVerifier(
    private val authProperties: AuthProperties,
    @Qualifier("authRestTemplate") private val restTemplate: RestTemplate
) {
    fun verify(request: NativeLoginExchangeRequest): VerifiedProviderUser {
        val accessToken = request.accessToken?.trim().orEmpty()
        if (accessToken.isBlank()) {
            throw unauthorized("Kakao access token is required.")
        }

        val acceptedAppIds = authProperties.kakao.acceptedAppIds()
        if (acceptedAppIds.isEmpty()) {
            throw misconfigured("Kakao app id is not configured.")
        }

        val tokenInfo = getTokenInfo(accessToken)
        val providerUserId = tokenInfo.readLong("id")?.toString()
            ?: throw unauthorized("Kakao access token does not contain user id.")
        val appId = tokenInfo.readLong("app_id") ?: tokenInfo.readLong("appId")
            ?: throw unauthorized("Kakao access token does not contain app id.")

        if (appId !in acceptedAppIds) {
            throw unauthorized("Kakao access token app id is not allowed.")
        }

        val userInfo = getUserInfo(accessToken)
        val userInfoId = userInfo.readLong("id")?.toString()
        if (userInfoId != null && userInfoId != providerUserId) {
            throw unauthorized("Kakao user info does not match token info.")
        }

        return VerifiedProviderUser(
            providerUserId = providerUserId,
            displayName = userInfo.extractKakaoDisplayName()
        )
    }

    private fun getTokenInfo(accessToken: String): Map<String, Any> =
        exchangeKakaoGet(authProperties.kakao.tokenInfoUrl, accessToken)

    private fun getUserInfo(accessToken: String): Map<String, Any> =
        runCatching { exchangeKakaoGet(authProperties.kakao.userInfoUrl, accessToken) }.getOrDefault(emptyMap())

    private fun exchangeKakaoGet(url: String, accessToken: String): Map<String, Any> {
        val headers = HttpHeaders().apply {
            setBearerAuth(accessToken)
        }

        return try {
            restTemplate.exchange(
                url,
                HttpMethod.GET,
                HttpEntity<Unit>(headers),
                Map::class.java
            ).body?.toStringAnyMap()
                ?: throw unauthorized("Kakao token verification failed.")
        } catch (error: RestClientException) {
            throw unauthorized("Kakao token verification failed.")
        }
    }
}

private fun Map<*, *>.toStringAnyMap(): Map<String, Any> =
    entries.mapNotNull { (key, value) ->
        val stringKey = key as? String ?: return@mapNotNull null
        value?.let { stringKey to it }
    }.toMap()

private fun Map<String, Any>.readLong(key: String): Long? =
    when (val value = this[key]) {
        is Number -> value.toLong()
        is String -> value.toLongOrNull()
        else -> null
    }

private fun Map<String, Any>.extractKakaoDisplayName(): String? {
    val properties = this["properties"] as? Map<*, *>
    val kakaoAccount = this["kakao_account"] as? Map<*, *>
    val accountProfile = kakaoAccount?.get("profile") as? Map<*, *>

    return listOf(
        accountProfile?.get("nickname"),
        properties?.get("nickname"),
        kakaoAccount?.get("name")
    ).firstNotNullOfOrNull { value ->
        value?.toString()?.trim()?.takeIf { it.isNotBlank() }
    }
}

private fun unauthorized(message: String): ResponseStatusException =
    ResponseStatusException(HttpStatus.UNAUTHORIZED, message)

private fun misconfigured(message: String): ResponseStatusException =
    ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, message)
