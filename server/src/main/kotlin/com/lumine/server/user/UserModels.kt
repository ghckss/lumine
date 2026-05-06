package com.lumine.server.user

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.time.OffsetDateTime

enum class AuthProvider {
    KAKAO,
    GOOGLE
}

enum class Gender {
    FEMALE,
    MALE,
    OTHER
}

data class UserMeResponse(
    val userId: String,
    val provider: AuthProvider,
    val displayName: String,
    val gender: Gender?,
    val birthDate: LocalDate?,
    val agreedToTerms: Boolean,
    val signedUpAt: OffsetDateTime?
)

data class UpsertUserProfileRequest(
    @field:NotNull
    val provider: AuthProvider?,
    @field:NotBlank
    val displayName: String?,
    @field:NotNull
    val gender: Gender?,
    @field:NotNull
    val birthDate: LocalDate?,
    val agreedToTerms: Boolean
)

data class UserProfile(
    val userId: String,
    val provider: AuthProvider,
    val displayName: String,
    val gender: Gender?,
    val birthDate: LocalDate?,
    val agreedToTerms: Boolean,
    val signedUpAt: OffsetDateTime?
)
