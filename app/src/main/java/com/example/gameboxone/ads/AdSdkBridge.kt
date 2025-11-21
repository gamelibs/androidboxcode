package com.example.gameboxone.ads

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.content.Intent
import com.example.gameboxone.MainActivity
import com.example.gameboxone.WebViewActivity

class AdSdkBridge(private val activityProvider: () -> Activity?) {
    private val TAG = "AdSdkBridge"

    companion object {
        // Static method for compatibility (no longer needed but kept for safety)
        fun resumeWebViewIfPaused() {
            // No longer needed since we close WebViewActivity instead of pausing
            Log.d("AdSdkBridge", "resumeWebViewIfPaused called but no longer needed")
        }

        // JavaScript utility functions to inject into WebView
        const val JS_AD_UTILITIES = """
            // Ad SDK utilities for H5 games
            window.AdSDK = {
                // Show interstitial ad
                showInterstitial: function() {
                    try {
                        if (window.AndroidAd && typeof window.AndroidAd.showAd === 'function') {
                            window.AndroidAd.showAd('interstitial');
                            console.log('AdSDK: Requested interstitial ad');
                            return true;
                        } else {
                            console.warn('AdSDK: AndroidAd interface not available');
                            return false;
                        }
                    } catch (e) {
                        console.error('AdSDK: Failed to show interstitial ad', e);
                        return false;
                    }
                },

                // Show rewarded ad
                showRewarded: function() {
                    try {
                        if (window.AndroidAd && typeof window.AndroidAd.showAd === 'function') {
                            window.AndroidAd.showAd('rewarded');
                            console.log('AdSDK: Requested rewarded ad');
                            return true;
                        } else {
                            console.warn('AdSDK: AndroidAd interface not available');
                            return false;
                        }
                    } catch (e) {
                        console.error('AdSDK: Failed to show rewarded ad', e);
                        return false;
                    }
                },

                // Check if ad SDK is available
                isAvailable: function() {
                    return window.AndroidAd && typeof window.AndroidAd.showAd === 'function';
                },

                // Event-driven ad request (alternative method)
                requestAd: function(adType) {
                    try {
                        // Dispatch custom event
                        var event = new CustomEvent('adRequest', {
                            detail: { type: adType }
                        });
                        window.dispatchEvent(event);
                        console.log('AdSDK: Dispatched ad request event for', adType);
                        return true;
                    } catch (e) {
                        console.error('AdSDK: Failed to dispatch ad request event', e);
                        return false;
                    }
                },

                // Close game and return to main scene
                closeGame: function() {
                    try {
                        if (window.AndroidAd && typeof window.AndroidAd.closeGame === 'function') {
                            console.log('AdSDK: Calling AndroidAd.closeGame()');
                            window.AndroidAd.closeGame();
                            return true;
                        } else {
                            console.warn('AdSDK: AndroidAd.closeGame interface not available');
                            return false;
                        }
                    } catch (e) {
                        console.error('AdSDK: Failed to close game', e);
                        return false;
                    }
                },

                // Show banner ad
                showBanner: function() {
                    try {
                        if (window.AndroidAd && typeof window.AndroidAd.showBannerAd === 'function') {
                            window.AndroidAd.showBannerAd();
                            console.log('AdSDK: Requested banner ad');
                            return true;
                        } else {
                            console.warn('AdSDK: AndroidAd.showBannerAd interface not available');
                            return false;
                        }
                    } catch (e) {
                        console.error('AdSDK: Failed to show banner ad', e);
                        return false;
                    }
                },

                // Hide banner ad
                hideBanner: function() {
                    try {
                        if (window.AndroidAd && typeof window.AndroidAd.hideBannerAd === 'function') {
                            window.AndroidAd.hideBannerAd();
                            console.log('AdSDK: Requested to hide banner ad');
                            return true;
                        } else {
                            console.warn('AdSDK: AndroidAd.hideBannerAd interface not available');
                            return false;
                        }
                    } catch (e) {
                        console.error('AdSDK: Failed to hide banner ad', e);
                        return false;
                    }
                },

                // Vibrate device
                vibrate: function(pattern) {
                    try {
                        if (window.AndroidAd && typeof window.AndroidAd.vibrate === 'function') {
                            window.AndroidAd.vibrate(pattern || [100]);
                            console.log('AdSDK: Requested vibration with pattern:', pattern);
                            return true;
                        } else {
                            console.warn('AdSDK: AndroidAd.vibrate interface not available');
                            return false;
                        }
                    } catch (e) {
                        console.error('AdSDK: Failed to vibrate', e);
                        return false;
                    }
                }
            };

            // Ensure AndroidAd bridge is available for direct calls
            window.checkAdBridge = function() {
                console.log('AdSDK: Checking bridge availability...');
                console.log('AdSDK: window.AndroidAd exists:', typeof window.AndroidAd !== 'undefined');
                if (window.AndroidAd) {
                    console.log('AdSDK: AndroidAd.showInterstitial exists:', typeof window.AndroidAd.showInterstitial === 'function');
                    console.log('AdSDK: AndroidAd.showAd exists:', typeof window.AndroidAd.showAd === 'function');
                    console.log('AdSDK: AndroidAd.closeGame exists:', typeof window.AndroidAd.closeGame === 'function');
                }
                return window.AndroidAd && typeof window.AndroidAd.showInterstitial === 'function';
            };

            // Override ovo.showInterstitialAd to wait for bridge if it exists
            if (window.ovo && typeof window.ovo.showInterstitialAd === 'function') {
                var originalShowInterstitialAd = window.ovo.showInterstitialAd;
                window.ovo.showInterstitialAd = function(callback, opts) {
                    console.log('AdSDK: Intercepted ovo.showInterstitialAd call');
                    
                    // Check if bridge is available
                    if (window.AndroidAd && typeof window.AndroidAd.showInterstitial === 'function') {
                        console.log('AdSDK: Bridge available, calling original function');
                        return originalShowInterstitialAd.call(this, callback, opts);
                    } else {
                        console.log('AdSDK: Bridge not available, polling...');
                        // Poll for bridge availability
                        var pollCount = 0;
                        var pollInterval = setInterval(function() {
                            pollCount++;
                            if (window.AndroidAd && typeof window.AndroidAd.showInterstitial === 'function') {
                                console.log('AdSDK: Bridge became available after polling, calling original function');
                                clearInterval(pollInterval);
                                return originalShowInterstitialAd.call(this, callback, opts);
                            } else if (pollCount > 50) { // 5 seconds max
                                console.log('AdSDK: Bridge not available after polling, calling original (will fallback)');
                                clearInterval(pollInterval);
                                return originalShowInterstitialAd.call(this, callback, opts);
                            }
                        }, 100);
                    }
                };
                console.log('AdSDK: ovo.showInterstitialAd overridden to wait for bridge');
            }

            console.log('AdSDK utilities loaded');

            // Add compatibility methods for existing ovo SDK
            window.showBannerAd = function(callback, opts) {
                console.log('AdSDK: showBannerAd called (compatibility mode)');
                var result = window.AdSDK.showBanner();
                if (typeof callback === 'function') {
                    callback(result);
                }
                return result;
            };

            window.hideBannerAd = function(callback, opts) {
                console.log('AdSDK: hideBannerAd called (compatibility mode)');
                var result = window.AdSDK.hideBanner();
                if (typeof callback === 'function') {
                    callback(result);
                }
                return result;
            };

            // Add Android object for vibration compatibility
            if (typeof window.Android === 'undefined') {
                window.Android = {};
            }
            window.Android.vibrate = function(pattern) {
                console.log('AdSDK: Android.vibrate called (compatibility mode) with pattern:', pattern);
                return window.AdSDK.vibrate(pattern);
            };

            console.log('AdSDK compatibility methods loaded');
        """
    }

