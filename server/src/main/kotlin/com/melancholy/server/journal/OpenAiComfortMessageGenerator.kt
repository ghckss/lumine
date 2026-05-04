package com.melancholy.server.journal

import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Component
import com.melancholy.server.openai.OpenAiResponsesClient

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
            instructions = "한국어로만 답하세요. 감정 일기를 남긴 사용자에게 건네는 다정한 한 문장을 작성하세요. 50자 이상 110자 이하. 따뜻하고 조용한 톤. 훈계, 분석, 의료 조언, 이모지, 따옴표 금지.",
            input = prompt,
            temperature = 0.7
        ) ?: fallback
    }

    private fun buildPrompt(context: JournalComfortContext, fallback: String): String {
        val emotions = context.emotions.joinToString(", ")
        val recentSummary = context.recentEmotionSummary.joinToString(", ").ifBlank { "없음" }
        val body = context.body.ifBlank { "기록 본문 없음" }

        return """
            사용자가 오늘 남긴 감정 일기를 바탕으로, 마지막에 보여줄 다정한 문장 하나를 작성하세요.

            오늘 감정: $emotions
            오늘 기록: $body
            최근 자주 보인 감정: $recentSummary
            안전 신호 여부: ${context.hasSafetySignal}
            fallback 문장: $fallback
        """.trimIndent()
    }
}
