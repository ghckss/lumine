package com.lumine.server.support.api

import com.lumine.server.global.api.ApiResponse
import com.lumine.server.support.SupportService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/support")
class SupportController(
    private val supportService: SupportService
) {
    @GetMapping("/resources")
    fun getResources(): ApiResponse<List<SupportResourceResponse>> =
        ApiResponse(supportService.getResources().map { it.toApiResponse() })
}
