package com.example.gameboxone.observability

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SentryObservabilityConfigTest {
    @Test
    fun blank_dsn_keeps_sentry_disabled() {
        val config = SentryObservabilityConfig.fromValues(
            enabled = true,
            dsn = "   ",
            environment = "release",
            releaseName = "GameBoxOne@1.0"
        )

        assertFalse(config.isConfigured)
        assertEquals("release", config.environment)
    }

    @Test
    fun non_blank_dsn_enables_sentry() {
        val config = SentryObservabilityConfig.fromValues(
            enabled = true,
            dsn = "https://public@example.ingest.sentry.io/1",
            environment = "prod",
            releaseName = "GameBoxOne@1.0"
        )

        assertTrue(config.isConfigured)
        assertEquals("prod", config.environment)
        assertEquals("GameBoxOne@1.0", config.releaseName)
    }
}

