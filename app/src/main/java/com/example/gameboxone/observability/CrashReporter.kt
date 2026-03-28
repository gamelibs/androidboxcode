package com.example.gameboxone.observability

data class CrashSnapshot(
    val crashId: String,
    val timestampMs: Long,
    val threadName: String,
    val message: String,
    val stacktrace: String,
    val fatal: Boolean
)

interface CrashReporter {
    fun reportFatal(threadName: String, throwable: Throwable, attributes: Map<String, String> = emptyMap()): CrashSnapshot
    fun reportNonFatal(tag: String, throwable: Throwable, attributes: Map<String, String> = emptyMap()): CrashSnapshot
    fun getLastCrash(): CrashSnapshot?
    fun clearLastCrash()
}

