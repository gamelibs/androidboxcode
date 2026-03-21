package com.example.gameboxone.data.state

import com.example.gameboxone.data.model.AdventureTaskStatus
import com.example.gameboxone.data.model.AdventureTaskType
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.TaskStageUiModel

/**
 * 历练任务详情页 UI 状态
 */
data class AdventureTaskDetailState(
    val isLoading: Boolean = true,
    val playerTitle: String = "",           // 玩家当前称号，如 "探索者"
    val gameName: String = "",              // 游戏名，如 "VikingPub"
    val gameDescription: String = "",       // 游戏描述
    val taskType: AdventureTaskType = AdventureTaskType.SCORE,
    val targetValue: Int = 0,
    val currentProgress: Int = 0,          // 当前最高分/关卡/通关次数
    val status: AdventureTaskStatus = AdventureTaskStatus.AVAILABLE,
    val stages: List<TaskStageUiModel> = emptyList(),
    val rewardText: String = "",
    val taskId: String = "",
    val gameId: String = "",
    val game: Custom.HotGameData? = null,  // null 表示演示模式（无真实游戏）
    // 下载流程
    val isDownloading: Boolean = false,
    val downloadProgress: Float = 0f,
    val showDownloadDialog: Boolean = false,
    val downloadInfo: Custom.DownloadInfo? = null,
    val loadingMessage: String? = null,
    val error: String? = null
)

