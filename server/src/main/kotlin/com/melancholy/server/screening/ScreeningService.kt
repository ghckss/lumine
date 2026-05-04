package com.melancholy.server.screening

import com.melancholy.server.common.Time
import jakarta.annotation.PostConstruct
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class ScreeningService(
    private val screeningNarrativeGenerator: ScreeningNarrativeGenerator,
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
                            description = "요즘 드는 생각을 알려주세요. 필수는 아니에요.",
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
        val narrative = screeningNarrativeGenerator.generate(
            ScreeningNarrativeContext(
                totalScore = score,
                withdrawalScore = withdrawalScore,
                hopeScore = hopeScore,
                requiresSafetyPrompt = requiresSafetyPrompt,
                narrativeAnswer = request.answers["n1"].orEmpty(),
                answers = request.answers
            )
        )
        val result = ScreeningResultResponse(
            publicSummary = narrative.publicSummary,
            publicComfortMessage = narrative.publicComfortMessage,
            recommendedActions = narrative.recommendedActions,
            recommendedRescreenAt = Time.today().plusWeeks(4),
            requiresSafetyPrompt = requiresSafetyPrompt
        )

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
