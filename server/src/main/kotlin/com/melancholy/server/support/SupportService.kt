package com.melancholy.server.support

import org.springframework.stereotype.Service

@Service
class SupportService {
    fun getResources(): List<SupportResource> =
        listOf(
            SupportResource(
                code = "suicide-prevention",
                title = "자살예방상담전화",
                phone = "109",
                description = "24시간 연결 가능한 도움 전화예요"
            ),
            SupportResource(
                code = "emergency",
                title = "응급전화",
                phone = "119",
                description = "지금 바로 도움이 필요할 때 연결해요"
            ),
            SupportResource(
                code = "welfare",
                title = "보건복지상담센터",
                phone = "129",
                description = "보건복지 관련 상담을 도와줘요"
            )
        )
}
