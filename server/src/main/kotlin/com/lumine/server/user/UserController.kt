package com.lumine.server.user

import com.lumine.server.auth.AuthenticatedUser
import com.lumine.server.global.api.ApiResponse
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {
    @GetMapping("/me")
    fun getMe(
        @AuthenticationPrincipal principal: AuthenticatedUser
    ): ApiResponse<UserMeResponse> = ApiResponse(userService.getCurrentUser(principal.userId))

    @PostMapping("/profile")
    fun upsertProfile(
        @AuthenticationPrincipal principal: AuthenticatedUser,
        @Valid @RequestBody request: UpsertUserProfileRequest
    ): ApiResponse<UserMeResponse> = ApiResponse(userService.upsertProfile(principal.userId, request))
}
