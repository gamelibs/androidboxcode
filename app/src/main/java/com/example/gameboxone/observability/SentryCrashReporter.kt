package com.example.gameboxone.observability

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SentryCrashReporter @Inject constructor() {
    fun captureFatal(snapshot: CrashSnapshot, throwable: Throwable, attributes: Map<String, String> = emptyMap()) {
        capture(snapshot, throwable, attributes + mapOf("fatal" to "true"))
    }

    fun captureNonFatal(snapshot: CrashSnapshot, throwable: Throwable, attributes: Map<String, String> = emptyMap()) {
        capture(snapshot, throwable, attributes + mapOf("fatal" to "false"))
    }

    fun setUser(id: String?, username: String?) {
        SentryBridge.setUser(id, username)
    }

    private fun capture(
        snapshot: CrashSnapshot,
        throwable: Throwable,
        attributes: Map<String, String>
    ) {
        SentryBridge.captureException(
            throwable = throwable,
            tags = attributes + mapOf(
                "crash_id" to snapshot.crashId,
                "thread_name" to snapshot.threadName
            )
        )
    }
}


