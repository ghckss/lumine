package com.lumine.server.user

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.LocalDate
import java.time.OffsetDateTime

@Entity
@Table(
    name = "users",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_users_provider_subject",
            columnNames = ["provider", "provider_subject"]
        )
    ]
)
class UserEntity(
    @Id
    @Column(length = 36)
    val id: String,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    val provider: AuthProvider,
    @Column(name = "provider_subject", nullable = false, length = 255)
    val providerSubject: String,
    @Column(name = "display_name", nullable = false, length = 100)
    var displayName: String,
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    var gender: Gender? = null,
    @Column(name = "birth_date")
    var birthDate: LocalDate? = null,
    @Column(name = "agreed_to_terms", nullable = false)
    var agreedToTerms: Boolean = false,
    @Column(name = "signed_up_at")
    var signedUpAt: OffsetDateTime? = null
)
