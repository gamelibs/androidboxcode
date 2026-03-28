package com.example.gameboxone.ads

interface AdObservabilityDelegate {
    fun onAdEvent(eventName: String, adType: String, properties: Map<String, Any?> = emptyMap())
}

