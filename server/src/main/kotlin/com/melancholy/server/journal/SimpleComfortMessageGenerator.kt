package com.melancholy.server.journal

import org.springframework.stereotype.Component

@Component
class SimpleComfortMessageGenerator : ComfortMessageGenerator {
    private val positiveEmotions = setOf("차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘")
    private val heavyEmotions = setOf("지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움")
    private val fallback = "오늘 마음을 남겨줘서 고마워요. 천천히 하루를 내려놔도 괜찮아요."

    override fun generate(context: JournalComfortContext): String {
        if (context.hasSafetySignal) {
            return "지금 마음이 많이 버거웠을 것 같아요. 혼자 두지 말고 바로 도움을 붙잡아도 괜찮아요."
        }

        val positiveCount = context.emotions.count { positiveEmotions.contains(it) }
        val heavyCount = context.emotions.count { heavyEmotions.contains(it) }

        return when {
            positiveCount == 3 ->
                "가벼운 결이 남아 있었네요. 오늘의 좋은 마음도 그대로 기억해도 괜찮아요."

            heavyCount == 3 ->
                "무거운 감정이 겹친 하루였네요. 이렇게 남겨준 것만으로도 충분히 잘 버틴 거예요."

            positiveCount > 0 && heavyCount > 0 ->
                "가벼운 마음과 무거운 마음이 함께 있었네요. 어느 쪽이든 그대로 느껴도 괜찮아요."

            context.body.isNotBlank() ->
                "오늘 있었던 일을 남겨줘서 고마워요. 바로 정리되지 않는 마음이어도 괜찮아요."

            else -> fallback
        }
    }
}
