package com.lumine.server.journal

import com.lumine.server.user.UserEntity
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.OrderBy
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.LocalDate
import java.time.OffsetDateTime

@Entity
@Table(
    name = "journal_entries",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_journal_user_date", columnNames = ["user_id", "entry_date"])
    ]
)
class JournalEntryEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: UserEntity?,
    @Column(name = "entry_date", nullable = false)
    var entryDate: LocalDate,
    @Column(nullable = false, columnDefinition = "text")
    var body: String,
    @Column(name = "comfort_message", nullable = false, columnDefinition = "text")
    var comfortMessage: String,
    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime,
    @OneToMany(mappedBy = "entry", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder asc, id asc")
    val emotions: MutableList<JournalEmotionEntity> = mutableListOf()
) {
    fun replaceEmotions(labels: List<String>) {
        emotions.clear()
        labels.forEachIndexed { index, label ->
            emotions.add(
                JournalEmotionEntity(
                    entry = this,
                    emotionId = label,
                    label = label,
                    sortOrder = index
                )
            )
        }
    }
}

@Entity
@Table(name = "journal_entry_emotions")
class JournalEmotionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    var entry: JournalEntryEntity,
    @Column(name = "emotion_id", nullable = false)
    var emotionId: String,
    @Column(nullable = false)
    var label: String,
    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int
)
