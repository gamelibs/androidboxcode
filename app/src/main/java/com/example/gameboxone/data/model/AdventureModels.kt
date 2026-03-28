package com.example.gameboxone.data.model

/**
 * 历练首页 UI 需要的轻量模型。
 * 首版以本地单机成长为核心：任务规则来自本地/配置，进度与奖励状态存本地。
 */
enum class AdventureTaskType {
    SCORE,
    STAGE,
    CLEAR,
    ELITE,
    START,
    TIME,
    EXIT
}

enum class AdventureTaskStatus {
    LOCKED,
    AVAILABLE,
    IN_PROGRESS,
    ACHIEVED,
    CLAIMED,
    COMPLETED
}

data class AdventureLevelMeta(
    val level: Int,
    val title: String,
    val chapterId: String,
    val chapterTitle: String,
    val nextLevelPreview: String
)

data class AdventureTaskUiModel(
    val taskId: String,
    val gameId: String,
    val game: GameConfigItem?,
    val gameName: String,
    val taskTitle: String,
    val taskDescription: String,
    val targetText: String,
    val progressText: String,
    val rewardText: String,
    val status: AdventureTaskStatus,
    val statusLabel: String,
    val isRecommended: Boolean
)

data class AdventureRewardGrant(
    val rewardPackageId: String? = null,
    val exp: Long = 0L,
    val coins: Long = 0L,
    val popupText: String? = null,
    val titleReward: String? = null,
    val badgeReward: String? = null,
    val frameReward: String? = null
)

data class AdventureTaskClaimResult(
    val success: Boolean = false,
    val taskId: String = "",
    val reward: AdventureRewardGrant = AdventureRewardGrant(),
    val newTotalExp: Long = 0L,
    val newTotalCoins: Long = 0L,
    val displayMessage: String = ""
)

data class AdventureLevelUpResult(
    val success: Boolean = false,
    val fromLevel: Int = 0,
    val toLevel: Int = 0,
    val newChapterId: String = "",
    val newChapterTitle: String = "",
    val chapterReward: AdventureRewardGrant? = null,
    val levelReward: AdventureRewardGrant? = null,
    val displayMessage: String = ""
)

data class AdventureHomeUiState(
    val isInitialized: Boolean = false,
    val localPlayerName: String = "本地旅人",
    val currentLevel: Int = 1,
    val currentTitle: String = "探索者",
    val currentChapterId: String = "chapter_01",
    val currentChapterTitle: String = "第一章·初入历练场",
    val totalExp: Long = 0L,
    val totalCoins: Long = 0L,
    val totalTaskCount: Int = 0,
    val completedTaskCount: Int = 0,
    val achievedTaskCount: Int = 0,
    val requiredTaskCount: Int = 7,
    val completedClearTaskCount: Int = 0,
    val requiredClearTaskCount: Int = 0,
    val completedEliteTaskCount: Int = 0,
    val requiredEliteTaskCount: Int = 0,
    val upgradeReady: Boolean = false,
    val recommendedTasks: List<AdventureTaskUiModel> = emptyList(),
    val chapterTasks: List<AdventureTaskUiModel> = emptyList(),
    val recentActivities: List<String> = emptyList(),
    val nextLevelPreview: String = "Lv.2 行旅者",
    val emptyMessage: String? = null
)

/** 章节地图页每个节点的状态 */
enum class ChapterNodeState {
    COMPLETED,    // 已通关（历史章节）
    CURRENT,      // 当前正在进行
    LOCKED        // 未解锁
}

/** 章节地图页 UI 模型 */
data class ChapterMapNode(
    val level: Int,
    val title: String,
    val chapterId: String,
    val chapterTitle: String,
    val state: ChapterNodeState,
    val completedTasks: Int,
    val totalTasks: Int,
    val nextLevelPreview: String
)

/** 任务详情页原始数据（供 AdventureTaskDetailViewModel 使用） */
data class AdventureTaskRaw(
    val definition: LocalAdventureTaskDefinitionEntity,
    val progress: LocalAdventureTaskProgressEntity?,
    val playerTitle: String
)

/** 任务详情页单个关卡节点 */
data class TaskStageUiModel(
    val stageNumber: Int,    // 1, 2, 3, 4
    val scoreLabel: String,  // "10", "第1关", "1次"等
    val scoreValue: Int,     // 用于比较进度的原始数值
    val isCompleted: Boolean,
    val isCurrent: Boolean   // 当前正在挑战的节点
)

