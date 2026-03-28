package com.example.gameboxone

import com.example.gameboxone.observability.AnalyticsEventNames
import org.junit.Test

import org.junit.Assert.*

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun analytics_event_names_match_expected_funnel_keys() {
        assertEquals("app_launch", AnalyticsEventNames.APP_LAUNCH)
        assertEquals("home_view", AnalyticsEventNames.HOME_VIEW)
        assertEquals("task_reward_claimed", AnalyticsEventNames.TASK_REWARD_CLAIMED)
        assertEquals("ad_error", AnalyticsEventNames.AD_ERROR)
    }

    @Test
    fun analytics_event_names_are_non_blank() {
        val names = listOf(
            AnalyticsEventNames.APP_LAUNCH,
            AnalyticsEventNames.GAME_START,
            AnalyticsEventNames.GAME_EXIT,
            AnalyticsEventNames.SDK_REFRESH_SUCCESS,
            AnalyticsEventNames.LEVEL_UP
        )

        assertTrue(names.all { it.isNotBlank() })
    }
}