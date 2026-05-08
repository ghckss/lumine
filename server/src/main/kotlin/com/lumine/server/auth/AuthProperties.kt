package com.lumine.server.auth

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate

@ConfigurationProperties(prefix = "auth")
data class AuthProperties(
    var mockLoginEnabled: Boolean = false,
    var google: Google = Google(),
    var kakao: Kakao = Kakao()
) {
    data class Google(
        var clientIds: String = "",
        var tokenInfoUrl: String = "https://oauth2.googleapis.com/tokeninfo"
    ) {
        fun acceptedClientIds(): Set<String> =
            clientIds.split(",")
                .map { it.trim() }
                .filter { it.isNotBlank() }
                .toSet()
    }

    data class Kakao(
        var appIds: String = "",
        var tokenInfoUrl: String = "https://kapi.kakao.com/v1/user/access_token_info",
        var userInfoUrl: String = "https://kapi.kakao.com/v2/user/me"
    ) {
        fun acceptedAppIds(): Set<Long> =
            appIds.split(",")
                .map { it.trim() }
                .filter { it.isNotBlank() }
                .mapNotNull { it.toLongOrNull() }
                .toSet()
    }
}

@Configuration
@EnableConfigurationProperties(AuthProperties::class)
class AuthConfiguration {
    @Bean
    fun authRestTemplate(restTemplateBuilder: RestTemplateBuilder): RestTemplate = restTemplateBuilder.build()
}
