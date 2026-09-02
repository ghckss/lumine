package com.lumine.server.auth

import com.fasterxml.jackson.databind.ObjectMapper
import com.lumine.server.user.AuthProvider
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.time.Instant
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Service
class UserJwtService(
    private val authProperties: AuthProperties,
    private val objectMapper: ObjectMapper
) {
    fun issueAccessToken(
        userId: String,
        provider: AuthProvider,
        displayName: String,
        permission: UserPermission = UserPermission.USER
    ): String {
        val now = Instant.now()
        val expiresAt = now.plusSeconds(authProperties.jwt.accessTokenTtlSeconds)
        val header = mapOf(
            "alg" to "HS256",
            "typ" to "JWT"
        )
        val payload = mapOf(
            "iss" to authProperties.jwt.issuer,
            "sub" to userId,
            "provider" to provider.name,
            "displayName" to displayName,
            "permission" to permission.value,
            "iat" to now.epochSecond,
            "exp" to expiresAt.epochSecond
        )
        val signingInput = "${base64UrlJson(header)}.${base64UrlJson(payload)}"
        val signature = hmacSha256(signingInput)

        return "$signingInput.${base64Url(signature)}"
    }

    fun verifyAccessToken(token: String): AuthenticatedUser? = runCatching {
        val parts = token.split('.')
        require(parts.size == 3)

        val header = objectMapper.readTree(base64UrlDecode(parts[0]))
        require(header.path("alg").asText() == "HS256")
        require(header.path("typ").asText() == "JWT")

        val signingInput = "${parts[0]}.${parts[1]}"
        require(MessageDigest.isEqual(hmacSha256(signingInput), base64UrlDecode(parts[2])))

        val payload = objectMapper.readTree(base64UrlDecode(parts[1]))
        require(payload.path("iss").asText() == authProperties.jwt.issuer)
        require(payload.path("exp").asLong(0) > Instant.now().epochSecond)

        val userId = payload.path("sub").asText().takeIf { it.isNotBlank() } ?: error("Missing subject")
        val permission = UserPermission.entries.firstOrNull {
            it.value == payload.path("permission").asText()
        } ?: error("Invalid permission")

        AuthenticatedUser(userId = userId, permission = permission)
    }.getOrNull()

    private fun base64UrlJson(value: Map<String, Any>): String =
        base64Url(objectMapper.writeValueAsBytes(value))

    private fun hmacSha256(value: String): ByteArray {
        val key = SecretKeySpec(authProperties.jwt.secret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256")
        return Mac.getInstance("HmacSHA256").apply { init(key) }
            .doFinal(value.toByteArray(StandardCharsets.UTF_8))
    }

    private fun base64Url(value: ByteArray): String =
        Base64.getUrlEncoder().withoutPadding().encodeToString(value)

    private fun base64UrlDecode(value: String): ByteArray =
        Base64.getUrlDecoder().decode(value)
}

enum class UserPermission(val value: String) {
    USER("USER")
}
