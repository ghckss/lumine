package com.melancholy.server.auth

import com.melancholy.server.user.AuthProvider
import org.springframework.stereotype.Service

@Service
class AuthService {
    fun login(provider: AuthProvider): LoginResponse =
        LoginResponse(
            userId = if (provider == AuthProvider.KAKAO) "mock-kakao-001" else "mock-google-001",
            provider = provider,
            displayName = if (provider == AuthProvider.KAKAO) "하린" else "서윤",
            accessToken = "mock-access-token-${provider.name.lowercase()}",
            refreshToken = "mock-refresh-token-${provider.name.lowercase()}"
        )

    fun logout(): LogoutResponse = LogoutResponse(success = true)
}
