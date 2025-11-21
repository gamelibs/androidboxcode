package com.example.gameboxone.webview

/**
 * Minimal UI contract used by native <-> JS bridge (GameDataBridge et al).
 * Implementations should be defensive and only update visible UI components.
 */
interface GameInfoUIModule {
    /** Update a short textual game status (examples: "true", "victory", "failed") */
    fun updateGameStatus(status: String)

    /** Update the visible game name/title */
    fun updateGameName(name: String)

    /** Update current level display */
    fun updateLevel(level: String)

    /** Update current score display (string form to avoid JSON/number parsing issues in bridge) */
    fun updateScore(score: String)

    /** Update a displayed game time / uptime string */
    fun updateGameTime(time: String)

    /** Handle ad-related events coming from JS; implementation may choose to ignore or log */
    fun handleAdEvent(eventType: String, data: String)
}
