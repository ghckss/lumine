package com.lumine.server.screening

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface ScreeningSessionRepository : JpaRepository<ScreeningSessionEntity, Long> {
    fun findAllByOrderByCompletedDateDescIdDesc(pageable: Pageable): List<ScreeningSessionEntity>

    fun findTopByOrderByCompletedDateDescIdDesc(): ScreeningSessionEntity?
}
