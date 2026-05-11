package com.lumine.server.journal

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate

interface JournalEntryRepository : JpaRepository<JournalEntryEntity, Long> {
    @EntityGraph(attributePaths = ["emotions"])
    fun findByEntryDate(entryDate: LocalDate): JournalEntryEntity?

    @Query("select entry.id from JournalEntryEntity entry order by entry.entryDate desc, entry.createdAt desc")
    fun findRecentIds(pageable: Pageable): List<Long>

    @EntityGraph(attributePaths = ["emotions"])
    fun findAllByIdIn(ids: Collection<Long>): List<JournalEntryEntity>
}
