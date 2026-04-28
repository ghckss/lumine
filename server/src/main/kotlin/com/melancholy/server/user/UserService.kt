package com.melancholy.server.user

import com.melancholy.server.common.Time
import org.springframework.stereotype.Service
import java.util.concurrent.atomic.AtomicReference

@Service
class UserService {
    private val currentUser = AtomicReference(
        UserProfile(
            userId = "mock-user-001",
            provider = AuthProvider.KAKAO,
            displayName = "하린",
            gender = Gender.FEMALE,
            birthDate = java.time.LocalDate.of(1997, 5, 12),
            agreedToTerms = true,
            signedUpAt = Time.now().minusDays(14)
        )
    )

    fun getCurrentUser(): UserMeResponse = currentUser.get().toResponse()

    fun upsertProfile(request: UpsertUserProfileRequest): UserMeResponse {
        val updated = UserProfile(
            userId = currentUser.get().userId,
            provider = request.provider!!,
            displayName = request.displayName!!.trim(),
            gender = request.gender,
            birthDate = request.birthDate,
            agreedToTerms = request.agreedToTerms,
            signedUpAt = currentUser.get().signedUpAt ?: Time.now()
        )

        currentUser.set(updated)
        return updated.toResponse()
    }

    private fun UserProfile.toResponse(): UserMeResponse =
        UserMeResponse(
            userId = userId,
            provider = provider,
            displayName = displayName,
            gender = gender,
            birthDate = birthDate,
            agreedToTerms = agreedToTerms,
            signedUpAt = signedUpAt
        )
}
