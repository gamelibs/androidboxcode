package com.example.gameboxone.data.state

/**
 * 游戏播放界面UI状态
 */
data class GamePlayerUiState(
    val isLoading: Boolean = true,
    val gameUrl: String? = null,
    val error: String? = null,
    val isFullScreen: Boolean = false
)