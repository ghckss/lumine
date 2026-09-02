package com.lumine.server.auth

import com.fasterxml.jackson.databind.ObjectMapper
import org.hamcrest.Matchers.not
import org.hamcrest.Matchers.blankOrNullString
import org.junit.jupiter.api.Assertions.assertNotEquals
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
class AuthSecurityIntegrationTests(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper
) {
    @Test
    fun `personal api requires a valid bearer token`() {
        mockMvc.get("/api/users/me")
            .andExpect { status { isUnauthorized() } }

        val login = login("kakao")
        mockMvc.get("/api/users/me") {
            header("Authorization", "Bearer ${login.accessToken}")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.userId") { value(login.userId) }
            jsonPath("$.data.displayName") { value("하린") }
        }

        val tamperedToken = login.accessToken.dropLast(1) + if (login.accessToken.last() == 'a') "b" else "a"
        mockMvc.get("/api/users/me") {
            header("Authorization", "Bearer $tamperedToken")
        }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `different providers receive different internal user ids`() {
        val kakao = login("kakao")
        val google = login("google")

        assertNotEquals(kakao.userId, google.userId)
        mockMvc.get("/api/users/me") {
            header("Authorization", "Bearer ${google.accessToken}")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.userId") { value(google.userId) }
            jsonPath("$.data.provider") { value("GOOGLE") }
        }
    }

    @Test
    fun `repeated login for the same provider subject reuses the account`() {
        val first = login("kakao")
        val second = login("kakao")

        org.junit.jupiter.api.Assertions.assertEquals(first.userId, second.userId)
    }

    @Test
    fun `profile update keeps identity from verified login`() {
        val login = login("kakao")

        mockMvc.post("/api/users/profile") {
            header("Authorization", "Bearer ${login.accessToken}")
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "provider": "GOOGLE",
                  "displayName": "다른 이름",
                  "gender": "OTHER",
                  "birthDate": "1999-09-09",
                  "agreedToTerms": true
                }
            """.trimIndent()
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.userId") { value(login.userId) }
            jsonPath("$.data.provider") { value("KAKAO") }
            jsonPath("$.data.displayName") { value("하린") }
            jsonPath("$.data.gender") { value("OTHER") }
        }
    }

    private fun login(provider: String): TestLogin {
        val response = mockMvc.post("/api/auth/login/$provider") {
            contentType = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            jsonPath("$.data.accessToken") { value(not(blankOrNullString())) }
        }.andReturn().response.contentAsString
        val data = objectMapper.readTree(response).path("data")
        return TestLogin(
            userId = data.path("userId").asText(),
            accessToken = data.path("accessToken").asText()
        )
    }

    private data class TestLogin(
        val userId: String,
        val accessToken: String
    )
}
