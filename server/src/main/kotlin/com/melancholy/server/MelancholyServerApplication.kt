package com.melancholy.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MelancholyServerApplication

fun main(args: Array<String>) {
    runApplication<MelancholyServerApplication>(*args)
}
