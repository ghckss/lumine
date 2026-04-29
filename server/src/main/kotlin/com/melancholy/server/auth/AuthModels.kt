package com.melancholy.server.auth

import com.melancholy.server.user.AuthProvider

data class NativeLoginExchangeRequest(
    val providerUserId: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val displayName: String? = null
)

data class LoginResponse(
    val userId: String,
    val provider: AuthProvider,
    val displayName: String,
    val accessToken: String,
    val refreshToken: String
)

data class LogoutResponse(
    val success: Boolean
)
