package com.example.gameboxone.observability

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CompositeCrashReporter @Inject constructor(
    private val localCrashReporter: LocalCrashReporter,
    private val sentryCrashReporter: SentryCrashReporter
) : CrashReporter {
    override fun reportFatal(
        threadName: String,
        throwable: Throwable,
        attributes: Map<String, String>
    ): CrashSnapshot {
        val snapshot = localCrashReporter.reportFatal(threadName, throwable, attributes)
        sentryCrashReporter.captureFatal(snapshot, throwable, attributes)
        return snapshot
    }

    override fun reportNonFatal(
        tag: String,
        throwable: Throwable,
        attributes: Map<String, String>
    ): CrashSnapshot {
        val snapshot = localCrashReporter.reportNonFatal(tag, throwable, attributes)
        sentryCrashReporter.captureNonFatal(snapshot, throwable, attributes)
        return snapshot
    }

    override fun getLastCrash(): CrashSnapshot? = localCrashReporter.getLastCrash()

    override fun clearLastCrash() {
        localCrashReporter.clearLastCrash()
    }
}

