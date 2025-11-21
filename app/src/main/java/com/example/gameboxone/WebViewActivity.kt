package com.example.gameboxone

/*
 * WebViewActivity.kt
 * -------------------
 * 说明：
 * 这个 Activity 负责托管游戏的 WebView 并提供宿主（App）与游戏页面/SDK 的交互桥接。
 * 我在每个方法和重要代码段上添加了详细注释，说明其用途、交互契约、以及副作用。
 */

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.util.Log
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
import androidx.appcompat.app.AppCompatActivity
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.MyGameManager
import com.example.gameboxone.manager.WebServerManager
import com.example.gameboxone.utils.WebSettingsUtils
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject
import android.webkit.JavascriptInterface
import android.view.LayoutInflater
import androidx.annotation.LayoutRes

private const val TAG = "WebViewActivity"

@AndroidEntryPoint
class WebViewActivity : AppCompatActivity(), CoroutineScope by MainScope() {

    companion object {
        private const val KEY_GAME_PATH = "gamePath"
        private const val KEY_GAME_ID = "gameId"  // 添加游戏ID参数

        /**
         * 启动此 Activity 的便捷方法。
         * @param context 上下文（通常为 Activity 或 Application 的 context）
         * @param gamePath 本地游戏目录（解压后包含 index.html 的文件夹路径）
         * @param gameId 可选的游戏ID，用来查询本地配置（例如任务积分）
         */
        fun start(context: Context, gamePath: String, gameId: String) {
            val intent = Intent(context, WebViewActivity::class.java).apply {
                putExtra(KEY_GAME_PATH, gamePath)
                putExtra(KEY_GAME_ID, gameId)  // 传递游戏ID
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }

    // 布局及控件引用：用于展示 Web 内容 / 加载 / 错误 / 覆盖层 / 顶部信息条
    private lateinit var layoutWeb: FrameLayout
    private lateinit var layoutLoading: FrameLayout
    private lateinit var layoutError: LinearLayout
    private lateinit var textErrorMessage: TextView
    private lateinit var btnRetry: Button
    private lateinit var progressBar: ProgressBar

    private lateinit var webView: WebView
    private var gamePath: String? = null
    private var gameUrl: String? = null
    private var gameId: String? = null  // 添加游戏ID字段

    // topbar（宿主 UI，包含返回/暂停/得分）
    private lateinit var layoutTopbar: LinearLayout
    private lateinit var btnBack: android.widget.ImageButton
    private lateinit var btnPause: android.widget.ImageButton
    private lateinit var tvScore: TextView

    @Inject
    lateinit var webServerManager: WebServerManager

    @Inject
    lateinit var eventManager: EventManager  // 添加事件管理器
    
    @Inject
    lateinit var myGameManager: MyGameManager  // 添加游戏管理器

    @Inject
    lateinit var dataManager: com.example.gameboxone.manager.DataManager

     // 添加错误处理和生命周期相关字段
     private var hasError = false
     private var isDestroyed = false


    // 标志：表示当前是否正在展示广告（由 JS-bridge 在展示广告前设置）
    @Volatile
    private var isAdBeingDisplayed = false
    // 供 AdSdkBridge 调用以设置广告展示状态
    @Synchronized
    fun setAdBeingDisplayed(value: Boolean) {
        // H5交互说明：
        // 1) 此方法由原生广告桥（例如 AdSdkBridge）调用，表明原生层即将显示或已关闭原生广告。
        // 2) 该标志用于原生层决定在窗口失去焦点、音频焦点或生命周期变化时是否应当暂停/恢复 WebView 或游戏逻辑。
        // 3) 注意：此方法只更新原生状态，不会直接操作 WebView 或注入 JS。如需通知 H5，使用 notifyJsAdWillShow()/notifyJsAdClosed().
        isAdBeingDisplayed = value
        Log.d(com.example.gameboxone.TAG, "setAdBeingDisplayed = $value")
    }

    // Overlay 覆盖层视图
    private lateinit var layoutOverlay: FrameLayout
    private lateinit var overlayTask: TextView
    private lateinit var btnContinue: Button

    // runtime score state — keep latest but only show when topbar visible
    // 当前得分仅在顶部 topbar 可见（游戏已开始）时显示
    private var currentScore: Int? = null

    /**
     * Activity 生命周期 onCreate
     * 1) 隐藏系统栏（全屏），因为游戏希望沉浸式显示
     * 2) setContentView 到 `activity_web`（该布局包含 WebView 的容器、加载/错误/overlay 等）
     * 3) initViews() 绑定控件
     * 4) 读取 intent 参数（gamePath / gameId），校验并启动本地静态服务器
     * 5) 若提供 gameId，则异步加载任务信息并显示在 overlay 上
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Make this activity fullscreen (hide status and navigation bars)
        androidx.core.view.WindowCompat.setDecorFitsSystemWindows(window, false)
        val insetsController = androidx.core.view.WindowInsetsControllerCompat(window, window.decorView)
        insetsController.hide(androidx.core.view.WindowInsetsCompat.Type.systemBars())
        insetsController.systemBarsBehavior = androidx.core.view.WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        setContentView(R.layout.activity_web)

        // 初始化视图（绑定 layout 中的所有子视图引用）
        initViews()
        
        // 获取游戏路径和 ID（由 caller 传入）
        gamePath = intent.getStringExtra(KEY_GAME_PATH)
        gameId = intent.getStringExtra(KEY_GAME_ID)
        
        if (gamePath == null) {
            showError("没有提供游戏路径，无法启动游戏")
            return
        }

        // 检查游戏路径是否有效（存在且包含 index.html），否则展示错误页面
        if (!validateGamePath()) {
            return
        }

        // 记录游戏启动（可以上报事件）
        recordGameStart()

        // 若传入 gameId，则尝试加载任务信息并更新遮罩文本
        // 使用协程在 IO 线程读取数据库并切换回主线程更新 overlayText
        gameId?.let { id ->
            launch(Dispatchers.IO) {
                try {
                    val game = dataManager.getGameById(id)
                    val points = game?.taskPoints
                    val desc = game?.taskDesc
                    val text = when {
                        !points.isNullOrEmpty() -> {
                            // 显示前四个点
                            val show = points.take(4).joinToString(separator = ",")
                            "任务:${show}"
                        }
                        !desc.isNullOrBlank() -> desc
                        else -> "任务: -"
                    }
                    launch(Dispatchers.Main) {
                        overlayTask.text = text
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "获取任务信息失败: ${e.message}")
                }
            }
        }

        // 设置 WebView 并启动本地静态文件服务器以便加载游戏
        setupWebView()
        startLocalServer()
    }

    /**
     * 绑定并初始化布局中的视图（只做 findViewById 和初始状态设定）
     * - 包括 overlay（遮罩层）、topbar（宿主 UI）以及 loading/error 视图。
     * - 不在此处加载游戏内容，只做视图初始绑定与点击事件连接。
     */
    private fun initViews() {
        layoutWeb = findViewById(R.id.layout_web)
        layoutLoading = findViewById(R.id.layout_loading)
        layoutError = findViewById(R.id.layout_error)
        textErrorMessage = findViewById(R.id.text_error_message)
        btnRetry = findViewById(R.id.btn_retry)
        progressBar = findViewById(R.id.progress_bar)

        // overlay（遮罩层）容器
        layoutOverlay = findViewById(R.id.layout_overlay)
        // Inflate initial overlay (start page) — 默认显示开始游戏页面（start）
        inflateOverlay(R.layout.view_start_game)

        // topbar（包含返回/暂停/分数）
        layoutTopbar = findViewById(R.id.layout_topbar)
        btnBack = findViewById(R.id.btn_back)
        btnPause = findViewById(R.id.btn_pause)
        tvScore = findViewById(R.id.tv_score)

        // 默认处于播放状态（尚未开始，使用 tag 控制暂停/播放状态）
        btnPause.tag = "playing"

        // 顶部控制栏在未开始游戏前不显示，只有按下“继续游戏”后才显示
        layoutTopbar.visibility = View.GONE

        btnRetry.setOnClickListener {
            retryLoading()
        }

        // note: btnContinue and overlay control are bound inside inflateOverlay

        btnBack.setOnClickListener {
            goBack()
        }

        // 暂停/恢复按钮的点击处理
        // 逻辑：点击进入 paused 状态时会显示 overlay（继续页面），并调用页面的 pause JS 回调（如果存在）
        // 恢复时隐藏 overlay 并调用 resume JS 回调
        btnPause.setOnClickListener {
            // 暂停/恢复游戏：显示或隐藏覆盖层，并调用页面 JS 钩子（如果存在）
            val isPaused = btnPause.tag == "paused"
            if (isPaused) {
                // 恢复游戏：隐藏 overlay，显示 topbar，调用页面 resume JS
                btnPause.tag = "playing"
                layoutOverlay.visibility = View.GONE
                layoutTopbar.visibility = View.VISIBLE
                webView.evaluateJavascript("(function(){ if(window.resumeGame) { window.resumeGame(); } if(window.__appResume) { window.__appResume(); } })()", null)

             } else {
                 // 暂停游戏：显示 overlay 并调用页面 pause JS（overlay 默认是继续面板）
                 btnPause.tag = "paused"
                 // show overlay and inflate the 'continue' panel
                 inflateOverlay(R.layout.view_goon_game)
                 layoutOverlay.visibility = View.VISIBLE
                  // 隐藏顶部栏以符合需求
                  layoutTopbar.visibility = View.GONE
                  webView.evaluateJavascript("(function(){ if(window.pauseGame) { window.pauseGame(); } if(window.__appPause) { window.__appPause(); } })()", null)

               }
         }
    }

    /**
     * 将指定的 overlay 布局（开始/继续面板）注入 overlay 容器，并绑定其中的控件与回调。
     * - layoutRes: 要注入的布局资源 ID，例如 R.layout.view_start_game 或 R.layout.view_goon_game
     * - 此函数会移除之前的 overlay 内容并 inflate 一个新的视图
     * - 绑定的控件：overlayTask（任务文本）、btnContinue（继续按钮）、btnClose（关闭按钮）
     */
    private fun inflateOverlay(@LayoutRes layoutRes: Int) {
        // clear previous
        layoutOverlay.removeAllViews()
        LayoutInflater.from(this).inflate(layoutRes, layoutOverlay, true)
        // bind controls inside overlay
        overlayTask = layoutOverlay.findViewById(R.id.overlay_task)
        btnContinue = layoutOverlay.findViewById(R.id.btn_continue)
        val btnClose = layoutOverlay.findViewById<android.widget.ImageButton?>(R.id.btn_close_overlay)
        // 关闭按钮默认行为：结束 Activity（返回上一级）
        btnClose?.setOnClickListener {
            finish()
        }
        btnContinue.setOnClickListener {
             // hide overlay and start/resume game
             layoutOverlay.visibility = View.GONE
             layoutTopbar.visibility = View.VISIBLE
             // update score display
             val scoreToShow = currentScore ?: 0
             tvScore.text = "当前得分:${scoreToShow}"
             btnPause.tag = "playing"
             webView.evaluateJavascript("(function(){ if(window.resumeGame) { window.resumeGame(); } if(window.__appResume) { window.__appResume(); } })()", null)

         }
    }

    /**
     * 校验传入的 gamePath 是否有效：存在且为目录，并包含 index.html
     * 返回 true 表示可以继续加载，否则会展示错误页面并返回 false
     */
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

    /**
     * 配置并创建 WebView
     * - 设置 WebSettings（使用工具类统一设置）
     * - 注入 JS Bridge（AndroidBridge），提供 onScore/requestPause/requestResume 等方法给页面调用
     * - 设置 WebChromeClient/WebViewClient 以处理进度、console、错误及全屏视图
     * - 将 WebView 添加到 layoutWeb 容器中

     */
    private fun setupWebView() {
        webView = WebView(this).apply {
            // 使用统一的WebSettings工具类配置
            WebSettingsUtils.setSettings(this@WebViewActivity, this)

            // Register JS bridge before loading content
            // Note: addJavascriptInterface should be used only with trusted content (we serve local files)
            this@WebViewActivity.runOnUiThread {

            }

            // 硬件加速 - 对WebGL至关重要
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            webChromeClient = object : WebChromeClient() {
                // 页面加载进度回调，用于更新进度条
                override fun onProgressChanged(view: WebView, newProgress: Int) {
                    super.onProgressChanged(view, newProgress)
                    if (!hasError) {
                        updateLoadingProgress(newProgress)
                    }
                }

                // 捕获页面 console.log 输出，便于调试
                override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                    Log.d(TAG, "Console: ${message.message()}")
                    return true
                }

                // 支持页面主动请求进入全屏（视频或 WebGL 全屏）
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
                // 拦截 URL 加载，使用 WebView 自己加载
                override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                    view.loadUrl(url)
                    return true
                }

                // 页面开始加载时显示 loading
                override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    hasError = false
                    showLoading()
                }

                // 页面加载完成，隐藏 loading 显示内容
                override fun onPageFinished(view: WebView, url: String) {
                    super.onPageFinished(view, url)
                    if (!hasError) {
                        hideLoading()  
                    }
                    Log.d(TAG, "页面加载完成: $url")

                }

                // 接收错误并展示友好提示
                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    hasError = true
                    val errorMessage = error?.let { "错误 ${it.errorCode}: ${it.description}" } ?: "未知错误"
                    showError("加载错误: $errorMessage")
                }
            }
        }

        // 使用集中管理器完成所有桥接初始化（注册接口、注入脚本、初始化）
        // 说明：WebViewBridgeRegistrar 负责：
        //  - 向 WebView 注入必要的 JS 脚本（如 postMessage 封装、事件桥）
        //  - 注册受控的原生接口（如 addJavascriptInterface），并应在内部做来源/域名校验以降低风险
        //  - 为 UI 模块（uiModule）或 Ad 模块提供回调通道
        try {
            // Create a lightweight, defensive UI module implementation to pass into the registrar.
            // This object only updates visible UI components on the main thread and catches
            // exceptions to avoid crashing the Activity when JS calls arrive.
            val uiModule = object : com.example.gameboxone.webview.GameInfoUIModule {
                override fun updateGameStatus(status: String) {
                    runOnUiThread {
                        try {
                            when (status.lowercase()) {
                                "true", "playing", "victory" -> {
                                    layoutOverlay.visibility = View.GONE
                                    layoutTopbar.visibility = View.VISIBLE
                                }
                                "failed" -> {
                                    layoutTopbar.visibility = View.VISIBLE
                                }
                                else -> {
                                    layoutTopbar.visibility = View.VISIBLE
                                }
                            }
                        } catch (_: Exception) { /* defensive: ignore UI update failures */ }
                    }
                }

                override fun updateGameName(name: String) {
                    runOnUiThread {
                        try { overlayTask.text = name } catch (_: Exception) { }
                    }
                }

                override fun updateLevel(level: String) {
                    runOnUiThread {
                        try { overlayTask.text = "关卡: $level" } catch (_: Exception) { }
                    }
                }

                override fun updateScore(score: String) {
                    runOnUiThread {
                        try {
                            currentScore = score.toIntOrNull()
                            tvScore.text = "当前得分:${currentScore ?: 0}"
                        } catch (_: Exception) { }
                    }
                }

                override fun updateGameTime(time: String) {
                    runOnUiThread {
                        try {
                            // show time in overlayTask if appropriate (keep simple)
                            overlayTask.text = time
                        } catch (_: Exception) { }
                    }
                }

                override fun handleAdEvent(eventType: String, data: String) {
                    Log.d(TAG, "handleAdEvent from bridge: type=$eventType data=$data")
                    // default: forward to AdGameEventBridge via registrar wiring (already set up there)
                }
            }

            try {
                // Important: register bridges before attaching the WebView into the view hierarchy.
                // The registrar only wires interfaces and injects scripts; subsequent logic flow
                // (health checks, event exchanges) is handled by the bridge itself.
                WebViewBridgeRegistrar.registerAndInitialize(webView, { this }, uiModule)
                Log.d(TAG, "WebView bridges and scripts initialized successfully")
            } catch (e: Exception) {
                Log.w(TAG, "WebView bridge initialization failed", e)
            }
        } catch (e: Exception) {
             Log.w(TAG, "uiModule creation failed", e)
         }

        // 将 WebView 添加到布局。把 addView 放在桥接注册之后，保证页面加载时桥接可用并且
        // 后续由桥接器决定初始化/下发流程（参照 Registrar 的实现）。
        layoutWeb.addView(webView)

        // 预先显示加载中界面
        showLoading()
    }

    /**
     * 启动本地静态文件服务器并加载游戏 URL
     * - webServerManager.startServer 会把本地文件夹提供为 HTTP 服务
     * - getGameUrl 会返回可被 WebView 加载的 http://127.0.0.1:PORT/... 链接
     * - 异常会在 UI 线程展示错误信息
     */
    private fun startLocalServer() {
        showLoading()
        launch(Dispatchers.IO) {
            try {
                Log.d(TAG, "准备启动本地服务器，游戏路径: $gamePath")
                webServerManager.startServer(gamePath!!)
                val url = webServerManager.getGameUrl(gamePath!!)
                gameUrl = url
                launch(Dispatchers.Main) {
                    if (!url.isNullOrEmpty()) {
                        Log.d(TAG, "加载游戏URL: $url")
                        webView.loadUrl(url)
                    } else {
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

    /**
     * 更新加载进度条
     * @param progress [0,100]
     */
    private fun updateLoadingProgress(progress: Int) {
        progressBar.progress = progress
        if (progress >= 100) {
            hideLoading()
        }
    }

    /**
     * 显示 loading 页面（隐藏 web 内容与错误页）
     */
    private fun showLoading() {
        layoutLoading.visibility = View.VISIBLE
        layoutError.visibility = View.GONE
        layoutWeb.visibility = View.GONE
    }

    /**
     * 隐藏 loading 显示 web 内容
     */
    private fun hideLoading() {
        layoutLoading.visibility = View.GONE
        layoutWeb.visibility = View.VISIBLE
    }

    /**
     * 展示错误页面并记录日志
     */
    private fun showError(message: String) {
        hasError = true
        layoutError.visibility = View.VISIBLE
        layoutWeb.visibility = View.GONE
        textErrorMessage.text = message
        Log.e(TAG, message)
    }

    /**
     * 重试加载逻辑：当处于错误状态时，隐藏错误界面并重新加载 WebView
     */
    private fun retryLoading() {
        if (hasError) {
            // 清除错误状态，重新加载
            hasError = false
            layoutError.visibility = View.GONE
            webView.reload()
        }
    }

    /**
     * 记录游戏启动的钩子（占位），可以上报埋点/Analytics
     */
    private fun recordGameStart() {
        // TODO: 记录游戏启动事件
    }

    /**
     * 返回逻辑：优先让 WebView 前进历史记录，否则结束 Activity
     */
    private fun goBack() {
        // 优先处理返回物理按键
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            // 否则结束当前活动
            finish()
        }
    }



    override fun onDestroy() {
        super.onDestroy()
        isDestroyed = true
        // 清理WebView资源，防止内存泄漏
        webView.apply {
            stopLoading()
            clearHistory()
            loadUrl("about:blank")
            removeAllViews()
        }
    }

    override fun onBackPressed() {
        // 处理返回键，优先级高于其他事件
        if (hasError) {
            // 如果当前处于错误状态，重试加载
            retryLoading()
        } else {
            // 否则按常规方式处理返回
            super.onBackPressed()
        }
    }

    /**
     * Show banner ad in the WebView layout
     */
    fun showBannerAd(bannerView: com.google.android.gms.ads.AdView) {
        try {
            // Remove existing banner if any
            hideBannerAd()

            // Add banner to the bottom of the layout
            val layoutParams = android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = android.view.Gravity.BOTTOM or android.view.Gravity.CENTER_HORIZONTAL
            }

            layoutWeb.addView(bannerView, layoutParams)
            Log.d(com.example.gameboxone.TAG, "Banner ad view added to layout")
        } catch (e: Exception) {
            Log.w(com.example.gameboxone.TAG, "Failed to show banner ad", e)
        }
    }

    /**
     * Hide banner ad from the WebView layout
     */
    fun hideBannerAd() {
        try {
            // Find and remove banner view
            for (i in 0 until layoutWeb.childCount) {
                val child = layoutWeb.getChildAt(i)
                if (child is com.google.android.gms.ads.AdView) {
                    layoutWeb.removeView(child)
                    Log.d(com.example.gameboxone.TAG, "Banner ad view removed from layout")
                    break
                }
            }
        } catch (e: Exception) {
            Log.w(com.example.gameboxone.TAG, "Failed to hide banner ad", e)
        }
    }

    /**
     * Close the current WebViewActivity and uninstall the game if possible.
     * This runs the uninstall on an IO dispatcher and finishes the activity on the main thread.
     */
    fun closeGameAndUninstall() {
        val id = gameId
        if (id.isNullOrBlank()) {
            Log.w(com.example.gameboxone.TAG, "closeGameAndUninstall: no gameId, just finish")
            try { finish() } catch (e: Exception) { Log.w(com.example.gameboxone.TAG, "finish failed", e) }
            return
        }
        Log.d(com.example.gameboxone.TAG, "closeGameAndUninstall: will finish activity immediately and uninstall in background for $id")

        // Finish immediately so UI returns to main scene
        try {
            finish()
        } catch (e: Exception) {
            Log.w(com.example.gameboxone.TAG, "finish failed", e)
        }

        // Perform uninstall asynchronously; do not block UI
        launch(Dispatchers.IO) {
            try {
                val success = myGameManager.deleteGame(id)
                Log.d(com.example.gameboxone.TAG, "closeGameAndUninstall: background uninstall result for $id = $success")
            } catch (e: Exception) {
                Log.e(com.example.gameboxone.TAG, "closeGameAndUninstall: background uninstall failed for $id", e)
            }
        }
    }

}
