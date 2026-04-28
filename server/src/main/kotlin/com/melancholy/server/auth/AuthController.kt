package com.melancholy.server.auth

import com.melancholy.server.global.api.ApiResponse
import com.melancholy.server.user.AuthProvider
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/login/kakao")
    fun loginKakao(): ApiResponse<LoginResponse> = ApiResponse(authService.login(AuthProvider.KAKAO))

    @PostMapping("/login/google")
    fun loginGoogle(): ApiResponse<LoginResponse> = ApiResponse(authService.login(AuthProvider.GOOGLE))

    @PostMapping("/logout")
    fun logout(): ApiResponse<LogoutResponse> = ApiResponse(authService.logout())
}
