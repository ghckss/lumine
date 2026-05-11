package com.lumine.server.screening

import org.springframework.stereotype.Component

@Component
class RuleBasedScreeningNarrativeGenerator : ScreeningNarrativeGenerator {
    override fun generate(context: ScreeningNarrativeContext): ScreeningNarrative =
        when {
            context.requiresSafetyPrompt -> ScreeningNarrative(
                publicSummary = "지금은 혼자 견디기엔 부담이 클 수 있어요.",
                publicComfortMessage = "이런 순간에는 혼자서 다 버티려 하지 않아도 괜찮아요. 가까운 도움과 먼저 연결되는 것이 필요할 수 있어요.",
                recommendedActions = listOf(
                    "지금 바로 도움을 받을 수 있는 연결을 먼저 확인해봐요.",
                    "믿을 수 있는 사람 한 명에게 지금 상태를 알려봐요.",
                    "짧게라도 지금 느끼는 것을 남겨봐요."
                )
            )

            context.totalScore >= 20 -> ScreeningNarrative(
                publicSummary = "최근 지친 상태가 꽤 오래 이어졌을 수 있어요.",
                publicComfortMessage = "버거움이 오래 이어질 때는 작은 일도 크게 느껴질 수 있어요. 오늘은 해야 할 일을 조금 줄이고 쉬는 쪽을 먼저 생각해봐요.",
                recommendedActions = listOf(
                    "오늘 감정을 짧게라도 남겨봐요.",
                    "할 일을 하나 줄이고 쉬는 시간을 만들어봐요.",
                    "버거움이 이어지면 주변에 알려봐요."
                )
            )

            context.totalScore >= 10 -> ScreeningNarrative(
                publicSummary = "최근 마음이 쉽게 편해지지 않았을 수 있어요.",
                publicComfortMessage = "부담이 겹치면 사소한 일도 오래 남을 수 있어요. 지금은 그 감정을 억지로 정리하려 하기보다 잠시 쉬어가도 괜찮아요.",
                recommendedActions = listOf(
                    "감정 세 가지만 먼저 남겨봐요.",
                    "오늘 가장 오래 남은 일을 짧게 적어봐요.",
                    "잠시 쉬어갈 시간을 정해봐요."
                )
            )

            else -> ScreeningNarrative(
                publicSummary = "오늘은 비교적 크게 무겁지 않은 상태로 보여요.",
                publicComfortMessage = "크게 흔들리지 않은 날도 그냥 지나치지 않아도 괜찮아요. 편했던 순간이 있었다면 짧게 남겨두어도 좋아요.",
                recommendedActions = listOf(
                    "편했던 감정을 하나 남겨봐요.",
                    "오늘 괜찮았던 순간을 적어봐요.",
                    "필요할 때 다시 상태를 확인해봐요."
                )
            )
        }
}
