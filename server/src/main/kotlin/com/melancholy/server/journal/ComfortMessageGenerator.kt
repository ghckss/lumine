package com.melancholy.server.journal

interface ComfortMessageGenerator {
    fun generate(context: JournalComfortContext): String
}
