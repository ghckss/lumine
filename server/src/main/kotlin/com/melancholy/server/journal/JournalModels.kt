package com.melancholy.server.journal

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.time.OffsetDateTime

data class JournalEmotionResponse(
    val id: String,
    val label: String
)

data class JournalEntryResponse(
    val date: LocalDate,
    val emotions: List<JournalEmotionResponse>,
    val body: String,
    val comfortMessage: String,
    val createdAt: OffsetDateTime
)

data class JournalEntryRequest(
    val date: LocalDate?,
    @field:NotEmpty
    @field:Size(min = 3, max = 3)
    val emotions: List<@NotBlank String>,
    val body: String = ""
)

data class JournalComfortContext(
    val emotions: List<String>,
    val body: String,
    val recentEmotionSummary: List<String>,
    val hasSafetySignal: Boolean
)
