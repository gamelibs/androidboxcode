package com.example.gameboxone.data.state

import com.example.gameboxone.data.model.Custom

data class MyGameState(
    val games: List<Custom.MyGameData> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val downloadingGameId: String? = null,
    val downloadProgress: Float = 0f,
    val deletingGameId: String? = null
)