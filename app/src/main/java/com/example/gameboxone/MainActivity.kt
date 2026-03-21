package com.example.gameboxone

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.gameboxone.ui.theme.GameboxoneTheme
import com.example.gameboxone.ui.theme.ThemeManager
import com.example.gameboxone.ui.screen.LaunchConsentScreen
import com.example.gameboxone.ui.screen.MainScreen
import dagger.hilt.android.AndroidEntryPoint
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.core.view.WindowInsetsCompat
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.ads.AdHostActivity
import com.example.gameboxone.ads.AdManager
import com.example.gameboxone.ads.ConsentManager
import com.example.gameboxone.legal.LegalConfig
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject
    lateinit var consentManager: ConsentManager

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
        AdManager.setAdsEnabled(prefs.getBoolean("ad_consent_enabled", true))

        val initialLegalAccepted = LegalConfig.hasAcceptedRequiredAgreements(this)

        setContent {
            // 订阅全局深色模式状态，切换时触发重组
            val isDark by ThemeManager.isDarkTheme.collectAsState()
            var hasAcceptedLegal by remember { mutableStateOf(initialLegalAccepted) }
            val snackbarHostState = remember { SnackbarHostState() }
            val scope = rememberCoroutineScope()

            GameboxoneTheme(darkTheme = isDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    if (hasAcceptedLegal) {
                        MainScreen()
                    } else {
                        Box(modifier = Modifier.fillMaxSize()) {
                            LaunchConsentScreen(
                                onAccepted = {
                                    LegalConfig.markAcceptedRequiredAgreements(this@MainActivity)
                                    hasAcceptedLegal = true
                                    initializeAdsIfEligible()
                                },
                                onExit = { finish() },
                                onOpenFailed = { message ->
                                    scope.launch { snackbarHostState.showSnackbar(message) }
                                }
                            )
                            SnackbarHost(
                                hostState = snackbarHostState,
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(bottom = 24.dp)
                            )
                        }
                    }
                }
            }
        }
    }

    /**
     * 应用启动后尝试展示一次开屏广告，并输出详细日志
     */
    override fun onStart() {
        super.onStart()

        initializeAdsIfEligible()
    }

    private fun initializeAdsIfEligible() {
        if (!LegalConfig.hasAcceptedRequiredAgreements(this)) {
            Log.d("MainActivity", "未同意应用协议，跳过广告初始化")
            return
        }

        AdManager.onAppForegrounded()

        Log.d("MainActivity", "[Ads] initializeWithConsent")
        AdManager.initializeWithConsent(this, consentManager)

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
