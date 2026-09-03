package com.lumine.server.journal

import com.lumine.server.auth.AuthenticatedUser
import com.lumine.server.global.api.ApiResponse
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/journal/entries")
class JournalController(
    private val journalService: JournalService
) {
    @GetMapping
    fun getEntry(
        @AuthenticationPrincipal principal: AuthenticatedUser,
        @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ApiResponse<JournalEntryResponse?> = ApiResponse(journalService.getEntry(principal.userId, date))

    @GetMapping("/history")
    fun getEntries(
        @AuthenticationPrincipal principal: AuthenticatedUser,
        @RequestParam(name = "limit", defaultValue = "10") limit: Int
    ): ApiResponse<List<JournalEntryResponse>> = ApiResponse(journalService.getEntries(principal.userId, limit))

    @PostMapping
    fun saveEntry(
        @AuthenticationPrincipal principal: AuthenticatedUser,
        @Valid @RequestBody request: JournalEntryRequest
    ): ApiResponse<JournalEntryResponse> = ApiResponse(journalService.save(principal.userId, request))

    @DeleteMapping
    fun deleteEntry(
        @AuthenticationPrincipal principal: AuthenticatedUser,
        @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,
        @RequestParam("expectedVersion") expectedVersion: Long
    ): ApiResponse<DeleteJournalEntryResponse> =
        ApiResponse(journalService.delete(principal.userId, date, expectedVersion))
}
