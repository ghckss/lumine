package com.lumine.server.screening

import jakarta.validation.constraints.NotEmpty
import java.time.LocalDate

data class ScreeningQuestionnaireResponse(
    val version: String,
    val title: String,
    val subtitle: String,
    val sections: List<ScreeningQuestionSectionResponse>
)

data class ScreeningQuestionSectionResponse(
    val id: String,
    val title: String,
    val items: List<ScreeningQuestionItemResponse>
)

data class ScreeningQuestionItemResponse(
    val id: String,
    val kind: String,
    val title: String,
    val description: String? = null,
    val required: Boolean,
    val options: List<ScreeningQuestionOptionResponse> = emptyList()
)

data class ScreeningQuestionOptionResponse(
    val value: String,
    val label: String,
    val score: Int? = null
)

data class ScreeningSubmissionRequest(
    @field:NotEmpty
    val answers: Map<String, String>
)

data class ScreeningResultResponse(
    val publicSummary: String,
    val publicComfortMessage: String,
    val recommendedActions: List<String>,
    val recommendedRescreenAt: LocalDate,
    val requiresSafetyPrompt: Boolean
)

data class ScreeningHistoryItemResponse(
    val completedDate: LocalDate,
    val publicSummary: String,
    val recommendedRescreenAt: LocalDate,
    val requiresSafetyPrompt: Boolean
)

data class ScreeningExportResponse(
    val completedDate: LocalDate,
    val answers: Map<String, String>,
    val publicSummary: String,
    val publicComfortMessage: String,
    val recommendedActions: List<String>,
    val recommendedRescreenAt: LocalDate,
    val requiresSafetyPrompt: Boolean
)

enum class ScreeningSubtype {
    MAJOR_DEPRESSION_TENDENCY,
    PERSISTENT_DEPRESSION_TENDENCY,
    SEASONAL_PATTERN_POSSIBLE,
    PERINATAL_CONTEXT_POSSIBLE,
    STRESS_ADAPTATION_POSSIBLE,
    BIPOLAR_RULE_OUT_NEEDED
}

enum class ScreeningChronicity {
    SHORT_TERM,
    LONG_TERM
}

data class ScreeningRecord(
    val completedDate: LocalDate,
    val result: ScreeningResultResponse,
    val internalSubtype: ScreeningSubtype,
    val internalChronicity: ScreeningChronicity
)
