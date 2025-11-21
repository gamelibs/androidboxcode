package com.example.gameboxone.ads

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity

/**
 * 透明承载页：用于在干净的 Activity 上展示全屏广告，避免 WebView 场景的触摸/焦点冲突。
 * 使用方式：AdHostActivity.start(context, AdType.INTERSTITIAL/REWARDED/APP_OPEN)
 */
class AdHostActivity : AppCompatActivity() {
    companion object {
        private const val TAG = "AdHostActivity"
        private const val EXTRA_AD_TYPE = "ad_type"
    private const val EXTRA_MESSAGE_ID = "message_id"

        enum class AdType { INTERSTITIAL, REWARDED, APP_OPEN }

        fun start(context: Context, type: AdType, messageId: String? = null) {
            val i = Intent(context, AdHostActivity::class.java)
                .putExtra(EXTRA_AD_TYPE, type.name)
            if (messageId != null) i.putExtra(EXTRA_MESSAGE_ID, messageId)
            if (context !is android.app.Activity) {
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(i)
        }
    }

    private var started = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 透明主题，无 UI；避免转场动画干扰
        overridePendingTransition(0, 0)

        // Defensive: clear NOT_TOUCHABLE in case previous activity left the window non-interactive
        try {
            window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE)
        } catch (e: Exception) {
            Log.w(TAG, "Failed to clear NOT_TOUCHABLE flag on AdHostActivity start", e)
        }

        // Simplified window flags - focus on essential ones to avoid conflicts
        window.setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN or
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS or
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
            WindowManager.LayoutParams.FLAG_FULLSCREEN or
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS or
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        )

        // Essential system UI visibility for ad display
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
            View.SYSTEM_UI_FLAG_FULLSCREEN or
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )

        // Remove problematic window attributes that can interfere with ad display
        // Let the system handle the window type naturally
    }

    override fun onResume() {
        super.onResume()
        if (started) return
        started = true

        val typeName = intent.getStringExtra(EXTRA_AD_TYPE)
    val incomingMessageId = intent.getStringExtra(EXTRA_MESSAGE_ID)
        val type = runCatching { AdType.valueOf(typeName ?: "") }.getOrNull()
        Log.d(TAG, "onResume show type=$type canShowAds=${AdManager.canShowAds()}")

        if (type == null) {
            finishSafely()
            return
        }

        when (type) {
            AdType.INTERSTITIAL -> showInterstitial()
            AdType.REWARDED -> showRewarded()
            AdType.APP_OPEN -> showAppOpen()
        }
    }

    private fun showInterstitial() {
        if (!AdManager.canShowAds()) { finishSafely(); return }
        // pass incoming message id to AdManager so failures can be correlated
        val messageId = intent.getStringExtra(EXTRA_MESSAGE_ID)
        AdManager.showInterstitial(this, messageId,
            onShown = {
                // Only send beforeAd when the ad actually starts showing.
                AdGameEventBridge.beforeAd("interstitial")
                Log.d(TAG, "interstitial shown")
                AdGameEventBridge.interstitialOpen()
            },
            onClosed = { shown ->
                try {
                    // Only emit viewed events when the ad was actually shown.
                    if (shown) {
                        // send unified adViewed with type
                        AdGameEventBridge.adViewed("interstitial")
                    } else {
                        Log.d(TAG, "interstitial onClosed: ad not shown, skipping adViewed")
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "interstitial onClosed handler failed", e)
                } finally {
                    finishSafely()
                }
            }
        )
    }

    private fun showRewarded() {
        if (!AdManager.canShowAds()) { finishSafely(); return }
        // Defer beforeAd until the ad is actually shown to avoid sending it when show fails
        val messageId = intent.getStringExtra(EXTRA_MESSAGE_ID)
        AdManager.showRewarded(this, messageId,
            // onEarned already handled below; provide onShown so we can emit beforeAd at show time
            onShown = {
                AdGameEventBridge.beforeAd("reward")
            },
            // Per requirement: do not include reward details in adViewed; no-op here
            onEarned = { },
            onClosed = { shown ->
                try {
                    if (shown) {
                        // Always send simple string value per requirement
                        AdGameEventBridge.adViewed("reward")
                    } else {
                        Log.d(TAG, "reward onClosed: ad not shown, skipping adViewed")
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "emitting reward outcome failed", e)
                } finally {
                    finishSafely()
                }
            }
        )
    }

    private fun showAppOpen() {
        if (!AdManager.canShowAds()) { finishSafely(); return }
        val messageId = intent.getStringExtra(EXTRA_MESSAGE_ID)
        AdGameEventBridge.beforeAd("openad")
        AdManager.showAppOpen(this, messageId) {
            finishSafely()
        }
    }

    private fun finishSafely() {
        try {
            // Notify WebViewActivity that ad finished so it can resume H5/game
            val resumeIntent = android.content.Intent("com.vidar.dragonegg.RESUME_WEBVIEW")
            try { sendBroadcast(resumeIntent) } catch (e: Exception) { Log.w(TAG, "Failed to send resume broadcast", e) }
        } catch (e: Exception) {
            Log.w(TAG, "finishSafely notify failed", e)
        }
        try { overridePendingTransition(0, 0) } catch (_: Exception) {}
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        // No need to resume WebView since we closed WebViewActivity
        // The system will naturally return to MainActivity after ad closes
        Log.d(TAG, "AdHostActivity destroyed, returning to main scene")
    }
}
