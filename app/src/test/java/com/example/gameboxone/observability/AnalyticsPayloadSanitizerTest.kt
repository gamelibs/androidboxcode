package com.example.gameboxone.observability

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class AnalyticsPayloadSanitizerTest {
    @Test
    fun sanitize_removes_blank_keys_and_null_values() {
        val result = AnalyticsPayloadSanitizer.sanitize(
            mapOf(
                " valid_key " to "  value  ",
                "" to "ignored",
                "null_value" to null,
                "blank_value" to "   ",
                "flag" to true,
                "count" to 3
            )
        )

        assertEquals("value", result["valid_key"])
        assertEquals("true", result["flag"])
        assertEquals("3", result["count"])
        assertFalse(result.containsKey(""))
        assertFalse(result.containsKey("null_value"))
        assertFalse(result.containsKey("blank_value"))
    }

    @Test
    fun sanitize_truncates_very_long_values() {
        val longValue = "a".repeat(300)
        val result = AnalyticsPayloadSanitizer.sanitize(mapOf("payload" to longValue))

        assertEquals(200, result.getValue("payload").length)
    }
}

