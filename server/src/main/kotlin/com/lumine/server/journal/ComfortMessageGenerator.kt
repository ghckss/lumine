package com.lumine.server.journal

interface ComfortMessageGenerator {
    fun generate(context: JournalComfortContext): String
}
