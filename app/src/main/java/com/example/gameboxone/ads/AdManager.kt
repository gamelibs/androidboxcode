package com.example.gameboxone.ads

import android.app.Activity
import android.content.Context
import android.content.pm.ApplicationInfo
import android.os.SystemClock
import android.provider.Settings
import android.util.Log
import androidx.appcompat.app.AlertDialog
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardItem
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.appopen.AppOpenAd
import com.google.android.gms.ads.appopen.AppOpenAd.AppOpenAdLoadCallback
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.RequestConfiguration
import java.security.MessageDigest

object AdManager {
    private const val TAG = "AdManager"
    // Google 官方测试广告位
    private const val TEST_APP_OPEN_UNIT = "ca-app-pub-3940256099942544/9257395921"
    private const val TEST_INTERSTITIAL_UNIT = "ca-app-pub-3940256099942544/1033173712"
    private const val TEST_REWARDED_UNIT = "ca-app-pub-3940256099942544/5224354917"
    private const val TEST_BANNER_UNIT = "ca-app-pub-3940256099942544/6300978111"

    // Ad unit ids are sourced from AdConfig so they can be changed at runtime
    private val INTERSTITIAL_AD_UNIT: String
        get() = AdConfig.INTERSTITIAL_AD_UNIT
    private val REWARDED_AD_UNIT: String
        get() = AdConfig.REWARDED_AD_UNIT
    private val BANNER_AD_UNIT: String
        get() = AdConfig.BANNER_AD_UNIT
    private val APP_OPEN_AD_UNIT: String
        get() = AdConfig.APP_OPEN_AD_UNIT

    private var interstitial: InterstitialAd? = null
    private var interstitialLoadTime: Long = 0L

    private var rewardedAd: RewardedAd? = null
    private var rewardedLoadTime: Long = 0L

    private var bannerAdView: AdView? = null
    private var bannerLoadTime: Long = 0L
    @Volatile private var bannerLoading: Boolean = false
    @Volatile private var bannerLastError: String? = null
    @Volatile private var bannerShown: Boolean = false

    private var isShowing = false
    private const val AD_EXPIRY_MILLIS = 60 * 60 * 1000L // 1 hour
    private const val COOLDOWN_MS = 30_000L

    // 可选覆盖：在 Debug 下使用测试位
    @Volatile private var appOpenUnitOverride: String? = null
    @Volatile private var interstitialUnitOverride: String? = null
    @Volatile private var rewardedUnitOverride: String? = null
    @Volatile private var bannerUnitOverride: String? = null

    private var appOpenAd: AppOpenAd? = null
    private var appOpenLoadTime: Long = 0L
    @Volatile private var appOpenLoading: Boolean = false
    @Volatile private var appOpenLastError: String? = null

    @Volatile private var shownInCurrentForeground: Boolean = false
    @Volatile private var lastShownTimestampMs: Long = 0L

    @Volatile private var isInitialized: Boolean = false
    @Volatile private var canRequestAds: Boolean = false
    // 调试：允许在未同意时加载测试广告
    @Volatile private var allowTestAdsWithoutConsent: Boolean = false
    // 全局控制：是否允许广告展示/调用（由 UI 的 Enable Ads 控制）
    @Volatile private var enableAdsGate: Boolean = true

    fun setAdsEnabled(enabled: Boolean) {
        enableAdsGate = enabled
        Log.d(TAG, "Ads enabled gate set to: $enableAdsGate")
    }

    fun isAppOpenReady(): Boolean = appOpenAd != null && isAdFresh(appOpenLoadTime)
    fun isAppOpenLoading(): Boolean = appOpenLoading
    fun getAppOpenLoadTime(): Long = appOpenLoadTime
    fun getAppOpenLastError(): String? = appOpenLastError
    fun onAppForegrounded() { shownInCurrentForeground = false }
    fun canShowAppOpenNow(): Boolean {
        val cooldownOk = (SystemClock.elapsedRealtime() - lastShownTimestampMs) >= COOLDOWN_MS
        return isAppOpenReady() && !shownInCurrentForeground && cooldownOk && canShowAds()
    }

