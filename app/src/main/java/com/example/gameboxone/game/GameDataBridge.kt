package com.example.gameboxone.game

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.os.Handler
import android.os.Looper
import com.example.gameboxone.AppLog as Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject
import java.lang.ref.WeakReference
import com.example.gameboxone.callback.AndroidEventCallBack
import org.json.JSONArray
import kotlin.jvm.javaClass
import kotlin.let
import kotlin.random.Random
import kotlin.ranges.until
import kotlin.text.equals
import kotlin.text.isBlank
import kotlin.text.lowercase

/**
 * 游戏数据桥接器
 * 用于JS和Android之间的游戏数据交互
 * 只提供核心方法：ALLOWED_EVENTS
 * 支持回调机制和异常处理
 */
class GameDataBridge(
    private val uiModule: com.example.gameboxone.webview.GameInfoUIModule?,
    private val eventCallBack: AndroidEventCallBack? = null
) {
    
    companion object {
        private const val TAG = "GameDataBridge"
        private const val BRIDGE_TAG = "GAME_EVENTS_BRIDGE"
        // 事件白名单（仅处理这些事件，其余走兜底或忽略）
        private val ALLOWED_EVENTS: Set<String> = setOf(
            "ready",
            "health",
            "interstitial",
            "reward",
            "game_score",
            "game_level",
            "game_start",
            "level_start",
            "level_end",
            "game_over",
            "game_time",
            "load_update",
            "load_complete",
            "banner",
            "openad",
            "app_open"
        )
    }
    
    init {
        Log.d(TAG, "=== GameDataBridge 简化版初始化完成，支持回调机制 ===")
    }
    private val mainHandler = Handler(Looper.getMainLooper())
    // Guard/handler for scheduling delayed app_ads_on probe response
    private var appAdsProbeScheduled = false
    
    /**
     * 简化的事件处理方法
     * @param eventType 事件类型
     * @param data 事件数据
     * @param uiAction UI更新操作
     */
    private fun processEventWithCallback(eventType: String, data: String, uiAction: () -> Unit) {
        try {
            // 确保在主线程更新 UI，并在更新后发送回调
            mainHandler.post {
                try {
                    uiAction()
                } catch (uiErr: Exception) {
                    Log.e(TAG, "UI 更新失败: $eventType", uiErr)
                    } finally {
                        try {
                            // Ensure message_id exists in callback payload when possible for tracing
                            var callbackPayload = data
                            try {
                                val obj = JSONObject(data)
                                if (!obj.has("message_id")) {
                                    val mid = "m${System.nanoTime()}"
                                    obj.put("message_id", mid)
                                }
                                callbackPayload = obj.toString()
                            } catch (_: Exception) {
                                // not a JSON object, leave original data as-is
                            }

                            eventCallBack?.sendSimpleCallback(eventType, callbackPayload)
                        } catch (cbErr: Exception) {
                            Log.w(TAG, "发送简单回调失败（已忽略）: $eventType", cbErr)
                        }
                    }
            }
        } catch (e: Exception) {
            Log.e(TAG, "事件处理失败: $eventType", e)
        }
    }
    
    
    /**
     * 游戏开始
     * @param data JSON格式的游戏开始数据，包含 game_name 等
     */
    @JavascriptInterface
    fun game_start(data: String) {
        Log.d(TAG, "game_start: $data")
        uiModule ?: return
        
        processEventWithCallback("game_start", data) {
            val json = JSONObject(data)
            val gameName = json.optString("game_name", "")
            
            // 直接调用UI模块，不再通过Activity
            uiModule.updateGameStatus("true")
            uiModule.updateGameName(gameName)
        }
    }
    
    /**
     * 关卡开始
     * @param data JSON格式的关卡开始数据
     */
    @JavascriptInterface
    fun level_start(data: String) {
        Log.d(TAG, "level_start: $data")
        uiModule ?: return
        
        processEventWithCallback("level_start", data) {
            val json = JSONObject(data)
            val levelName = json.optString("level_name", "")
            uiModule.updateLevel(levelName)
        }
    }
    
    /**
     * 关卡结束
     * @param data JSON格式的关卡结束数据，包含 level_name、success、score
     */
    @JavascriptInterface
    fun level_end(data: String) {
        Log.d(TAG, "level_end: $data")
        uiModule ?: return
        
        processEventWithCallback("level_end", data) {
            val json = JSONObject(data)
            val levelName = json.optString("level_name", "")
            val success = json.optBoolean("success", false)
            val score = json.optString("score", "0")
            
            uiModule.updateScore(score)
            uiModule.updateLevel(levelName)
            
            val status = if (success) "victory" else "failed"
            uiModule.updateGameStatus(status)
        }
    }
    
    /**
     * 广告事件
     * @param data JSON格式的广告事件数据
     */
    @JavascriptInterface
    fun ads_events(data: String) {
        Log.d(TAG, "ads_events: $data")
        uiModule ?: return
        
        processEventWithCallback("ads_events", data) {
            val json = JSONObject(data)
            val eventType = json.optString("event_type", "")
            uiModule.handleAdEvent(eventType, data)
        }
    }
    
    /**
     * 统一事件处理方法
     * @param data JSON格式的事件数据，包含 event_type 和相关数据
     *
     * H5 上行说明（与前端 checkAndSendMessages 对应）：
     * - 前端会将待发送事件数组（adsdklayer）序列化后调用：
     *     window.CpsenseAppEvent.events(JSON.stringify(nativePayload));
     *   其中 nativePayload 是类似于：
     *     [{"type":"interstitial","value":{...},"message_id":"m123"}, ...]
     * - 本方法负责：
     *   1) 解析 JSONArray（容错处理，避免抛异常崩溃）
     *   2) 对每条消息调用 processSingleEvent 进行细化处理
     *   3) 做必要的协议兼容（type/event_type 字段、小写/大写兼容）
     *
     * 设计注意点：
     * - H5 端做了 deduplicateMessages，但 native 端也应具备一定的防重/防回环能力（例如忽略来自前端的 ad_error），
     *   以避免上行/下行循环触发。GameDataBridge 已对 ad_error 做忽略处理。
     * - 所有 UI 操作必须在主线程执行；@JavascriptInterface 的调用线程不可假定为主线程，
     *   因此 processEventWithCallback 会通过 Handler 切换到主线程并在 UI 更新后发送回调。
     * - 推荐 H5 对每条消息携带唯一 message_id，native 在日志、回调及错误追踪时应带上该 id 以便排查。
     */
    @JavascriptInterface
    fun events(data: String) {
        Log.d(TAG, "=== GameDataBridge.events called ===")
        Log.d(TAG, "events received data: $data")
        // Unified bridge log for incoming messages from JS
        Log.d(BRIDGE_TAG, "IN  <- JS payload: $data")
        Log.d(TAG, "uiModule available: ${uiModule != null}")
        Log.d(TAG, "eventCallBack available: ${eventCallBack != null}")
        
        if (uiModule == null) {
            Log.w(TAG, "uiModule is null, returning early")
            return
        }

        // 仅支持数组形式数据（adsdklayer）
        try {
            val arr = JSONArray(data)
            for (i in 0 until arr.length()) {
                val item = arr.optJSONObject(i) ?: continue
                // per-item debug log commented out to reduce noise
                // Log.d(TAG, "events: processing index=$i, obj=$item")
                // Log.d(BRIDGE_TAG, "IN  <- JS item index=$i obj=$item")

                // 协议握手：add_ads_event / is_ads_android
                try {
                    val t = item.optString("type", "")
                    val v = item.optString("value", "")
                    Log.d(TAG, "JS上行事件: type=$t, value=$v")
                    // Ignore ad_error coming from H5 to avoid potential echo/loop where
                    // an incoming ad_error triggers native-side ad_error OUT messages.
                    if (t.equals("ad_error", true)) {
                        Log.d(TAG, "Ignoring incoming ad_error from JS to avoid loop: $item")
                        continue
                    }
                    // 兼容两种上报名：旧版 add_ads_event 与新版 app_ads_event
                    if (t == "app_ads_event" &&  v == "is_ads_native"){
                        try {
                            val ctx = try {
                                val webView = eventCallBack?.let { callback ->
                                    val field = callback.javaClass.getDeclaredField("webViewRef")
                                    field.isAccessible = true
                                    val webViewRef = field.get(callback) as? WeakReference<*>
                                    webViewRef?.get() as? WebView
                                }
                                webView?.context
                            } catch (e: Exception) {
                                Log.w(TAG, "无法获取 context，跳过 app_ads_event 偏好读取", e)
                                null
                            }

                            val adsEnabled = try {
                                val prefs = ctx?.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
                                prefs?.getBoolean("ad_consent_enabled", true) ?: true
                            } catch (e: Exception) { true }

                            try {
                                eventCallBack?.sendAppAdsOn(adsEnabled)
                                Log.d(TAG, "app_ads_event: report app_ads_on=$adsEnabled to JS")
                            } catch (e: Exception) {
                                Log.w(TAG, "sendAppAdsOn($adsEnabled) failed", e)
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "handling app_ads_event failed", e)
                        }
                        continue
                    }
                } catch (_: Exception) {}

                processSingleEvent(item)
            }
        } catch (e: Exception) {
            Log.e(TAG, "events 解析数据失败（期望 JSONArray）", e)
        }
    }

    // 处理单条事件的公共方法
    private fun processSingleEvent(json: JSONObject) {
        // 说明：此方法从 json 中解析出 eventType（兼容多种命名），并把处理交给 UI 或广告处理逻辑。
        // 字段约定示例：
        // {
        //   "type": "interstitial",
        //   "value": { "level_name": "1", "score": 100 },
        //   "message_id": "m123"
        // }
        // 处理要点：
        // - 优先从 value 字段读取结构化数据（可能为 JSONObject 或字符串化 JSON）；
        // - 对广告类事件调用 handleAdEvent，并将 message_id 透传以便关联回调；
        // - 所有 UI 更新通过 processEventWithCallback 包裹，以保证在主线程执行并在完成后发送回调给 JS。
        // 兼容多种前端字段命名：event_type 或 type（大小写不敏感）
        var eventType = json.optString("event_type", "")
        if (eventType.isBlank()) {
            eventType = json.optString("type", "")
        }
        if (eventType.isBlank()) {
            // 尝试大写或小写键（某些前端可能使用 'GAME_TIME' 之类）
            val keys = json.keys()
            while (keys.hasNext()) {
                val k = keys.next()
                if (k.equals("event_type", true) || k.equals("type", true)) {
                    eventType = json.optString(k, "")
                    break
                }
            }
        }

        Log.d(TAG, "processSingleEvent: resolved eventType='$eventType', json=$json")

        // 事件白名单控制：不在白名单中的事件统一透传给 UI 模块的 handleAdEvent，避免无关事件污染主流程
        val normalizedType = eventType.lowercase()
        if (!ALLOWED_EVENTS.contains(normalizedType)) {
            Log.d(TAG, "processSingleEvent: eventType '$eventType' not in whitelist, forwarding to handleAdEvent only")
            uiModule?.handleAdEvent(eventType, json.toString())
            return
        }

        Log.d(TAG, "processSingleEvent: eventType '$eventType' is whitelisted, dispatching to handlers")

        // 将所有 UI 更新包装到 processEventWithCallback 中，保证回调与异常处理一致
        val dataStr = json.toString()
        processEventWithCallback(eventType, dataStr) {
            when (eventType) {
                "game_start", "GAME_START" -> {
                    // 不处理传入数据，仅显示已进入游戏状态
                    uiModule?.updateGameStatus("true")
                }
                "level_start", "LEVEL_START" -> {
                    val levelName = json.optString("level_name", "关卡1")
                    uiModule?.updateLevel(levelName)
                }
                "game_score", "GAME_SCORE" -> {
                    // 定时上报的分数事件：优先从 value/score 字段提取数字
                    var scoreStr = "0"
                    try {
                        if (json.has("value")) {
                            val v = json.opt("value")
                            scoreStr = when (v) {
                                is Number -> v.toString()
                                is String -> {
                                    // 可能是纯数字字符串，或 JSON 字符串
                                    val trimmed = v.trim()
                                    try {
                                        val obj = JSONObject(trimmed)
                                        obj.optString("score", trimmed)
                                    } catch (_: Exception) {
                                        trimmed
                                    }
                                }
                                is JSONObject -> {
                                    v.optString("score", v.optString("value", "0"))
                                }
                                else -> json.optString("score", json.optString("value", "0"))
                            }
                        } else {
                            scoreStr = json.optString("score", json.optString("value", "0"))
                        }
                    } catch (e: Exception) {
                        Log.w(TAG, "game_score parsing failed, fallback to 0", e)
                        scoreStr = "0"
                    }

                    // 仅保留数字部分，保证 UI 始终展示纯数字
                    val numericScore = scoreStr.takeIf { it.isNotBlank() }?.let { s ->
                        val m = Regex("(\\d+)").find(s)
                        m?.value ?: "0"
                    } ?: "0"

                    uiModule?.updateScore(numericScore)
                }
                "level_end", "LEVEL_END" -> {
                    // 优先支持 { "value": { ... } } 结构（来自 adsdklayer 中的 value 字段）
                    var levelName = ""
                    var success = false
                    var scoreStr = "0"

                    if (json.has("value")) {
                        try {
                            val v = json.opt("value")
                            when (v) {
                                is JSONObject -> {
                                    val valueObj = v
                                    levelName = when {
                                        valueObj.has("level_name") -> valueObj.optString("level_name", "")
                                        valueObj.has("level") -> valueObj.optString("level", "")
                                        else -> ""
                                    }
                                    success = valueObj.optBoolean("success", false)
                                    scoreStr = if (valueObj.has("score")) valueObj.optString("score", "0") else "0"
                                }
                                is String -> {
                                    // value 可能是字符串化的 JSON
                                    try {
                                        val valueObj = JSONObject(v)
                                        levelName = valueObj.optString("level_name", valueObj.optString("level", ""))
                                        success = valueObj.optBoolean("success", false)
                                        scoreStr = valueObj.optString("score", "0")
                                    } catch (e: Exception) {
                                        // 不是 JSON 字符串，直接把字符串视为 level 名称
                                        levelName = v
                                        success = false
                                        scoreStr = "0"
                                    }
                                }
                                is Number -> {
                                    // 有些上报可能把关卡用数字表示
                                    levelName = v.toString()
                                    success = false
                                    scoreStr = "0"
                                }
                                else -> {
                                    Log.w(TAG, "level_end value is unsupported type=${v?.javaClass}")
                                    levelName = json.optString("level_name", "")
                                    success = json.optBoolean("success", false)
                                    scoreStr = json.optString("score", "0")
                                }
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "level_end value parsing failed, fallback: ${e.message}")
                            levelName = json.optString("level_name", "")
                            success = json.optBoolean("success", false)
                            scoreStr = json.optString("score", "0")
                        }
                    } else {
                        // 兼容原始扁平结构
                        levelName = json.optString("level_name", "")
                        success = json.optBoolean("success", false)
                        scoreStr = json.optString("score", "0")
                    }

                    // 先更新状态（优先显示 GameStart/状态）
                    val status = if (success) "victory" else "failed"
                    uiModule?.updateGameStatus(status)

                    // 仅展示数字：从 scoreStr 和 levelName 中提取首个数字序列
                    fun extractFirstNumber(input: String): String {
                        val regex = Regex("(\\d+)")
                        val m = regex.find(input)
                        return m?.value ?: "0"
                    }

                    val score = extractFirstNumber(scoreStr)
                    val levelOnly = extractFirstNumber(levelName)

                    uiModule?.updateScore(score)
                    uiModule?.updateLevel(levelOnly)
                }
                "game_time", "GAME_TIME" -> {
                    val gameTime = json.optString("value", json.optString("game_time", "0"))
                    uiModule?.updateGameTime(gameTime)
                }
                // 广告事件处理：检查 app_ads_on 状态并调用对应 AdManager 方法
                "interstitial", "INTERSTITIAL" -> {
                    Log.d(TAG, "processSingleEvent: matched INTERSTITIAL event")
                    handleAdEvent("interstitial", json)
                }
                "reward", "REWARD", "rewarded", "REWARDED" -> {
                    Log.d(TAG, "processSingleEvent: matched REWARD event")
                    handleAdEvent("reward", json)
                }
                "banner", "BANNER" -> {
                    Log.d(TAG, "processSingleEvent: matched BANNER event")
                    handleAdEvent("banner", json)
                }
                "openad", "OPENAD", "app_open", "APP_OPEN" -> {
                    Log.d(TAG, "processSingleEvent: matched OPENAD event")
                    handleAdEvent("openad", json)
                }
                else -> {
                    // 其他事件类型当作广告事件处理
                    uiModule?.handleAdEvent(eventType, json.toString())
                }
            }
        }
    }

    /**
     * 处理广告事件：检查 app_ads_on 状态并调用对应 AdManager 方法
     * @param adType 广告类型：interstitial, reward, banner, openad
     * @param json 事件数据
     *
     * 处理流程说明：
     * - 首先读取 SharedPreferences 中的广告开关（ad_consent_enabled），如关闭则忽略事件。
     * - 尝试从 eventCallBack 提取 WebView/Context/Activity，若无法获取则跳过。
     * - 在主线程上执行广告调度（通过 AdHostActivity 或 AdManager），并将 message_id 作为可选关联信息传递。
     * - 推荐：在 handleAdEvent 中对 message_id 做日志记录，并在广告完成/失败后使用 eventCallBack 将结果下发给 H5（保持 message_id 关联），
     *   以便 H5 做埋点/展示逻辑（GameDataBridge 的 sendRawPayload/sendAppAdsOn 等方法即用于此场景）。
     */
    private fun handleAdEvent(adType: String, json: JSONObject) {
        Log.d(TAG, "=== handleAdEvent called ===")
        Log.d(TAG, "handleAdEvent: adType='$adType', json=$json")
        
        try {
            // 检查 app_ads_on 状态（从 SharedPreferences 读取 Enable Ads 开关）
            val ctx = uiModule?.let { 
                // 尝试从 UI 模块获取 context，如果不可用则从 eventCallBack 获取
                try {
                    val webView = eventCallBack?.let { callback ->
                        val field = callback.javaClass.getDeclaredField("webViewRef")
                        field.isAccessible = true
                        val webViewRef = field.get(callback) as? WeakReference<*>
                        webViewRef?.get() as? WebView
                    }
                    webView?.context
                } catch (e: Exception) {
                    Log.w(TAG, "无法获取 context，跳过广告事件处理", e)
                    null
                }
            }
            
            if (ctx == null) {
                Log.w(TAG, "Context 不可用，跳过广告事件: $adType")
                return
            }
            
            val prefs = ctx.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
            // 默认值改为 true：未存储时视为广告功能开启
            val appAdsOn = prefs.getBoolean("ad_consent_enabled", true)

            Log.d(TAG, "广告事件处理: type=$adType, app_ads_on=$appAdsOn, data=${json}")
            
            if (!appAdsOn) {
                Log.d(TAG, "广告功能已关闭，忽略广告事件: $adType")
                return
            }
            
            // 获取 Activity 实例
            val activity = try {
                val webView = eventCallBack?.let { callback ->
                    val field = callback.javaClass.getDeclaredField("webViewRef")
                    field.isAccessible = true
                    val webViewRef = field.get(callback) as? WeakReference<*>
                    webViewRef?.get() as? WebView
                }
                var context = webView?.context
                while (context is ContextWrapper) {
                    if (context is Activity) {
                        break
                    }
                    context = context.baseContext
                }
                context as? Activity
            } catch (e: Exception) {
                Log.w(TAG, "无法获取 Activity，跳过广告事件处理", e)
                null
            }

            if (activity == null) {
                Log.w(TAG, "Activity 不可用，跳过广告事件: $adType")
                return
            }

            // 根据广告类型调用对应的 AdManager 方法
            mainHandler.post {
                try {
                    // extract optional message_id for correlation
                    val messageId = if (json.has("message_id")) json.optString("message_id") else null
                    when (adType.lowercase()) {
                        "interstitial" -> {
                            Log.d(TAG, "启动插屏广告")
                            com.example.gameboxone.ads.AdHostActivity.start(
                                activity,
                                com.example.gameboxone.ads.AdHostActivity.Companion.AdType.INTERSTITIAL,
                                messageId
                            )
                        }
                        "reward", "rewarded" -> {
                            Log.d(TAG, "启动激励广告")
                            com.example.gameboxone.ads.AdHostActivity.start(
                                activity,
                                com.example.gameboxone.ads.AdHostActivity.Companion.AdType.REWARDED,
                                messageId
                            )
                        }
                        "banner" -> {
                            Log.d(TAG, "启动横幅广告")
                            com.example.gameboxone.ads.AdManager.loadBanner(activity, messageId)
                        }
                        "openad", "app_open" -> {
                            Log.d(TAG, "启动开屏广告")
                            com.example.gameboxone.ads.AdHostActivity.start(
                                activity,
                                com.example.gameboxone.ads.AdHostActivity.Companion.AdType.APP_OPEN,
                                messageId
                            )
                        }
                        else -> {
                            Log.w(TAG, "未知的广告类型: $adType")
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "调用 AdManager 失败: $adType", e)
                }
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "处理广告事件失败: $adType", e)
        }
    }

    /**
     * 健康检查/握手方法
     * @return 返回连接状态
     */
    @JavascriptInterface
    fun health(): String {
        Log.d(TAG, "health check called")
        return "OK"
    }
}
