package com.lumine.server.auth

import com.lumine.server.user.AuthProvider
import com.lumine.server.user.UserService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class AuthService(
    private val authProperties: AuthProperties,
    private val providerTokenVerifier: ProviderTokenVerifier,
    private val userJwtService: UserJwtService,
    private val userService: UserService
) {
    fun login(provider: AuthProvider, request: NativeLoginExchangeRequest? = null): LoginResponse {
        val verifiedUser = when {
            authProperties.mockLoginEnabled && request.isMockLoginRequest(provider) -> mockVerifiedUser(provider, request)
            request != null -> providerTokenVerifier.verify(provider, request)
            else -> throw ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Provider token is required."
            )
        }

        if (!request?.providerUserId.isNullOrBlank() && request?.providerUserId != verifiedUser.providerUserId) {
            throw ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Provider user id does not match verified token."
            )
        }

        val displayName = verifiedUser.displayName ?: request?.displayName ?: provider.defaultDisplayName()
        val user = userService.findOrCreateFromLogin(
            provider = provider,
            providerSubject = verifiedUser.providerUserId,
            displayName = displayName
        )
        val response = LoginResponse(
            userId = user.userId,
            provider = provider,
            displayName = user.displayName,
            accessToken = userJwtService.issueAccessToken(
                userId = user.userId,
                provider = provider,
                displayName = user.displayName
            ),
            refreshToken = request?.refreshToken ?: "mock-refresh-token-${provider.name.lowercase()}"
        )

        return response
    }

    fun logout(): LogoutResponse = LogoutResponse(success = true)

    private fun NativeLoginExchangeRequest?.isMockLoginRequest(provider: AuthProvider): Boolean {
        if (this == null) {
            return true
        }

        val expectedProvider = provider.name.lowercase()
        return providerUserId?.startsWith("mock-$expectedProvider") == true ||
            accessToken == "mock-$expectedProvider-native-access-token" ||
            idToken == "mock-$expectedProvider-native-id-token"
    }

    private fun mockVerifiedUser(
        provider: AuthProvider,
        request: NativeLoginExchangeRequest?
    ): VerifiedProviderUser =
        VerifiedProviderUser(
            providerUserId = request?.providerUserId
                ?: if (provider == AuthProvider.KAKAO) "mock-kakao-native-user" else "mock-google-native-user",
            displayName = request?.displayName ?: provider.defaultDisplayName()
        )

    private fun AuthProvider.defaultDisplayName(): String =
        if (this == AuthProvider.KAKAO) "하린" else "서윤"
}
