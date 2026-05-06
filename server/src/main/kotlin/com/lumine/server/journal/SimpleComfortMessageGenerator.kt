package com.lumine.server.journal

import org.springframework.stereotype.Component

@Component
class SimpleComfortMessageGenerator : ComfortMessageGenerator {
    private val heavyEmotions = setOf("지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움")
    private val fallback = "오늘 마음을 여기까지 데려오느라 애썼어요. 잠시 그대로 쉬어가도 괜찮아요."

    override fun generate(context: JournalComfortContext): String {
        if (context.hasSafetySignal) {
            return "지금 마음이 많이 버거웠다면, 그 무게를 혼자만 들고 있지 않았으면 해요."
        }

        val heavyCount = context.emotions.count { heavyEmotions.contains(it) }
        val leadEmotion = context.emotions.firstOrNull() ?: "마음"

        return when {
            heavyCount > 0 ->
                "오늘 ${leadEmotion}이 오래 머물렀다면, 그 마음을 견디느라 많이 애썼을 거예요."

            context.body.isNotBlank() ->
                "오늘의 일을 말로 꺼내기까지도 쉽지 않았을 텐데, 그 마음을 조용히 들어둘게요."

            else -> fallback
        }
    }
}
