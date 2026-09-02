package com.lumine.server.contentimport

import com.lumine.server.common.Time
import com.lumine.server.user.UserEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.OffsetDateTime

@Entity
@Table(
    name = "content_import_receipts",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_content_import_user_item", columnNames = ["user_id", "item_id"])
    ]
)
class ContentImportReceiptEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,
    @Column(name = "item_id", nullable = false, length = 100)
    val itemId: String,
    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    val itemType: ContentImportItemType,
    @Column(name = "imported_at", nullable = false)
    val importedAt: OffsetDateTime = Time.now()
)
