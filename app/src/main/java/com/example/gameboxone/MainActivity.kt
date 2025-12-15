package com.example.gameboxone

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.gameboxone.ui.theme.GameboxoneTheme
import com.example.gameboxone.ui.theme.ThemeManager
import com.example.gameboxone.ui.screen.MainScreen
import dagger.hilt.android.AndroidEntryPoint
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.core.view.WindowInsetsCompat
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.ads.AdHostActivity
import com.example.gameboxone.ads.AdManager

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable edge-to-edge layout
        enableEdgeToEdge()

        // Make the activity fullscreen by hiding system bars (status + navigation)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        hideSystemBars()

        // 初始化主题状态（从 SharedPreferences 读取一次）
        val prefs = getSharedPreferences("game_preferences", MODE_PRIVATE)
        val darkEnabled = prefs.getBoolean("dark_mode_enabled", false)
        ThemeManager.setDarkTheme(darkEnabled)

        setContent {
            // 订阅全局深色模式状态，切换时触发重组
            val isDark by ThemeManager.isDarkTheme.collectAsState()

            GameboxoneTheme(darkTheme = isDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen()
                }
            }
        }
    }

    /**
     * 应用启动后尝试展示一次开屏广告，并输出详细日志
     */
    override fun onStart() {
        super.onStart()

        // 使用开发模式初始化广告：假定已获得同意并使用测试广告位
        Log.d("MainActivity", "[Ads] onStart -> initializeForDevAssumeConsent")
        AdManager.initializeForDevAssumeConsent(applicationContext)

        val canShowNow = AdManager.canShowAppOpenNow()
        val isReady = AdManager.isAppOpenReady()
        val isLoading = AdManager.isAppOpenLoading()
        val lastError = AdManager.getAppOpenLastError()

        Log.d(
            "MainActivity",
            "[Ads] 开屏广告状态: canShowNow=$canShowNow, isReady=$isReady, isLoading=$isLoading, lastError=$lastError"
        )

        if (canShowNow) {
            Log.d("MainActivity", "[Ads] 条件满足，启动 AdHostActivity 显示开屏广告")
            AdHostActivity.start(this, AdHostActivity.Companion.AdType.APP_OPEN)
        } else {
            Log.d("MainActivity", "[Ads] 当前不可显示开屏广告，将依赖 AdManager 的预加载与后续触发")
        }

        // 延迟几秒检查一次预载结果：仅在“广告环境不可用 且 所有广告类型都未准备好”时才提示失败
        Handler(Looper.getMainLooper()).postDelayed({
            val canShowAds = AdManager.canShowAds()
            val anyReady = AdManager.isAppOpenReady() ||
                    AdManager.isInterstitialReady() ||
                    AdManager.isRewardedReady()

            Log.d(
                "MainActivity",
                "[Ads] 预载检查: canShowAds=$canShowAds, anyReady=$anyReady, appOpenReady=${AdManager.isAppOpenReady()}, interstitialReady=${AdManager.isInterstitialReady()}, rewardedReady=${AdManager.isRewardedReady()}"
            )

            // 更温和的失败判定：只有在广告环境本身不可用并且所有广告类型都未就绪时才认为初始化失败
            if (!canShowAds && !anyReady) {
                // 使用系统 Toast 提示广告初始化失败，保证在大多数环境下都能看到
                Toast.makeText(
                    this,
                    "广告初始化失败：当前设备的广告环境可能不完整，广告可能无法正常展示。",
                    Toast.LENGTH_LONG
                ).show()
            } else {
                Log.d("MainActivity", "[Ads] 预载检查通过，至少有一种广告类型已准备好")
            }
        }, 5_000)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemBars()
        }
    }

    private fun hideSystemBars() {
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        // 使用 transient bars，让状态栏偶尔被系统短暂显示后自动隐藏
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    GameboxoneTheme {
        Greeting("Android")
    }
}
