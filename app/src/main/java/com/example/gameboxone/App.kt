package com.example.gameboxone

import android.app.Application
import android.content.Intent
import android.os.Build
import com.example.gameboxone.AppLog as Log
import android.widget.Toast
import com.example.gameboxone.ads.AdManager
import com.example.gameboxone.manager.DataManager
import com.example.gameboxone.manager.SdkManager
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.UserManager
import com.example.gameboxone.observability.AnalyticsManager
import com.example.gameboxone.observability.CrashReporter
import com.example.gameboxone.observability.SentryObservabilityConfig
import com.example.gameboxone.observability.SentryBridge
import com.example.gameboxone.ui.CrashHandlerActivity
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * 应用入口 Application 类
 *
 * 说明：
 * - 使用 Hilt (通过 @HiltAndroidApp) 提供依赖注入支持。
 * - 在 onCreate 中进行全局初始化：设置未捕获异常处理、异步预加载数据、注册事件处理器等。
 * - 保持进程级的 CoroutineScope（applicationScope）用于启动不依赖 Activity 生命周期的后台任务。
 *
 * 关键点摘要：
 * - initializeApp() 会发起异步预加载（preloadAppData），但不会等待其完成；随后立即注册事件处理器。
 *   因此若事件处理器依赖预加载结果，可能发生竞态，需要在 EventManager 或 DataManager 内部处理“未就绪”场景。
 * - 全局未捕获异常处理器会在任何线程上回调，请注意在该回调里调用 UI 操作的风险：
 *   这里使用 Application context 启动带 FLAG_ACTIVITY_NEW_TASK 的 Activity 来展示崩溃信息，但进程可能处于不稳定状态，无法保证成功。
 */
@HiltAndroidApp
class App : Application(){
    // 这是一个跟随进程生命周期的协程作用域，用于启动在整个应用存续期内应保持的后台任务。
    // 使用 SupervisorJob 可以保证一个子协程抛异常时不会取消其他子协程。
    // 将 Dispatcher 设置为 Main，让 scope 默认在主线程，但在启动协程时我们可以通过 launch(Dispatchers.IO) 切换到 IO 线程。
    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    
    // 下面的依赖通过 Hilt 注入，在 Application 启动阶段 Hilt 会完成注入，通常在 onCreate 执行前这些字段可用。
    @Inject
    lateinit var dataManager: DataManager
    
    @Inject
    lateinit var sdkManager: SdkManager

    @Inject
    lateinit var eventManager: EventManager

    @Inject
    lateinit var userManager: UserManager

    @Inject
    lateinit var analyticsManager: AnalyticsManager

    @Inject
    lateinit var crashReporter: CrashReporter

    companion object {
        private const val TAG = "App"
        // 全局单例引用（方便在代码其他地方快速获取 Application 实例）。
        // 注意：getInstance() 使用了 !!，如果在 Application 构造之前被调用会抛出 NPE，但通常 Android 框架会先构造 Application。
        private var instance: App? = null

        fun getInstance(): App = instance!!
    }

    // 在构造时设置单例引用。Android 会先调用 Application 构造函数再执行 onCreate。
    init {
        instance = this
    }

    override fun onCreate() {
        super.onCreate()

        // 执行应用级初始化流程（同步触发初始化步骤，内部会发起异步工作）
        initializeApp()

    }

    /**
     * 应用初始化入口方法
     * - 设置全局未捕获异常处理
     * - 打印初始化日志
     * - 发起异步预加载应用数据（不阻塞调用者）
     *
     * 任何在此方法直接抛出的 Exception 都会被捕获并以友好方式（Toast）提示用户。
     */
    private fun initializeApp() {
        try {
            // 设置全局异常处理器，捕获未捕获异常以便上报/展示崩溃 UI
            setupUncaughtExceptionHandler()
            Log.d(TAG, "🔥 游戏盒子应用初始化开始...")
            initializeSentryIfConfigured()
            analyticsManager.markAppLaunch()
            analyticsManager.startObserving(eventManager)
            AdManager.setObservabilityDelegate(analyticsManager)

            // 预加载应用数据（异步）
            preloadAppData()
        } catch (e: Exception) {
            // 捕获 initializeApp 本身可能抛出的异常（极少发生），并展示错误提示
            Log.e(TAG, "❌ 应用程序初始化失败", e)
            handleInitializationError(e)
        }
    }
    
