package com.lumine.server.user

import com.lumine.server.journal.JournalEntryResponse
import com.lumine.server.screening.ScreeningExportResponse
import java.time.OffsetDateTime

data class UserDataExportResponse(
    val schemaVersion: String,
    val exportedAt: OffsetDateTime,
    val profile: UserMeResponse,
    val journals: List<JournalEntryResponse>,
    val screenings: List<ScreeningExportResponse>
)

data class DeleteUserResponse(
    val success: Boolean
)
