package com.lumine.server.common

import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZoneOffset

object Time {
    private val seoulZoneId: ZoneId = ZoneId.of("Asia/Seoul")
    private val seoulZoneOffset: ZoneOffset = ZoneOffset.ofHours(9)

    fun today(): LocalDate = LocalDate.now(seoulZoneId)

    fun now(): OffsetDateTime = OffsetDateTime.now(seoulZoneOffset)
}
