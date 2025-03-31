package com.example.gameboxone

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.gameboxone.manager.WebServerManager
import com.example.gameboxone.utils.WebGLHelper
import com.example.gameboxone.utils.WebSettingsUtils
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

private const val TAG = "WebViewActivity"

@AndroidEntryPoint
class WebViewActivity : AppCompatActivity(), CoroutineScope by MainScope() {

    companion object {
        private const val KEY_GAME_PATH = "gamePath"

        fun start(context: Context, gamePath: String) {
            val intent = Intent(context, WebViewActivity::class.java).apply {
                putExtra(KEY_GAME_PATH, gamePath)
                // 添加标志位，确保从新任务启动
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }

    private lateinit var layoutWeb: FrameLayout
    private lateinit var layoutLoading: FrameLayout
    private lateinit var layoutError: LinearLayout
    private lateinit var textErrorMessage: TextView
    private lateinit var btnRetry: Button
    private lateinit var progressBar: ProgressBar
    
    private lateinit var webView: WebView
    private var gamePath: String? = null
    private var gameUrl: String? = null

    @Inject
    lateinit var webServerManager: WebServerManager

    // 添加错误处理和生命周期相关字段
    private var hasError = false
    private var isDestroyed = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_web)

        // 初始化视图
        initViews()
        
        // 获取游戏路径
        gamePath = intent.getStringExtra(KEY_GAME_PATH)
        if (gamePath == null) {
            showError("没有提供游戏路径，无法启动游戏")
            return
        }

        // 检查游戏路径是否存在
        if (!validateGamePath()) {
            return
        }

        // 设置WebView并启动服务器
        setupWebView()
        startLocalServer()
    }

    private fun initViews() {
        layoutWeb = findViewById(R.id.layout_web)
        layoutLoading = findViewById(R.id.layout_loading)
        layoutError = findViewById(R.id.layout_error)
        textErrorMessage = findViewById(R.id.text_error_message)
        btnRetry = findViewById(R.id.btn_retry)
        progressBar = findViewById(R.id.progress_bar)

        btnRetry.setOnClickListener {
            retryLoading()
        }
    }

    private fun validateGamePath(): Boolean {
        val gameDir = File(gamePath!!)
        if (!gameDir.exists() || !gameDir.isDirectory) {
            showError("游戏目录不存在: $gamePath")
            Log.e(TAG, "游戏目录不存在或无效: $gamePath")
            return false
        }
        
        // 检查游戏目录下是否有index.html文件
        val indexFile = File(gameDir, "index.html")
        if (!indexFile.exists()) {
            showError("游戏文件不完整，缺少主页文件")
            Log.e(TAG, "游戏目录中没有找到index.html: $gamePath")
            return false
        }
        
        return true
    }

    private fun setupWebView() {
        webView = WebView(this).apply {
            // 使用统一的WebSettings工具类配置
            WebSettingsUtils.setSettings(this@WebViewActivity, this)

            // 硬件加速 - 对WebGL至关重要
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView, newProgress: Int) {
                    super.onProgressChanged(view, newProgress)
                    if (!hasError) {
                        updateLoadingProgress(newProgress)
                    }
                }

                // 添加错误处理
                override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                    Log.d(TAG, "Console: ${message.message()}")
                    return true
                }

                // 添加全屏支持
                override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                    super.onShowCustomView(view, callback)
                    if (view != null) {
                        layoutWeb.addView(view, ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT))
                        view.tag = "customView"
                    }
                }
                
                override fun onHideCustomView() {
                    super.onHideCustomView()
                    // 隐藏全屏视图
                    val customView = layoutWeb.findViewWithTag<View>("customView")
                    if (customView != null) {
                        layoutWeb.removeView(customView)
                    }
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                    view.loadUrl(url)
                    return true
                }

                override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    hasError = false
                    showLoading()
                }

                override fun onPageFinished(view: WebView, url: String) {
                    super.onPageFinished(view, url)
                    if (!hasError) {
                        hideLoading()  
                    }
                    Log.d(TAG, "页面加载完成: $url")

                    // 注入WebGL修复脚本
                    injectWebGLFixScript()
                }

                override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                    Log.e(TAG, "加载错误: ${error.description}")
                    super.onReceivedError(view, request, error)
                    hasError = true
                    handleWebViewError(error)
                }
            }

            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        layoutWeb.addView(webView)
    }

    private fun startLocalServer() {
        showLoading()
        launch(Dispatchers.IO) {
            try {
                Log.d(TAG, "准备启动本地服务器，游戏路径: $gamePath")
                webServerManager.startServer(gamePath!!)
                
                gameUrl = webServerManager.getGameUrl(gamePath!!)
                Log.d(TAG, "获取到游戏URL: $gameUrl")

                launch(Dispatchers.Main) {
                    gameUrl?.let {
                        Log.d(TAG, "加载游戏URL: $it")
                        webView.loadUrl(it)
                    } ?: run {
                        showError("无法获取游戏URL")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "启动本地服务器失败", e)
                launch(Dispatchers.Main) {
                    showError("启动游戏服务失败: ${e.message}")
                }
            }
        }
    }

    private fun injectWebGLFixScript() {
        webView.post {
            webView.evaluateJavascript(WebGLHelper.getWebGLFixScript(), null)
        }
    }

    private fun goBack() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            finish()
        }
    }

    // 处理WebView错误
    private fun handleWebViewError(error: WebResourceError) {
        if (!isDestroyed) {
            showError("加载失败: ${error.description}")
        }
    }

    // 更新加载进度
    private fun updateLoadingProgress(progress: Int) {
        progressBar.progress = progress
        if (progress >= 100) {
            hideLoading()
        }
    }

    // 显示加载动画
    private fun showLoading() {
        layoutLoading.visibility = View.VISIBLE
        layoutError.visibility = View.GONE
    }

    // 隐藏加载动画
    private fun hideLoading() {
        layoutLoading.visibility = View.GONE
    }
    
    // 显示错误信息
    private fun showError(message: String) {
        layoutLoading.visibility = View.GONE
        layoutError.visibility = View.VISIBLE
        textErrorMessage.text = message
        Log.e(TAG, message)
    }
    
    // 重试加载
    private fun retryLoading() {
        if (validateGamePath()) {
            layoutError.visibility = View.GONE
            // 重启本地服务器
            startLocalServer()
        }
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.keyCode == KeyEvent.KEYCODE_BACK && event.action == KeyEvent.ACTION_UP) {
            goBack()
            return true
        }
        return super.dispatchKeyEvent(event)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        isDestroyed = true
        webView.apply {
            stopLoading()
            clearHistory()
            clearCache(true)
            loadUrl("about:blank")
            removeAllViews()
            destroy()
        }

        launch(Dispatchers.IO) {
            webServerManager.stopServer()
        }

        cancel()
        super.onDestroy()
    }
}