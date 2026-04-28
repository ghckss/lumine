package com.melancholy.server.screening

import com.melancholy.server.common.Time
import jakarta.annotation.PostConstruct
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class ScreeningService(
    private val screeningSessionRepository: ScreeningSessionRepository
) {
    @PostConstruct
    fun seed() {
        if (screeningSessionRepository.count() > 0) {
            return
        }

        val result = ScreeningResultResponse(
            publicSummary = "요즘 혼자 버티는 시간이 조금 길어졌던 것 같아요.",
            publicComfortMessage = "오늘 상태를 들여다본 것만으로도 충분히 의미 있어요.",
            recommendedActions = listOf(
                "오늘 감정을 짧게라도 기록해봐요.",
                "믿을 수 있는 사람 한 명에게 지금 마음을 나눠봐요.",
                "며칠 더 힘들다면 다시 한 번 상태를 살펴봐요."
            ),
            recommendedRescreenAt = LocalDate.of(2026, 4, 29),
            requiresSafetyPrompt = false
        )

        screeningSessionRepository.save(
            ScreeningSessionEntity(
                completedDate = LocalDate.of(2026, 4, 1),
                publicSummary = result.publicSummary,
                publicComfortMessage = result.publicComfortMessage,
                recommendedRescreenAt = result.recommendedRescreenAt,
                requiresSafetyPrompt = result.requiresSafetyPrompt,
                internalSubtype = ScreeningSubtype.STRESS_ADAPTATION_POSSIBLE,
                internalChronicity = ScreeningChronicity.SHORT_TERM
            ).apply {
                replaceRecommendedActions(result.recommendedActions)
                replaceAnswers(
                    mapOf(
                        "q1" to "2",
                        "q2" to "2",
                        "q3" to "1",
                        "q4" to "1",
                        "q5" to "1",
                        "q6" to "1",
                        "q7" to "1",
                        "q8" to "1",
                        "q9" to "0",
                        "q10" to "1"
                    )
                )
            }
        )
    }

    fun getQuestionnaire(): ScreeningQuestionnaireResponse =
        ScreeningQuestionnaireResponse(
            version = "2026-04-ko-mvp",
            title = "[Lumine] 마음 결 살펴보기 (10문항)",
            subtitle = "최근 일주일 동안, 얼마나 자주 이런 마음이 머물렀나요?",
            sections = listOf(
                ScreeningQuestionSectionResponse(
                    id = "core",
                    title = "마음의 흐름",
                    items = listOf(
                        ScreeningQuestionItemResponse(
                            id = "q1",
                            kind = "single_choice",
                            title = "평소 즐겁게 하던 일들이 오늘따라 무채색처럼 느껴졌나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q2",
                            kind = "single_choice",
                            title = "마음 한구석에 설명하기 어려운 가라앉은 기분이 계속 머물렀나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q3",
                            kind = "single_choice",
                            title = "밤새 깊은 잠에 들지 못하거나, 반대로 자고 일어나도 여전히 꿈속인 듯 무거웠나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q4",
                            kind = "single_choice",
                            title = "몸에 물을 머금은 듯 무겁고, 사소한 움직임조차 버겁게 느껴진 적이 있나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q5",
                            kind = "single_choice",
                            title = "입맛이 너무 없거나, 반대로 허전한 마음을 채우려 무언가를 계속 찾게 되었나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q6",
                            kind = "single_choice",
                            title = "내 자신이 조금은 실망스럽거나, 주변 사람들에게 미안한 마음이 불쑥 찾아왔나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q7",
                            kind = "single_choice",
                            title = "책을 읽거나 대화를 나눌 때, 생각이 자꾸만 다른 곳으로 흩어지곤 했나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q8",
                            kind = "single_choice",
                            title = "행동이나 말이 평소보다 느려졌다는 느낌, 혹은 반대로 너무 불안해서 가만히 있기 힘들었나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q9",
                            kind = "single_choice",
                            title = "세상으로부터 조금 떨어져 혼자만의 어둠 속에 숨고 싶다는 생각을 했나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        ),
                        ScreeningQuestionItemResponse(
                            id = "q10",
                            kind = "single_choice",
                            title = "내일의 빛이 오늘보다 더 밝을 거라는 기대가 조금은 흐릿하게 보였나요?",
                            required = true,
                            options = listOf(
                                ScreeningQuestionOptionResponse("0", "전혀 그렇지 않음", 0),
                                ScreeningQuestionOptionResponse("1", "가끔 그러함", 1),
                                ScreeningQuestionOptionResponse("2", "자주 그러함", 2),
                                ScreeningQuestionOptionResponse("3", "거의 매일 그러함", 3)
                            )
                        )
                    )
                ),
                ScreeningQuestionSectionResponse(
                    id = "narrative",
                    title = "조금 더 들려주세요",
                    items = listOf(
                        ScreeningQuestionItemResponse(
                            id = "n1",
                            kind = "long_text",
                            title = "요즘 가장 자주 마음에 남는 일이 있다면 적어볼래요?",
                            description = "필수는 아니에요. 괜찮은 만큼만 적어도 돼요",
                            required = false
                        )
                    )
                )
            )
        )

    @Transactional
    fun submit(request: ScreeningSubmissionRequest): ScreeningResultResponse {
        val score = request.answers.values.sumOf { it.toIntOrNull() ?: 0 }
        val withdrawalScore = request.answers["q9"]?.toIntOrNull() ?: 0
        val hopeScore = request.answers["q10"]?.toIntOrNull() ?: 0
        val requiresSafetyPrompt = withdrawalScore >= 3 || hopeScore >= 3

        val result = when {
            requiresSafetyPrompt -> ScreeningResultResponse(
                publicSummary = "혼자 감당하기 벅찬 마음이 깊어지고 있는 것 같아요.",
                publicComfortMessage = "지금은 혼자 버티기보다 곁에 있는 도움과 바로 이어져도 괜찮아요.",
                recommendedActions = listOf(
                    "지금 바로 도움을 받을 수 있는 연결을 먼저 확인해봐요.",
                    "혼자 있지 말고 믿을 수 있는 사람 한 명에게 지금 마음을 알려봐요.",
                    "오늘 기록은 짧아도 괜찮으니, 지금 상태를 그대로 남겨봐요."
                ),
                recommendedRescreenAt = Time.today().plusWeeks(4),
                requiresSafetyPrompt = true
            )

            score >= 20 -> ScreeningResultResponse(
                publicSummary = "지친 시간이 길어지면서 마음의 빛도 많이 흐려졌던 것 같아요.",
                publicComfortMessage = "지금 마음을 이렇게 확인한 것만으로도 충분히 의미 있어요. 오늘은 스스로를 조금 더 가볍게 대해줘도 괜찮아요.",
                recommendedActions = listOf(
                    "오늘 감정을 짧게라도 남겨봐요.",
                    "할 일을 줄이고 몸을 쉬게 하는 시간을 먼저 만들어봐요.",
                    "버거움이 이어지면 다시 한 번 상태를 살펴봐요."
                ),
                recommendedRescreenAt = Time.today().plusWeeks(4),
                requiresSafetyPrompt = false
            )

            score >= 10 -> ScreeningResultResponse(
                publicSummary = "최근에 버거운 날이 조금 겹치면서 마음의 결이 흐트러졌던 것 같아요.",
                publicComfortMessage = "조금씩 흔들리는 마음도 그대로 남겨둬도 괜찮아요. 오늘은 무리하지 않고 숨을 고르는 쪽을 먼저 택해도 돼요.",
                recommendedActions = listOf(
                    "감정 세 가지만 먼저 남겨봐요.",
                    "오늘 가장 오래 남은 일을 짧게 적어봐요.",
                    "며칠 뒤 다시 한 번 살펴봐요."
                ),
                recommendedRescreenAt = Time.today().plusWeeks(4),
                requiresSafetyPrompt = false
            )

            else -> ScreeningResultResponse(
                publicSummary = "지금은 비교적 잘 버텨내고 있는 흐름이 보여요.",
                publicComfortMessage = "가벼운 날의 결도 충분히 남겨둘 가치가 있어요. 오늘 괜찮았던 순간도 조용히 적어봐도 좋아요.",
                recommendedActions = listOf(
                    "괜찮았던 감정도 함께 남겨봐요.",
                    "지금 흐름을 천천히 이어가봐요.",
                    "필요할 때 다시 상태를 확인해봐요."
                ),
                recommendedRescreenAt = Time.today().plusWeeks(4),
                requiresSafetyPrompt = false
            )
        }

        screeningSessionRepository.save(
            ScreeningSessionEntity(
                completedDate = Time.today(),
                publicSummary = result.publicSummary,
                publicComfortMessage = result.publicComfortMessage,
                recommendedRescreenAt = result.recommendedRescreenAt,
                requiresSafetyPrompt = result.requiresSafetyPrompt,
                internalSubtype = ScreeningSubtype.STRESS_ADAPTATION_POSSIBLE,
                internalChronicity = ScreeningChronicity.SHORT_TERM
            ).apply {
                replaceRecommendedActions(result.recommendedActions)
                replaceAnswers(request.answers)
            }
        )

        return result
    }

    @Transactional(readOnly = true)
    fun getLatestResult(): ScreeningResultResponse? =
        screeningSessionRepository.findTopByOrderByCompletedDateDescIdDesc()?.toResponse()

    @Transactional(readOnly = true)
    fun getHistory(): List<ScreeningHistoryItemResponse> =
        screeningSessionRepository.findAllByOrderByCompletedDateDescIdDesc(PageRequest.of(0, 20)).map {
            ScreeningHistoryItemResponse(
                completedDate = it.completedDate,
                publicSummary = it.publicSummary,
                recommendedRescreenAt = it.recommendedRescreenAt,
                requiresSafetyPrompt = it.requiresSafetyPrompt
            )
        }

    private fun ScreeningSessionEntity.toResponse(): ScreeningResultResponse =
        ScreeningResultResponse(
            publicSummary = publicSummary,
            publicComfortMessage = publicComfortMessage,
            recommendedActions = recommendedActions.map { it.action },
            recommendedRescreenAt = recommendedRescreenAt,
            requiresSafetyPrompt = requiresSafetyPrompt
        )
}
