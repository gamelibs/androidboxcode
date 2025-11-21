package com.example.gameboxone

import android.content.Context
import android.content.pm.ApplicationInfo
import android.util.Log
import android.webkit.WebView
import com.example.gameboxone.callback.AndroidEventCallBack
import com.example.gameboxone.webview.GameInfoUIModule
import kotlin.jvm.javaClass
import kotlin.let
import kotlin.text.trimIndent

/**
 * WebView JavaScript 桥接完整管理器
 * 职责：注册桥接、注入脚本、初始化，提供一站式桥接服务
 * 支持回调机制和异常处理
 *
 * H5 交互说明（总览）：
 * - 该类负责将原生能力有控制地暴露给 H5（通过 addJavascriptInterface）以及在页面中注入必要的 JS 脚本
 *   （如 WebGL 修复脚本、广告事件监听、健康检查脚本等）。
 * - 安全说明：对 `addJavascriptInterface` 暴露的方法必须谨慎设计，避免直接暴露敏感 API。
 *   推荐做法：在桥接方法内部做来源/域名校验、参数校验及异常捕获；在可能的情况下，优先使用 postMessage 等受控通道。
 * - Debug vs Release：调试模式下会注入更多帮助排查的脚本（日志、守卫、WebGL 修复），发布版尽量保持最小化注入，降低攻击面并提升性能。
 */
object WebViewBridgeRegistrar {
    private const val TAG = "WebViewBridgeRegistrar"


    /**
     * 完整的桥接初始化：注册 + 注入脚本 + 初始化
     * 说明：
     * - 调用方（如 `WebViewActivity`）应在创建 WebView 并设置好 WebSettings 后调用此函数。
     * - 该函数分两步：注册桥接接口（addJavascriptInterface）和按环境注入脚本/初始化逻辑。
     * - 只有在 WebView 准备好（通常在 loadUrl 前或页面 onPageFinished 前）时，脚本才会生效；因此内部使用 webView.post 保证在 UI 线程执行。
     */
    fun registerAndInitialize(
        webView: WebView,
        activityProvider: () -> WebViewActivity,
        uiModule: GameInfoUIModule?
    ) {
        // 1. 注册所有桥接
        registerBridges(webView, activityProvider, uiModule)

        // 2. 注入并初始化所有脚本（仅 Debug 环境注入调试脚本/守卫/日志桥接）
        if (isAppDebuggable(webView.context)) {
            // Debug 模式：注入调试脚本（包括 WebGL 修复、广告工具脚本等），便于开发时快速排查问题。
            initializeBridgeScripts(webView)
        } else {
            // Release：不注入调试脚本，最小化对 H5 的影响，但仍执行最小的可用性检查（例如广告桥可用性检测）。
            try {
                webView.post { ensureAdBridgeAvailable(webView) }
            } catch (e: Exception) {
                Log.w(TAG, "post minimal init failed", e)
            }
        }
    }

