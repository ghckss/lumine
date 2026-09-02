package com.lumine.server.user

import com.lumine.server.common.Time
import com.lumine.server.contentimport.ContentImportReceiptRepository
import com.lumine.server.journal.JournalEntryRepository
import com.lumine.server.journal.JournalService
import com.lumine.server.screening.ScreeningService
import com.lumine.server.screening.ScreeningSessionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserDataService(
    private val userService: UserService,
    private val userRepository: UserRepository,
    private val journalService: JournalService,
    private val journalEntryRepository: JournalEntryRepository,
    private val screeningService: ScreeningService,
    private val screeningSessionRepository: ScreeningSessionRepository,
    private val contentImportReceiptRepository: ContentImportReceiptRepository
) {
    @Transactional(readOnly = true)
    fun export(userId: String): UserDataExportResponse =
        UserDataExportResponse(
            schemaVersion = "2026-09-01",
            exportedAt = Time.now(),
            profile = userService.getCurrentUser(userId),
            journals = journalService.getAllEntries(userId),
            screenings = screeningService.getAllExportRecords(userId)
        )

    @Transactional
    fun delete(userId: String): DeleteUserResponse {
        journalEntryRepository.deleteAll(journalEntryRepository.findAllByUserId(userId))
        screeningSessionRepository.deleteAll(screeningSessionRepository.findAllByUserIdOrderByCompletedDateDescIdDesc(userId))
        contentImportReceiptRepository.deleteAll(contentImportReceiptRepository.findAllByUserId(userId))

        journalEntryRepository.flush()
        screeningSessionRepository.flush()
        contentImportReceiptRepository.flush()
        userRepository.deleteById(userId)
        return DeleteUserResponse(success = true)
    }
}
