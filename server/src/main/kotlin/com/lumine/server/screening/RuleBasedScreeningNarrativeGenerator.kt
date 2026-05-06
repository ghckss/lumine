package com.lumine.server.screening

import org.springframework.stereotype.Component

@Component
class RuleBasedScreeningNarrativeGenerator : ScreeningNarrativeGenerator {
    override fun generate(context: ScreeningNarrativeContext): ScreeningNarrative =
        when {
            context.requiresSafetyPrompt -> ScreeningNarrative(
                publicSummary = "혼자 감당하기 벅찬 마음이 깊어지고 있는 것 같아요.",
                publicComfortMessage = "지금은 혼자 버티기보다 곁에 있는 도움과 바로 이어져도 괜찮아요.",
                recommendedActions = listOf(
                    "지금 바로 도움을 받을 수 있는 연결을 먼저 확인해봐요.",
                    "혼자 있지 말고 믿을 수 있는 사람 한 명에게 지금 마음을 알려봐요.",
                    "오늘 기록은 짧아도 괜찮으니, 지금 상태를 그대로 남겨봐요."
                )
            )

            context.totalScore >= 20 -> ScreeningNarrative(
                publicSummary = "지친 시간이 길어지면서 마음의 빛도 많이 흐려졌던 것 같아요.",
                publicComfortMessage = "지금 마음을 이렇게 확인한 것만으로도 충분히 의미 있어요. 오늘은 스스로를 조금 더 가볍게 대해줘도 괜찮아요.",
                recommendedActions = listOf(
                    "오늘 감정을 짧게라도 남겨봐요.",
                    "할 일을 줄이고 몸을 쉬게 하는 시간을 먼저 만들어봐요.",
                    "버거움이 이어지면 다시 한 번 상태를 살펴봐요."
                )
            )

            context.totalScore >= 10 -> ScreeningNarrative(
                publicSummary = "최근에 버거운 날이 조금 겹치면서 마음의 결이 흐트러졌던 것 같아요.",
                publicComfortMessage = "조금씩 흔들리는 마음도 그대로 남겨둬도 괜찮아요. 오늘은 무리하지 않고 숨을 고르는 쪽을 먼저 택해도 돼요.",
                recommendedActions = listOf(
                    "감정 세 가지만 먼저 남겨봐요.",
                    "오늘 가장 오래 남은 일을 짧게 적어봐요.",
                    "며칠 뒤 다시 한 번 살펴봐요."
                )
            )

            else -> ScreeningNarrative(
                publicSummary = "지금은 비교적 잘 버텨내고 있는 흐름이 보여요.",
                publicComfortMessage = "가벼운 날의 결도 충분히 남겨둘 가치가 있어요. 오늘 괜찮았던 순간도 조용히 적어봐도 좋아요.",
                recommendedActions = listOf(
                    "괜찮았던 감정도 함께 남겨봐요.",
                    "지금 흐름을 천천히 이어가봐요.",
                    "필요할 때 다시 상태를 확인해봐요."
                )
            )
        }
}