    /**
     * 初始化广告SDK，包含用户同意检查
     * 现在需要在获得用户同意后才能初始化
     */
    fun initializeWithConsent(context: Context, consentManager: ConsentManager) {
        if (isInitialized) {
            Log.d(TAG, "AdManager 已经初始化")
            return
        }
        val isDebug = isDebug(context)
        val testDeviceId = if (isDebug) {
            try { computeTestDeviceHashedId(context) } catch (e: Exception) { Log.w(TAG, "computeTestDeviceHashedId failed", e); null }
        } else null

        Log.d(TAG, "开始初始化用户同意流程")
        consentManager.initializeConsent(
            context = context,
            isDebug = isDebug,
            testDeviceHashedId = testDeviceId
        ) { canRequest ->
            canRequestAds = canRequest
            Log.d(TAG, "用户同意流程完成，可以请求广告: $canRequest")
            if (canRequest) {
                allowTestAdsWithoutConsent = false
                initializeMobileAds(context)
            } else {
                if (isDebug) {
                    // Debug 模式下：启用仅测试广告，不依赖同意
                    allowTestAdsWithoutConsent = true
                    appOpenUnitOverride = TEST_APP_OPEN_UNIT
                    interstitialUnitOverride = TEST_INTERSTITIAL_UNIT
                    rewardedUnitOverride = TEST_REWARDED_UNIT
                    Log.w(TAG, "Debug 未获同意：启用测试广告位覆盖并初始化 MobileAds，仅用于开发验证")
                    initializeMobileAds(context)
                } else {
                    Log.w(TAG, "用户未同意或同意获取失败，不初始化广告")
                }
            }
        }
    }

    /**
     * 传统的init方法，现在改为内部使用
     */
    private fun initializeMobileAds(context: Context) {
        try {
            // collect test device ids: default + current device in debug
            val testIds = AdConfig.TEST_DEVICE_IDS.toMutableList()
            if (isDebug(context)) {
                try {
                    val current = computeTestDeviceHashedId(context)
                    if (current.isNotEmpty() && !testIds.contains(current)) testIds.add(current)
                } catch (e: Exception) { Log.w(TAG, "computeTestDeviceHashedId failed", e) }
            }
            // set request configuration
            try {
                val configuration = RequestConfiguration.Builder()
                    .setTestDeviceIds(testIds)
                    .build()
                MobileAds.setRequestConfiguration(configuration)
                Log.d(TAG, "RequestConfiguration set with test devices (${if (isDebug(context)) "debug" else "release"}): ${testIds}")
            } catch (e: Exception) { Log.w(TAG, "setRequestConfiguration failed", e) }

            // initialize Mobile Ads
            MobileAds.initialize(context) {
                Log.d(TAG, "MobileAds initialized")
                isInitialized = true
                // 初始化完成后再触发各广告类型预加载
                loadInterstitial(context)
                loadRewarded(context)
                loadAppOpen(context)
            }
        } catch (e: Exception) {
            Log.w(TAG, "MobileAds initialize failed", e)
        }
    }

    /**
     * 检查是否可以显示广告
     */
    fun canShowAds(): Boolean {
        val gate = enableAdsGate
        val initOk = isInitialized
        val consentOk = canRequestAds
        val testOverrideOk = allowTestAdsWithoutConsent && isInitialized
        val result = gate && initOk && (consentOk || testOverrideOk)
        Log.d(
            TAG,
            "canShowAds: gate=$gate, isInitialized=$initOk, canRequestAds=$consentOk, allowTestAdsWithoutConsent=$allowTestAdsWithoutConsent, result=$result"
        )
        return result
    }

    private fun isAdFresh(loadTime: Long) =
        loadTime != 0L && (SystemClock.elapsedRealtime() - loadTime) < AD_EXPIRY_MILLIS

