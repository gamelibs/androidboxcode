package com.example.gameboxone.ads

import com.google.android.gms.ads.AdRequest

/**
 * Centralized ad configuration. Defaults use Google-provided test ad unit ids.
 * Change values here or at runtime before calling AdManager.init when switching to production.
 */
object AdConfig {
    // Use provided AdMob App ID for Dragon Egg
    var ADMOB_APP_ID: String = "ca-app-pub-1939303734521252~3944883708"

    // 开发阶段：全部使用Google测试广告位以避免"Internal error"
    var INTERSTITIAL_AD_UNIT: String = "ca-app-pub-3940256099942544/1033173712" // Google test
    var REWARDED_AD_UNIT: String = "ca-app-pub-3940256099942544/5224354917"   // Google test
    var BANNER_AD_UNIT: String = "ca-app-pub-3940256099942544/6300978111"     // Google test banner
    // 开屏广告也使用测试广告位
    var APP_OPEN_AD_UNIT: String = "ca-app-pub-3940256099942544/9257395921"   // Google test app open

    // List of test device ids - include emulator by default
    var TEST_DEVICE_IDS: List<String> = listOf(AdRequest.DEVICE_ID_EMULATOR)

    // Helper to switch to production ids at runtime if needed
    fun setProduction(appId: String, interstitial: String, rewarded: String, banner: String, appOpen: String = APP_OPEN_AD_UNIT, testDeviceIds: List<String> = emptyList()) {
        ADMOB_APP_ID = appId
        INTERSTITIAL_AD_UNIT = interstitial
        REWARDED_AD_UNIT = rewarded
        BANNER_AD_UNIT = banner
        APP_OPEN_AD_UNIT = appOpen
        TEST_DEVICE_IDS = testDeviceIds
    }
}
