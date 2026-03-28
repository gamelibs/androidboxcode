package com.example.gameboxone.data.model

import com.google.gson.annotations.SerializedName

/**
 * 历练系统配置解析模型（用于 assets/adventure_config.json 及后端 API 返回）
 * 这些是只读 DTO，不带 Room 注解。
 */

/** 根配置对象 */
data class AdventureFullConfig(
    @SerializedName("version") val version: String = "1.0.0",
    @SerializedName("configVersion") val configVersion: Int = 1,
    @SerializedName("publishedAt") val publishedAt: String = "",
    @SerializedName("minAppVersion") val minAppVersion: String = "1.0.0",
    @SerializedName("levels") val levels: List<AdventureLevelSpec> = emptyList(),
    @SerializedName("chapters") val chapters: List<AdventureChapterSpec> = emptyList(),
    @SerializedName("rewardPackages") val rewardPackages: List<AdventureRewardPackageSpec> = emptyList(),
    @SerializedName("homeRecommend") val homeRecommend: AdventureHomeRecommendSpec? = null
)

/** 等级配置 */
data class AdventureLevelSpec(
    @SerializedName("level") val level: Int = 1,
    @SerializedName("title") val title: String = "",
    @SerializedName("chapterId") val chapterId: String = "",
    @SerializedName("upgradeTaskCount") val upgradeTaskCount: Int = 7,
    @SerializedName("requireClearTaskCount") val requireClearTaskCount: Int = 0,
    @SerializedName("requireEliteTaskCount") val requireEliteTaskCount: Int = 0,
    @SerializedName("rewardExp") val rewardExp: Int = 200,
    @SerializedName("rewardCoins") val rewardCoins: Int = 100,
    @SerializedName("nextLevelPreview") val nextLevelPreview: String = ""
)

/** 章节配置（含任务列表） */
data class AdventureChapterSpec(
    @SerializedName("chapterId") val chapterId: String = "",
    @SerializedName("level") val level: Int = 1,
    @SerializedName("chapterTitle") val chapterTitle: String = "",
    @SerializedName("chapterSubtitle") val chapterSubtitle: String = "",
    @SerializedName("description") val description: String = "",
    @SerializedName("requiredTaskCount") val requiredTaskCount: Int = 7,
    @SerializedName("styleKey") val styleKey: String = "",
    @SerializedName("tasks") val tasks: List<AdventureTaskSpec> = emptyList()
)

/** 单个任务配置 */
data class AdventureTaskSpec(
    @SerializedName("taskId") val taskId: String = "",
    @SerializedName("slotNo") val slotNo: Int = 1,
    @SerializedName("gameId") val gameId: String = "",
    @SerializedName("gameName") val gameName: String = "",
    @SerializedName("taskType") val taskType: String = "SCORE",
    @SerializedName("targetValue") val targetValue: Int = 0,
    @SerializedName("taskTitle") val taskTitle: String = "",
    @SerializedName("taskDescription") val taskDescription: String = "",
    @SerializedName("rewardExp") val rewardExp: Int = 40,
    @SerializedName("rewardCoins") val rewardCoins: Int = 12,
    @SerializedName("isRequiredForUpgrade") val isRequiredForUpgrade: Boolean = true,
    @SerializedName("difficulty") val difficulty: String = "low",
    @SerializedName("weight") val weight: Int = 5
)

/** 奖励包配置 */
data class AdventureRewardPackageSpec(
    @SerializedName("rewardPackageId") val rewardPackageId: String = "",
    @SerializedName("rewardType") val rewardType: String = "task",
    @SerializedName("exp") val exp: Int = 0,
    @SerializedName("gold") val gold: Int = 0,
    @SerializedName("titleReward") val titleReward: String? = null,
    @SerializedName("badgeReward") val badgeReward: String? = null,
    @SerializedName("frameReward") val frameReward: String? = null,
    @SerializedName("popupText") val popupText: String = ""
)

/** 首页推荐策略配置 */
data class AdventureHomeRecommendSpec(
    @SerializedName("strategy") val strategy: String = "closest_to_complete",
    @SerializedName("featuredChapterId") val featuredChapterId: String = "",
    @SerializedName("fallbackTaskIds") val fallbackTaskIds: List<String> = emptyList()
)

/** 离线章节覆盖配置（用于 assets/offline_adventure_override.json） */
data class OfflineAdventureOverrideConfig(
    @SerializedName("version") val version: String = "1.0.0",
    @SerializedName("enabledWhenOfflineOnly") val enabledWhenOfflineOnly: Boolean = true,
    @SerializedName("chapters") val chapters: List<AdventureChapterSpec> = emptyList()
)

/**
 * 后端版本检查接口响应模型
 * GET /api/v1/site/adventure/version
 */
data class AdventureVersionResponse(
    @SerializedName("configVersion") val configVersion: Int = 0,
    @SerializedName("version") val version: String = "",
    @SerializedName("publishedAt") val publishedAt: String = "",
    @SerializedName("minAppVersion") val minAppVersion: String = "1.0.0"
)

/**
 * 首页聚合接口响应模型
 * GET /api/v1/site/adventure/home
 */
data class AdventureHomeResponse(
    @SerializedName("currentChapter") val currentChapter: AdventureChapterSpec? = null,
    @SerializedName("recommendedTaskIds") val recommendedTaskIds: List<String> = emptyList(),
    @SerializedName("nextLevelPreview") val nextLevelPreview: AdventureLevelSpec? = null,
    @SerializedName("configVersion") val configVersion: Int = 0
)

