package com.melancholy.server.global.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .authorizeHttpRequests {
                it.requestMatchers("/actuator/health", "/api/support/resources").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2Login(Customizer.withDefaults())
            .httpBasic { it.disable() }
            .formLogin { it.disable() }

        return http.build()
    }
}
