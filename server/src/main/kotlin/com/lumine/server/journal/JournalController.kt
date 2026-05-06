package com.lumine.server.journal

import com.lumine.server.global.api.ApiResponse
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
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
        @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ApiResponse<JournalEntryResponse?> = ApiResponse(journalService.getEntry(date))

    @GetMapping("/history")
    fun getEntries(
        @RequestParam(name = "limit", defaultValue = "10") limit: Int
    ): ApiResponse<List<JournalEntryResponse>> = ApiResponse(journalService.getEntries(limit))

    @PostMapping
    fun saveEntry(
        @Valid @RequestBody request: JournalEntryRequest
    ): ApiResponse<JournalEntryResponse> = ApiResponse(journalService.save(request))
}
