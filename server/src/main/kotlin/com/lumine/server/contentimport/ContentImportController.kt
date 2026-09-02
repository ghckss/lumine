package com.lumine.server.contentimport

import com.lumine.server.auth.AuthenticatedUser
import com.lumine.server.global.api.ApiResponse
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users/me/content-import")
class ContentImportController(
    private val contentImportService: ContentImportService
) {
    @PostMapping
    fun import(
        @AuthenticationPrincipal principal: AuthenticatedUser,
        @Valid @RequestBody request: ContentImportRequest
    ): ApiResponse<ContentImportResponse> =
        ApiResponse(contentImportService.import(principal.userId, request))
}
