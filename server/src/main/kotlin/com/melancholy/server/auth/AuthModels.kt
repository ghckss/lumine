package com.melancholy.server.auth

import com.melancholy.server.user.AuthProvider

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
