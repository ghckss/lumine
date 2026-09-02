package com.lumine.server.contentimport

import com.lumine.server.journal.JournalService
import com.lumine.server.screening.ScreeningService
import com.lumine.server.user.UserService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Service
class ContentImportService(
    private val contentImportItemService: ContentImportItemService
) {
    fun import(userId: String, request: ContentImportRequest): ContentImportResponse =
        ContentImportResponse(
            items = request.items.map { item ->
                runCatching { contentImportItemService.import(userId, item) }
                    .fold(
                        onSuccess = { it },
                        onFailure = { error ->
                            if (error is ContentImportConflictException) {
                                ContentImportItemResponse(
                                    id = item.id,
                                    status = ContentImportItemStatus.CONFLICT,
                                    message = "같은 날짜의 서버 일기가 있어 기기 기록을 유지했습니다."
                                )
                            } else {
                                ContentImportItemResponse(
                                    id = item.id,
                                    status = ContentImportItemStatus.FAILED,
                                    message = "기록을 이전하지 못했습니다. 다시 시도해주세요."
                                )
                            }
                        }
                    )
            }
        )
}

@Service
class ContentImportItemService(
    private val contentImportReceiptRepository: ContentImportReceiptRepository,
    private val journalService: JournalService,
    private val screeningService: ScreeningService,
    private val userService: UserService
) {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun import(userId: String, item: ContentImportItemRequest): ContentImportItemResponse {
        if (contentImportReceiptRepository.existsByUserIdAndItemId(userId, item.id)) {
            return ContentImportItemResponse(item.id, ContentImportItemStatus.ALREADY_IMPORTED)
        }

        when (item.type) {
            ContentImportItemType.JOURNAL -> importJournal(userId, item)
            ContentImportItemType.SCREENING -> importScreening(userId, item)
        }

        contentImportReceiptRepository.save(
            ContentImportReceiptEntity(
                user = userService.requireEntity(userId),
                itemId = item.id,
                itemType = item.type
            )
        )
        return ContentImportItemResponse(item.id, ContentImportItemStatus.IMPORTED)
    }

    private fun importJournal(userId: String, item: ContentImportItemRequest) {
        val journal = requireNotNull(item.journal) { "journal payload is required" }
        val date = requireNotNull(journal.date) { "journal date is required" }
        if (journalService.getEntry(userId, date) != null) {
            throw ContentImportConflictException()
        }
        journalService.save(userId, journal)
    }

    private fun importScreening(userId: String, item: ContentImportItemRequest) {
        val screening = requireNotNull(item.screening) { "screening payload is required" }
        screeningService.submit(userId, screening)
    }
}

class ContentImportConflictException : RuntimeException()
