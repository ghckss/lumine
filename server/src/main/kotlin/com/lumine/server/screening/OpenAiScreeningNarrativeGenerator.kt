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
            instructions = buildInstructions(),
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
            recommendedActions.size < 3 ||
            !isNarrativeSafe(publicSummary, publicComfortMessage)
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

    private fun buildInstructions(): String =
        """
            한국어로만 답하세요.
            심리 검사 결과 화면에서 보여줄 짧은 위로 문구를 작성합니다.
            전문 진단이 아니라, 상담사가 사용자의 이야기를 조심스럽게 듣고 건네는 말처럼 작성하세요.
            말투는 자연스러운 해요체를 사용하고, 어렵거나 꾸민 표현보다 쉽게 읽히는 문장을 우선하세요.

            결과 문구 역할:
            - publicSummary: 결과 카드의 큰 제목입니다. 사용자의 상태를 단정하지 말고, 지금 마음에 건네는 위로 한마디로 작성하세요. 30~65자 권장.
            - publicComfortMessage: 제목 아래 설명입니다. 사용자의 자유서술은 여기에서만 조심스럽게 참고하고, 평가 없이 받아주는 문장으로 작성하세요. 60~120자 권장.
            - recommendedActions: 사용자가 부담 없이 해볼 수 있는 작은 행동 3개입니다. 각 문장은 20~45자 정도로 짧게 작성하세요.

            publicSummary 작성 규칙:
            - 사용자가 쓴 사건, 관계, 장소를 그대로 제목에 올리지 마세요.
            - "회사", "외부 팀", "사람처럼", "밀려난"처럼 사용자의 상처가 담긴 표현을 제목에서 반복하지 마세요.
            - "{사건}이 마음에 오래 머무는 흐름" 같은 어색한 명사 연결을 만들지 마세요.
            - 비유나 서비스 고유 어휘를 억지로 쓰지 말고, 단순하고 자연스럽게 말하세요.

            금지:
            - 의료 진단, 병명 단정, 치료 지시, 위험도 낙인, 점수 직접 노출.
            - "정답", "반드시", "무조건", "큰일", "위험합니다" 같은 압박감 있는 표현.
            - "잘했다", "의미 있다", "충분히 잘하고 있다"처럼 평가하거나 칭찬으로 덮는 표현.
            - 이모지, 따옴표, 마크다운, 영어.
            - fallback 문장을 그대로 복사하지 마세요. fallback은 톤 참고용입니다.
        """.trimIndent()

    private fun buildPrompt(context: ScreeningNarrativeContext, fallback: ScreeningNarrative): String {
        val severity = when {
            context.requiresSafetyPrompt -> "safety"
            context.totalScore >= 20 -> "high"
            context.totalScore >= 10 -> "medium"
            else -> "low"
        }

        return """
            아래 심리 검사 결과를 바탕으로 결과 화면 문구를 작성하세요.
            원본 답변의 숫자는 0이 낮고 3이 높은 빈도를 뜻합니다.
            자유 서술 답변은 사용자의 맥락을 이해하기 위한 참고 자료입니다.
            자유 서술의 사건을 추측하거나 요약하지 말고, 사용자가 느꼈을 부담만 조심스럽게 반영하세요.

            심각도별 정서 방향:
            - low: 크게 무겁지 않은 상태를 과장하지 않고 부드럽게 확인합니다.
            - medium: 최근의 부담을 인정하고, 작은 회복 행동으로 이어줍니다.
            - high: 지침이 이어진 상태를 인정하고, 부담을 줄이는 행동을 우선합니다.
            - safety: 혼자 견디지 않도록 연결을 권하되, 놀라게 하거나 낙인찍지 않습니다.

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

    private fun isNarrativeSafe(publicSummary: String, publicComfortMessage: String): Boolean {
        val combined = "$publicSummary $publicComfortMessage"
        val blockedFragments = listOf(
            "밀려난 듯한 느낌이 마음에 오래 머무는 흐름",
            "의미없는 사람",
            "의미 없는 사람"
        )

        return blockedFragments.none { combined.contains(it) }
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
