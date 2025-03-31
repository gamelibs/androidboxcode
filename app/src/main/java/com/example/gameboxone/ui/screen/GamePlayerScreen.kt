
package com.example.gameboxone.ui.screen


import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Build
import android.util.Log
import android.view.View
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
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
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.data.viewmodel.GamePlayerViewModel
import com.example.gameboxone.event.GameEvent
import com.example.gameboxone.utils.WebGLHelper
import com.example.gameboxone.utils.WebSettingsUtils
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File

private const val TAG = "GamePlayerScreen"

//
//@SuppressLint("SetJavaScriptEnabled")
//@Composable
//fun GamePlayerScreen(
//    localGamePath: String,
//    viewModel: GamePlayerViewModel = hiltViewModel()
//) {
//    val uiState by viewModel.uiState.collectAsState()
//    val context = LocalContext.current
//    val eventManager = viewModel.eventManager
//
//    // 预创建WebView缓存目录并配置WebGL环境
//    LaunchedEffect(Unit) {
//        try {
//            // 创建WebView缓存目录
//            val webViewCacheDir = File(context.cacheDir, "WebView/Default/HTTP Cache/Code Cache/js")
//            if (!webViewCacheDir.exists()) {
//                webViewCacheDir.mkdirs()
//                Log.d(TAG, "预创建WebView缓存目录: ${webViewCacheDir.absolutePath}")
//            }
//
//            // 使用WebGLHelper预先配置WebGL环境
////            WebGLHelper.configureWebViewForWebGL(WebView(context))
//        } catch (e: Exception) {
//            Log.e(TAG, "创建WebView缓存目录或配置WebGL失败", e)
//        }
//    }
//
//    // JS Bridge 接口类
//    class JsBridge(private val eventManager: EventManager) {
//        @JavascriptInterface
//        fun showDialog(title: String, message: String, callback: String) {
//            CoroutineScope(Dispatchers.Main).launch {
//                eventManager.emitGameEvent(GameEvent.UI.ShowBridgeDialog(
//                    title = title,
//                    message = message,
//                    callback = callback
//                ))
//            }
//        }
//    }
//
//    // 创建WebView
//    val webViewWithSettings = remember {
//        WebView(context).apply {
//            // 使用统一的WebSettings工具类配置
//            WebSettingsUtils.setSettings(context, this)
//
//            // 硬件加速
//            setLayerType(View.LAYER_TYPE_HARDWARE, null)
//
//            // 添加JavaScript接口
//            addJavascriptInterface(JsBridge(eventManager), "AndroidBridge")
//
//            // 增强的WebChromeClient
//            webChromeClient = object : WebChromeClient() {
//                override fun onConsoleMessage(message: ConsoleMessage): Boolean {
//                    Log.d(TAG, "WebGL控制台: ${message.message()}")
//                    return true
//                }
//
//                // 处理权限请求 - 对WebGL很重要
//                @SuppressLint("NewApi")
//                override fun onPermissionRequest(request: PermissionRequest) {
//                    request.grant(request.resources)
//                }
//            }
//
//            // 添加WebViewClient以监控加载状态
//            webViewClient = object : WebViewClient() {
//                override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
//                    Log.d(TAG, "开始加载页面: $url")
//                    super.onPageStarted(view, url, favicon)
//                }
//
//                override fun onPageFinished(view: WebView, url: String) {
//                    Log.d(TAG, "页面加载完成: $url")
//                    super.onPageFinished(view, url)
//                }
//
//                override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
//                    Log.e(TAG, "加载错误: ${error.description} 代码: ${error.errorCode}")
//                    super.onReceivedError(view, request, error)
//                }
//            }
//        }
//    }
//
//    Box(modifier = Modifier.fillMaxSize()) {
//        // WebView
//        uiState.gameUrl?.let { url ->
//            AndroidView(
//                factory = { webViewWithSettings },
//                update = { webView ->
//                    webView.loadUrl(url)
//                },
//                modifier = Modifier.fillMaxSize()
//            )
//        }
//
//        // 加载指示器
//        if (uiState.isLoading) {
//            CircularProgressIndicator(
//                modifier = Modifier.align(Alignment.Center)
//            )
//        }
//    }
//
//    // 监听UI事件
//    LaunchedEffect(Unit) {
//        eventManager.gameEvents.collect { event ->
//            when (event) {
//                is GameEvent.UI.BridgeDialogResult -> {
//                    webViewWithSettings.post {
//                        webViewWithSettings.evaluateJavascript("""
//                            (function() {
//                                // 修复WebGL初始化问题
//                                const originalGetContext = HTMLCanvasElement.prototype.getContext;
//                                HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {
//                                    // 强制启用所有WebGL特性
//                                    if (contextType.includes('webgl')) {
//                                        const newAttributes = contextAttributes || {};
//                                        newAttributes.alpha = true;
//                                        newAttributes.antialias = true;
//                                        newAttributes.depth = true;
//                                        newAttributes.premultipliedAlpha = true;
//                                        newAttributes.preserveDrawingBuffer = true;
//
//                                        // 尝试创建上下文
//                                        const gl = originalGetContext.call(this, contextType, newAttributes);
//
//                                        if (gl) {
//                                            // 保护getParameter方法
//                                            const originalGetParameter = gl.getParameter;
//                                            gl.getParameter = function(pname) {
//                                                try {
//                                                    return originalGetParameter.call(this, pname);
//                                                } catch(e) {
//                                                    console.log("WebGL参数获取被捕获: " + pname);
//                                                    return null;
//                                                }
//                                            };
//                                        }
//                                        return gl;
//                                    }
//                                    return originalGetContext.call(this, contextType, contextAttributes);
//                                };
//
//                                console.log("WebGL环境已优化");
//                            })();
//                        """, null)
//                    }
//                }
//                else -> {}
//            }
//        }
//    }
//
//    // 添加启动效果
//    LaunchedEffect(localGamePath) {
//        Log.d(TAG, "启动游戏: $localGamePath")
//        viewModel.startGame(localGamePath)
//    }
//
//    // 延迟清理
//    DisposableEffect(Unit) {
//        onDispose {
//            Log.d(TAG, "清理游戏资源")
//            viewModel.stopGame()
//            // 清理WebView
//            with(webViewWithSettings) {
//                stopLoading()
//                clearHistory()
//                clearCache(true)
//                loadUrl("about:blank")
//                onPause()
//                removeAllViews()
//            }
//        }
//    }
//}