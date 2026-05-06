package com.lumine.server.screening

import com.lumine.server.global.api.ApiResponse
import jakarta.validation.Valid
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
        @Valid @RequestBody request: ScreeningSubmissionRequest
    ): ApiResponse<ScreeningResultResponse> = ApiResponse(screeningService.submit(request))

    @GetMapping("/latest")
    fun getLatest(): ApiResponse<ScreeningResultResponse?> =
        ApiResponse(screeningService.getLatestResult())

    @GetMapping("/history")
    fun getHistory(): ApiResponse<List<ScreeningHistoryItemResponse>> =
        ApiResponse(screeningService.getHistory())
}
