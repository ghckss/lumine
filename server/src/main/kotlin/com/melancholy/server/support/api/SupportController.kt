package com.melancholy.server.support.api

import com.melancholy.server.global.api.ApiResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/support")
class SupportController {
    @GetMapping("/resources")
    fun getResources(): ApiResponse<List<SupportResourceResponse>> {
        return ApiResponse(
            data = listOf(
                SupportResourceResponse(
                    code = "suicide-prevention",
                    title = "자살예방상담전화",
                    phone = "109",
                    description = "24시간 연결 가능한 도움 전화"
                ),
                SupportResourceResponse(
                    code = "emergency",
                    title = "응급전화",
                    phone = "119",
                    description = "즉시 도움이 필요한 경우"
                ),
                SupportResourceResponse(
                    code = "welfare",
                    title = "보건복지상담센터",
                    phone = "129",
                    description = "보건복지 관련 상담 연결"
                )
            )
        )
    }
}
