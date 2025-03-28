package com.example.gameboxone.ui.state


import com.example.gameboxone.data.model.GameConfigItem

data class HomeScreenState(
    var loading: Boolean = true,
    val isLoading: Boolean = false,
    val isSyncing: Boolean = false,
    val games: List<GameConfigItem> = emptyList(),
    val error: String? = null,
    val syncError: String? = null,
    val isRefreshing: Boolean = false,
    val lastUpdateTime: Long = 0L
)
