package com.lumine.server.contentimport

import org.springframework.data.jpa.repository.JpaRepository

interface ContentImportReceiptRepository : JpaRepository<ContentImportReceiptEntity, Long> {
    fun existsByUserIdAndItemId(userId: String, itemId: String): Boolean
    fun findAllByUserId(userId: String): List<ContentImportReceiptEntity>
}
