package com.lumine.server.auth

import com.lumine.server.user.AuthProvider
import com.lumine.server.user.UserService
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userService: UserService
) {
    fun login(provider: AuthProvider, request: NativeLoginExchangeRequest? = null): LoginResponse {
        val response = LoginResponse(
            userId = request?.providerUserId ?: if (provider == AuthProvider.KAKAO) "mock-kakao-001" else "mock-google-001",
            provider = provider,
            displayName = request?.displayName ?: if (provider == AuthProvider.KAKAO) "하린" else "서윤",
            accessToken = request?.accessToken ?: "mock-access-token-${provider.name.lowercase()}",
            refreshToken = request?.refreshToken ?: "mock-refresh-token-${provider.name.lowercase()}"
        )

        userService.syncCurrentUser(
            userId = response.userId,
            provider = response.provider,
            displayName = response.displayName
        )

        return response
    }

    fun logout(): LogoutResponse {
        userService.clearCurrentUser()
        return LogoutResponse(success = true)
    }
}
