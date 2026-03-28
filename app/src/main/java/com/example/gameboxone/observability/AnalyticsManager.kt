package com.example.gameboxone.observability

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.ads.AdObservabilityDelegate
import com.example.gameboxone.di.ApplicationScope
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.event.GameEvent
import com.example.gameboxone.event.TaskEvent
import com.example.gameboxone.manager.EventManager
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AnalyticsManager @Inject constructor(
    @ApplicationContext private val context: Context,
    @ApplicationScope private val applicationScope: CoroutineScope
) : AdObservabilityDelegate {
    private val prefs by lazy {
        context.getSharedPreferences("observability_prefs", Context.MODE_PRIVATE)
    }
    private val observersStarted = AtomicBoolean(false)

    fun track(eventName: String, properties: Map<String, Any?> = emptyMap()) {
        val payload = AnalyticsPayloadSanitizer.sanitize(properties)
        Log.d(TAG, "track: event=$eventName, payload=$payload")
        SentryBridge.addBreadcrumb(category = "analytics", message = eventName, data = payload)
    }

    override fun onAdEvent(eventName: String, adType: String, properties: Map<String, Any?>) {
        track(eventName, properties + mapOf("ad_type" to adType))
    }

    fun markAppLaunch() {
        track(AnalyticsEventNames.APP_LAUNCH)
        if (!prefs.getBoolean(KEY_FIRST_OPEN_RECORDED, false)) {
            prefs.edit().putBoolean(KEY_FIRST_OPEN_RECORDED, true).apply()
            track(AnalyticsEventNames.APP_FIRST_OPEN)
        }
    }

    fun startObserving(eventManager: EventManager) {
        if (!observersStarted.compareAndSet(false, true)) return

        applicationScope.launch {
            eventManager.taskEvents.collectLatest { event ->
                when (event) {
                    is TaskEvent.TaskAchieved -> track(
                        AnalyticsEventNames.TASK_ACHIEVED,
                        mapOf(
                            "task_id" to event.taskId,
                            "game_id" to event.gameId,
                            "reward_exp" to event.rewardExp,
                            "reward_coins" to event.rewardCoins
                        )
                    )
                    is TaskEvent.TaskClaimed -> Unit
                }
            }
        }

        applicationScope.launch {
            eventManager.dataEvents.collectLatest { event ->
                when (event) {
                    DataEvent.RefreshStarted -> track(AnalyticsEventNames.DATA_REFRESH_START)
                    DataEvent.RefreshCompleted -> track(AnalyticsEventNames.DATA_REFRESH_COMPLETE)
                    DataEvent.SdkLoaded -> track(AnalyticsEventNames.SDK_REFRESH_SUCCESS, mapOf("source" to "data_event"))
                    is DataEvent.Error -> track(
                        AnalyticsEventNames.DATA_ERROR,
                        mapOf("message" to event.message)
                    )
                    else -> Unit
                }
            }
        }

        applicationScope.launch {
            eventManager.gameEvents.collectLatest { event ->
                when (event) {
                    is GameEvent.GameDownloadStarted -> track(
                        AnalyticsEventNames.GAME_DOWNLOAD_START,
                        mapOf("game_id" to event.game.id, "game_name" to event.game.name, "source" to "event_bus")
                    )
                    is GameEvent.GameDownloadCompleted -> track(
                        AnalyticsEventNames.GAME_DOWNLOAD_SUCCESS,
                        mapOf("game_id" to event.game.id, "game_name" to event.game.name, "source" to "event_bus")
                    )
                    else -> Unit
                }
            }
        }
    }

    companion object {
        private const val TAG = "AnalyticsManager"
        private const val KEY_FIRST_OPEN_RECORDED = "first_open_recorded"
    }
}



