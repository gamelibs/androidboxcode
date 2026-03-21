package com.example.gameboxone.data.state

import com.example.gameboxone.data.model.AdventureTaskUiModel
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem

/**
 * 游戏详情页面状态
 */
data class GameDetailState(
    val game: Custom.HotGameData? = null,
    val adventureTask: AdventureTaskUiModel? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val showDownloadDialog: Boolean = false,
    val downloadInfo: Custom.DownloadInfo? = null,
    val isDownloading: Boolean = false,
    val downloadProgress: Float = 0f,
    val loadingMessage: String? = null,
    val isFavorite: Boolean = false,
    val hasUpdate: Boolean = false       // 已安装但有新版本可更新
)