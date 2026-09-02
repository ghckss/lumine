package com.lumine.server.user

import com.lumine.server.common.Time
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository
) {
    @Transactional
    fun findOrCreateFromLogin(
        provider: AuthProvider,
        providerSubject: String,
        displayName: String
    ): UserMeResponse {
        val user = userRepository.findByProviderAndProviderSubject(provider, providerSubject)
            ?: UserEntity(
                id = UUID.randomUUID().toString(),
                provider = provider,
                providerSubject = providerSubject,
                displayName = displayName
            )
        user.displayName = displayName
        return userRepository.save(user).toResponse()
    }

    @Transactional(readOnly = true)
    fun exists(userId: String): Boolean = userRepository.existsById(userId)

    @Transactional(readOnly = true)
    fun getCurrentUser(userId: String): UserMeResponse = requireUser(userId).toResponse()

    @Transactional
    fun upsertProfile(userId: String, request: UpsertUserProfileRequest): UserMeResponse {
        val user = requireUser(userId)
        user.gender = request.gender
        user.birthDate = request.birthDate
        user.agreedToTerms = request.agreedToTerms
        user.signedUpAt = user.signedUpAt ?: Time.now()
        return userRepository.save(user).toResponse()
    }

    @Transactional(readOnly = true)
    fun requireEntity(userId: String): UserEntity = requireUser(userId)

    private fun requireUser(userId: String): UserEntity =
        userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user no longer exists.")
        }

    private fun UserEntity.toResponse(): UserMeResponse =
        UserMeResponse(
            userId = id,
            provider = provider,
            displayName = displayName,
            gender = gender,
            birthDate = birthDate,
            agreedToTerms = agreedToTerms,
            signedUpAt = signedUpAt
        )
}
