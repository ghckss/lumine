package com.lumine.server.contentimport

import com.lumine.server.journal.JournalEntryRequest
import com.lumine.server.screening.ScreeningSubmissionRequest
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size

data class ContentImportRequest(
    @field:NotEmpty
    @field:Size(max = 100)
    @field:Valid
    val items: List<ContentImportItemRequest>
)

data class ContentImportItemRequest(
    @field:NotBlank
    @field:Size(max = 100)
    val id: String,
    val type: ContentImportItemType,
    @field:Valid
    val journal: JournalEntryRequest? = null,
    @field:Valid
    val screening: ScreeningSubmissionRequest? = null
)

enum class ContentImportItemType {
    JOURNAL,
    SCREENING
}

data class ContentImportResponse(
    val items: List<ContentImportItemResponse>
)

data class ContentImportItemResponse(
    val id: String,
    val status: ContentImportItemStatus,
    val message: String? = null
)

enum class ContentImportItemStatus {
    IMPORTED,
    ALREADY_IMPORTED,
    CONFLICT,
    FAILED
}
