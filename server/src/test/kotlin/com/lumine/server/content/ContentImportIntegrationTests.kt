package com.lumine.server.content

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest(properties = ["auth.mock-login-enabled=true"])
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class ContentImportIntegrationTests(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper
) {
    @Test
    fun `guest content import is partial idempotent and scoped by user`() {
        val kakao = login("kakao")
        val google = login("google")
        saveJournal(kakao, "2026-09-01", "서버에 먼저 저장한 기록")

        val request = mapOf(
            "items" to listOf(
                journalItem("guest-conflict", "2026-09-01", "게스트 충돌 기록"),
                journalItem("guest-journal", "2026-09-02", "게스트 새 기록"),
                screeningItem("guest-screening"),
                mapOf("id" to "guest-invalid", "type" to "JOURNAL")
            )
        )

        import(kakao, request).andExpect {
            status { isOk() }
            jsonPath("$.data.items[0].status") { value("CONFLICT") }
            jsonPath("$.data.items[1].status") { value("IMPORTED") }
            jsonPath("$.data.items[2].status") { value("IMPORTED") }
            jsonPath("$.data.items[3].status") { value("FAILED") }
        }

        import(kakao, request).andExpect {
            status { isOk() }
            jsonPath("$.data.items[0].status") { value("CONFLICT") }
            jsonPath("$.data.items[1].status") { value("ALREADY_IMPORTED") }
            jsonPath("$.data.items[2].status") { value("ALREADY_IMPORTED") }
            jsonPath("$.data.items[3].status") { value("FAILED") }
        }

        mockMvc.get("/api/journal/entries") {
            bearer(kakao)
            param("date", "2026-09-01")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.body") { value("서버에 먼저 저장한 기록") }
        }
        mockMvc.get("/api/journal/entries") {
            bearer(kakao)
            param("date", "2026-09-02")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.body") { value("게스트 새 기록") }
        }

        import(google, mapOf("items" to listOf(journalItem("guest-journal", "2026-09-02", "다른 계정 기록"))))
            .andExpect {
                status { isOk() }
                jsonPath("$.data.items[0].status") { value("IMPORTED") }
            }

        mockMvc.get("/api/journal/entries") {
            bearer(google)
            param("date", "2026-09-02")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.body") { value("다른 계정 기록") }
        }

        mockMvc.post("/api/users/me/content-import") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect { status { isUnauthorized() } }
    }

    private fun import(token: String, request: Any) =
        mockMvc.post("/api/users/me/content-import") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }

    private fun journalItem(id: String, date: String, body: String) = mapOf(
        "id" to id,
        "type" to "JOURNAL",
        "journal" to mapOf(
            "date" to date,
            "emotions" to listOf("평온"),
            "body" to body
        )
    )

    private fun screeningItem(id: String) = mapOf(
        "id" to id,
        "type" to "SCREENING",
        "screening" to mapOf(
            "answers" to (1..10).associate { "q$it" to "0" }
        )
    )

    private fun saveJournal(token: String, date: String, body: String) {
        mockMvc.post("/api/journal/entries") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("date" to date, "emotions" to listOf("평온"), "body" to body)
            )
        }.andExpect { status { isOk() } }
    }

    private fun login(provider: String): String {
        val response = mockMvc.post("/api/auth/login/$provider") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"providerUserId":"mock-$provider-content-import"}"""
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        return objectMapper.readTree(response).path("data").path("accessToken").asText()
    }

    private fun org.springframework.test.web.servlet.MockHttpServletRequestDsl.bearer(token: String) {
        header("Authorization", "Bearer $token")
    }
}
