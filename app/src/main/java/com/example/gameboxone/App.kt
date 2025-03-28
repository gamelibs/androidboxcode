package com.example.gameboxone

import android.app.Application
import android.content.Intent
import android.util.Log
import android.widget.Toast
import com.example.gameboxone.Manager.DataManager
import com.example.gameboxone.Manager.SdkManager
import com.example.gameboxone.ui.CrashHandlerActivity
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltAndroidApp
class App : Application(){
    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    
    @Inject
    lateinit var dataManager: DataManager
    
    @Inject
    lateinit var sdkManager: SdkManager

    companion object {
        private const val TAG = "App"
        private var instance: App? = null

//        fun getInstance(): App = instance!!
    }

    init {
        instance = this
    }

    override fun onCreate() {
        super.onCreate()
        initializeApp()
    }

    private fun initializeApp() {
        try {
            // 设置全局异常处理器
            setupUncaughtExceptionHandler()
            Log.d(TAG, "🔥 游戏盒子应用初始化开始...")

            // 预加载应用数据
            preloadAppData()
        } catch (e: Exception) {
            Log.e(TAG, "❌ 应用程序初始化失败", e)
            handleInitializationError(e)
        }
    }
    
    private fun preloadAppData() {
        applicationScope.launch(Dispatchers.IO) {
            try {
                Log.d(TAG, "开始预加载应用数据...")
                dataManager.preloadAppData()
                
                // 添加SDK预加载
                sdkManager.preloadSdk()
            } catch (e: Exception) {
                Log.e(TAG, "应用数据预加载失败", e)
            }
        }
    }

    private fun setupUncaughtExceptionHandler() {
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e(TAG, "未捕获异常 in thread: ${thread.name}", throwable)
            handleFatalError(throwable)
        }
    }

    private fun handleInitializationError(error: Throwable) {
        applicationScope.launch(Dispatchers.Main) {
            // 处理初始化错误
            Toast.makeText(this@App,
                "应用初始化失败：${error.message}",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    private fun handleFatalError(error: Throwable) {
        // 处理致命错误
        startActivity(Intent(this, CrashHandlerActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            putExtra("error", error.toString())
        })
    }

    override fun onTerminate() {
        super.onTerminate()
        applicationScope.cancel()
    }
}