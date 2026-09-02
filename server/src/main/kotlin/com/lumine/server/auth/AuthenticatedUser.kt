package com.lumine.server.auth

data class AuthenticatedUser(
    val userId: String,
    val permission: UserPermission
)
