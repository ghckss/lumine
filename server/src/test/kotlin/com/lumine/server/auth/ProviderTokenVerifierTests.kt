package com.lumine.server.auth

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.test.web.client.ExpectedCount
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.header
import org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo
import org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess
import org.springframework.web.client.RestTemplate
import org.springframework.web.server.ResponseStatusException

class ProviderTokenVerifierTests {
    @Test
    fun `google verifier accepts id token with configured audience`() {
        val restTemplate = RestTemplate()
        val server = MockRestServiceServer.bindTo(restTemplate).build()
        val verifier = GoogleProviderTokenVerifier(
            AuthProperties(
                google = AuthProperties.Google(clientIds = "google-client-id")
            ),
            restTemplate
        )

        server.expect(ExpectedCount.once(), requestTo("https://oauth2.googleapis.com/tokeninfo?id_token=id-token"))
            .andRespond(
                withSuccess(
                    """{"sub":"google-user-1","aud":"google-client-id","name":"서윤"}""",
                    MediaType.APPLICATION_JSON
                )
            )

        val verified = verifier.verify(NativeLoginExchangeRequest(idToken = "id-token"))

        assertEquals("google-user-1", verified.providerUserId)
        assertEquals("서윤", verified.displayName)
        server.verify()
    }

    @Test
    fun `google verifier rejects id token with unknown audience`() {
        val restTemplate = RestTemplate()
        val server = MockRestServiceServer.bindTo(restTemplate).build()
        val verifier = GoogleProviderTokenVerifier(
            AuthProperties(
                google = AuthProperties.Google(clientIds = "google-client-id")
            ),
            restTemplate
        )

        server.expect(ExpectedCount.once(), requestTo("https://oauth2.googleapis.com/tokeninfo?id_token=id-token"))
            .andRespond(
                withSuccess(
                    """{"sub":"google-user-1","aud":"other-client-id"}""",
                    MediaType.APPLICATION_JSON
                )
            )

        assertThrows(ResponseStatusException::class.java) {
            verifier.verify(NativeLoginExchangeRequest(idToken = "id-token"))
        }
        server.verify()
    }

    @Test
    fun `kakao verifier accepts access token with configured app id`() {
        val restTemplate = RestTemplate()
        val server = MockRestServiceServer.bindTo(restTemplate).build()
        val verifier = KakaoProviderTokenVerifier(
            AuthProperties(
                kakao = AuthProperties.Kakao(appIds = "1234")
            ),
            restTemplate
        )

        server.expect(ExpectedCount.once(), requestTo("https://kapi.kakao.com/v1/user/access_token_info"))
            .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer kakao-token"))
            .andRespond(
                withSuccess(
                    """{"id":987654321,"expires_in":7199,"app_id":1234}""",
                    MediaType.APPLICATION_JSON
                )
            )
        server.expect(ExpectedCount.once(), requestTo("https://kapi.kakao.com/v2/user/me"))
            .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer kakao-token"))
            .andRespond(
                withSuccess(
                    """{"id":987654321,"properties":{"nickname":"하린"}}""",
                    MediaType.APPLICATION_JSON
                )
            )

        val verified = verifier.verify(NativeLoginExchangeRequest(accessToken = "kakao-token"))

        assertEquals("987654321", verified.providerUserId)
        assertEquals("하린", verified.displayName)
        server.verify()
    }
}
