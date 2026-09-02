package com.lumine.server.journal

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate

interface JournalEntryRepository : JpaRepository<JournalEntryEntity, Long> {
    @EntityGraph(attributePaths = ["emotions"])
    fun findByUserIdAndEntryDate(userId: String, entryDate: LocalDate): JournalEntryEntity?

    @Query("select entry.id from JournalEntryEntity entry where entry.user.id = :userId order by entry.entryDate desc, entry.createdAt desc")
    fun findRecentIds(userId: String, pageable: Pageable): List<Long>

    @EntityGraph(attributePaths = ["emotions"])
    fun findAllByIdInAndUserId(ids: Collection<Long>, userId: String): List<JournalEntryEntity>

    @EntityGraph(attributePaths = ["emotions"])
    fun findAllByUserIdOrderByEntryDateDescCreatedAtDesc(userId: String): List<JournalEntryEntity>

    fun findAllByUserId(userId: String): List<JournalEntryEntity>
}
