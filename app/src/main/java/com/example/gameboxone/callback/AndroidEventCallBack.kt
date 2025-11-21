package com.example.gameboxone.callback

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject
import java.lang.ref.WeakReference
import java.util.concurrent.atomic.AtomicLong
import kotlin.collections.forEachIndexed
import kotlin.text.endsWith
import kotlin.text.replace
import kotlin.text.startsWith
import kotlin.text.trim

/**
 * Android事件回调处理器 - 简单版本
 * 用于处理JS调用Android后的简单回调机制
 */
class AndroidEventCallBack(webView: WebView) {
    
    companion object {
        private const val TAG = "AndroidEventCallBack"
        // Unified bridge tag for filtering up/down event logs in logcat
        private const val BRIDGE_TAG = "GAME_EVENTS_BRIDGE"
    }
    
    /**
     * Send iframeSdk events as a JSON array of {type,value} objects via CpsenseAppEventCallBack.
     * Example: sendIframeEvents("beforeAd" to "interstitial", "afterAd" to true)
     */
    fun sendIframeEvents(vararg events: Pair<String, Any?>) {
        val webView = webViewRef.get() ?: return
        try {
            val payload = buildString {
                append('[')
                events.forEachIndexed { idx, (type, value) ->
                    if (idx > 0) append(',')
                    append('{')
                    append("\"type\":\"").append(type).append("\"")
                    append(',')
                    append("\"value\":")
                    when (value) {
                        null -> append("null")
                        is Number, is Boolean -> append(value.toString())
                        is JSONObject -> append(value.toString())
                        is String -> {
                            // If the string already looks like JSON, assume it's intentional and keep as raw JSON
                            val str = value as String
                            val trimmed = str.trim()
                            if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith(
                                    "["
                                ) && trimmed.endsWith("]"))
                            ) {
                                // assume the string is JSON - insert as raw JSON
                                append(trimmed)
                            } else {
                                // string-escape minimal quotes and backslashes
                                val s = str.replace("\\", "\\\\").replace("\"", "\\\"")
                                append('"').append(s).append('"')
                            }
                        }

                        else -> {
                            // try to coerce other objects into JSON by attempting to parse their toString()
                            try {
                                val candidate = value.toString()
                                val t = candidate.trim()
                                if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith(
                                        "]"
                                    ))
                                ) {
                                    append(t)
                                } else {
                                    val s = candidate.replace("\\", "\\\\").replace("\"", "\\\"")
                                    append('"').append(s).append('"')
                                }
                            } catch (e: Exception) {
                                val s = value.toString().replace("\\", "\\\\").replace("\"", "\\\"")
                                append('"').append(s).append('"')
                            }
                        }
                    }
                    append('}')
                }
                append(']')
            }

            // Use JSON literal to avoid JS string-quoting/escaping issues
            val jsCode = "if (typeof window.CpsenseAppEventCallBack === 'function') { try{ window.CpsenseAppEventCallBack($payload); }catch(e){} }"
            mainHandler.post { webView.evaluateJavascript(jsCode, null) }
            Log.d(TAG, "sendIframeEvents: $payload")
            // Unified bridge log for easier filtering in logcat
            Log.d(BRIDGE_TAG, "OUT -> JS payload: $payload")
        } catch (e: Exception) {
            Log.e(TAG, "sendIframeEvents failed", e)
        }
    }

    private val webViewRef = WeakReference(webView)
    private val mainHandler = Handler(Looper.getMainLooper())
    private val callbackId = AtomicLong(0)
    
    init {
        Log.d(TAG, "AndroidEventCallBack 初始化完成")
    }
    
    /**
     * 简单的事件回调处理
     * @param eventType 事件类型
     * @param eventData 事件数据
     */
    fun sendSimpleCallback(eventType: String, eventData: String) {
        val currentCallbackId = callbackId.incrementAndGet()
        
        // 直接发送简单回调到JS
        sendCallbackToJS(currentCallbackId, eventType, eventData)
        
        Log.d(TAG, "发送简单回调，ID: $currentCallbackId, 事件类型: $eventType")
    }
    
    /**
     * 向JS发送简单回调
     */
    private fun sendCallbackToJS(callbackId: Long, eventType: String, originalData: String) {
        val webView = webViewRef.get() ?: return
        
        try {
            // 构建简单的回调数据为 JSON 对象
            val callbackDataObj = JSONObject()
            callbackDataObj.put("callback_id", callbackId)
            callbackDataObj.put("event_type", eventType)
            callbackDataObj.put("data", "received")
            callbackDataObj.put("status", "ok")
            // 如果 originalData 是 JSON 并包含 message_id，则原样带回
            try {
                val orig = JSONObject(originalData)
                if (orig.has("message_id")) {
                    callbackDataObj.put("message_id", orig.optString("message_id"))
                }
            } catch (_: Exception) {
                // ignore
            }

            val callbackData = callbackDataObj.toString()
            val jsCode = "if (typeof window.CpsenseAppEventCallBack === 'function') { try{ window.CpsenseAppEventCallBack($callbackData); }catch(e){} }"

            mainHandler.post {
                webView.evaluateJavascript(jsCode) { result ->
                    Log.d(TAG, "简单回调发送完成，ID: $callbackId")
                    Log.d(BRIDGE_TAG, "OUT -> JS simpleCallback id=$callbackId event=$eventType data=$callbackData")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "发送简单回调失败", e)
        }
    }

    /**
     * 按新协议回调 app_ads_on（发送 JSON 数组）
     * 变更：去掉 value 字段，改为携带 app_name 字段
     * 下发格式：[ { "type": "app_ads_on", "app_name": "<应用名称>", "message_id": "m.." } ]
     */
    fun sendAppAdsOn(value: Boolean) {
        val webView = webViewRef.get() ?: return
        try {
            // attach message id for tracing
            val mid = "m${callbackId.incrementAndGet()}"
            // 统一下发格式：{ type:'app_ads_on', value: { app_name: 'gamesdk_appname' } }
            val appName = "gamesdk_appname"

            val payloadObj = JSONObject()
            val valueObj = JSONObject()
            valueObj.put("app_name", appName)
            payloadObj.put("type", "app_ads_on")
            payloadObj.put("value", valueObj)
            payloadObj.put("message_id", mid)

            val payloadArray = JSONArray()
            payloadArray.put(payloadObj)
            val payload = payloadArray.toString()
            val jsCode = "if (typeof window.CpsenseAppEventCallBack === 'function') { try{ window.CpsenseAppEventCallBack($payload); }catch(e){} }"
            mainHandler.post {
                webView.evaluateJavascript(jsCode) { _ ->
                    Log.d(TAG, "app_ads_on 回调已发送: value={app_name=$appName} message_id=$mid")
                    Log.d(BRIDGE_TAG, "OUT -> JS app_ads_on: $payload")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "发送 app_ads_on 回调失败", e)
        }
    }

    /**
     * Send a raw JSON array payload string to the iframe callback. The payload must be a JSON array
     * of objects (e.g. [{"type":"ad_error","value":"...","message_id":"m1"}])
     */
    fun sendRawPayload(payload: String) {
        val webView = webViewRef.get() ?: return
        try {
            val jsCode = "if (typeof window.CpsenseAppEventCallBack === 'function') { try{ window.CpsenseAppEventCallBack($payload); }catch(e){} }"
            mainHandler.post {
                webView.evaluateJavascript(jsCode) { _ ->
                    Log.d(TAG, "raw payload sent: $payload")
                    Log.d(BRIDGE_TAG, "OUT -> JS payload: $payload")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "sendRawPayload failed", e)
        }
    }

    /**
     * 从 SharedPreferences 读取 Enable Ads 并返回 app_ads_on
     */
    fun sendAppAdsOnFromPrefs() {
        val webView = webViewRef.get() ?: return
        try {
            val ctx = webView.context
            val prefs = ctx.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
            val appAdsOn = prefs.getBoolean("ad_consent_enabled", false)
            sendAppAdsOn(appAdsOn)
        } catch (e: Exception) {
            Log.w(TAG, "读取偏好失败，回退为 false", e)
            sendAppAdsOn(false)
        }
    }
    
    /**
     * JS接口方法：确认收到回调
     * @param data 回调确认数据
     */
    @JavascriptInterface
    fun confirmCallback(data: String) {
        Log.d(TAG, "JS确认收到回调: $data")
    }
}
