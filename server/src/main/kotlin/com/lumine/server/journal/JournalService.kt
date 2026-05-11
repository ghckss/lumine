package com.lumine.server.journal

import com.lumine.server.common.Time
import jakarta.annotation.PostConstruct
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class JournalService(
    private val comfortMessageGenerator: ComfortMessageGenerator,
    private val journalEntryRepository: JournalEntryRepository
) {
    @PostConstruct
    fun seed() {
        if (journalEntryRepository.count() > 0) {
            return
        }

        saveSeed(
            date = LocalDate.of(2026, 4, 28),
            emotions = listOf("차분함", "안도감", "고마움"),
            body = "오전에 조금 바빴지만, 저녁에는 한숨 돌릴 수 있었어요.",
            comfortMessage = "바쁜 하루를 지나온 뒤라면, 지금은 잠시 편하게 쉬어도 괜찮아요."
        )
        saveSeed(
            date = LocalDate.of(2026, 4, 27),
            emotions = listOf("지침", "답답함", "차분함"),
            body = "하루가 길었지만, 저녁이 되니 조금은 정리되는 느낌이 들었어요.",
            comfortMessage = "길었던 하루를 지나오느라 지쳤을 텐데, 지금은 조금 천천히 쉬어도 괜찮아요."
        )
    }

    @Transactional(readOnly = true)
    fun getEntry(date: LocalDate): JournalEntryResponse? =
        journalEntryRepository.findByEntryDate(date)?.toResponse()

    @Transactional(readOnly = true)
    fun getEntries(limit: Int): List<JournalEntryResponse> =
        findRecentEntriesWithEmotions(limit).map { it.toResponse() }

    @Transactional
    fun save(request: JournalEntryRequest): JournalEntryResponse {
        val targetDate = request.date ?: Time.today()
        val recentEmotionSummary = getRecentEmotionSummary()

        val comfortMessage = comfortMessageGenerator.generate(
            JournalComfortContext(
                emotions = request.emotions,
                body = request.body,
                recentEmotionSummary = recentEmotionSummary,
                hasSafetySignal = false
            )
        )

        val entity = journalEntryRepository.findByEntryDate(targetDate)
            ?: JournalEntryEntity(
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

    private fun saveSeed(
        date: LocalDate,
        emotions: List<String>,
        body: String,
        comfortMessage: String
    ) {
        val entity = JournalEntryEntity(
            entryDate = date,
            body = body,
            comfortMessage = comfortMessage,
            createdAt = Time.now().minusDays(1)
        )
        entity.replaceEmotions(emotions)
        journalEntryRepository.save(entity)
    }

    private fun getRecentEmotionSummary(): List<String> =
        findRecentEntriesWithEmotions(10)
            .flatMap { entry -> entry.emotions.map { emotion -> emotion.label } }
            .groupingBy { it }
            .eachCount()
            .entries
            .sortedByDescending { it.value }
            .take(3)
            .map { it.key }

    private fun findRecentEntriesWithEmotions(limit: Int): List<JournalEntryEntity> {
        val ids = journalEntryRepository.findRecentIds(PageRequest.of(0, limit))
        if (ids.isEmpty()) {
            return emptyList()
        }

        val orderById = ids.withIndex().associate { it.value to it.index }
        return journalEntryRepository.findAllByIdIn(ids)
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