    // Event-driven method: close WebView and return to main scene without calling ads
    @JavascriptInterface
    fun showAd(adType: String) {
        Log.d(TAG, "showAd('$adType') called from JavaScript")
        val activity = activityProvider()
        if (activity == null) {
            Log.w(TAG, "showAd: activity null")
            return
        }

        Log.d(TAG, "JS requested ad('$adType') - starting AdHostActivity")

        // Ensure we run on main thread
        Handler(Looper.getMainLooper()).post {
            try {
                // Start the AdHostActivity immediately to show the ad
                showAdImmediately(activity, adType)

                // 设置广告展示标志位，用于保护窗口焦点变化逻辑
                if (activity is com.example.gameboxone.WebViewActivity) {
                    try {
                        activity.setAdBeingDisplayed(true)
                        Log.d(TAG, "广告展示标志位已设置，保护窗口焦点变化逻辑")
                    } catch (e: Exception) {
                        Log.w(TAG, "Failed to set isAdBeingDisplayed flag on activity", e)
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "Failed to start ad host activity", e)
            }
        }
    }

    private fun showAdImmediately(activity: Activity, adType: String) {
        when (adType.lowercase()) {
            "interstitial" -> {
                Log.d(TAG, "Event -> AdHostActivity (INTERSTITIAL)")
                AdHostActivity.start(activity, AdHostActivity.Companion.AdType.INTERSTITIAL)
            }
            "rewarded" -> {
                Log.d(TAG, "Event -> AdHostActivity (REWARDED)")
                AdHostActivity.start(activity, AdHostActivity.Companion.AdType.REWARDED)
            }
            else -> {
                Log.w(TAG, "Unknown ad type: $adType")
            }
        }
    }

    // Legacy direct call methods (for backward compatibility)
    @JavascriptInterface
    fun showInterstitial() {
        Log.d(TAG, "showInterstitial() called from JavaScript")
        showAd("interstitial")
    }

    @JavascriptInterface
    fun showRewarded() {
        Log.d(TAG, "showRewarded() called from JavaScript")
        showAd("rewarded")
    }

    // Close game and uninstall (exposed to JS): will delete game files and finish WebViewActivity
    @JavascriptInterface
    fun closeGame() {
    Log.d(TAG, "closeGame() called on native bridge")
        val activity = activityProvider()
        if (activity == null) {
            Log.w(TAG, "closeGame: activity null")
            return
        }

        Handler(Looper.getMainLooper()).post {
            try {
                // Try to bring MainActivity to front to ensure user returns to main scene
                try {
                    val i = Intent(activity, MainActivity::class.java)
                        .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
                    activity.startActivity(i)
                    Log.d(TAG, "Started MainActivity to return to main scene")
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to start MainActivity", e)
                }

                if (activity is WebViewActivity) {
                    // Close WebViewActivity and perform uninstall in background
                    activity.closeGameAndUninstall()
                } else {
                    try { activity.finish() } catch (e: Exception) { Log.w(TAG, "finish failed", e) }
                }
            } catch (e: Exception) {
                Log.w(TAG, "closeGame failed", e)
            }
        }
    }

    // Banner ad methods
    @JavascriptInterface
    fun showBannerAd() {
        Log.d(TAG, "showBannerAd() called from JavaScript")
        val activity = activityProvider()
        if (activity == null) {
            Log.w(TAG, "showBannerAd: activity null")
            return
        }

        Handler(Looper.getMainLooper()).post {
            try {
                if (AdManager.isBannerReady() && !AdManager.isBannerShown()) {
                    val bannerView = AdManager.getBannerAdView()
                    if (bannerView != null && activity is WebViewActivity) {
                        activity.showBannerAd(bannerView)
                        AdManager.setBannerShown(true)
                        Log.d(TAG, "Banner ad shown successfully")
                    } else {
                        Log.w(TAG, "Banner ad view not available or activity not WebViewActivity")
                    }
                } else {
                    Log.d(TAG, "Banner ad not ready or already shown")
                    // Try to load banner if not ready
                    AdManager.loadBanner(activity.applicationContext)
                }
            } catch (e: Exception) {
                Log.w(TAG, "showBannerAd failed", e)
            }
        }
    }

    @JavascriptInterface
    fun hideBannerAd() {
        Log.d(TAG, "hideBannerAd() called from JavaScript")
        val activity = activityProvider()
        if (activity == null) {
            Log.w(TAG, "hideBannerAd: activity null")
            return
        }

        Handler(Looper.getMainLooper()).post {
            try {
                if (AdManager.isBannerShown() && activity is WebViewActivity) {
                    activity.hideBannerAd()
                    AdManager.setBannerShown(false)
                    Log.d(TAG, "Banner ad hidden successfully")
                } else {
                    Log.d(TAG, "Banner ad not shown or activity not WebViewActivity")
                }
            } catch (e: Exception) {
                Log.w(TAG, "hideBannerAd failed", e)
            }
        }
    }

    // Vibration method
    @JavascriptInterface
    fun vibrate(pattern: String) {
        Log.d(TAG, "vibrate('$pattern') called from JavaScript")
        val activity = activityProvider()
        if (activity == null) {
            Log.w(TAG, "vibrate: activity null")
            return
        }

        Handler(Looper.getMainLooper()).post {
            try {
                val vibrator = activity.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? android.os.Vibrator
                if (vibrator != null) {
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        // Parse pattern string like "[100,200,100]"
                        val patternArray = parseVibrationPattern(pattern)
                        if (patternArray.isNotEmpty()) {
                            vibrator.vibrate(android.os.VibrationEffect.createWaveform(patternArray, -1))
                            Log.d(TAG, "Vibration executed with pattern: ${patternArray.joinToString()}")
                        } else {
                            vibrator.vibrate(android.os.VibrationEffect.createOneShot(100, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                            Log.d(TAG, "Vibration executed with default pattern")
                        }
                    } else {
                        // For older Android versions
                        val patternArray = parseVibrationPattern(pattern)
                        if (patternArray.isNotEmpty()) {
                            vibrator.vibrate(patternArray, -1)
                        } else {
                            vibrator.vibrate(100)
                        }
                        Log.d(TAG, "Vibration executed (legacy API)")
                    }
                } else {
                    Log.w(TAG, "Vibrator service not available")
                }
            } catch (e: Exception) {
                Log.w(TAG, "vibrate failed", e)
            }
        }
    }

    private fun parseVibrationPattern(pattern: String): LongArray {
        return try {
            // Remove brackets and split by comma
            val cleanPattern = pattern.trim().removePrefix("[").removeSuffix("]").trim()
            if (cleanPattern.isEmpty()) {
                longArrayOf(100)
            } else {
                cleanPattern.split(",")
                    .map { it.trim().toLongOrNull() ?: 100L }
                    .toLongArray()
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to parse vibration pattern: $pattern", e)
            longArrayOf(100)
        }
    }
}
