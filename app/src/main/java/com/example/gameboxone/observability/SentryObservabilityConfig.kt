package com.example.gameboxone.observability

data class SentryObservabilityConfig(
    val enabled: Boolean,
    val dsn: String,
    val environment: String,
    val releaseName: String
) {
    val isConfigured: Boolean
        get() = enabled && dsn.isNotBlank()

    companion object {
        fun fromValues(
            enabled: Boolean,
            dsn: String?,
            environment: String?,
            releaseName: String
        ): SentryObservabilityConfig {
            return SentryObservabilityConfig(
                enabled = enabled,
                dsn = dsn.orEmpty().trim(),
                environment = environment.orEmpty().trim().ifBlank { "release" },
                releaseName = releaseName.trim().ifBlank { "GameBoxOne@dev" }
            )
        }
    }
}

