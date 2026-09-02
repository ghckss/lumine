package com.lumine.server.user

import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<UserEntity, String> {
    fun findByProviderAndProviderSubject(provider: AuthProvider, providerSubject: String): UserEntity?
}
