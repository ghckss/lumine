package com.lumine.server.screening

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository

interface ScreeningSessionRepository : JpaRepository<ScreeningSessionEntity, Long> {
    fun findAllByUserIdOrderByCompletedDateDescIdDesc(userId: String, pageable: Pageable): List<ScreeningSessionEntity>

    @EntityGraph(attributePaths = ["recommendedActions"])
    fun findTopByUserIdOrderByCompletedDateDescIdDesc(userId: String): ScreeningSessionEntity?

    fun findAllByUserIdOrderByCompletedDateDescIdDesc(userId: String): List<ScreeningSessionEntity>
}
