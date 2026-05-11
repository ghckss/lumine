package com.lumine.server.journal

import org.springframework.stereotype.Component

@Component
class SimpleComfortMessageGenerator : ComfortMessageGenerator {
    private val heavyEmotions = setOf("지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움")
    private val fallback = "오늘 하루를 지나오느라 힘이 들었다면, 잠시 쉬어가도 괜찮아요."

    override fun generate(context: JournalComfortContext): String {
        if (context.hasSafetySignal) {
            return "지금 마음이 많이 버거웠다면, 그 무게를 혼자만 들고 있지 않았으면 해요."
        }

        val heavyCount = context.emotions.count { heavyEmotions.contains(it) }
        val leadEmotion = context.emotions.firstOrNull() ?: "마음"

        return when {
            heavyCount > 0 ->
                "오늘 ${leadEmotion}이 크게 느껴졌다면, 잠시 그 감정을 내려놓을 시간이 필요할 수 있어요."

            context.body.isNotBlank() ->
                "오늘의 일을 말로 꺼내는 것만으로도 힘이 들 수 있어요. 지금은 천천히 쉬어가도 괜찮아요."

            else -> fallback
        }
    }
}
