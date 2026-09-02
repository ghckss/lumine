package com.lumine.server.journal

import com.lumine.server.common.Time
import com.lumine.server.user.UserService
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class JournalService(
    private val comfortMessageGenerator: ComfortMessageGenerator,
    private val journalEntryRepository: JournalEntryRepository,
    private val userService: UserService
) {
    @Transactional(readOnly = true)
    fun getEntry(userId: String, date: LocalDate): JournalEntryResponse? =
        journalEntryRepository.findByUserIdAndEntryDate(userId, date)?.toResponse()

    @Transactional(readOnly = true)
    fun getEntries(userId: String, limit: Int): List<JournalEntryResponse> =
        findRecentEntriesWithEmotions(userId, limit).map { it.toResponse() }

    @Transactional
    fun save(userId: String, request: JournalEntryRequest): JournalEntryResponse {
        val targetDate = request.date ?: Time.today()
        val recentEmotionSummary = getRecentEmotionSummary(userId)

        val comfortMessage = comfortMessageGenerator.generate(
            JournalComfortContext(
                emotions = request.emotions,
                body = request.body,
                recentEmotionSummary = recentEmotionSummary,
                hasSafetySignal = false
            )
        )

        val entity = journalEntryRepository.findByUserIdAndEntryDate(userId, targetDate)
            ?: JournalEntryEntity(
                user = userService.requireEntity(userId),
                entryDate = targetDate,
                body = "",
                comfortMessage = comfortMessage,
                createdAt = Time.now()
            )

        entity.body = request.body
        entity.comfortMessage = comfortMessage
        entity.createdAt = Time.now()
        entity.replaceEmotions(request.emotions)

        return journalEntryRepository.save(entity).toResponse()
    }

    private fun getRecentEmotionSummary(userId: String): List<String> =
        findRecentEntriesWithEmotions(userId, 10)
            .flatMap { entry -> entry.emotions.map { emotion -> emotion.label } }
            .groupingBy { it }
            .eachCount()
            .entries
            .sortedByDescending { it.value }
            .take(3)
            .map { it.key }

    private fun findRecentEntriesWithEmotions(userId: String, limit: Int): List<JournalEntryEntity> {
        val ids = journalEntryRepository.findRecentIds(userId, PageRequest.of(0, limit))
        if (ids.isEmpty()) {
            return emptyList()
        }

        val orderById = ids.withIndex().associate { it.value to it.index }
        return journalEntryRepository.findAllByIdInAndUserId(ids, userId)
            .sortedBy { orderById[it.id] ?: Int.MAX_VALUE }
    }

    private fun JournalEntryEntity.toResponse(): JournalEntryResponse =
        JournalEntryResponse(
            date = entryDate,
            emotions = emotions.map { JournalEmotionResponse(id = it.emotionId, label = it.label) },
            body = body,
            comfortMessage = comfortMessage,
            createdAt = createdAt
        )
}
