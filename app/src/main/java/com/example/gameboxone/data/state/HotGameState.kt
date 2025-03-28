package com.example.gameboxone.data.state

import com.example.gameboxone.data.model.Custom


data class HotGameState(
    val hotGames: List<Custom.HotGameData> = emptyList(),
    val isLoading: Boolean = false,
    val isSyncing: Boolean = false,  // 添加同步状态
    val error: String? = null,
    val syncError: String? = null,
    val currentGameId: String? = null
) {
    fun isValid() = hotGames.isNotEmpty() && !isLoading && error == null
}