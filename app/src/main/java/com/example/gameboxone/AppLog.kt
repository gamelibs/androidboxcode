// filepath: /Users/vidar/works/AndroidCode/app/src/main/java/com/example/gameboxone/AppLog.kt
package com.example.gameboxone

import android.util.Log as AndroidLog

/**
 * 全局统一日志入口。
 * 在现有代码中我们会通过 import com.example.gameboxone.AppLog as Log
 * 来替换原先的 android.util.Log 导入。这样现有的 Log.d/... 调用无需变动，
 * 但输出会带上统一的标识（UNIFIED_MARKER），便于在 Logcat 中搜索和过滤。
 */
object AppLog {
    private const val UNIFIED_MARKER = "GAMEBOX" // 可在 Logcat 中用此关键字过滤

    fun d(tag: String, msg: String) {
        AndroidLog.d(tag, "[$UNIFIED_MARKER] $msg")
    }

    fun d(tag: String, msg: String, tr: Throwable?) {
        AndroidLog.d(tag, "[$UNIFIED_MARKER] $msg", tr)
    }

    fun i(tag: String, msg: String) {
        AndroidLog.i(tag, "[$UNIFIED_MARKER] $msg")
    }

    fun i(tag: String, msg: String, tr: Throwable?) {
        AndroidLog.i(tag, "[$UNIFIED_MARKER] $msg", tr)
    }

    fun w(tag: String, msg: String) {
        AndroidLog.w(tag, "[$UNIFIED_MARKER] $msg")
    }

    fun w(tag: String, msg: String, tr: Throwable?) {
        AndroidLog.w(tag, "[$UNIFIED_MARKER] $msg", tr)
    }

    fun e(tag: String, msg: String) {
        AndroidLog.e(tag, "[$UNIFIED_MARKER] $msg")
    }

    fun e(tag: String, msg: String, tr: Throwable?) {
        AndroidLog.e(tag, "[$UNIFIED_MARKER] $msg", tr)
    }

    fun v(tag: String, msg: String) {
        AndroidLog.v(tag, "[$UNIFIED_MARKER] $msg")
    }

    fun v(tag: String, msg: String, tr: Throwable?) {
        AndroidLog.v(tag, "[$UNIFIED_MARKER] $msg", tr)
    }

    // fallback for calls like Log.wtf if needed
    fun wtf(tag: String, msg: String) {
        AndroidLog.wtf(tag, "[$UNIFIED_MARKER] $msg")
    }

    fun wtf(tag: String, msg: String, tr: Throwable?) {
        AndroidLog.wtf(tag, "[$UNIFIED_MARKER] $msg", tr)
    }
}

