package com.example.gameboxone.observability

object AnalyticsPayloadSanitizer {
    fun sanitize(properties: Map<String, Any?>): Map<String, String> {
        return properties.entries
            .mapNotNull { (key, value) ->
                val normalizedKey = key.trim()
                if (normalizedKey.isBlank() || value == null) return@mapNotNull null
                val normalizedValue = when (value) {
                    is String -> value.trim()
                    is Number, is Boolean -> value.toString()
                    else -> value.toString().trim()
                }
                if (normalizedValue.isBlank()) return@mapNotNull null
                normalizedKey to normalizedValue.take(200)
            }
            .toMap()
    }
}

