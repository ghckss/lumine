package com.lumine.server.screening

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.lumine.server.openai.OpenAiResponsesClient
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Component

@Component
@Primary
class OpenAiScreeningNarrativeGenerator(
    private val openAiResponsesClient: OpenAiResponsesClient,
    private val fallbackGenerator: RuleBasedScreeningNarrativeGenerator,
    private val objectMapper: ObjectMapper
) : ScreeningNarrativeGenerator {
    override fun generate(context: ScreeningNarrativeContext): ScreeningNarrative {
        val fallback = fallbackGenerator.generate(context)
        val response = openAiResponsesClient.generateStructured(
            instructions = "한국어로만 답하세요. 심리 검사 결과 화면에 들어갈 문구를 작성합니다. 사용자에게 다정하고 비임상적인 문장으로 안내하세요. 추천 행동은 짧고 실천 가능한 문장 3개만 작성하세요. 분석적 낙인, 의료 진단, 과도한 확언, 이모지, 따옴표 금지.",
            input = buildPrompt(context, fallback),
            schemaName = "screening_narrative",
            schema = buildSchema()
        ) ?: return fallback

        val publicSummary = response.path("publicSummary").asText("").trim()
        val publicComfortMessage = response.path("publicComfortMessage").asText("").trim()
        val recommendedActions = response.path("recommendedActions")
            .takeIf { it.isArray }
            ?.mapNotNull { item -> item.asText(null)?.trim()?.takeIf { text -> text.isNotBlank() } }
            .orEmpty()

        return if (
            publicSummary.isBlank() ||
            publicComfortMessage.isBlank() ||
            recommendedActions.size < 3
        ) {
            fallback
        } else {
            ScreeningNarrative(
                publicSummary = publicSummary,
                publicComfortMessage = publicComfortMessage,
                recommendedActions = recommendedActions.take(3)
            )
        }
    }

    private fun buildPrompt(context: ScreeningNarrativeContext, fallback: ScreeningNarrative): String {
        val severity = when {
            context.requiresSafetyPrompt -> "safety"
            context.totalScore >= 20 -> "high"
            context.totalScore >= 10 -> "medium"
            else -> "low"
        }

        return """
            아래 심리 검사 결과를 바탕으로 결과 화면 문구를 작성하세요.

            위험 안내 필요: ${context.requiresSafetyPrompt}
            심각도 단계: $severity
            총점: ${context.totalScore}
            q9 점수: ${context.withdrawalScore}
            q10 점수: ${context.hopeScore}
            자유 서술 답변: ${context.narrativeAnswer.ifBlank { "없음" }}
            원본 답변: ${context.answers.entries.sortedBy { it.key }.joinToString(", ") { "${it.key}=${it.value}" }}

            fallback summary: ${fallback.publicSummary}
            fallback comfort: ${fallback.publicComfortMessage}
            fallback actions: ${fallback.recommendedActions.joinToString(" / ")}
        """.trimIndent()
    }

    private fun buildSchema(): ObjectNode =
        objectMapper.createObjectNode().apply {
            put("type", "object")
            putArray("required").apply {
                add("publicSummary")
                add("publicComfortMessage")
                add("recommendedActions")
            }
            put("additionalProperties", false)
            set<ObjectNode>("properties", objectMapper.createObjectNode().apply {
                putObject("publicSummary").apply {
                    put("type", "string")
                }
                putObject("publicComfortMessage").apply {
                    put("type", "string")
                }
                putObject("recommendedActions").apply {
                    put("type", "array")
                    putObject("items").put("type", "string")
                    put("minItems", 3)
                    put("maxItems", 3)
                }
            })
        }
}
