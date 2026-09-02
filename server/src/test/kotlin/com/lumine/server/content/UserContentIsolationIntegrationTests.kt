package com.lumine.server.content

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest(properties = ["auth.mock-login-enabled=true"])
@AutoConfigureMockMvc
class UserContentIsolationIntegrationTests(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper
) {
    @Test
    fun `users can keep separate journals on the same date`() {
        val kakao = login("kakao")
        val google = login("google")
        saveJournal(kakao, "2026-09-03", "카카오 사용자의 기록")
        saveJournal(google, "2026-09-03", "구글 사용자의 기록")

        mockMvc.get("/api/journal/entries") {
            bearer(kakao)
            param("date", "2026-09-03")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.body") { value("카카오 사용자의 기록") }
        }
        mockMvc.get("/api/journal/entries") {
            bearer(google)
            param("date", "2026-09-03")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.body") { value("구글 사용자의 기록") }
        }
    }

    @Test
    fun `screening history is isolated by user`() {
        val kakao = login("kakao")
        val google = login("google")
        submitScreening(kakao, 0)
        submitScreening(google, 1)

        mockMvc.get("/api/screening/history") {
            bearer(kakao)
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.length()") { value(1) }
            jsonPath("$.data[0].publicSummary") { value("오늘은 비교적 크게 무겁지 않은 상태로 보여요.") }
        }
        mockMvc.get("/api/screening/history") {
            bearer(google)
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.length()") { value(1) }
            jsonPath("$.data[0].publicSummary") { value("최근 마음이 쉽게 편해지지 않았을 수 있어요.") }
        }
    }

    @Test
    fun `personal content endpoints reject anonymous access`() {
        mockMvc.get("/api/journal/entries/history")
            .andExpect { status { isUnauthorized() } }
        mockMvc.get("/api/screening/history")
            .andExpect { status { isUnauthorized() } }
        mockMvc.post("/api/screening/submissions") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"answers":{"q1":"0"}}"""
        }.andExpect { status { isUnauthorized() } }
    }

    private fun saveJournal(token: String, date: String, body: String) {
        mockMvc.post("/api/journal/entries") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = """
                {"date":"$date","emotions":["평온"],"body":"$body"}
            """.trimIndent()
        }.andExpect { status { isOk() } }
    }

    private fun submitScreening(token: String, score: Int) {
        val answers = (1..10).associate { "q$it" to score.toString() }
        mockMvc.post("/api/screening/submissions") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("answers" to answers))
        }.andExpect { status { isOk() } }
    }

    private fun login(provider: String): String {
        val response = mockMvc.post("/api/auth/login/$provider") {
            contentType = MediaType.APPLICATION_JSON
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        return objectMapper.readTree(response).path("data").path("accessToken").asText()
    }

    private fun org.springframework.test.web.servlet.MockHttpServletRequestDsl.bearer(token: String) {
        header("Authorization", "Bearer $token")
    }
}
