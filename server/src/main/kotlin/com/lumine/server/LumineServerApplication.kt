package com.lumine.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class LumineServerApplication

fun main(args: Array<String>) {
    runApplication<LumineServerApplication>(*args)
}
