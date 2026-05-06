package com.lumine.server.auth

import com.lumine.server.global.api.ApiResponse
import com.lumine.server.user.AuthProvider
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/login/kakao")
    fun loginKakao(
        @RequestBody(required = false) request: NativeLoginExchangeRequest?
    ): ApiResponse<LoginResponse> = ApiResponse(authService.login(AuthProvider.KAKAO, request))

    @PostMapping("/login/google")
    fun loginGoogle(
        @RequestBody(required = false) request: NativeLoginExchangeRequest?
    ): ApiResponse<LoginResponse> = ApiResponse(authService.login(AuthProvider.GOOGLE, request))

    @PostMapping("/logout")
    fun logout(): ApiResponse<LogoutResponse> = ApiResponse(authService.logout())
}
