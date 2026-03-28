package com.example.gameboxone.manager

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.base.AppDatabase
import com.example.gameboxone.data.model.AdventureChapterSpec
import com.example.gameboxone.data.model.AdventureFullConfig
import com.example.gameboxone.data.model.AdventureHomeResponse
import com.example.gameboxone.data.model.AdventureHomeUiState
import com.example.gameboxone.data.model.AdventureLevelUpResult
import com.example.gameboxone.data.model.AdventureLevelMeta
import com.example.gameboxone.data.model.OfflineAdventureOverrideConfig
import com.example.gameboxone.data.model.AdventureRewardGrant
import com.example.gameboxone.data.model.AdventureRewardPackageSpec
import com.example.gameboxone.data.model.AdventureTaskStatus
import com.example.gameboxone.data.model.AdventureTaskClaimResult
import com.example.gameboxone.data.model.ChapterMapNode
import com.example.gameboxone.data.model.ChapterNodeState
import com.example.gameboxone.data.model.AdventureTaskType
import com.example.gameboxone.data.model.AdventureTaskUiModel
import com.example.gameboxone.data.model.AdventureTaskRaw
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.model.LocalAdventureProfileEntity
import com.example.gameboxone.data.model.LocalAdventureTaskDefinitionEntity
import com.example.gameboxone.data.model.LocalAdventureTaskProgressEntity
import com.example.gameboxone.observability.AnalyticsEventNames
import com.example.gameboxone.observability.AnalyticsManager
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LocalAdventureManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val database: AppDatabase,
    private val netManager: NetManager,
    private val analyticsManager: AnalyticsManager
) {
    private val TAG = "LocalAdventureManager"
    private val dao = database.localAdventureDao()

    // Lazy-loaded and cached adventure config from remote-cache / assets / fallback
    private var _cachedConfig: AdventureFullConfig? = null
    private var _offlineOverrideCache: OfflineAdventureOverrideConfig? = null

    fun invalidateConfigCache() {
        _cachedConfig = null
        _offlineOverrideCache = null
    }

    private fun loadOfflineAdventureOverride(): OfflineAdventureOverrideConfig? {
        _offlineOverrideCache?.let { return it }
        return try {
            val json = context.assets.open("offline_adventure_override.json")
                .bufferedReader()
                .use { it.readText() }
            Gson().fromJson(json, OfflineAdventureOverrideConfig::class.java)?.also {
                _offlineOverrideCache = it
                Log.d(TAG, "已加载离线历练覆盖配置：${it.chapters.size} 个章节")
            }
        } catch (e: Exception) {
            Log.w(TAG, "未加载离线历练覆盖配置，继续使用主配置", e)
            null
        }
    }

    private fun shouldUseOfflineAdventureOverride(config: OfflineAdventureOverrideConfig?): Boolean {
        if (config == null || config.chapters.isEmpty()) return false
        return if (config.enabledWhenOfflineOnly) {
            !netManager.checkNetworkNow()
        } else {
            true
        }
    }

    private suspend fun resolveChapterSpec(chapterId: String): AdventureChapterSpec? {
        val config = loadAdventureConfig()
        val baseChapter = loadCachedChapterSpec(chapterId)
            ?: config.chapters.firstOrNull { it.chapterId == chapterId }

        val overrideConfig = loadOfflineAdventureOverride()
        val overrideChapter = overrideConfig?.chapters?.firstOrNull { it.chapterId == chapterId }
        return if (overrideChapter != null && shouldUseOfflineAdventureOverride(overrideConfig)) {
            Log.d(TAG, "当前使用离线章节覆盖配置: $chapterId")
            overrideChapter
        } else {
            baseChapter
        }
    }

    suspend fun getCurrentChapterIdForSync(): String = withContext(Dispatchers.IO) {
        ensureProfile()
        dao.getProfile()?.currentChapterId ?: "chapter_01"
    }

    private suspend fun loadAdventureConfig(): AdventureFullConfig {
        _cachedConfig?.let { return it }

        try {
            val cached = database.appConfigDao().getLatestValue("adventure_config_json")
            if (!cached.isNullOrBlank()) {
                val config = Gson().fromJson(cached, AdventureFullConfig::class.java)
                if (config != null && config.levels.isNotEmpty() && config.chapters.isNotEmpty()) {
                    _cachedConfig = config
                    Log.d(TAG, "已从 app_config 加载远端历练配置：${config.chapters.size} 个章节, ${config.levels.size} 个等级")
                    return config
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "读取 app_config 中的远端历练配置失败，继续回退到 fallback/asset", e)
        }

        try {
            val cachedFallback = database.appConfigDao().getLatestValue("adventure_fallback_json")
            if (!cachedFallback.isNullOrBlank()) {
                val fallback = Gson().fromJson(cachedFallback, AdventureFullConfig::class.java)
                if (fallback != null && (fallback.levels.isNotEmpty() || fallback.chapters.isNotEmpty())) {
                    _cachedConfig = fallback
                    Log.d(TAG, "已从 app_config 加载远端 fallback 历练配置")
                    return fallback
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "读取 app_config 中的 fallback 历练配置失败，继续回退到 assets", e)
        }

        return try {
            val json = context.assets.open("adventure_config.json").bufferedReader().use { it.readText() }
            val config = Gson().fromJson(json, AdventureFullConfig::class.java)
            _cachedConfig = config
            Log.d(TAG, "已从 assets 加载历练配置：${config.chapters.size} 个章节, ${config.levels.size} 个等级")
            config
        } catch (e: Exception) {
            Log.e(TAG, "加载 adventure_config.json 失败，使用内置保底配置", e)
            buildFallbackConfig()
        }
    }

    /** 根据配置构建 levelMetas 列表 */
    private suspend fun buildLevelMetas(): List<AdventureLevelMeta> {
        val config = loadAdventureConfig()
        if (config.levels.isNotEmpty() && config.chapters.isNotEmpty()) {
            val chapterMap = config.chapters.associateBy { it.chapterId }
            return config.levels.map { lv ->
                val ch = chapterMap[lv.chapterId]
                AdventureLevelMeta(
                    level = lv.level,
                    title = lv.title,
                    chapterId = lv.chapterId,
                    chapterTitle = ch?.chapterTitle ?: "第${lv.level}章",
                    nextLevelPreview = lv.nextLevelPreview
                )
            }
        }
        return hardcodedLevelMetas
    }

    private suspend fun loadCachedHomeResponse(chapterId: String): AdventureHomeResponse? {
        return try {
            val cachedChapterId = database.appConfigDao().getLatestValue("adventure_home_chapter_id")
            if (!cachedChapterId.isNullOrBlank() && cachedChapterId != chapterId) return null
            val json = database.appConfigDao().getLatestValue("adventure_home_json") ?: return null
            Gson().fromJson(json, AdventureHomeResponse::class.java)
        } catch (e: Exception) {
            Log.w(TAG, "读取缓存 adventure_home_json 失败", e)
            null
        }
    }

    private suspend fun loadCachedChapterSpec(chapterId: String): AdventureChapterSpec? {
        return try {
            val json = database.appConfigDao().getLatestValue("adventure_chapter_json_$chapterId") ?: return null
            Gson().fromJson(json, AdventureChapterSpec::class.java)
        } catch (e: Exception) {
            Log.w(TAG, "读取缓存章节配置失败: $chapterId", e)
            null
        }
    }

    private suspend fun loadRewardPackages(): List<AdventureRewardPackageSpec> {
        val configPackages = runCatching { loadAdventureConfig().rewardPackages }
            .getOrDefault(emptyList())
            .filter { it.rewardPackageId.isNotBlank() }
        if (configPackages.isNotEmpty()) return configPackages

        try {
            val cached = database.appConfigDao().getLatestValue("adventure_reward_packages_json")
            if (!cached.isNullOrBlank()) {
                val listType = object : TypeToken<List<AdventureRewardPackageSpec>>() {}.type
                val parsed: List<AdventureRewardPackageSpec> = Gson().fromJson(cached, listType) ?: emptyList()
                if (parsed.isNotEmpty()) return parsed
            }
        } catch (e: Exception) {
            Log.w(TAG, "读取缓存奖励包配置失败，继续回退", e)
        }

        try {
            val fallbackJson = database.appConfigDao().getLatestValue("adventure_fallback_json")
            if (!fallbackJson.isNullOrBlank()) {
                val fallback = Gson().fromJson(fallbackJson, AdventureFullConfig::class.java)
                if (fallback?.rewardPackages?.isNotEmpty() == true) return fallback.rewardPackages
            }
        } catch (e: Exception) {
            Log.w(TAG, "读取 fallback 奖励包配置失败", e)
        }

        return emptyList()
    }

    private suspend fun resolveTaskRewardPackage(def: LocalAdventureTaskDefinitionEntity): AdventureRewardPackageSpec? {
        val candidates = loadRewardPackages().filter { it.rewardType.equals("task", ignoreCase = true) }
        return when {
            candidates.isEmpty() -> null
            candidates.size == 1 -> candidates.first()
            else -> candidates.firstOrNull {
                it.exp == def.rewardExp && it.gold == def.rewardCoins
            } ?: candidates.firstOrNull {
                it.rewardPackageId.contains(def.taskId, ignoreCase = true)
            }
        }
    }

    private suspend fun resolveChapterRewardPackage(chapterId: String): AdventureRewardPackageSpec? {
        val candidates = loadRewardPackages().filter { it.rewardType.equals("chapter", ignoreCase = true) }
        return when {
            candidates.isEmpty() -> null
            candidates.size == 1 -> candidates.first()
            else -> candidates.firstOrNull {
                it.rewardPackageId.contains(chapterId, ignoreCase = true)
            } ?: candidates.first()
        }
    }

    private suspend fun resolveLevelRewardPackage(
        currentLevel: Int,
        levelRewardExp: Int,
        levelRewardCoins: Int,
        nextTitle: String
    ): AdventureRewardPackageSpec? {
        val candidates = loadRewardPackages().filter { it.rewardType.equals("level", ignoreCase = true) }
        return when {
            candidates.isEmpty() -> null
            else -> candidates.firstOrNull {
                it.rewardPackageId.contains("LV$currentLevel", ignoreCase = true)
            } ?: candidates.firstOrNull {
                it.exp == levelRewardExp && it.gold == levelRewardCoins
            } ?: candidates.firstOrNull {
                it.popupText.contains(nextTitle, ignoreCase = true)
            }
        }
    }

    private fun AdventureRewardPackageSpec.toGrant(
        expOverride: Long = exp.toLong(),
        coinsOverride: Long = gold.toLong()
    ) = AdventureRewardGrant(
        rewardPackageId = rewardPackageId,
        exp = expOverride,
        coins = coinsOverride,
        popupText = popupText.takeIf { it.isNotBlank() },
        titleReward = titleReward?.takeIf { it.isNotBlank() },
        badgeReward = badgeReward?.takeIf { it.isNotBlank() },
        frameReward = frameReward?.takeIf { it.isNotBlank() }
    )

    private fun buildRewardSummary(grant: AdventureRewardGrant): String {
        val parts = buildList {
            if (grant.exp > 0) add("+${grant.exp} EXP")
            if (grant.coins > 0) add("+${grant.coins} 金币")
            grant.titleReward?.let { add("称号：$it") }
            grant.badgeReward?.let { add("徽章：$it") }
            grant.frameReward?.let { add("头像框：$it") }
        }
        return parts.joinToString(" · ").ifBlank { "奖励已到账" }
    }

    private fun buildTaskRewardDisplayText(
        exp: Int,
        coins: Int,
        rewardPackage: AdventureRewardPackageSpec?
    ): String {
        val grant = rewardPackage?.toGrant(exp.toLong(), coins.toLong())
            ?: AdventureRewardGrant(exp = exp.toLong(), coins = coins.toLong())
        return buildRewardSummary(grant)
    }

    private fun buildTaskClaimMessage(taskTitle: String, grant: AdventureRewardGrant): String {
        val headline = grant.popupText?.takeIf { it.isNotBlank() } ?: "${taskTitle} 奖励已领取"
        return "$headline\n${buildRewardSummary(grant)}"
    }

    private fun buildLevelUpMessage(
        nextChapterTitle: String,
        levelReward: AdventureRewardGrant,
        chapterReward: AdventureRewardGrant?
    ): String {
        val headline = levelReward.popupText?.takeIf { it.isNotBlank() }
            ?: "🎊 晋级成功，已解锁 $nextChapterTitle"
        val detail = buildList {
            add("升级奖励：${buildRewardSummary(levelReward)}")
            chapterReward?.let { add("章节奖励：${buildRewardSummary(it)}") }
        }.joinToString("\n")
        return "$headline\n$detail"
    }

    private fun normalizeGameName(name: String): String =
        name.trim().replace("\\s+".toRegex(), "").lowercase()

    private fun resolveTaskGameBinding(
        chapterId: String,
        chapterIndex: Int,
        slotIndex: Int,
        taskSpec: com.example.gameboxone.data.model.AdventureTaskSpec,
        games: List<GameConfigItem>
    ): GameConfigItem? {
        games.firstOrNull { taskSpec.gameId.isNotBlank() && it.gameId == taskSpec.gameId }?.let {
            return it
        }

        val normalizedTaskName = normalizeGameName(taskSpec.gameName)
        if (normalizedTaskName.isNotBlank()) {
            games.firstOrNull { normalizeGameName(it.name) == normalizedTaskName }?.let {
                return it
            }
        }

        val offsetCandidate = games.getOrNull(chapterIndex * 10 + slotIndex)
        if (offsetCandidate != null) {
            Log.w(
                TAG,
                "章节 $chapterId 任务 ${taskSpec.taskId} 未匹配到 gameId=${taskSpec.gameId}，回退使用槽位绑定 ${offsetCandidate.gameId}"
            )
        }
        return offsetCandidate
    }

    // Hardcoded fallback in case the JSON fails entirely
    private val hardcodedLevelMetas = listOf(
        AdventureLevelMeta(1,  "探索者", "chapter_01", "第一章·初入历练场",  "Lv.2 行旅者"),
        AdventureLevelMeta(2,  "行旅者", "chapter_02", "第二章·踏上旅途",   "Lv.3 闯关者"),
        AdventureLevelMeta(3,  "闯关者", "chapter_03", "第三章·挑战成形",   "Lv.4 御风者"),
        AdventureLevelMeta(4,  "御风者", "chapter_04", "第四章·节奏掌控",   "Lv.5 破境者"),
        AdventureLevelMeta(5,  "破境者", "chapter_05", "第五章·中期突破",   "Lv.6 星辉者"),
        AdventureLevelMeta(6,  "星辉者", "chapter_06", "第六章·形成习惯",   "Lv.7 统御者"),
        AdventureLevelMeta(7,  "统御者", "chapter_07", "第七章·多线掌控",   "Lv.8 归真者"),
        AdventureLevelMeta(8,  "归真者", "chapter_08", "第八章·高阶回合",   "Lv.9 问道者"),
        AdventureLevelMeta(9,  "问道者", "chapter_09", "第九章·终局前夜",   "Lv.10 合道者"),
        AdventureLevelMeta(10, "合道者", "chapter_10", "第十章·合道终章",   "终局荣誉挑战")
    )

    // ─── Public API ──────────────────────────────────────────────────────────

    /**
     * 返回指定 taskId 的原始任务数据（定义 + 进度 + 玩家称号），供任务详情页使用。
     */
    suspend fun getTaskRaw(taskId: String): AdventureTaskRaw? = withContext(Dispatchers.IO) {
        try {
            ensureProfile()
            val profile = dao.getProfile() ?: return@withContext null
            val levelMetas = buildLevelMetas()
            val playerTitle = levelMetas.firstOrNull { it.level == profile.currentLevel }?.title ?: "探索者"
            val def = dao.getTaskDefinitionById(taskId) ?: return@withContext null
            val progress = dao.getProgressByTaskId(taskId)
            AdventureTaskRaw(definition = def, progress = progress, playerTitle = playerTitle)
        } catch (e: Exception) {
            Log.e(TAG, "getTaskRaw failed for $taskId", e)
            null
        }
    }

    /**
     * 返回当前章节中与指定 gameId 关联的第一个任务 UI 模型。
     * 供 GameDetailScreen 展示"当前历练挑战"上下文。
     */
    suspend fun getTaskForGame(gameId: String): AdventureTaskUiModel? = withContext(Dispatchers.IO) {
        try {
            ensureProfile()
            val profile = dao.getProfile() ?: return@withContext null
            val def = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
                .firstOrNull { it.gameId == gameId } ?: return@withContext null
            val progress = dao.getProgressByTaskId(def.taskId)
            val taskType = parseTaskType(def.taskType)
            val status = parseTaskStatus(progress?.status)
            val taskRewardPackage = resolveTaskRewardPackage(def)
            val progressText = when (taskType) {
                AdventureTaskType.SCORE -> "当前最高 ${progress?.currentScore ?: 0} 分"
                AdventureTaskType.STAGE -> "当前第 ${progress?.currentStage ?: 0} 关"
                AdventureTaskType.CLEAR -> "已通关 ${progress?.clearCount ?: 0} 次"
                AdventureTaskType.ELITE -> "${progress?.currentScore ?: 0} 分 / 通关 ${progress?.clearCount ?: 0} 次"
                AdventureTaskType.START -> "已启动 ${progress?.startCount ?: 0} 次"
                AdventureTaskType.TIME -> "已累计 ${formatDuration(progress?.totalPlaySeconds ?: 0)}"
                AdventureTaskType.EXIT -> "已完成 ${progress?.exitCount ?: 0} 次结算"
            }
            AdventureTaskUiModel(
                taskId = def.taskId,
                gameId = def.gameId,
                game = null,
                gameName = def.taskTitle,
                taskTitle = def.taskTitle,
                taskDescription = def.taskDescription,
                targetText = targetText(taskType, def.targetValue),
                progressText = progressText,
                rewardText = buildTaskRewardDisplayText(def.rewardExp, def.rewardCoins, taskRewardPackage),
                status = status,
                statusLabel = statusLabel(status),
                isRecommended = false
            )
        } catch (e: Exception) {
            Log.e(TAG, "getTaskForGame failed for $gameId", e)
            null
        }
    }

    /**
     * 返回章节入口任务，优先选择待领奖 / 进行中 / 可挑战任务，供地图页点击跳转。
     */
    suspend fun getChapterEntryTaskId(chapterId: String): String? = withContext(Dispatchers.IO) {
        try {
            ensureProfile()
            val cachedGames = database.gameConfigDao().getAll()
            ensureChapterSeed(chapterId, cachedGames)
            val definitions = dao.getTaskDefinitionsByChapter(chapterId)
            if (definitions.isEmpty()) return@withContext null
            val progressByTaskId = dao.getTaskProgressByChapter(chapterId).associateBy { it.taskId }
            definitions.minByOrNull { def ->
                when (parseTaskStatus(progressByTaskId[def.taskId]?.status)) {
                    AdventureTaskStatus.ACHIEVED -> 0
                    AdventureTaskStatus.IN_PROGRESS -> 1
                    AdventureTaskStatus.AVAILABLE -> 2
                    AdventureTaskStatus.CLAIMED, AdventureTaskStatus.COMPLETED -> 3
                    AdventureTaskStatus.LOCKED -> 4
                }
            }?.taskId
        } catch (e: Exception) {
            Log.e(TAG, "getChapterEntryTaskId failed for $chapterId", e)
            null
        }
    }

    suspend fun ensureInitialized(games: List<GameConfigItem>) = withContext(Dispatchers.IO) {
        ensureProfile()
        val profile = dao.getProfile() ?: return@withContext
        ensureChapterSeed(profile.currentChapterId, games)
    }

    suspend fun loadHomeUiState(games: List<GameConfigItem>): AdventureHomeUiState = withContext(Dispatchers.IO) {
        ensureInitialized(games)

        val profile = dao.getProfile() ?: return@withContext AdventureHomeUiState(
            emptyMessage = "历练档案初始化失败，请稍后重试"
        )

        val levelMetas = buildLevelMetas()
        val currentMeta = levelMetas.firstOrNull { it.level == profile.currentLevel } ?: levelMetas.first()
        val definitions = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
        val progressByTask = dao.getTaskProgressByChapter(profile.currentChapterId).associateBy { it.taskId }
        val gameById = games.associateBy { it.gameId }
        val cachedHome = loadCachedHomeResponse(profile.currentChapterId)
        val config = loadAdventureConfig()
        val homeChapter = cachedHome?.currentChapter
            ?.takeIf { it.chapterId.isBlank() || it.chapterId == profile.currentChapterId }
        val levelSpec = config.levels.firstOrNull { it.level == profile.currentLevel }

        if (definitions.isEmpty()) {
            return@withContext AdventureHomeUiState(
                isInitialized = true,
                localPlayerName = profile.localPlayerName,
                currentLevel = profile.currentLevel,
                currentTitle = currentMeta.title,
                currentChapterId = currentMeta.chapterId,
                currentChapterTitle = homeChapter?.chapterTitle?.ifBlank { currentMeta.chapterTitle } ?: currentMeta.chapterTitle,
                totalExp = profile.totalExp,
                totalCoins = profile.totalCoins,
                nextLevelPreview = cachedHome?.nextLevelPreview?.let { "Lv.${it.level} ${it.title}" }
                    ?.takeIf { it.isNotBlank() }
                    ?: currentMeta.nextLevelPreview,
                emptyMessage = if (games.isEmpty()) {
                    "正在准备游戏列表与历练任务，请稍后刷新。"
                } else {
                    "当前章节暂未生成可挑战任务，请稍后重试。"
                }
            )
        }

        val taskCards = definitions.map { def ->
            val progress = progressByTask[def.taskId]
            val taskType = parseTaskType(def.taskType)
            val status = parseTaskStatus(progress?.status)
            val game = gameById[def.gameId]
            val taskRewardPackage = resolveTaskRewardPackage(def)
            val progressText = when (taskType) {
                AdventureTaskType.SCORE -> "当前最高 ${progress?.currentScore ?: 0} 分"
                AdventureTaskType.STAGE -> "当前最高第 ${progress?.currentStage ?: 0} 关"
                AdventureTaskType.CLEAR -> "已通关 ${progress?.clearCount ?: 0} 次"
                AdventureTaskType.ELITE -> {
                    val score = progress?.currentScore ?: 0
                    val clear = progress?.clearCount ?: 0
                    "当前 ${score} 分 / 通关 ${clear} 次"
                }
                AdventureTaskType.START -> "已启动 ${progress?.startCount ?: 0} 次"
                AdventureTaskType.TIME -> "已累计 ${formatDuration(progress?.totalPlaySeconds ?: 0)}"
                AdventureTaskType.EXIT -> "已完成 ${progress?.exitCount ?: 0} 次结算"
            }

            AdventureTaskUiModel(
                taskId = def.taskId,
                gameId = def.gameId,
                game = game,
                gameName = game?.name ?: def.taskTitle.removePrefix("挑战 ").ifBlank { "挑战游戏" },
                taskTitle = def.taskTitle,
                taskDescription = def.taskDescription,
                targetText = targetText(taskType, def.targetValue),
                progressText = progressText,
                rewardText = buildTaskRewardDisplayText(def.rewardExp, def.rewardCoins, taskRewardPackage),
                status = status,
                statusLabel = statusLabel(status),
                isRecommended = false
            )
        }

        val recommendedTaskIds = cachedHome?.recommendedTaskIds
            ?.filter { taskId -> taskCards.any { it.taskId == taskId } }
            ?.takeIf { it.isNotEmpty() }
            ?: config.homeRecommend?.fallbackTaskIds
                ?.filter { taskId -> taskCards.any { it.taskId == taskId } }
                ?.takeIf { it.isNotEmpty() }
            ?.toSet()
            ?: taskCards
                .sortedWith(
                    compareBy<AdventureTaskUiModel> {
                        when (it.status) {
                            AdventureTaskStatus.ACHIEVED -> 0
                            AdventureTaskStatus.IN_PROGRESS -> 1
                            AdventureTaskStatus.AVAILABLE -> 2
                            AdventureTaskStatus.LOCKED -> 3
                            AdventureTaskStatus.CLAIMED, AdventureTaskStatus.COMPLETED -> 4
                        }
                    }.thenBy { it.taskId }
                )
                .take(3)
                .map { it.taskId }
                .toSet()

        val finalTasks = taskCards.map { it.copy(isRecommended = recommendedTaskIds.contains(it.taskId)) }
        val completedCount = finalTasks.count {
            it.status == AdventureTaskStatus.CLAIMED || it.status == AdventureTaskStatus.COMPLETED
        }
        val achievedCount = finalTasks.count { it.status == AdventureTaskStatus.ACHIEVED }
        val recentActivities = buildRecentActivities(finalTasks, currentMeta)
        val requiredTaskCount = homeChapter?.requiredTaskCount?.takeIf { it > 0 }
            ?: resolveChapterSpec(profile.currentChapterId)?.requiredTaskCount
            ?: 7
        val completedClearTaskCount = definitions.count { def ->
            parseTaskType(def.taskType) == AdventureTaskType.CLEAR &&
                parseTaskStatus(progressByTask[def.taskId]?.status) in listOf(
                    AdventureTaskStatus.CLAIMED,
                    AdventureTaskStatus.COMPLETED
                )
        }
        val completedEliteTaskCount = definitions.count { def ->
            parseTaskType(def.taskType) == AdventureTaskType.ELITE &&
                parseTaskStatus(progressByTask[def.taskId]?.status) in listOf(
                    AdventureTaskStatus.CLAIMED,
                    AdventureTaskStatus.COMPLETED
                )
        }
        val requiredClearTaskCount = levelSpec?.requireClearTaskCount ?: 0
        val requiredEliteTaskCount = levelSpec?.requireEliteTaskCount ?: 0
        val upgradeReady = completedCount >= requiredTaskCount &&
            completedClearTaskCount >= requiredClearTaskCount &&
            completedEliteTaskCount >= requiredEliteTaskCount

        val emptyMessage = when {
            games.isEmpty() -> "游戏列表尚未准备完成，请先刷新资源后再开始挑战。"
            finalTasks.isEmpty() -> "当前章节暂时没有可展示的任务。"
            finalTasks.none { it.status == AdventureTaskStatus.ACHIEVED || it.status == AdventureTaskStatus.IN_PROGRESS } ->
                "新手提示：先从任意一个可挑战任务开始，完成后这里会出现领奖与推荐提醒。"
            else -> null
        }

        AdventureHomeUiState(
            isInitialized = true,
            localPlayerName = profile.localPlayerName,
            currentLevel = profile.currentLevel,
            currentTitle = currentMeta.title,
            currentChapterId = currentMeta.chapterId,
            currentChapterTitle = homeChapter?.chapterTitle?.ifBlank { currentMeta.chapterTitle } ?: currentMeta.chapterTitle,
            totalExp = profile.totalExp,
            totalCoins = profile.totalCoins,
            totalTaskCount = finalTasks.size,
            completedTaskCount = completedCount,
            achievedTaskCount = achievedCount,
            requiredTaskCount = requiredTaskCount,
            completedClearTaskCount = completedClearTaskCount,
            requiredClearTaskCount = requiredClearTaskCount,
            completedEliteTaskCount = completedEliteTaskCount,
            requiredEliteTaskCount = requiredEliteTaskCount,
            upgradeReady = upgradeReady,
            recommendedTasks = finalTasks.filter { it.isRecommended },
            chapterTasks = finalTasks,
            recentActivities = recentActivities,
            nextLevelPreview = cachedHome?.nextLevelPreview?.let { "Lv.${it.level} ${it.title}" }
                ?.takeIf { it.isNotBlank() }
                ?: currentMeta.nextLevelPreview,
            emptyMessage = emptyMessage
        )
    }

    /**
     * 领取任务奖励：将任务状态改为 CLAIMED，并将经验/金币添加到玩家档案
     */
    suspend fun claimTaskReward(taskId: String): AdventureTaskClaimResult = withContext(Dispatchers.IO) {
        try {
            val progress = dao.getProgressByTaskId(taskId)
                ?: return@withContext AdventureTaskClaimResult(taskId = taskId)
            if (progress.status != AdventureTaskStatus.ACHIEVED.name) {
                return@withContext AdventureTaskClaimResult(taskId = taskId)
            }

            val def = dao.getTaskDefinitionById(taskId)
                ?: return@withContext AdventureTaskClaimResult(taskId = taskId)
            val taskRewardPackage = resolveTaskRewardPackage(def)
            val rewardGrant = taskRewardPackage?.toGrant(
                expOverride = def.rewardExp.toLong(),
                coinsOverride = def.rewardCoins.toLong()
            ) ?: AdventureRewardGrant(
                exp = def.rewardExp.toLong(),
                coins = def.rewardCoins.toLong()
            )

            dao.upsertSingleTaskProgress(
                progress.copy(status = AdventureTaskStatus.CLAIMED.name, claimedAt = System.currentTimeMillis())
            )

            val profile = dao.getProfile() ?: return@withContext AdventureTaskClaimResult(taskId = taskId)
            val expGain = rewardGrant.exp
            val coinsGain = rewardGrant.coins
            val updatedProfile = profile.copy(
                totalExp = profile.totalExp + expGain,
                totalCoins = profile.totalCoins + coinsGain,
                updatedAt = System.currentTimeMillis()
            )

            dao.upsertProfile(updatedProfile)
            Log.d(TAG, "任务 $taskId 奖励领取：+$expGain EXP, +$coinsGain 金币")
            analyticsManager.track(
                AnalyticsEventNames.TASK_REWARD_CLAIMED,
                mapOf(
                    "task_id" to taskId,
                    "chapter_id" to def.chapterId,
                    "exp" to expGain,
                    "coins" to coinsGain,
                    "reward_package_id" to rewardGrant.rewardPackageId
                )
            )
            AdventureTaskClaimResult(
                success = true,
                taskId = taskId,
                reward = rewardGrant,
                newTotalExp = updatedProfile.totalExp,
                newTotalCoins = updatedProfile.totalCoins,
                displayMessage = buildTaskClaimMessage(def.taskTitle, rewardGrant)
            )
        } catch (e: Exception) {
            Log.e(TAG, "领取任务奖励失败", e)
            AdventureTaskClaimResult(taskId = taskId)
        }
    }

    /**
     * 模拟玩一次游戏（demo 模式）
     */
    suspend fun simulatePlay(taskId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val progress = dao.getProgressByTaskId(taskId) ?: return@withContext false
            val chapterId = progress.chapterId
            val def = dao.getTaskDefinitionsByChapter(chapterId).firstOrNull { it.taskId == taskId }
                ?: return@withContext false

            if (progress.status == AdventureTaskStatus.CLAIMED.name ||
                progress.status == AdventureTaskStatus.COMPLETED.name) return@withContext false

            val taskType = parseTaskType(def.taskType)
            val target = def.targetValue

            val roll = (0.6f + Math.random().toFloat() * 0.6f)
            val newScore = (progress.currentScore + (target * roll).toInt()).coerceAtLeast(0)
            val newStage = (progress.currentStage + (1 + (Math.random() * 2).toInt())).coerceAtLeast(0)
            val newClear = progress.clearCount + if (taskType == AdventureTaskType.CLEAR ||
                taskType == AdventureTaskType.ELITE) 1 else 0
            val newStartCount = if (taskType == AdventureTaskType.START) progress.startCount + 1 else progress.startCount
            val newPlaySeconds = if (taskType == AdventureTaskType.TIME) {
                progress.totalPlaySeconds + (target * roll).toInt()
            } else progress.totalPlaySeconds
            val newExitCount = if (taskType == AdventureTaskType.EXIT) progress.exitCount + 1 else progress.exitCount

            val achieved = when (taskType) {
                AdventureTaskType.SCORE -> newScore >= target
                AdventureTaskType.STAGE -> newStage >= target
                AdventureTaskType.CLEAR -> newClear >= target
                AdventureTaskType.ELITE -> newScore >= target || newClear >= 1
                AdventureTaskType.START -> newStartCount >= target
                AdventureTaskType.TIME -> newPlaySeconds >= target
                AdventureTaskType.EXIT -> newExitCount >= target
            }

            val newStatus = when {
                achieved -> AdventureTaskStatus.ACHIEVED.name
                newScore > 0 || newStage > 0 || newClear > 0 ||
                    newStartCount > 0 || newPlaySeconds > 0 || newExitCount > 0 ->
                    AdventureTaskStatus.IN_PROGRESS.name
                else -> AdventureTaskStatus.AVAILABLE.name
            }

            dao.upsertSingleTaskProgress(
                progress.copy(
                    status = newStatus,
                    currentScore = newScore,
                    currentStage = newStage,
                    clearCount = newClear,
                    startCount = newStartCount,
                    totalPlaySeconds = newPlaySeconds,
                    exitCount = newExitCount,
                    achievedAt = if (achieved) System.currentTimeMillis() else progress.achievedAt,
                    updatedAt = System.currentTimeMillis()
                )
            )
            Log.d(
                TAG,
                "模拟游玩 $taskId: score=$newScore, stage=$newStage, clear=$newClear, start=$newStartCount, time=$newPlaySeconds, exit=$newExitCount, achieved=$achieved"
            )
            achieved
        } catch (e: Exception) {
            Log.e(TAG, "模拟游玩失败", e)
            false
        }
    }

    /**
     * 尝试升级：检查是否达到升级条件，是则推进到下一章节/等级
     */
    suspend fun tryLevelUp(): AdventureLevelUpResult = withContext(Dispatchers.IO) {
        try {
            val profile = dao.getProfile() ?: return@withContext AdventureLevelUpResult()
            val levelMetas = buildLevelMetas()
            val currentMeta = levelMetas.firstOrNull { it.chapterId == profile.currentChapterId }
                ?: return@withContext AdventureLevelUpResult()

            // Check upgrade conditions from config
            val config = loadAdventureConfig()
            val levelSpec = config.levels.firstOrNull { it.level == currentMeta.level }
            val requiredCount = levelSpec?.upgradeTaskCount ?: 7
            val completedCount = dao.getCompletedCountByChapter(profile.currentChapterId)
            val currentDefinitions = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
            val currentProgress = dao.getTaskProgressByChapter(profile.currentChapterId).associateBy { it.taskId }
            val completedClearTaskCount = currentDefinitions.count { def ->
                parseTaskType(def.taskType) == AdventureTaskType.CLEAR &&
                    parseTaskStatus(currentProgress[def.taskId]?.status) in listOf(
                        AdventureTaskStatus.CLAIMED,
                        AdventureTaskStatus.COMPLETED
                    )
            }
            val completedEliteTaskCount = currentDefinitions.count { def ->
                parseTaskType(def.taskType) == AdventureTaskType.ELITE &&
                    parseTaskStatus(currentProgress[def.taskId]?.status) in listOf(
                        AdventureTaskStatus.CLAIMED,
                        AdventureTaskStatus.COMPLETED
                    )
            }
            val requiredClearTaskCount = levelSpec?.requireClearTaskCount ?: 0
            val requiredEliteTaskCount = levelSpec?.requireEliteTaskCount ?: 0
            if (
                completedCount < requiredCount ||
                completedClearTaskCount < requiredClearTaskCount ||
                completedEliteTaskCount < requiredEliteTaskCount
            ) {
                return@withContext AdventureLevelUpResult()
            }

            val nextMeta = levelMetas.firstOrNull { it.level == currentMeta.level + 1 }
                ?: return@withContext AdventureLevelUpResult() // Already max level

            val levelReward = resolveLevelRewardPackage(
                currentLevel = currentMeta.level,
                levelRewardExp = levelSpec?.rewardExp ?: 0,
                levelRewardCoins = levelSpec?.rewardCoins ?: 0,
                nextTitle = nextMeta.title
            )?.toGrant() ?: AdventureRewardGrant(
                exp = (levelSpec?.rewardExp ?: 0).toLong(),
                coins = (levelSpec?.rewardCoins ?: 0).toLong()
            )
            val chapterReward = resolveChapterRewardPackage(profile.currentChapterId)?.toGrant()
            val totalExpGain = levelReward.exp + (chapterReward?.exp ?: 0L)
            val totalCoinsGain = levelReward.coins + (chapterReward?.coins ?: 0L)
            val updatedProfile = profile.copy(
                currentLevel = nextMeta.level,
                currentChapterId = nextMeta.chapterId,
                totalExp = profile.totalExp + totalExpGain,
                totalCoins = profile.totalCoins + totalCoinsGain,
                updatedAt = System.currentTimeMillis()
            )

            dao.upsertProfile(updatedProfile)
            Log.d(TAG, "升级成功：Lv.${currentMeta.level} → Lv.${nextMeta.level} (${nextMeta.chapterTitle})")
            analyticsManager.track(
                AnalyticsEventNames.LEVEL_UP,
                mapOf(
                    "from_level" to currentMeta.level,
                    "to_level" to nextMeta.level,
                    "chapter_id" to nextMeta.chapterId,
                    "level_reward_package_id" to levelReward.rewardPackageId,
                    "chapter_reward_package_id" to chapterReward?.rewardPackageId
                )
            )
            AdventureLevelUpResult(
                success = true,
                fromLevel = currentMeta.level,
                toLevel = nextMeta.level,
                newChapterId = nextMeta.chapterId,
                newChapterTitle = nextMeta.chapterTitle,
                chapterReward = chapterReward,
                levelReward = levelReward,
                displayMessage = buildLevelUpMessage(nextMeta.chapterTitle, levelReward, chapterReward)
            )
        } catch (e: Exception) {
            Log.e(TAG, "升级失败", e)
            AdventureLevelUpResult()
        }
    }

    /**
     * 加载章节地图（Lv.1 ~ Lv.10）
     */
    suspend fun loadChapterMap(): List<ChapterMapNode> = withContext(Dispatchers.IO) {
        val profile = dao.getProfile()
        val currentLevel = profile?.currentLevel ?: 1
        val levelMetas = buildLevelMetas()

        levelMetas.map { meta ->
            val state = when {
                meta.level < currentLevel -> ChapterNodeState.COMPLETED
                meta.level == currentLevel -> ChapterNodeState.CURRENT
                else -> ChapterNodeState.LOCKED
            }
            val (done, total) = if (state != ChapterNodeState.LOCKED) {
                val tasks = dao.getTaskProgressByChapter(meta.chapterId)
                val completed = tasks.count { it.status in listOf("CLAIMED", "COMPLETED") }
                Pair(completed, tasks.size.coerceAtLeast(10))
            } else {
                Pair(0, 10)
            }
            ChapterMapNode(
                level = meta.level,
                title = meta.title,
                chapterId = meta.chapterId,
                chapterTitle = meta.chapterTitle,
                state = state,
                completedTasks = done,
                totalTasks = total,
                nextLevelPreview = meta.nextLevelPreview
            )
        }
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private suspend fun ensureProfile() {
        val existing = dao.getProfile()
        if (existing != null) return

        val now = System.currentTimeMillis()
        val suffix = UUID.randomUUID().toString().take(6).uppercase()
        dao.upsertProfile(
            LocalAdventureProfileEntity(
                localPlayerId = UUID.randomUUID().toString(),
                localPlayerName = "旅人$suffix",
                currentLevel = 1,
                currentChapterId = "chapter_01",
                totalExp = 0L,
                totalCoins = 120L,
                updatedAt = now
            )
        )
        Log.d(TAG, "已初始化本地历练档案")
    }

    /**
     * P0 Fix: 按章节按需播种任务定义 —— 不依赖全局计数，支持所有 10 个章节。
     * 若该章节已有定义则跳过；否则从 adventure_config.json 读取并写入数据库。
     */
    private suspend fun ensureChapterSeed(chapterId: String, games: List<GameConfigItem>) {
        val config = loadAdventureConfig()
        val chapterSpec = resolveChapterSpec(chapterId)
        if (chapterSpec == null) {
            Log.w(TAG, "adventure_config.json 中找不到章节: $chapterId，无法播种任务")
            return
        }

        val now = System.currentTimeMillis()
        val existingProgressByTaskId = dao.getTaskProgressByChapter(chapterId).associateBy { it.taskId }
        val chapterIndex = config.chapters.indexOfFirst { it.chapterId == chapterId }.coerceAtLeast(0)

        val definitions = chapterSpec.tasks.mapIndexed { slotIdx, taskSpec ->
            val realGame = resolveTaskGameBinding(chapterId, chapterIndex, slotIdx, taskSpec, games)
            val gameId = realGame?.gameId ?: taskSpec.gameId
            LocalAdventureTaskDefinitionEntity(
                taskId = taskSpec.taskId,
                chapterId = chapterId,
                level = chapterSpec.level,
                slotNo = taskSpec.slotNo,
                gameId = gameId,
                taskType = taskSpec.taskType,
                targetValue = taskSpec.targetValue,
                taskTitle = taskSpec.taskTitle.ifBlank {
                    if (realGame != null) "挑战 ${realGame.name}"
                    else "挑战 ${taskSpec.gameName.ifBlank { "挑战游戏" }}"
                },
                taskDescription = taskSpec.taskDescription,
                rewardExp = taskSpec.rewardExp,
                rewardCoins = taskSpec.rewardCoins,
                isRequiredForUpgrade = taskSpec.isRequiredForUpgrade
            )
        }

        val progress = definitions.map {
            existingProgressByTaskId[it.taskId]?.copy(
                chapterId = it.chapterId,
                gameId = it.gameId,
                updatedAt = now
            ) ?: LocalAdventureTaskProgressEntity(
                taskId = it.taskId,
                chapterId = it.chapterId,
                gameId = it.gameId,
                status = AdventureTaskStatus.AVAILABLE.name,
                currentScore = 0,
                currentStage = 0,
                clearCount = 0,
                startCount = 0,
                totalPlaySeconds = 0,
                exitCount = 0,
                achievedAt = null,
                claimedAt = null,
                updatedAt = now
            )
        }

        dao.upsertTaskDefinitions(definitions)
        dao.upsertTaskProgress(progress)
        Log.d(TAG, "已播种章节 $chapterId 任务: ${definitions.size} 个 (chapterIndex=$chapterIndex, 可用 ${games.size} 个)")
    }

    // ─── Utility ─────────────────────────────────────────────────────────────

    private fun parseTaskType(value: String?): AdventureTaskType =
        runCatching { AdventureTaskType.valueOf(value.orEmpty()) }.getOrDefault(AdventureTaskType.SCORE)

    private fun parseTaskStatus(value: String?): AdventureTaskStatus =
        runCatching { AdventureTaskStatus.valueOf(value.orEmpty()) }.getOrDefault(AdventureTaskStatus.AVAILABLE)

    private fun targetText(type: AdventureTaskType, targetValue: Int): String = when (type) {
        AdventureTaskType.SCORE -> "目标：达到 ${targetValue} 分"
        AdventureTaskType.STAGE -> "目标：到达第 ${targetValue} 关"
        AdventureTaskType.CLEAR -> "目标：完成 ${targetValue} 次通关"
        AdventureTaskType.ELITE -> "目标：达成 ${targetValue} 分或完成通关"
        AdventureTaskType.START -> "目标：启动游戏 ${targetValue} 次"
        AdventureTaskType.TIME -> "目标：累计游玩 ${formatDuration(targetValue)}"
        AdventureTaskType.EXIT -> "目标：完成 ${targetValue} 次结算"
    }

    private fun statusLabel(status: AdventureTaskStatus): String = when (status) {
        AdventureTaskStatus.LOCKED -> "未解锁"
        AdventureTaskStatus.AVAILABLE -> "可挑战"
        AdventureTaskStatus.IN_PROGRESS -> "进行中"
        AdventureTaskStatus.ACHIEVED -> "待领奖"
        AdventureTaskStatus.CLAIMED -> "已领奖"
        AdventureTaskStatus.COMPLETED -> "已完成"
    }

    private fun buildRecentActivities(
        tasks: List<AdventureTaskUiModel>,
        meta: AdventureLevelMeta
    ): List<String> {
        val activities = mutableListOf<String>()
        if (tasks.isEmpty()) {
            activities += "${meta.chapterTitle} 正在准备中，稍后回来即可继续历练。"
            return activities
        }
        if (tasks.none { it.status == AdventureTaskStatus.CLAIMED || it.status == AdventureTaskStatus.COMPLETED }) {
            activities += "欢迎来到${meta.chapterTitle}，先完成任务即可晋级。"
        }
        tasks.filter { it.status == AdventureTaskStatus.ACHIEVED }
            .take(2)
            .forEach { activities += "${it.gameName} 已达成目标，可立即领奖。" }
        tasks.filter { it.status == AdventureTaskStatus.CLAIMED || it.status == AdventureTaskStatus.COMPLETED }
            .take(2)
            .forEach { activities += "已完成：${it.gameName} 挑战。" }
        return activities.take(3)
    }

    private fun formatDuration(seconds: Int): String {
        if (seconds <= 0) return "0 秒"
        val minutes = seconds / 60
        val remainSeconds = seconds % 60
        return when {
            minutes <= 0 -> "${seconds} 秒"
            remainSeconds == 0 -> "${minutes} 分钟"
            else -> "${minutes} 分 ${remainSeconds} 秒"
        }
    }

    /** 内联保底配置：仅在 assets 文件解析完全失败时使用 */
    private fun buildFallbackConfig(): AdventureFullConfig {
        val levels = hardcodedLevelMetas.map { meta ->
            com.example.gameboxone.data.model.AdventureLevelSpec(
                level = meta.level, title = meta.title, chapterId = meta.chapterId,
                upgradeTaskCount = 7, rewardExp = 200 + meta.level * 20,
                rewardCoins = 100 + meta.level * 10, nextLevelPreview = meta.nextLevelPreview
            )
        }
        // Minimal chapter_01 fallback tasks
        // ⚠️ 测试模式保底：targetValue 全部为 1，便于快速验证流程
        val chapterOneTasks = listOf(
            Triple("SCORE", 1, "达到 1 分"),    Triple("STAGE", 1, "到达第 1 关"),
            Triple("CLEAR", 1, "完成 1 次通关"), Triple("SCORE", 1, "达到 1 分"),
            Triple("STAGE", 1, "到达第 1 关"),  Triple("SCORE", 1, "达到 1 分"),
            Triple("CLEAR", 1, "完成 1 次通关"), Triple("STAGE", 1, "到达第 1 关"),
            Triple("SCORE", 1, "达到 1 分"),    Triple("ELITE", 1, "达到 1 分或完成通关")
        ).mapIndexed { i, t ->
            com.example.gameboxone.data.model.AdventureTaskSpec(
                taskId = "T${(i + 1).toString().padStart(3, '0')}",
                slotNo = i + 1, gameId = "G0${(i + 1).toString().padStart(3, '0')}",
                gameName = listOf("像素冒险","弹球传说","太空侵略","节奏达人","方块消消乐",
                    "跑酷无极限","数字 2048","贪吃蛇","华容道","英雄对决").getOrElse(i) { "挑战游戏${i+1}" },
                taskType = t.first, targetValue = t.second, taskTitle = "初试牛刀 ${i+1}",
                taskDescription = t.third, rewardExp = 40 + i * 5, rewardCoins = 12 + i * 3,
                isRequiredForUpgrade = i < 7
            )
        }
        val chapters = listOf(
            AdventureChapterSpec(
                chapterId = "chapter_01", level = 1, chapterTitle = "第一章·初入历练场",
                requiredTaskCount = 7, tasks = chapterOneTasks
            )
        )
        return AdventureFullConfig(levels = levels, chapters = chapters)
    }
}
