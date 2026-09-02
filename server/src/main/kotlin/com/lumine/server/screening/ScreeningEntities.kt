package com.lumine.server.screening

import com.lumine.server.user.UserEntity
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.OrderBy
import jakarta.persistence.Table
import java.time.LocalDate

@Entity
@Table(name = "screening_sessions")
class ScreeningSessionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: UserEntity?,
    @Column(name = "completed_date", nullable = false)
    var completedDate: LocalDate,
    @Column(name = "public_summary", nullable = false, columnDefinition = "text")
    var publicSummary: String,
    @Column(name = "public_comfort_message", nullable = false, columnDefinition = "text")
    var publicComfortMessage: String,
    @Column(name = "recommended_rescreen_at", nullable = false)
    var recommendedRescreenAt: LocalDate,
    @Column(name = "requires_safety_prompt", nullable = false)
    var requiresSafetyPrompt: Boolean,
    @Enumerated(EnumType.STRING)
    @Column(name = "internal_subtype", nullable = false)
    var internalSubtype: ScreeningSubtype,
    @Enumerated(EnumType.STRING)
    @Column(name = "internal_chronicity", nullable = false)
    var internalChronicity: ScreeningChronicity,
    @OneToMany(mappedBy = "session", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder asc, id asc")
    val recommendedActions: MutableList<ScreeningRecommendedActionEntity> = mutableListOf(),
    @OneToMany(mappedBy = "session", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id asc")
    val answers: MutableList<ScreeningAnswerEntity> = mutableListOf()
) {
    fun replaceRecommendedActions(actions: List<String>) {
        recommendedActions.clear()
        actions.forEachIndexed { index, action ->
            recommendedActions.add(
                ScreeningRecommendedActionEntity(
                    session = this,
                    action = action,
                    sortOrder = index
                )
            )
        }
    }

    fun replaceAnswers(values: Map<String, String>) {
        answers.clear()
        values.entries.sortedBy { it.key }.forEach { (questionId, answerValue) ->
            answers.add(
                ScreeningAnswerEntity(
                    session = this,
                    questionId = questionId,
                    answerValue = answerValue
                )
            )
        }
    }
}

@Entity
@Table(name = "screening_recommended_actions")
class ScreeningRecommendedActionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_session_id", nullable = false)
    var session: ScreeningSessionEntity,
    @Column(nullable = false, columnDefinition = "text")
    var action: String,
    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int
)

@Entity
@Table(name = "screening_answers")
class ScreeningAnswerEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_session_id", nullable = false)
    var session: ScreeningSessionEntity,
    @Column(name = "question_id", nullable = false)
    var questionId: String,
    @Column(name = "answer_value", nullable = false, columnDefinition = "text")
    var answerValue: String
)
