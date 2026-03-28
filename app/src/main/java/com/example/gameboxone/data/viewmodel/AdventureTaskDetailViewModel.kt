package com.example.gameboxone.data.viewmodel

import com.example.gameboxone.AppLog as Log
import android.content.Context
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.viewModelScope
import com.example.gameboxone.WebViewActivity
import com.example.gameboxone.data.model.AdventureTaskStatus
import com.example.gameboxone.data.model.AdventureTaskType
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.TaskStageUiModel
import com.example.gameboxone.data.state.AdventureTaskDetailState
import com.example.gameboxone.data.state.GameResourceState
import com.example.gameboxone.event.GameEvent
import com.example.gameboxone.manager.DataManager
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.LocalAdventureManager
import com.example.gameboxone.manager.MyGameManager
import com.example.gameboxone.manager.ResourceManager
import com.example.gameboxone.navigation.NavigationEvent
import com.example.gameboxone.observability.AnalyticsEventNames
import com.example.gameboxone.observability.AnalyticsManager
import com.example.gameboxone.service.MessageService
import com.example.gameboxone.base.UiMessage
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import kotlin.math.sqrt

@HiltViewModel
class AdventureTaskDetailViewModel @Inject constructor(
    private val dataManager: DataManager,
    private val localAdventureManager: LocalAdventureManager,
    private val resourceManager: ResourceManager,
    private val myGameManager: MyGameManager,
    eventManager: EventManager,
    private val analyticsManager: AnalyticsManager,
    private val messageService: MessageService,
    @ApplicationContext private val context: Context,
    savedStateHandle: SavedStateHandle
) : GameViewModel(eventManager) {

    val taskId: String = checkNotNull(savedStateHandle["taskId"]) { "taskId 不能为空" }

    override val _state = MutableStateFlow(AdventureTaskDetailState())
    val state: StateFlow<AdventureTaskDetailState> = _state.asStateFlow()

    init {
        loadTaskDetail()
    }

    fun loadTaskDetail() {
        viewModelScope.launch {
            try {
                setLoading(true)
                runCatching { dataManager.syncAdventureConfigIfNeeded(force = false) }
                    .onFailure { Log.w(TAG, "同步远端历练配置失败，继续使用本地配置", it) }
                val raw = localAdventureManager.getTaskRaw(taskId)
                if (raw == null) {
                    _state.value = _state.value.copy(
                        isLoading = false,
                        error = "找不到任务数据 (taskId=$taskId)"
                    )
                    return@launch
                }

                val def = raw.definition
                val progress = raw.progress
                val taskType = parseTaskType(def.taskType)
                val currentProgress = when (taskType) {
                    AdventureTaskType.SCORE, AdventureTaskType.ELITE -> progress?.currentScore ?: 0
                    AdventureTaskType.STAGE -> progress?.currentStage ?: 0
                    AdventureTaskType.CLEAR -> progress?.clearCount ?: 0
                    AdventureTaskType.START -> progress?.startCount ?: 0
                    AdventureTaskType.TIME -> progress?.totalPlaySeconds ?: 0
                    AdventureTaskType.EXIT -> progress?.exitCount ?: 0
                }
                val stages = buildStages(
                    taskType = taskType,
                    targetValue = def.targetValue,
                    currentScore = progress?.currentScore ?: 0,
                    currentStage = progress?.currentStage ?: 0,
                    clearCount = progress?.clearCount ?: 0,
                    startCount = progress?.startCount ?: 0,
                    totalPlaySeconds = progress?.totalPlaySeconds ?: 0,
                    exitCount = progress?.exitCount ?: 0
                )
                val status = parseTaskStatus(progress?.status)

                // Load game data
                val game = dataManager.getCachedGameData(def.gameId)

                _state.value = AdventureTaskDetailState(
                    isLoading = false,
                    playerTitle = raw.playerTitle,
                    gameName = game?.name ?: def.taskTitle.removePrefix("挑战 ").ifBlank { "挑战游戏" },
                    gameDescription = game?.description?.ifBlank { null }
                        ?: "一起来挑战这款精彩游戏！",
                    taskType = taskType,
                    targetValue = def.targetValue,
                    currentProgress = currentProgress,
                    status = status,
                    stages = stages,
                    rewardText = "+${def.rewardExp} EXP / +${def.rewardCoins} 金币",
                    taskId = def.taskId,
                    gameId = def.gameId,
                    game = game
                )
                analyticsManager.track(
                    AnalyticsEventNames.TASK_DETAIL_VIEW,
                    mapOf(
                        "task_id" to def.taskId,
                        "game_id" to def.gameId,
                        "task_type" to taskType.name,
                        "status" to status.name
                    )
                )

                Log.d(TAG, "任务详情加载完成: taskId=$taskId, game=${game?.name}, stages=${stages.size}")
            } catch (e: Exception) {
                Log.e(TAG, "加载任务详情失败", e)
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    /** 点击"开始冒险" */
    fun startAdventure() {
        viewModelScope.launch {
            try {
                val game = _state.value.game
                if (game == null) {
                    // 演示模式：模拟游玩
                    val achieved = localAdventureManager.simulatePlay(taskId)
                    // 重新加载状态
                    loadTaskDetail()
                    if (achieved) {
                        messageService.showMessage(UiMessage.Success(message = "任务达成！🎉 可以在首页领取奖励"))
                    } else {
                        messageService.showMessage(UiMessage.Info(message = "演示模式：继续努力！"))
                    }
                    return@launch
                }

                setLoading(true)
                analyticsManager.track(
                    AnalyticsEventNames.GAME_LAUNCH_CLICK,
                    mapOf(
                        "task_id" to taskId,
                        "game_id" to (game.gameId ?: game.id),
                        "source" to "adventure_task"
                    )
                )
                when (val res = resourceManager.ensureGameResourceAvailable(game)) {
                    is GameResourceState.Available -> {
                        Log.d(TAG, "直接启动: ${game.name}, path=${res.localPath}")
                        WebViewActivity.start(context, res.localPath, game.gameId ?: game.id)
                    }
                    is GameResourceState.LoadingFromBackup -> {
                        setState { copy(isLoading = true, loadingMessage = "正在准备游戏资源…") }
                        myGameManager.installGameFromBackup(game).onSuccess { localPath ->
                            WebViewActivity.start(context, localPath, game.gameId ?: game.id)
                        }.onFailure { e ->
                            Log.w(TAG, "保底安装失败，走下载流程", e)
                            handleNeedDownload(game)
                        }
                    }
                    is GameResourceState.NeedDownload -> handleNeedDownload(game)
                    is GameResourceState.Error -> handleError(res.message)
                    GameResourceState.Loading -> Unit
                }
            } catch (e: Exception) {
                Log.e(TAG, "启动游戏出错", e)
                handleError("启动游戏失败: ${e.message}")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun handleNeedDownload(game: Custom.HotGameData) {
        if (game.downloadUrl.isBlank()) {
            viewModelScope.launch {
                setState { copy(isLoading = true, loadingMessage = "正在从本地资源加载…") }
                myGameManager.installGameFromBackup(game).fold(
                    onSuccess = { path -> WebViewActivity.start(context, path, game.gameId ?: game.id) },
                    onFailure = { e -> handleError("无法加载游戏: ${e.message}") }
                )
                setState { copy(isLoading = false, loadingMessage = null) }
            }
            return
        }
        val info = resourceManager.resolveDownloadInfo(game.downloadUrl, game.gameRes)
        setState {
            copy(
                showDownloadDialog = true,
                downloadInfo = Custom.DownloadInfo(
                    gameName = game.name,
                    downloadUrl = info.downloadUrl,
                    targetPath = info.targetPath
                )
            )
        }
    }

    fun confirmDownload() {
        viewModelScope.launch {
            val game = _state.value.game ?: return@launch
            val dlInfo = _state.value.downloadInfo ?: return@launch
            setState { copy(showDownloadDialog = false, isDownloading = true, downloadProgress = 0f, loadingMessage = "正在下载…") }
            emitGameEvent(GameEvent.GameDownloadStarted(Custom.ToBaseData(game.id, game.name, game.iconUrl)))
            analyticsManager.track(
                AnalyticsEventNames.GAME_DOWNLOAD_START,
                mapOf("game_id" to (game.gameId ?: game.id), "source" to "adventure_task")
            )
            val myGame = Custom.MyGameData(
                id = game.id, gameId = game.gameId, name = game.name, iconUrl = game.iconUrl,
                gameRes = game.gameRes, rating = game.rating, patch = game.patch,
                description = game.description, downloadUrl = dlInfo.downloadUrl,
                isLocal = false, localPath = "", size = null, hasUpdate = false,
                installTime = System.currentTimeMillis().toString(), lastPlayTime = "0",
                playCount = 0, taskDesc = game.taskDesc, taskPoints = game.taskPoints
            )
            myGameManager.downloadAndInstallGame(myGame, onProgress = { p -> setState { copy(downloadProgress = p) } })
                .fold(
                    onSuccess = { path ->
                        emitGameEvent(GameEvent.GameDownloadCompleted(Custom.ToBaseData(game.id, game.name, game.iconUrl)))
                        analyticsManager.track(
                            AnalyticsEventNames.GAME_DOWNLOAD_SUCCESS,
                            mapOf("game_id" to (game.gameId ?: game.id), "source" to "adventure_task")
                        )
                        WebViewActivity.start(context, path, game.gameId ?: game.id)
                        setState { copy(isDownloading = false, downloadProgress = 0f, loadingMessage = null) }
                    },
                    onFailure = { e ->
                        analyticsManager.track(
                            AnalyticsEventNames.GAME_DOWNLOAD_FAIL,
                            mapOf(
                                "game_id" to (game.gameId ?: game.id),
                                "source" to "adventure_task",
                                "message" to (e.message ?: "unknown")
                            )
                        )
                        handleError("下载失败: ${e.message}")
                        setState { copy(isDownloading = false, downloadProgress = 0f, loadingMessage = null) }
                    }
                )
        }
    }

    fun dismissDownloadDialog() {
        setState { copy(showDownloadDialog = false, downloadInfo = null) }
    }

    fun onBackPressed() {
        viewModelScope.launch {
            eventManager.emitNavigationEvent(NavigationEvent.PopBackStack)
        }
    }

    // ── State helpers ──────────────────────────────────────────────────────

    private fun setState(update: AdventureTaskDetailState.() -> AdventureTaskDetailState) {
        _state.value = update(_state.value)
    }

    // ── Stage calculation ──────────────────────────────────────────────────

    private fun buildStages(
        taskType: AdventureTaskType,
        targetValue: Int,
        currentScore: Int,
        currentStage: Int,
        clearCount: Int,
        startCount: Int,
        totalPlaySeconds: Int,
        exitCount: Int
    ): List<TaskStageUiModel> = when (taskType) {
        AdventureTaskType.SCORE, AdventureTaskType.ELITE -> {
            val milestones = scoreMilestones(targetValue)
            milestones.mapIndexed { i, threshold ->
                val completed = currentScore >= threshold
                val current = !completed && (i == 0 || currentScore >= milestones[i - 1])
                TaskStageUiModel(i + 1, threshold.toString(), threshold, completed, current)
            }
        }
        AdventureTaskType.STAGE -> {
            val count = minOf(targetValue, 4).coerceAtLeast(1)
            (1..count).map { n ->
                val threshold = if (count <= 4) n * (targetValue / count) else n
                val completed = currentStage >= n
                val current = !completed && currentStage == n - 1
                TaskStageUiModel(n, "第${n}关", n, completed, current)
            }
        }
        AdventureTaskType.CLEAR -> {
            val count = minOf(targetValue, 4).coerceAtLeast(1)
            (1..count).map { n ->
                val completed = clearCount >= n
                val current = !completed && clearCount == n - 1
                TaskStageUiModel(n, "${n}次", n, completed, current)
            }
        }
        AdventureTaskType.START -> {
            val count = minOf(targetValue, 4).coerceAtLeast(1)
            (1..count).map { n ->
                val completed = startCount >= n
                val current = !completed && startCount == n - 1
                TaskStageUiModel(n, "启动${n}次", n, completed, current)
            }
        }
        AdventureTaskType.TIME -> {
            val milestones = scoreMilestones(targetValue)
            milestones.mapIndexed { i, threshold ->
                val completed = totalPlaySeconds >= threshold
                val current = !completed && (i == 0 || totalPlaySeconds >= milestones[i - 1])
                TaskStageUiModel(i + 1, formatDuration(threshold), threshold, completed, current)
            }
        }
        AdventureTaskType.EXIT -> {
            val count = minOf(targetValue, 4).coerceAtLeast(1)
            (1..count).map { n ->
                val completed = exitCount >= n
                val current = !completed && exitCount == n - 1
                TaskStageUiModel(n, "结算${n}次", n, completed, current)
            }
        }
    }

    private fun scoreMilestones(target: Int): List<Int> {
        if (target <= 4) return (1..target).toList()
        return listOf(
            maxOf(1, target / 6),
            maxOf(2, target / 3),
            maxOf(3, target * 2 / 3),
            target
        )
    }

    private fun formatDuration(seconds: Int): String {
        if (seconds <= 0) return "0秒"
        val minutes = seconds / 60
        val remainSeconds = seconds % 60
        return when {
            minutes <= 0 -> "${seconds}秒"
            remainSeconds == 0 -> "${minutes}分"
            else -> "${minutes}分${remainSeconds}秒"
        }
    }

    private fun parseTaskType(v: String?): AdventureTaskType =
        runCatching { AdventureTaskType.valueOf(v.orEmpty()) }.getOrDefault(AdventureTaskType.SCORE)

    private fun parseTaskStatus(v: String?): AdventureTaskStatus =
        runCatching { AdventureTaskStatus.valueOf(v.orEmpty()) }.getOrDefault(AdventureTaskStatus.AVAILABLE)

    override fun handleError(message: String, error: Exception?) {
        _error.value = message
        viewModelScope.launch {
            messageService.showMessage(UiMessage.Error(message = message))
        }
        error?.let { Log.e(TAG, message, it) }
    }

    companion object {
        private const val TAG = "AdventureTaskDetailVM"
    }
}

