package com.lumine.server.auth

import com.lumine.server.user.UserService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val userJwtService: UserJwtService,
    private val userService: UserService
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authorization = request.getHeader(HttpHeaders.AUTHORIZATION)
        if (authorization.isNullOrBlank() || !authorization.startsWith(BEARER_PREFIX, ignoreCase = true)) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authorization.substring(BEARER_PREFIX.length).trim()
        val authenticatedUser = userJwtService.verifyAccessToken(token)
        if (authenticatedUser == null || !userService.exists(authenticatedUser.userId)) {
            SecurityContextHolder.clearContext()
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired access token.")
            return
        }

        val authentication = UsernamePasswordAuthenticationToken(
            authenticatedUser,
            token,
            listOf(SimpleGrantedAuthority("ROLE_${authenticatedUser.permission.value}"))
        )
        SecurityContextHolder.getContext().authentication = authentication
        filterChain.doFilter(request, response)
    }

    private companion object {
        const val BEARER_PREFIX = "Bearer "
    }
}
