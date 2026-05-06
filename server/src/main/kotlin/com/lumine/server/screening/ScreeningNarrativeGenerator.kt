package com.lumine.server.screening

data class ScreeningNarrative(
    val publicSummary: String,
    val publicComfortMessage: String,
    val recommendedActions: List<String>
)

data class ScreeningNarrativeContext(
    val totalScore: Int,
    val withdrawalScore: Int,
    val hopeScore: Int,
    val requiresSafetyPrompt: Boolean,
    val narrativeAnswer: String,
    val answers: Map<String, String>
)

interface ScreeningNarrativeGenerator {
    fun generate(context: ScreeningNarrativeContext): ScreeningNarrative
}