    /**
     * 注册所有 JavaScript 桥接接口
     * 重点说明：
     * - 使用 addJavascriptInterface 时请确保暴露的类只包含需要的方法，且在方法实现中做足够的校验与异常处理。
     * - 尽量避免在接口中直接处理任意 eval/exec 请求；若必须暴露执行能力，请做白名单/权限校验。
     * - 本方法把回调与事件发送的能力封装为 `AndroidEventCallBack`，并通过 `GameDataBridge` 统一处理业务事件。
     */
    @Suppress("UNUSED_PARAMETER")
    private fun registerBridges(
        webView: WebView,
        activityProvider: () -> WebViewActivity,
        uiModule: GameInfoUIModule?
    ) {
        // 保持对 activityProvider 的轻量引用以避免 "未使用参数" 的编译警告，且不执行实际 provider() 调用以避免副作用。
        @Suppress("UNUSED_VARIABLE")
        val _activityProviderRef = activityProvider.hashCode()

        // 为了解决静态分析器在调用处发出的警告，我们尽量安全地调用 activityProvider() 一次，
        // 但要捕获任何异常并避免对得到的 Activity 做副作用操作。
        try {
            val maybeActivity = try { activityProvider() } catch (t: Throwable) { null }
            // 仅做非侵入式检查，例如记录类名，避免触发生命周期方法
            maybeActivity?.javaClass?.name?.let { _ -> /* intentionally no-op */ }
        } catch (e: Exception) {
            // 忽略，调用仅为标记参数已被使用
        }


        try {
            // 创建回调处理器
            val eventCallBack = AndroidEventCallBack(webView)

            // expose callback holder for native->JS raw payload sending
            try {
                com.example.gameboxone.callback.AndroidEventCallBackHolder.setCallback(eventCallBack)
            } catch (e: Exception) {
                Log.w(TAG, "setCallback holder failed", e)
            }

            // 将 uiModule 和 eventCallBack 传入 GameDataBridge
            // 说明：GameDataBridge 是将具体业务（如游戏存档、统计、配置）提供给 H5 的受控接口。
            //    - H5 通过 window.CpsenseAppEvent.<method> 调用原生能力，GameDataBridge 在内部应进行参数和来源校验。
            val gameBridge = com.example.gameboxone.game.GameDataBridge(uiModule, eventCallBack)
            webView.addJavascriptInterface(gameBridge, "CpsenseAppEvent")
            Log.d(TAG, "JavaScript interface 'CpsenseAppEvent' registered successfully")

            // 注册回调接口（提供 confirm 等交互能力，命名与 JS 端对齐）
            // 说明：回调接口用于原生向 H5 推送事件或应答 H5 的异步调用（例如广告结果回调）。
            webView.addJavascriptInterface(eventCallBack, "CpsenseAppEventCallBackInterface")
            Log.d(TAG, "JavaScript interface 'CpsenseAppEventCallBackInterface' registered successfully")

            // Wire native->H5 ad event dispatcher (eventCallBack in scope here)
            try {
                com.example.gameboxone.ads.AdGameEventBridge.setCallback(eventCallBack)
            } catch (e: Exception) {
                Log.w(TAG, "AdGameEventBridge setCallback failed", e)
            }
        } catch (e: Exception) {
            Log.w(TAG, "addJavascriptInterface CpsenseAppEvent/CpsenseAppEventCallBack failed", e)
        }

        // 仅 Debug 注入 AdSDK 工具脚本（包含 console 友好日志等），发布版不注入
        if (isAppDebuggable(webView.context)) {
            try {
                webView.post {
                    try {
                        // AdSdkBridge may live in different packages across forks; resolve via reflection to avoid compile-time dependency
                        val possibleNames = listOf(
                            "com.example.gameboxone.ads.AdSdkBridge",
                            "com.vidar.dragonegg.ads.AdSdkBridge",
                            "com.example.ads.AdSdkBridge"
                        )
                        var jsUtils: String? = null
                        for (name in possibleNames) {
                            try {
                                val cls = Class.forName(name)
                                val field = cls.getDeclaredField("JS_AD_UTILITIES")
                                field.isAccessible = true
                                val value = field.get(null) as? String
                                if (!value.isNullOrEmpty()) {
                                    jsUtils = value
                                    break
                                }
                            } catch (_: Throwable) { /* try next */ }
                        }
                        jsUtils?.let { webView.evaluateJavascript(it, null) }
                    } catch (e: Exception) {
                        Log.w(TAG, "evaluateJavascript JS_AD_UTILITIES failed", e)
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "post JS injection failed", e)
            }
        }
    }

    private fun isAppDebuggable(ctx: Context): Boolean {
        return try {
            (ctx.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        } catch (_: Exception) { false }
    }

    /**
     * 初始化所有桥接相关的脚本和功能
     * 包括：WebGL修复、广告事件监听、游戏数据桥接初始化
     * 说明：此方法主要用于开发/调试阶段，注入脚本帮助在各种设备/浏览器内核差异下提高稳定性。
     */
    private fun initializeBridgeScripts(webView: WebView) {
        webView.post {
            try {
                // 1. 注入 WebGL 修复脚本
                // 说明：某些 WebView 内核的 WebGL 实现���在兼容性问题，WebGLHelper.getWebGLFixScript
                // 会注入针对已知问题的修复（例如调整 getExtension、wrap shader 编译逻辑等）。
                webView.evaluateJavascript(com.example.gameboxone.utils.WebGLHelper.getWebGLFixScript(), null)

                // 2. 设置广告事件监听器
                // 说明：在 H5 页面中监听自定义 adRequest 事件，并尝试调用预先注册的 AndroidAd 接口。
                setupAdEventListener(webView)

                // 3. 初始化游戏数据桥接
                // 说明：通过调用 CpsenseAppEvent.health() 或类似接口触发原生端初始化逻辑，便于 H5 端知道桥接已经可用。
                initializeGameDataBridge(webView)

                // 4. 确保广告桥接可用性检查
                // 说明：对广告等可选桥做一次性检查，保证在页面层面尽早发现问题并记录日志。
                ensureAdBridgeAvailable(webView)

            } catch (e: Exception) {
                Log.w(TAG, "Bridge scripts initialization failed", e)
            }
        }
    }

    /**
     * 设置广告事件监听器
     * H5->Native 流程说明：
     * - H5 通过 dispatchEvent(new CustomEvent('adRequest', { detail: { type: 'banner' } })) 发起广告请求；
     * - 注入的监听器会检查 window.AndroidAd 是否存在并调用其方法；此处为简化示例，生产中建议使用事件总线/回调接口并对来源进行校验。
     */
    private fun setupAdEventListener(webView: WebView) {
        webView.evaluateJavascript("""
            window.addEventListener('adRequest', function(event) {
                try {
                    var adType = event.detail && event.detail.type;
                    if (adType && window.AndroidAd && typeof window.AndroidAd.showAd === 'function') {
                        window.AndroidAd.showAd(adType);
                    }
                } catch (e) {
                    // 静默处理错误
                }
            });
        """.trimIndent(), null)
    }

    /**
     * 初始化游戏数据桥接
     * 说明：做一个简单的 "健康检查" 调用，让 H5 能得知 bridge 可用并触发前端相应初始化逻辑。
     * - 使用 setTimeout 是为了等待页面中可能尚未绑定到 window 的代码完成注册。
     */
    private fun initializeGameDataBridge(webView: WebView) {
        webView.evaluateJavascript("""
            setTimeout(function() {
                if (window.CpsenseAppEvent && typeof window.CpsenseAppEvent.health === 'function') {
                    try {
                        window.CpsenseAppEvent.health();
                    } catch (e) {
                        // 静默处理健康检查失败
                    }
                }
            }, 500);
        """.trimIndent(), null)
    }

    /**
     * 确保广告桥接可用性
     * 说明：在页面层面调用 checkAdBridge（若 H5 注入了此函数）用于对接入的广告桥进行一次快速检测。
     */
    private fun ensureAdBridgeAvailable(webView: WebView) {
        webView.evaluateJavascript("""
            setTimeout(function() {
                if (typeof window.checkAdBridge === 'function') {
                    window.checkAdBridge();
                }
            }, 100);
        """.trimIndent(), null)
    }
}
