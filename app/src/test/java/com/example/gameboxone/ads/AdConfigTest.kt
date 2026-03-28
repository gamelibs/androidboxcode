package com.example.gameboxone.ads

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AdConfigTest {
    @Test
    fun google_test_units_are_not_treated_as_production_ready() {
        val oldAppId = AdConfig.ADMOB_APP_ID
        val oldInterstitial = AdConfig.INTERSTITIAL_AD_UNIT
        val oldRewarded = AdConfig.REWARDED_AD_UNIT
        val oldBanner = AdConfig.BANNER_AD_UNIT
        val oldAppOpen = AdConfig.APP_OPEN_AD_UNIT
        try {
            AdConfig.setProduction(
                appId = oldAppId,
                interstitial = "ca-app-pub-3940256099942544/1033173712",
                rewarded = "ca-app-pub-3940256099942544/5224354917",
                banner = "ca-app-pub-3940256099942544/6300978111",
                appOpen = "ca-app-pub-3940256099942544/9257395921"
            )

            assertFalse(AdConfig.hasProductionUnitsConfigured())
        } finally {
            AdConfig.ADMOB_APP_ID = oldAppId
            AdConfig.INTERSTITIAL_AD_UNIT = oldInterstitial
            AdConfig.REWARDED_AD_UNIT = oldRewarded
            AdConfig.BANNER_AD_UNIT = oldBanner
            AdConfig.APP_OPEN_AD_UNIT = oldAppOpen
        }
    }

    @Test
    fun non_test_units_are_treated_as_production_ready() {
        val oldAppId = AdConfig.ADMOB_APP_ID
        val oldInterstitial = AdConfig.INTERSTITIAL_AD_UNIT
        val oldRewarded = AdConfig.REWARDED_AD_UNIT
        val oldBanner = AdConfig.BANNER_AD_UNIT
        val oldAppOpen = AdConfig.APP_OPEN_AD_UNIT
        try {
            AdConfig.setProduction(
                appId = "ca-app-pub-1111111111111111~2222222222",
                interstitial = "ca-app-pub-1111111111111111/3333333333",
                rewarded = "ca-app-pub-1111111111111111/4444444444",
                banner = "ca-app-pub-1111111111111111/5555555555",
                appOpen = "ca-app-pub-1111111111111111/6666666666"
            )

            assertTrue(AdConfig.hasProductionUnitsConfigured())
        } finally {
            AdConfig.ADMOB_APP_ID = oldAppId
            AdConfig.INTERSTITIAL_AD_UNIT = oldInterstitial
            AdConfig.REWARDED_AD_UNIT = oldRewarded
            AdConfig.BANNER_AD_UNIT = oldBanner
            AdConfig.APP_OPEN_AD_UNIT = oldAppOpen
        }
    }
}