    // 计算当前设备的测试设备哈希 ID（MD5(ANDROID_ID) -> 大写十六进制）
    private fun computeTestDeviceHashedId(context: Context): String {
        val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "emulator"
        val md5Bytes = MessageDigest.getInstance("MD5").digest(androidId.toByteArray())
        val hashed = md5Bytes.joinToString("") { "%02X".format(it) }
        Log.d(TAG, "Computed test device hashed ID: $hashed")
        return hashed
    }

    // --- Interstitial ---
    fun loadInterstitial(context: Context) {
        if (!canRequestAds && !allowTestAdsWithoutConsent) {
            Log.d(TAG, "loadInterstitial: skip — canRequestAds=$canRequestAds, allowTestAdsWithoutConsent=$allowTestAdsWithoutConsent")
            return
        }
        if (interstitial != null && isAdFresh(interstitialLoadTime)) {
            Log.d(TAG, "loadInterstitial: existing interstitial is fresh, skip reload")
            return
        }
        val request = AdRequest.Builder().build()
        val unitId = interstitialUnitOverride ?: INTERSTITIAL_AD_UNIT
        Log.d(TAG, "loadInterstitial: using adUnitId=$unitId")
        InterstitialAd.load(context, unitId, request, object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) {
                interstitial = ad
                interstitialLoadTime = SystemClock.elapsedRealtime()
                Log.d(TAG, "interstitial loaded")
            }
            override fun onAdFailedToLoad(error: LoadAdError) {
                interstitial = null
                Log.d(TAG, "interstitial failed to load: ${error.message}")
                // Do NOT emit ad_error for background loads; only show-path failures should notify H5
            }
        })
    }

    fun isInterstitialReady(): Boolean = interstitial != null && isAdFresh(interstitialLoadTime)

    // --- App Open ---
    fun loadAppOpen(context: Context) {
        Log.d(TAG, "loadAppOpen() called")
        if (!isInitialized) { Log.d(TAG, "loadAppOpen: skip — MobileAds 未初始化"); return }
        if (!canRequestAds && !allowTestAdsWithoutConsent) { Log.d(TAG, "loadAppOpen: skip — 未获同意且非测试模式"); return }
        if (appOpenAd != null && isAdFresh(appOpenLoadTime)) { Log.d(TAG, "loadAppOpen: already have fresh appOpenAd (loaded at $appOpenLoadTime)"); return }
        if (appOpenLoading) { Log.d(TAG, "loadAppOpen: already loading, skip"); return }
        appOpenLoading = true
        appOpenLastError = null
        val request = AdRequest.Builder().build()
        val adUnitToUse = appOpenUnitOverride ?: APP_OPEN_AD_UNIT
        Log.d(TAG, "AppOpen 使用广告位: $adUnitToUse${if (appOpenUnitOverride != null) " (override)" else ""}")
        AppOpenAd.load(context, adUnitToUse, request, object : AppOpenAdLoadCallback() {
            override fun onAdLoaded(ad: AppOpenAd) {
                appOpenAd = ad
                appOpenLoadTime = SystemClock.elapsedRealtime()
                appOpenLoading = false
                appOpenLastError = null
                Log.d(TAG, "app open loaded, loadTime=${appOpenLoadTime}")
            }
            override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                appOpenAd = null
                appOpenLoading = false
                appOpenLastError = loadAdError.message
                Log.w(TAG, "app open failed to load: ${loadAdError.message}")

                if (isDebug(context) && appOpenUnitOverride == null && loadAdError.message?.contains("Publisher data not found", true) == true) {
                    appOpenUnitOverride = TEST_APP_OPEN_UNIT
                    Log.w(TAG, "Debug 回退到 Google 测试开屏广告位并重试加载: $TEST_APP_OPEN_UNIT")
                    loadAppOpen(context)
                }
                // Do NOT emit ad_error for background loads; only show-path failures should notify H5
            }
        })
    }

    private fun isDebug(context: Context): Boolean =
        (context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0

    fun showAppOpen(activity: Activity, messageId: String? = null, onClosed: (() -> Unit)? = null) {
        Log.d(TAG, "showAppOpen() called; canShowAds=${canShowAds()}, isShowing=$isShowing, appOpenAdPresent=${appOpenAd != null}, isFresh=${isAdFresh(appOpenLoadTime)}")
        if (!canShowAds()) {
            Log.d(TAG, "showAppOpen: 无法显示广告 - 广告未初始化或用户未同意")
            try { AdGameEventBridge.adError("appopen_not_allowed", messageId) } catch (_: Exception) {}
            // 弹出提示对话框：广告环境未就绪
            try {
                activity.runOnUiThread {
                    try {
                        AlertDialog.Builder(activity)
                            .setTitle("广告启动失败")
                            .setMessage("广告环境未就绪，无法显示开屏广告，请检查网络或设备的 Google 服务。")
                            .setPositiveButton("知道了", null)
                            .show()
                    } catch (e: Exception) {
                        Log.w(TAG, "showAppOpen: failed to show failure dialog", e)
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "showAppOpen: runOnUiThread failed when showing failure dialog", e)
            }
            onClosed?.invoke(); return
        }
        if (isShowing || appOpenAd == null || !isAdFresh(appOpenLoadTime)) {
            Log.d(TAG, "showAppOpen: ad not ready — calling onClosed and triggering load")
            try { AdGameEventBridge.adError("appopen_not_ready", messageId) } catch (_: Exception) {}
            onClosed?.invoke(); loadAppOpen(activity.applicationContext); return
        }
        appOpenAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                Log.d(TAG, "AppOpen: onAdDismissedFullScreenContent")
                isShowing = false
                appOpenAd = null
                loadAppOpen(activity.applicationContext)
                onClosed?.invoke()
            }
            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                Log.w(TAG, "AppOpen: onAdFailedToShowFullScreenContent: ${adError.message}")
                isShowing = false
                appOpenAd = null
                onClosed?.invoke()
                try {
                    AdGameEventBridge.adError(adError.message ?: "appopen_failed_to_show", messageId)
                } catch (e: Exception) {
                    Log.w(TAG, "report appopen show error to bridge failed", e)
                }
                loadAppOpen(activity.applicationContext)
            }
            override fun onAdShowedFullScreenContent() {
                Log.d(TAG, "AppOpen: onAdShowedFullScreenContent")
                isShowing = true
                shownInCurrentForeground = true
                lastShownTimestampMs = SystemClock.elapsedRealtime()
            }
        }
        try { Log.d(TAG, "AppOpen: calling appOpenAd.show()"); appOpenAd?.show(activity) }
        catch (e: Exception) { Log.w(TAG, "showAppOpen exception", e); isShowing = false; onClosed?.invoke(); loadAppOpen(activity.applicationContext) }
    }

    fun showInterstitial(activity: Activity, messageId: String? = null, onShown: (() -> Unit)? = null, onClosed: ((Boolean) -> Unit)? = null) {
        Log.d(
            TAG,
            "showInterstitial() called; canShowAds=${canShowAds()}, isShowing=$isShowing, interstitialPresent=${interstitial != null}, isFresh=${isAdFresh(interstitialLoadTime)}"
        )
        if (!canShowAds()) {
            Log.d(TAG, "showInterstitial: 无法显示广告 - 广告未初始化或用户未同意")
            try { AdGameEventBridge.adError("interstitial_not_allowed", messageId) } catch (_: Exception) {}
            // 弹出提示对话框：广告环境未就绪
            try {
                activity.runOnUiThread {
                    try {
                        AlertDialog.Builder(activity)
                            .setTitle("广告启动失败")
                            .setMessage("广告环境未就绪，无法显示插屏广告，请检查网络或设备的 Google 服务。")
                            .setPositiveButton("知道了", null)
                            .show()
                    } catch (e: Exception) {
                        Log.w(TAG, "showInterstitial: failed to show failure dialog", e)
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "showInterstitial: runOnUiThread failed when showing failure dialog", e)
            }
            onClosed?.invoke(false); return
        }
        if (isShowing || interstitial == null || !isAdFresh(interstitialLoadTime)) {
            Log.d(
                TAG,
                "showInterstitial: ad not ready — isShowing=$isShowing, interstitial=${interstitial != null}, isFresh=${isAdFresh(interstitialLoadTime)}"
            )
            try { AdGameEventBridge.adError("interstitial_not_ready", messageId) } catch (_: Exception) {}
            onClosed?.invoke(false); loadInterstitial(activity.applicationContext); return
        }
        interstitial?.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() { isShowing = false; interstitial = null; loadInterstitial(activity.applicationContext); onClosed?.invoke(true) }
            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                isShowing = false
                interstitial = null
                try {
                    AdGameEventBridge.adError(adError.message ?: "interstitial_failed_to_show", messageId)
                } catch (e: Exception) {
                    Log.w(TAG, "report interstitial show error to bridge failed", e)
                }
                onClosed?.invoke(false)
                loadInterstitial(activity.applicationContext)
            }
            override fun onAdShowedFullScreenContent() { isShowing = true; onShown?.invoke() }
        }
        try { interstitial?.show(activity) } catch (e: Exception) { Log.w(TAG, "showInterstitial exception", e); isShowing = false; onClosed?.invoke(false); loadInterstitial(activity.applicationContext) }
    }

    // --- Rewarded ---
    fun loadRewarded(context: Context) {
        if (!canRequestAds && !allowTestAdsWithoutConsent) {
            Log.d(TAG, "loadRewarded: skip — canRequestAds=$canRequestAds, allowTestAdsWithoutConsent=$allowTestAdsWithoutConsent")
            return
        }
        if (rewardedAd != null && isAdFresh(rewardedLoadTime)) {
            Log.d(TAG, "loadRewarded: existing rewarded ad is fresh, skip reload")
            return
        }
        val request = AdRequest.Builder().build()
        val unitId = rewardedUnitOverride ?: REWARDED_AD_UNIT
        Log.d(TAG, "loadRewarded: using adUnitId=$unitId")
        RewardedAd.load(context, unitId, request, object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) { rewardedAd = ad; rewardedLoadTime = SystemClock.elapsedRealtime(); Log.d(TAG, "rewarded loaded") }
            override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                rewardedAd = null
                Log.d(TAG, "rewarded failed to load: ${loadAdError.message}")
                // Do NOT emit ad_error for background loads; only show-path failures should notify H5
            }
        })
    }

    fun isRewardedReady(): Boolean = rewardedAd != null && isAdFresh(rewardedLoadTime)

    // Primary signature: supports an onShown callback invoked when ad starts showing
    fun showRewarded(activity: Activity, messageId: String? = null, onShown: (() -> Unit)? = null, onEarned: ((RewardItem) -> Unit)? = null, onClosed: ((Boolean) -> Unit)? = null) {
        if (!canShowAds()) {
            Log.d(TAG, "showRewarded: 无法显示广告 - 广告未初始化或用户未同意")
            try { AdGameEventBridge.adError("rewarded_not_allowed", messageId) } catch (_: Exception) {}
            // 弹出提示对话框：广告环境未就绪
            try {
                activity.runOnUiThread {
                    try {
                        AlertDialog.Builder(activity)
                            .setTitle("广告启动失败")
                            .setMessage("广告环境未就绪，无法显示激励广告，请检查网络或设备的 Google 服务。")
                            .setPositiveButton("知道了", null)
                            .show()
                    } catch (e: Exception) {
                        Log.w(TAG, "showRewarded: failed to show failure dialog", e)
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "showRewarded: runOnUiThread failed when showing failure dialog", e)
            }
            onClosed?.invoke(false); return
        }
        if (isShowing || rewardedAd == null || !isAdFresh(rewardedLoadTime)) {
            try { AdGameEventBridge.adError("rewarded_not_ready", messageId) } catch (_: Exception) {}
            onClosed?.invoke(false); loadRewarded(activity.applicationContext); return
        }

        // Track whether the user actually earned the reward during this ad session
        var earned = false

        rewardedAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                isShowing = false
                rewardedAd = null
                loadRewarded(activity.applicationContext)
                // Pass whether reward was earned to the onClosed callback
                try { onClosed?.invoke(earned) } catch (e: Exception) { Log.w(TAG, "onClosed invoke failed", e) }
            }
            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                isShowing = false
                rewardedAd = null
                try {
                    AdGameEventBridge.adError(adError.message ?: "rewarded_failed_to_show", messageId)
                } catch (e: Exception) {
                    Log.w(TAG, "report rewarded show error to bridge failed", e)
                }
                try { onClosed?.invoke(false) } catch (e: Exception) { Log.w(TAG, "onClosed invoke failed", e) }
                loadRewarded(activity.applicationContext)
            }
            override fun onAdShowedFullScreenContent() { isShowing = true; onShown?.invoke() }
        }

        try {
            rewardedAd?.show(activity) { rewardItem ->
                // rewardItem indicates the user has earned the reward
                earned = true
                try { onEarned?.invoke(rewardItem) } catch (e: Exception) { Log.w(TAG, "onEarned invoke failed", e) }
            } ?: run {
                onClosed?.invoke(false)
                loadRewarded(activity.applicationContext)
            }
        } catch (e: Exception) {
            Log.w(TAG, "showRewarded exception", e)
            isShowing = false
            try { onClosed?.invoke(false) } catch (ex: Exception) { Log.w(TAG, "onClosed invoke failed", ex) }
            loadRewarded(activity.applicationContext)
        }
    }

    // Backwards-compatible overload: keep existing callers working (delegates to primary)
    // Backwards-compatible overloads
    fun showRewarded(activity: Activity, onEarned: ((RewardItem) -> Unit)? = null, onClosed: ((Boolean) -> Unit)? = null) {
        showRewarded(activity, null, null, onEarned, onClosed)
    }

    fun showInterstitial(activity: Activity, onShown: (() -> Unit)? = null, onClosed: ((Boolean) -> Unit)? = null) {
        showInterstitial(activity, null, onShown, onClosed)
    }

    fun showAppOpen(activity: Activity, onClosed: (() -> Unit)? = null) {
        showAppOpen(activity, null, onClosed)
    }

    fun getAppOpenBlockReason(): String {
        if (!isInitialized) return "MobileAds 未初始化"
        if (!(canRequestAds || (allowTestAdsWithoutConsent && isInitialized))) return "未获同意且非测试模式"
        if (isShowing) return "已有全屏广告正在展示"
        val now = SystemClock.elapsedRealtime()
        val cooldownLeft = COOLDOWN_MS - (now - lastShownTimestampMs)
        if (cooldownLeft > 0) return "冷却中，剩余 ${cooldownLeft} ms"
        if (shownInCurrentForeground) return "本次前台会话已展示过"
        if (appOpenAd == null) return "广告未加载"
        if (!isAdFresh(appOpenLoadTime)) return "广告已过期"
        return "条件未满足"
    }

    // --- Banner Ads ---
    fun loadBanner(context: Context, messageId: String? = null) {
        if (!canRequestAds && !allowTestAdsWithoutConsent) return
        if (bannerAdView != null && isAdFresh(bannerLoadTime)) return
        bannerLoading = true
        val unitId = bannerUnitOverride ?: BANNER_AD_UNIT
        Log.d(TAG, "Loading banner ad with unit: $unitId")

        val adView = AdView(context).apply {
            adUnitId = unitId
            setAdSize(AdSize.BANNER)
            adListener = object : AdListener() {
                override fun onAdLoaded() {
                    bannerAdView = this@apply
                    bannerLoadTime = SystemClock.elapsedRealtime()
                    bannerLoading = false
                    bannerLastError = null
                    bannerShown = false
                    Log.d(TAG, "Banner ad loaded successfully")
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    bannerAdView = null
                    bannerLoading = false
                    bannerLastError = loadAdError.message
                    Log.w(TAG, "Banner ad failed to load: ${loadAdError.message}")

                    // Do NOT emit ad_error for background loads; only show-path failures should notify H5

                    if (isDebug(context) && bannerUnitOverride == null && loadAdError.message?.contains("Publisher data not found", true) == true) {
                        bannerUnitOverride = TEST_BANNER_UNIT
                        Log.w(TAG, "Debug fallback to Google test banner ad unit: $TEST_BANNER_UNIT")
                        loadBanner(context)
                    }
                }

                override fun onAdOpened() {
                    Log.d(TAG, "Banner ad opened")
                }

                override fun onAdClosed() {
                    Log.d(TAG, "Banner ad closed")
                }
            }
        }

        val request = AdRequest.Builder().build()
        adView.loadAd(request)
    }

    fun getBannerAdView(): AdView? = bannerAdView

    fun isBannerReady(): Boolean = bannerAdView != null && isAdFresh(bannerLoadTime)

    fun isBannerLoading(): Boolean = bannerLoading

    fun getBannerLastError(): String? = bannerLastError

    fun isBannerShown(): Boolean = bannerShown

    fun setBannerShown(shown: Boolean) {
        bannerShown = shown
    }

    fun destroyBanner() {
        bannerAdView?.destroy()
        bannerAdView = null
        bannerLoadTime = 0L
        bannerLoading = false
        bannerLastError = null
        bannerShown = false
    }

    /**
     * 在调试或开发场景下强制使用 Google 测试广告位。
     * 当 use = true 时，会把所有广告位覆盖为 Google 提供的测试位，方便在设备上快速验证广告流程；
     * 当 use = false 时，恢复为默认的运行时配置（从 AdConfig 读取）。
     */
    /**
     * 在调试场景下强制使用测试广告位。可选传入 context 以便在启用时立即初始化 MobileAds 并触发加载。
     */
    fun setUseTestAds(use: Boolean, context: Context? = null) {
        if (use) {
            interstitialUnitOverride = TEST_INTERSTITIAL_UNIT
            rewardedUnitOverride = TEST_REWARDED_UNIT
            appOpenUnitOverride = TEST_APP_OPEN_UNIT
            bannerUnitOverride = TEST_BANNER_UNIT
            // 允许在未同意的情况下加载测试广告（仅在调试或开发阶段）
            allowTestAdsWithoutConsent = true
            Log.d(TAG, "AdManager: test ad units enabled; allowTestAdsWithoutConsent=$allowTestAdsWithoutConsent")

            // 如果调用者传入了 context，并且尚未初始化 MobileAds，则尝试初始化并触发加载
            context?.let { ctx ->
                try {
                    if (!isInitialized) {
                        Log.d(TAG, "setUseTestAds: MobileAds未初始化，等待initializeWithConsent调用")
                        // 不在这里重复初始化，避免与initializeWithConsent冲突
                        // initializeMobileAds(ctx)
                    } else {
                        // 已初始化：触发各广告类型的加载
                        Log.d(TAG, "setUseTestAds: MobileAds already initialized — triggering loads")
                        loadInterstitial(ctx)
                        loadRewarded(ctx)
                        loadAppOpen(ctx)
                        loadBanner(ctx)
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "setUseTestAds: failed to init/load test ads", e)
                }
            }
        } else {
            interstitialUnitOverride = null
            rewardedUnitOverride = null
            appOpenUnitOverride = null
            bannerUnitOverride = null
            // 关闭测试广告的无同意加载
            allowTestAdsWithoutConsent = false
            Log.d(TAG, "AdManager: test ad units disabled; allowTestAdsWithoutConsent=$allowTestAdsWithoutConsent")
        }
    }

    /**
     * 开发/调试：跳过 UMP，默认视为已同意，并使用测试广告位初始化。
     * 仅用于开发，不要用于生产。
     */
    fun initializeForDevAssumeConsent(context: Context) {
        try {
            // 使用测试广告位并允许在未同意时加载测试广告
            setUseTestAds(true, null)
            // 视为已可请求广告
            canRequestAds = true
            // 初始化与预加载
            initializeMobileAds(context)
            Log.d(TAG, "initializeForDevAssumeConsent completed (assume consent + test ads)")
        } catch (e: Exception) {
            Log.w(TAG, "initializeForDevAssumeConsent failed", e)
        }
    }
}
