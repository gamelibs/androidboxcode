package com.example.gameboxone.data.state

import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem

/**
 * 游戏详情页面状态
 */
data class GameDetailState(
    val game: Custom.HotGameData? = null,              // 游戏数据
    val isLoading: Boolean = false,          // 加载状态
    val error: String? = null,               // 错误信息
    val showDownloadDialog: Boolean = false, // 是否显示下载对话框
    val downloadInfo: Custom.DownloadInfo? = null,   // 下载信息
    val isDownloading: Boolean = false,
    val downloadProgress: Float = 0f,
    val loadingMessage: String? = null, // 添加加载消息属性
    val isFavorite: Boolean = false
)