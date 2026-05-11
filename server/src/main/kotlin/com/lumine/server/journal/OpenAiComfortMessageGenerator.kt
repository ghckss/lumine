package com.lumine.server.journal

import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Component
import com.lumine.server.openai.OpenAiResponsesClient

@Component
@Primary
class OpenAiComfortMessageGenerator(
    private val openAiResponsesClient: OpenAiResponsesClient,
    private val fallbackGenerator: SimpleComfortMessageGenerator
) : ComfortMessageGenerator {
    override fun generate(context: JournalComfortContext): String {
        val fallback = fallbackGenerator.generate(context)
        val prompt = buildPrompt(context, fallback)

        return openAiResponsesClient.generateText(
            instructions = "한국어로만 답하세요. 감정 일기 마지막에 보여줄 짧은 위로 한 문장을 작성하세요. 상담사가 사용자의 이야기를 조심스럽게 듣고 건네는 말처럼 자연스러운 해요체로 작성하세요. 사용자의 감정을 평가하거나 해석하지 말고, 잘했다/의미 있다 같은 평가도 피하세요. 50자 이상 110자 이하. 훈계, 분석, 의료 조언, 이모지, 따옴표, 마크다운 금지.",
            input = prompt,
            temperature = 0.7
        ) ?: fallback
    }

    private fun buildPrompt(context: JournalComfortContext, fallback: String): String {
        val emotions = context.emotions.joinToString(", ")
        val recentSummary = context.recentEmotionSummary.joinToString(", ").ifBlank { "없음" }
        val body = context.body.ifBlank { "기록 본문 없음" }

        return """
            사용자가 오늘 남긴 감정 일기를 바탕으로, 마지막에 보여줄 공감과 위로의 문장 하나를 작성하세요.
            특정 표현이나 비유를 억지로 쓰지 말고, 사용자가 쓴 말에서 느껴지는 부담을 조심스럽게 받아주세요.
            감정 상태를 평가하거나 요약하지 말고, 사용자가 혼자 감당하지 않아도 된다는 느낌을 주세요.

            오늘 감정: $emotions
            오늘 기록: $body
            최근 자주 보인 감정: $recentSummary
            안전 신호 여부: ${context.hasSafetySignal}
            fallback 문장: $fallback
        """.trimIndent()
    }
}
