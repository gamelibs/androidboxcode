package com.example.gameboxone.ads

import android.util.Log
import android.os.SystemClock
import org.json.JSONObject
import com.example.gameboxone.callback.AndroidEventCallBack
import com.example.gameboxone.callback.AndroidEventCallBackHolder
import java.lang.ref.WeakReference
import java.util.concurrent.atomic.AtomicLong

/**
 * Bridge to emit ad lifecycle events from native to the game's iframeSdk.
 * Produces JSON-array payloads like: [{"type":"beforeAd","value":"interstitial"}]
 */
object AdGameEventBridge {
    private const val TAG = "AdGameEventBridge"
    private const val BRIDGE_TAG = "GAME_EVENTS_BRIDGE"
    private var callbackRef: WeakReference<AndroidEventCallBack>? = null
    // track timestamp of last reported ad_error to suppress immediate duplicate callbacks
    @Volatile private var lastAdErrorAt: Long = 0L
    // Track last error time by message_id to avoid duplicates per request
    private val lastErrorByMessageId: MutableMap<String, Long> = java.util.concurrent.ConcurrentHashMap()
    // message id generator for outgoing bridge messages
    private val messageIdCounter = AtomicLong(0)

    fun setCallback(cb: AndroidEventCallBack?) {
        callbackRef = if (cb != null) WeakReference(cb) else null
        Log.d(TAG, "Callback set: ${cb != null}")
    }

    fun clear() { callbackRef = null }

    private fun send(vararg events: Pair<String, Any?>) {
        try {
            val cb = callbackRef?.get()
            if (cb == null) {
                Log.d(TAG, "send skipped: callback is null")
                return
            }
            // build simple JSON-like representation for logging
            try {
                val payloadBuilder = StringBuilder()
                payloadBuilder.append('[')
                events.forEachIndexed { idx, (type, value) ->
                    if (idx > 0) payloadBuilder.append(',')
                    payloadBuilder.append("{\"type\":\"").append(type).append("\",\"value\":")
                    when (value) {
                        null -> payloadBuilder.append("null")
                        is Boolean, is Number -> payloadBuilder.append(value.toString())
                        is org.json.JSONObject -> payloadBuilder.append(value.toString())
                        else -> payloadBuilder.append('"').append(value.toString()).append('"')
                    }
                    payloadBuilder.append('}')
                }
                payloadBuilder.append(']')
                // This is a pre-message-id construction log used for debugging. Demote to verbose and use module TAG
                Log.v(TAG, "constructed payload (pre-ids): ${payloadBuilder}")
            } catch (e: Exception) {
                Log.w(TAG, "failed to build bridge payload log", e)
            }
            // Forward raw values so JS receives the exact shapes requested (e.g. value: "interstitial")
            cb.sendIframeEvents(*events)
        } catch (e: Exception) {
            Log.w(TAG, "send failed", e)
        }
    }

    // Generic hooks
    // Send structured beforeAd payload: value will be an object containing ad_type
    fun beforeAd(kind: String) {
        // start of a new ad session: clear any previous error marker timestamp
        lastAdErrorAt = 0L

        val normalized = when (kind.toLowerCase()) {
            "interstitial", "interstitialad", "interstitial_ad", "inter" -> "interstitial"
            "reward", "rewarded", "rewardedad", "rewarded_ad" -> "reward"
            else -> kind
        }
        // Send primitive string value for type so JS receives: { type: 'beforeAd', value: 'interstitial' }
        send("beforeAd" to normalized)
    }
    fun afterAd() {
        val now = SystemClock.elapsedRealtime()
        // If an ad_error was reported very recently for this session, suppress afterAd.
        if (lastAdErrorAt != 0L && now - lastAdErrorAt < 5000L) {
            Log.d(TAG, "afterAd suppressed due to prior ad_error (recent)")
            // clear the marker for next sessions
            lastAdErrorAt = 0L
            return
        }
        // Backwards compatibility: map afterAd -> adViewed with unknown type
        send("adViewed" to "unknown")
    }

    /**
     * Unified ad viewed/completed event. Value will include at least { "ad_type": "interstitial"|"reward", ... }
     */
    fun adViewed(kind: String, extra: Map<String, Any?>? = null) {
        try {
            val normalized = when (kind.toLowerCase()) {
                "interstitial", "interstitialad", "interstitial_ad", "inter" -> "interstitial"
                "reward", "rewarded", "rewardedad", "rewarded_ad" -> "reward"
                else -> kind
            }
            // Send primitive string value for type so JS receives: { type: 'adViewed', value: 'interstitial' }
            // attach extra fields if provided
            if (extra == null) {
                send("adViewed" to normalized)
            } else {
                // If extra info provided (e.g., reward amount), include it as a JSON string in value
                // Format: send value as JSON string so JS can parse details if needed
                val obj = JSONObject()
                obj.put("ad_type", normalized)
                for ((k, v) in extra) {
                    try {
                        when (v) {
                            null -> obj.put(k, org.json.JSONObject.NULL)
                            is Number, is Boolean, is String -> obj.put(k, v)
                            else -> obj.put(k, v.toString())
                        }
                    } catch (_: Exception) { }
                }
                send("adViewed" to obj.toString())
            }
        } catch (e: Exception) {
            Log.w(TAG, "adViewed send failed", e)
        }
    }

    fun adError(reason: String, messageId: String? = null) {
        try {
            val now = SystemClock.elapsedRealtime()
            // Per-request dedupe by message_id; fallback to global short window when id is absent
            if (messageId != null) {
                val last = lastErrorByMessageId[messageId]
                if (last != null && now - last < 1000L) {
                    Log.d(TAG, "adError suppressed duplicate for message_id=$messageId (within 1s)")
                    return
                }
                lastErrorByMessageId[messageId] = now
            } else {
                if (lastAdErrorAt != 0L && now - lastAdErrorAt < 1000L) {
                    Log.d(TAG, "adError suppressed duplicate (within 1s, no message_id)")
                    return
                }
                lastAdErrorAt = now
            }
            // If a messageId is provided, send as an object that includes message_id so JS can correlate
            if (messageId != null) {
                try {
                    val obj = JSONObject()
                    obj.put("ad_error", reason)
                    // follow agreed shape: { type: 'ad_error', value: 'reason', message_id: 'mN' }
                    val payloadObj = JSONObject()
                    payloadObj.put("type", "ad_error")
                    payloadObj.put("value", reason)
                    payloadObj.put("message_id", messageId)
                    // Use callback to send raw payload array
                    val cb = AndroidEventCallBackHolder.callback()
                    if (cb != null) {
                        cb.sendRawPayload(org.json.JSONArray().put(payloadObj).toString())
                    } else {
                        send("ad_error" to reason)
                    }
                } catch (e: Exception) {
                    // fallback to primitive
                    send("ad_error" to reason)
                }
            } else {
                // send primitive string reason
                send("ad_error" to reason)
            }
        } catch (e: Exception) {
            Log.w(TAG, "adError send failed", e)
        }
    }

    // Interstitial
    fun interstitialOpen() {
        // Suppressed: do not emit interstitial_open to JS anymore
        Log.d(TAG, "interstitialOpen suppressed by policy")
    }

    fun interstitialViewed() {
        // Suppressed: do not emit interstitial_viewed to JS anymore
        Log.d(TAG, "interstitialViewed suppressed by policy")
    }

    // Rewarded
    fun rewardViewed(type: String, amount: Int) = adViewed("reward", mapOf("reward_type" to type, "amount" to amount))
    fun rewardDismissed() = send("adDismissed" to "reward")
}
