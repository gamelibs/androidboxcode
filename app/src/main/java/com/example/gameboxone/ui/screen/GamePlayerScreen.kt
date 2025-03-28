package com.example.gameboxone.ui.screen

import android.annotation.SuppressLint
import android.os.Build
import android.util.Log
import android.view.View
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebSettings
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.Manager.EventManager
import com.example.gameboxone.data.viewmodel.GamePlayerViewModel
import com.example.gameboxone.event.GameEvent
import com.example.gameboxone.utils.WebGLHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File

private const val TAG = "GamePlayerScreen"

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GamePlayerScreen(
    localGamePath: String,
    viewModel: GamePlayerViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val eventManager = viewModel.eventManager

    // 预创建WebView缓存目录并配置WebGL环境
    LaunchedEffect(Unit) {
        try {
            // 创建WebView缓存目录
            val webViewCacheDir = File(context.cacheDir, "WebView/Default/HTTP Cache/Code Cache/js")
            if (!webViewCacheDir.exists()) {
                webViewCacheDir.mkdirs()
                Log.d(TAG, "预创建WebView缓存目录: ${webViewCacheDir.absolutePath}")
            }

            // 使用WebGLHelper预先配置WebGL环境
            WebGLHelper.configureWebViewForWebGL(WebView(context))
        } catch (e: Exception) {
            Log.e(TAG, "创建WebView缓存目录或配置WebGL失败", e)
        }
    }

    // JS Bridge 接口类
    class JsBridge(private val eventManager: EventManager) {
        @JavascriptInterface
        fun showDialog(title: String, message: String, callback: String) {
            CoroutineScope(Dispatchers.Main).launch {
                eventManager.emitGameEvent(GameEvent.UI.ShowBridgeDialog(
                    title = title,
                    message = message,
                    callback = callback
                ))
            }
        }
    }

    // 创建WebView
    val webViewWithSettings = remember {
        WebView(context).apply {
            // 单次设置硬件加速
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            settings.apply {
                // 基础设置
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true

                // WebGL必要设置
                allowFileAccess = true
                allowContentAccess = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true

                // 缓存设置
                cacheMode = WebSettings.LOAD_NO_CACHE

                // 安全设置
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    safeBrowsingEnabled = false
                }
            }

            // 添加JavaScript接口
            addJavascriptInterface(JsBridge(eventManager), "AndroidBridge")

            // WebGL错误处理
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                    // 特别过滤WebGL GL_INVALID_ENUM错误
                    if (message.message().contains("GL_INVALID_ENUM") && 
                        message.message().contains("GetIntegerv")) {
                        // 忽略此类错误，因为它们通常无害
                        Log.d(TAG, "忽略WebGL GetIntegerv错误")
                        return true
                    }
                    
                    // 记录其他WebGL相关消息
                    if (message.message().contains("WebGL")) {
                        Log.d(TAG, "WebGL: ${message.message()}")
                    }
                    
                    return super.onConsoleMessage(message)
                }
            }

            // 注入WebGL错误处理修复脚本
            evaluateJavascript("""
                (function() {
                    // 修复WebGL getParameter GL_INVALID_ENUM错误
                    const originalGetContext = HTMLCanvasElement.prototype.getContext;
                    HTMLCanvasElement.prototype.getContext = function(type, attrs) {
                        if (type.includes('webgl')) {
                            const gl = originalGetContext.call(this, type, attrs);
                            
                            if (gl) {
                                // 替换原始getParameter方法，捕获并处理错误
                                const originalGetParameter = gl.getParameter;
                                gl.getParameter = function(pname) {
                                    try {
                                        return originalGetParameter.call(this, pname);
                                    } catch(e) {
                                        // 静默处理GetIntegerv错误
                                        console.log("WebGL参数获取失败，忽略: " + pname);
                                        return null;
                                    }
                                };
                            }
                            return gl;
                        }
                        return originalGetContext.call(this, type, attrs);
                    };
                    
                    console.log("WebGL错误处理修复已应用");
                })();
            """, null)
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // WebView
        uiState.gameUrl?.let { url ->
            AndroidView(
                factory = { webViewWithSettings },
                update = { webView ->
                    webView.loadUrl(url)
                },
                modifier = Modifier.fillMaxSize()
            )
        }

        // 加载指示器
        if (uiState.isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center)
            )
        }
    }

    // 监听UI事件
    LaunchedEffect(Unit) {
        eventManager.gameEvents.collect { event ->
            when (event) {
                is GameEvent.UI.BridgeDialogResult -> {
                    webViewWithSettings.post {
                        webViewWithSettings.evaluateJavascript(
                            "javascript:${event.callback}(${event.confirmed})",
                            null
                        )
                    }
                }
                else -> {}
            }
        }
    }

    // 添加启动效果
    LaunchedEffect(localGamePath) {
        Log.d(TAG, "启动游戏: $localGamePath")
        viewModel.startGame(localGamePath)
    }

    // 延迟清理
    DisposableEffect(Unit) {
        onDispose {
            Log.d(TAG, "清理游戏资源")
            viewModel.stopGame()
            // 清理WebView
            with(webViewWithSettings) {
                stopLoading()
                clearHistory()
                clearCache(true)
                loadUrl("about:blank")
                onPause()
                removeAllViews()
            }
        }
    }
}