package com.example.gameboxone.data.state

import com.example.gameboxone.data.model.Custom

data class MyGameState(
    val games: List<Custom.MyGameData> = emptyList(),       // 已安装游戏
    val allGames: List<Custom.MyGameData> = emptyList(),    // 全部游戏（完整目录）
    val isLoading: Boolean = false,
    val error: String? = null,
    val downloadingGameId: String? = null,
    val downloadProgress: Float = 0f,
    val deletingGameId: String? = null
)