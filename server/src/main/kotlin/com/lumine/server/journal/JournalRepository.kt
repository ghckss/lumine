package com.lumine.server.journal

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface JournalEntryRepository : JpaRepository<JournalEntryEntity, Long> {
    fun findByEntryDate(entryDate: LocalDate): JournalEntryEntity?

    fun findAllByOrderByEntryDateDescCreatedAtDesc(pageable: Pageable): List<JournalEntryEntity>
}
