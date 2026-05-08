package com.lumine.server.openai

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate

@Component
class OpenAiResponsesClient(
    restTemplateBuilder: RestTemplateBuilder,
    private val objectMapper: ObjectMapper,
    @Value("\${openai.api-key:}") private val apiKey: String,
    @Value("\${openai.model:gpt-5.2}") private val model: String,
    @Value("\${openai.base-url:https://api.openai.com/v1}") private val baseUrl: String
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val restTemplate: RestTemplate = restTemplateBuilder.build()

    fun isConfigured(): Boolean = apiKey.isNotBlank()

    @PostConstruct
    fun logConfiguration() {
        logger.info(
            "OpenAI client initialized. configured={}, model={}, baseUrl={}",
            isConfigured(),
            model,
            baseUrl
        )
    }

    fun generateText(
        instructions: String,
        input: String,
        temperature: Double? = null
    ): String? {
        if (!isConfigured()) {
            logger.warn("OpenAI text generation skipped because OPENAI_API_KEY is empty.")
            return null
        }

        val requestBody = linkedMapOf<String, Any>(
            "model" to model,
            "instructions" to instructions,
            "input" to input,
            "text" to mapOf(
                "format" to mapOf("type" to "text"),
                "verbosity" to "low"
            )
        )

        if (temperature != null) {
            requestBody["temperature"] = temperature
        }

        val result = runCatching {
            val root = createResponse(requestBody)
            extractText(root)
        }

        result.exceptionOrNull()?.let {
            logger.warn("OpenAI text generation failed. Falling back. model={}, reason={}", model, it.message)
        }

        val text = result.getOrNull()?.takeIf { it.isNotBlank() }
        if (result.isSuccess && text == null) {
            logger.warn("OpenAI text generation returned blank output. Falling back. model={}", model)
        }

        return text
    }

    fun generateStructured(
        instructions: String,
        input: String,
        schemaName: String,
        schema: ObjectNode
    ): JsonNode? {
        if (!isConfigured()) {
            logger.warn("OpenAI structured generation skipped because OPENAI_API_KEY is empty. schema={}", schemaName)
            return null
        }

        val requestBody = mapOf(
            "model" to model,
            "instructions" to instructions,
            "input" to input,
            "text" to mapOf(
                "format" to mapOf(
                    "type" to "json_schema",
                    "name" to schemaName,
                    "schema" to schema,
                    "strict" to true
                ),
                "verbosity" to "low"
            )
        )

        val result = runCatching {
            val root = createResponse(requestBody)
            extractStructuredOutput(root)
        }

        result.exceptionOrNull()?.let {
            logger.warn(
                "OpenAI structured generation failed. Falling back. model={}, schema={}, reason={}",
                model,
                schemaName,
                it.message
            )
        }

        val output = result.getOrNull()
        if (result.isSuccess && output == null) {
            logger.warn("OpenAI structured generation returned empty output. Falling back. model={}, schema={}", model, schemaName)
        }

        return output
    }

    private fun createResponse(requestBody: Any): JsonNode {
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            setBearerAuth(apiKey)
        }

        val response = restTemplate.postForEntity(
            "$baseUrl/responses",
            HttpEntity(requestBody, headers),
            String::class.java
        )

        return objectMapper.readTree(response.body)
    }

    private fun extractText(root: JsonNode): String {
        val output = root.path("output")
        if (!output.isArray) {
            return ""
        }

        return output.flatMap { item ->
            item.path("content").takeIf { it.isArray }?.toList().orEmpty()
        }.mapNotNull { content ->
            when {
                content.path("type").asText() == "output_text" -> content.path("text").asText(null)
                content.has("text") -> content.path("text").asText(null)
                else -> null
            }
        }.joinToString("\n").trim()
    }

    private fun extractStructuredOutput(root: JsonNode): JsonNode? {
        val text = extractText(root)
        if (text.isBlank()) {
            return null
        }

        return objectMapper.readTree(text)
    }
}