    /**
     * 预加载应用所需数据
     * - 在 applicationScope 中开启一个协程并切换到 IO 线程执行耗时操作（例如 DB/文件/网络）
     * - 内部捕获异常并记录，不将异常抛出到上层（以避免阻塞或崩溃应用启动）
     *
     * 语义与注意事项：
     * - 该方法发起预加载后立即返回（异步），因此调用方不能依赖预加载已完成。
     * - 若 EventManager 或其他组件依赖这些数据，需在组件内部做好“数据未就绪”的处理或提供回调/Deferred。
     */
    private fun preloadAppData() {
         applicationScope.launch(Dispatchers.IO) {
             try {
                 Log.d(TAG, "开始预加载应用数据...")

                 // Preload application data (may load from DB or fallback)
                 // preloadAppData 会负责：判断缓存、保底加载（如果 DB 为空）、并在适当时机使用已应用的 params 向远端请求并对比更新。
                 dataManager.preloadAppData()

                 // 用户注册/登录：拿到 token 与玩家信息，供任务/等级/金币等功能使用
                 try {
                     // 若已有 token，则先走 /me 自动登录；若 401 则自动重新注册获取 token
                     userManager.ensurePlayerSession()
                 } catch (e: Exception) {
                     Log.w(TAG, "玩家注册失败（将继续以游客状态运行）", e)
                 }
             } catch (e: Exception) {
                 // 预加载失败时仅记录日志，不上抛（容错策略）
                 Log.e(TAG, "应用数据预加载失败", e)
             }
         }
     }

    private fun initializeSentryIfConfigured() {
        val config = SentryObservabilityConfig.fromValues(
            enabled = resources.getBoolean(R.bool.sentry_enabled),
            dsn = getString(R.string.sentry_dsn),
            environment = getString(R.string.sentry_environment),
            releaseName = buildReleaseName()
        )
        if (!config.isConfigured) {
            Log.d(TAG, "Sentry 未配置，继续使用本地观测实现")
            return
        }

        if (SentryBridge.initialize(this)) {
            Log.d(TAG, "Sentry 初始化完成，environment=${config.environment}")
        } else {
            Log.w(TAG, "Sentry 初始化失败，继续使用本地观测")
        }
    }

    private fun buildReleaseName(): String {
        val versionName = try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(packageName, android.content.pm.PackageManager.PackageInfoFlags.of(0)).versionName
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(packageName, 0).versionName
            }
        } catch (e: Exception) {
            Log.w(TAG, "读取版本号失败，回退到默认值", e)
            "dev"
        }
        return "$packageName@${versionName.orEmpty().ifBlank { "dev" }}"
    }

    /**
     * 设置应用的默认未捕获异常处理器
     * - 该 handler 会拦截主线程和后台线程上未被捕获的 Throwable
     * - 请注意：此处未保存原始默认 handler 的引用并委托它，若希望保留系统行为（例如记录/终止流程），请保存并在处理后调用它。
     *
     * 回调线程：任何抛出异常的线程都会在该线程上执行该回调。
     * 因此在回调中执行长耗时或 UI 操作需小心（这里仅用 Application context 启动 CrashActivity）。
     */
    private fun setupUncaughtExceptionHandler() {
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e(TAG, "未捕获异常 in thread: ${thread.name}", throwable)
            val crash = crashReporter.reportFatal(
                threadName = thread.name,
                throwable = throwable,
                attributes = mapOf("source" to "uncaught_exception_handler")
            )
            handleFatalError(crash.crashId, throwable)
        }
    }

    /**
     * 初始化失败的处理（非致命）
     * - 在主线程内显示一个长时的 Toast，提示用户初始化出现问题
     * - 使用 applicationScope 来保证即使在非 Activity 场景下也能安全切换到主线程
     */
    private fun handleInitializationError(error: Throwable) {
        applicationScope.launch(Dispatchers.Main) {
            // 处理初始化错误
            Toast.makeText(this@App,
                "应用初始化失败：${error.message}",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    /**
     * 处理致命错误（未捕获异常）
     * - 通过启动一个新的 Activity（CrashHandlerActivity）展示崩溃信息或执行上报逻辑
     * - 使用 Application context 并设置 FLAG_ACTIVITY_NEW_TASK 使得可以在非 Activity 上下文中启动 Activity
     *
     * 注意：在某些致命崩溃场景（例如 JNI 崩溃、严重内存错误）中，进程可能立刻终止，无法成功展示 CrashActivity。
     */
    private fun handleFatalError(crashId: String, error: Throwable) {
        // 处理致命错误
        startActivity(Intent(this, CrashHandlerActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            putExtra("crashId", crashId)
            putExtra("error", error.toString())
        })
    }

    /**
     * 应用终止回调
     * - onTerminate 仅在开发环境或某些模拟器场景下被调用，生产设备通常不会调用此方法
     * - 我们在此取消 applicationScope 并清理 eventManager 注册，释放资源
     */
    override fun onTerminate() {
        super.onTerminate()
        // 取消进程范围内的协程，避免泄漏（生产环境通常不会触发）
        applicationScope.cancel()
        
        // 清理资源，例如解除事件注册
        eventManager.cleanup()
    }
}
