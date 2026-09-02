package com.lumine.server.screening

import com.lumine.server.common.Time
import com.lumine.server.user.UserService
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ScreeningService(
    private val screeningNarrativeGenerator: ScreeningNarrativeGenerator,
    private val screeningSessionRepository: ScreeningSessionRepository,
    private val userService: UserService
) {
    fun getQuestionnaire(): ScreeningQuestionnaireResponse =
        ScreeningQuestionnaireResponse(
            version = "2026-04-ko-mvp",
            title = "[Lumine] 마음 상태 살펴보기 (10문항)",
            subtitle = "최근 일주일 동안, 아래 상태를 얼마나 자주 느꼈나요?",
            sections = listOf(
                ScreeningQuestionSectionResponse(
                    id = "core",
                    title = "최근 상태",
                    items = listOf(
                        ScreeningQuestionItemResponse(
                            id = "q1",
                            kind = "single_choice",
                            title = "평소 즐겁게 하던 일들이 덜 즐겁게 느껴졌나요?",
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
                            title = "설명하기 어려운 가라앉은 기분이 계속 느껴졌나요?",
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
                            title = "깊게 잠들기 어렵거나, 자고 일어나도 피곤함이 남았나요?",
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
                            title = "몸이 무겁고, 사소한 움직임도 버겁게 느껴진 적이 있나요?",
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
                            title = "입맛이 줄었거나, 반대로 무언가를 계속 먹고 싶어진 적이 있나요?",
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
                            title = "스스로가 실망스럽거나, 주변 사람들에게 미안한 마음이 들었나요?",
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
                            title = "책을 읽거나 대화를 나눌 때 집중하기 어려웠나요?",
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
                            title = "사람들과 거리를 두고 혼자 있고 싶다는 생각이 들었나요?",
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
                            title = "앞으로 괜찮아질 거라는 기대가 줄어든 것처럼 느껴졌나요?",
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
    fun submit(userId: String, request: ScreeningSubmissionRequest): ScreeningResultResponse {
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
                user = userService.requireEntity(userId),
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
    fun getLatestResult(userId: String): ScreeningResultResponse? =
        screeningSessionRepository.findTopByUserIdOrderByCompletedDateDescIdDesc(userId)?.toResponse()

    @Transactional(readOnly = true)
    fun getHistory(userId: String): List<ScreeningHistoryItemResponse> =
        screeningSessionRepository.findAllByUserIdOrderByCompletedDateDescIdDesc(userId, PageRequest.of(0, 20)).map {
            ScreeningHistoryItemResponse(
                completedDate = it.completedDate,
                publicSummary = it.publicSummary,
                recommendedRescreenAt = it.recommendedRescreenAt,
                requiresSafetyPrompt = it.requiresSafetyPrompt
            )
        }

    @Transactional(readOnly = true)
    fun getAllExportRecords(userId: String): List<ScreeningExportResponse> =
        screeningSessionRepository.findAllByUserIdOrderByCompletedDateDescIdDesc(userId).map { session ->
            ScreeningExportResponse(
                completedDate = session.completedDate,
                answers = session.answers.associate { it.questionId to it.answerValue },
                publicSummary = session.publicSummary,
                publicComfortMessage = session.publicComfortMessage,
                recommendedActions = session.recommendedActions.map { it.action },
                recommendedRescreenAt = session.recommendedRescreenAt,
                requiresSafetyPrompt = session.requiresSafetyPrompt
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
