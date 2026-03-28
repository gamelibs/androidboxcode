package com.example.gameboxone.observability

import android.content.Context
import androidx.core.content.edit
import com.example.gameboxone.AppLog as Log
import dagger.hilt.android.qualifiers.ApplicationContext
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LocalCrashReporter @Inject constructor(
    @ApplicationContext private val context: Context,
    private val analyticsManager: AnalyticsManager
) : CrashReporter {
    private val prefs by lazy {
        context.getSharedPreferences("observability_prefs", Context.MODE_PRIVATE)
    }

    override fun reportFatal(
        threadName: String,
        throwable: Throwable,
        attributes: Map<String, String>
    ): CrashSnapshot {
        val snapshot = buildSnapshot(threadName, throwable, fatal = true)
        persist(snapshot, attributes)
        analyticsManager.track(
            AnalyticsEventNames.CRASH_FATAL,
            mapOf(
                "crash_id" to snapshot.crashId,
                "thread" to threadName,
                "type" to throwable::class.java.simpleName
            ) + attributes
        )
        Log.e("CrashReporter", "捕获致命崩溃 crashId=${snapshot.crashId}", throwable)
        return snapshot
    }

    override fun reportNonFatal(
        tag: String,
        throwable: Throwable,
        attributes: Map<String, String>
    ): CrashSnapshot {
        val snapshot = buildSnapshot(tag, throwable, fatal = false)
        persist(snapshot, attributes)
        analyticsManager.track(
            AnalyticsEventNames.CRASH_NON_FATAL,
            mapOf(
                "crash_id" to snapshot.crashId,
                "tag" to tag,
                "type" to throwable::class.java.simpleName
            ) + attributes
        )
        Log.w("CrashReporter", "记录非致命异常 crashId=${snapshot.crashId}", throwable)
        return snapshot
    }

    override fun getLastCrash(): CrashSnapshot? {
        val raw = prefs.getString(KEY_LAST_CRASH_JSON, null) ?: return null
        return runCatching {
            val json = JSONObject(raw)
            CrashSnapshot(
                crashId = json.optString("crashId"),
                timestampMs = json.optLong("timestampMs"),
                threadName = json.optString("threadName"),
                message = json.optString("message"),
                stacktrace = json.optString("stacktrace"),
                fatal = json.optBoolean("fatal")
            )
        }.getOrNull()
    }

    override fun clearLastCrash() {
        prefs.edit { remove(KEY_LAST_CRASH_JSON) }
    }

    private fun buildSnapshot(threadName: String, throwable: Throwable, fatal: Boolean): CrashSnapshot {
        val timestamp = System.currentTimeMillis()
        val readableTime = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date(timestamp))
        return CrashSnapshot(
            crashId = "crash_${readableTime}_${UUID.randomUUID().toString().take(8)}",
            timestampMs = timestamp,
            threadName = threadName,
            message = throwable.message ?: throwable.toString(),
            stacktrace = throwable.stackTraceToString().take(12_000),
            fatal = fatal
        )
    }

    private fun persist(snapshot: CrashSnapshot, attributes: Map<String, String>) {
        val json = JSONObject().apply {
            put("crashId", snapshot.crashId)
            put("timestampMs", snapshot.timestampMs)
            put("threadName", snapshot.threadName)
            put("message", snapshot.message)
            put("stacktrace", snapshot.stacktrace)
            put("fatal", snapshot.fatal)
            put("attributes", JSONObject(attributes))
        }
        prefs.edit { putString(KEY_LAST_CRASH_JSON, json.toString()) }
    }

    private companion object {
        const val KEY_LAST_CRASH_JSON = "last_crash_json"
    }
}


