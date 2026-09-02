package com.lumine.server.screening

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
@RequestMapping("/api/screening")
class ScreeningController(
    private val screeningService: ScreeningService
) {
    @GetMapping("/questionnaire")
    fun getQuestionnaire(): ApiResponse<ScreeningQuestionnaireResponse> =
        ApiResponse(screeningService.getQuestionnaire())

    @PostMapping("/submissions")
    fun submit(
        @AuthenticationPrincipal principal: AuthenticatedUser,
        @Valid @RequestBody request: ScreeningSubmissionRequest
    ): ApiResponse<ScreeningResultResponse> = ApiResponse(screeningService.submit(principal.userId, request))

    @GetMapping("/latest")
    fun getLatest(
        @AuthenticationPrincipal principal: AuthenticatedUser
    ): ApiResponse<ScreeningResultResponse?> =
        ApiResponse(screeningService.getLatestResult(principal.userId))

    @GetMapping("/history")
    fun getHistory(
        @AuthenticationPrincipal principal: AuthenticatedUser
    ): ApiResponse<List<ScreeningHistoryItemResponse>> =
        ApiResponse(screeningService.getHistory(principal.userId))
}
