package com.lumine.server.user

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest(properties = ["auth.mock-login-enabled=true"])
@AutoConfigureMockMvc
class UserDataManagementIntegrationTests(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper
) {
    @Test
    fun `user can export and delete only their own server data`() {
        val owner = login("kakao", "mock-kakao-data-owner")
        val other = login("google", "mock-google-data-other")
        saveJournal(owner.token, "2026-09-03", "내보낼 한글 일기")
        saveJournal(other.token, "2026-09-03", "다른 사용자의 일기")
        submitScreening(owner.token)
        importScreening(owner.token, "guest-receipt-for-delete")

        mockMvc.get("/api/users/me/export") {
            bearer(owner.token)
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.schemaVersion") { value("2026-09-01") }
            jsonPath("$.data.profile.userId") { value(owner.userId) }
            jsonPath("$.data.journals.length()") { value(1) }
            jsonPath("$.data.journals[0].body") { value("내보낼 한글 일기") }
            jsonPath("$.data.screenings.length()") { value(2) }
            jsonPath("$.data.screenings[0].answers.q1") { value("0") }
        }

        mockMvc.delete("/api/users/me") {
            bearer(owner.token)
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.success") { value(true) }
        }

        mockMvc.get("/api/users/me") {
            bearer(owner.token)
        }.andExpect { status { isUnauthorized() } }

        val recreated = login("kakao", "mock-kakao-data-owner")
        check(recreated.userId != owner.userId)
        mockMvc.get("/api/journal/entries/history") {
            bearer(recreated.token)
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.length()") { value(0) }
        }
        importScreening(recreated.token, "guest-receipt-for-delete")
            .andExpect {
                status { isOk() }
                jsonPath("$.data.items[0].status") { value("IMPORTED") }
            }

        mockMvc.get("/api/journal/entries") {
            bearer(other.token)
            param("date", "2026-09-03")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.body") { value("다른 사용자의 일기") }
        }

        mockMvc.get("/api/users/me/export")
            .andExpect { status { isUnauthorized() } }
        mockMvc.delete("/api/users/me")
            .andExpect { status { isUnauthorized() } }
    }

    private fun saveJournal(token: String, date: String, body: String) {
        mockMvc.post("/api/journal/entries") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("date" to date, "emotions" to listOf("평온"), "body" to body)
            )
        }.andExpect { status { isOk() } }
    }

    private fun submitScreening(token: String) {
        mockMvc.post("/api/screening/submissions") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("answers" to (1..10).associate { "q$it" to "0" })
            )
        }.andExpect { status { isOk() } }
    }

    private fun importScreening(token: String, itemId: String) =
        mockMvc.post("/api/users/me/content-import") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf(
                    "items" to listOf(
                        mapOf(
                            "id" to itemId,
                            "type" to "SCREENING",
                            "screening" to mapOf("answers" to (1..10).associate { "q$it" to "0" })
                        )
                    )
                )
            )
        }

    private fun login(provider: String, providerUserId: String): TestSession {
        val response = mockMvc.post("/api/auth/login/$provider") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("providerUserId" to providerUserId))
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        val data = objectMapper.readTree(response).path("data")
        return TestSession(data.path("userId").asText(), data.path("accessToken").asText())
    }

    private fun org.springframework.test.web.servlet.MockHttpServletRequestDsl.bearer(token: String) {
        header("Authorization", "Bearer $token")
    }

    private data class TestSession(val userId: String, val token: String)
}
