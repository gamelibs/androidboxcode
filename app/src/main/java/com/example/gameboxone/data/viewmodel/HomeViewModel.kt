package com.example.gameboxone.data.viewmodel

import com.example.gameboxone.AppLog as Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.manager.DataManager
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.IconCacheManager
import com.example.gameboxone.manager.LocalAdventureManager
import com.example.gameboxone.observability.AnalyticsEventNames
import com.example.gameboxone.observability.AnalyticsManager
import com.example.gameboxone.base.UiMessage
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.event.TaskEvent
import com.example.gameboxone.service.MessageService
import com.example.gameboxone.ui.state.HomeScreenState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

import com.example.gameboxone.data.model.ChapterMapNode
import com.example.gameboxone.navigation.NavigationEvent
// ...existing imports...

@HiltViewModel
class HomeViewModel @Inject constructor(
    val iconCacheManager: IconCacheManager,
    private val dataManager: DataManager,
    private val localAdventureManager: LocalAdventureManager,
    private val analyticsManager: AnalyticsManager,
    private val messageService: MessageService,
    private val eventManager: EventManager
) : ViewModel() {
    private val TAG = "HomeViewModel"
    private val _uiState = MutableStateFlow(HomeScreenState())
    val uiState: StateFlow<HomeScreenState> = _uiState.asStateFlow()

    private val _chapterMap = MutableStateFlow<List<ChapterMapNode>>(emptyList())
    val chapterMap: StateFlow<List<ChapterMapNode>> = _chapterMap.asStateFlow()


    init {
        // 注册为活跃订阅者，确保接收所有事件
        eventManager.registerSubscriber()
        
        // 监听 DataManager 的事件流
        viewModelScope.launch {
            dataManager.dataEvents.collect { event ->
                Log.d(TAG, "收到事件: $event")
                when (event) {
                    // 当开始刷新数据时，显示加载动画
                    is DataEvent.RefreshStarted -> {
                        if (!_uiState.value.isSyncing) { // 只有不是手动同步时才更新状态
                            _uiState.value = _uiState.value.copy(isLoading = true)
                        }
                    }
                    // 当数据加载完成时，隐藏加载动画并更新数据
                    is DataEvent.RefreshCompleted -> {
                        // 不再自动调用loadGameData()，避免与syncGameConfig重复加载
                        // 只有当不是手动同步操作时才触发加载
                        if (!_uiState.value.isSyncing) {
                            loadGameData()
                        }
                    }
                    is DataEvent.Initialized -> {
                        loadGameData() // 初始化时需要加载数据
                    }
                    // 当有错误发生时，隐藏加载动画并显示错误
                    is DataEvent.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = event.message
                        )
                    }
                    // 当数据已加载时，更新游戏数量
                    is DataEvent.DataLoaded -> {
                    }
                    else->{}
                }
            }
        }

        // 监听任务领奖事件：玩家在游戏结算页确认领取后刷新首页状态
        viewModelScope.launch {
            eventManager.taskEvents.collect { event ->
                if (event is TaskEvent.TaskClaimed) {
                    Log.d(TAG, "收到 TaskClaimed 事件 taskId=${event.taskId}，刷新首页数据")
                    loadGameData()
                }
            }
        }
    }

    // 当 ViewModel 被清除时取消注册
    override fun onCleared() {
        super.onCleared()
        eventManager.unregisterSubscriber()
    }

    // 加载游戏数据但不显示加载状态
    private suspend fun loadGameData() {
        try {
            val games = dataManager.getGameConfigItems()
            val adventureHome = buildAdventureState(games)
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                games = games,
                adventureHome = adventureHome,
                error = null
            )
            trackHomeView(adventureHome)
            // 刷新章节地图
            _chapterMap.value = localAdventureManager.loadChapterMap()
        } catch (e: Exception) {
            Log.e(TAG, "加载游戏数据失败", e)
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                error = e.message
            )
        }
    }

    // 保留公开的 loadInitialData 方法以便 UI 可以触发加载
    fun loadInitialData() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "开始加载游戏数据...")
                _uiState.value = _uiState.value.copy(isLoading = true)
                
                val games = dataManager.getGameConfigItems()
                val adventureHome = buildAdventureState(games)

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    games = games,
                    adventureHome = adventureHome,
                    error = null
                )
                trackHomeView(adventureHome)

                Log.d(TAG, "游戏数据加载完成，共 ${games.size} 个游戏")

            } catch (e: Exception) {
                Log.e(TAG, "加载游戏数据失败", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message
                )
                
                // 使用消息服务显示错误
                messageService.showMessage(
                    UiMessage.Error(
                        message = e.message ?: "加载游戏数据失败",
                        actionLabel = "重试",
                        onAction = { loadInitialData() }
                    )
                )
            }
        }
    }

    // 修改同步配置方法，避免重复加载数据
    fun syncGameConfig() {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, isSyncing = true)
                // 刷新数据
                dataManager.refreshAllData(true)
                
                // 直接获取刷新后的数据并更新UI状态
                val games = dataManager.getGameConfigItems(false)
                val adventureHome = buildAdventureState(games)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isSyncing = false,
                    games = games,
                    adventureHome = adventureHome,
                    error = null
                )
                trackHomeView(adventureHome)
                
                Log.d(TAG, "游戏数据同步完成，共 ${games.size} 个游戏")
                
            } catch (e: Exception) {
                Log.e(TAG, "同步游戏数据失败", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isSyncing = false,
                    error = e.message
                )
                
                // 使用消息服务显示同步错误
                messageService.showMessage(
                    UiMessage.Error(
                        message = e.message ?: "同步游戏数据失败",
                        actionLabel = "重试",
                        onAction = { syncGameConfig() }
                    )
                )
            }
        }
    }

    /** 领取任务奖励，完成后刷新首页状态 */
    fun claimReward(taskId: String) {
        viewModelScope.launch {
            val result = localAdventureManager.claimTaskReward(taskId)
            if (result.success) {
                loadGameData()
                messageService.showMessage(
                    UiMessage.Dialog(
                        title = "奖励到账",
                        message = result.displayMessage.ifBlank { "奖励领取成功！" }
                    )
                )
            } else {
                messageService.showMessage(UiMessage.Error(message = "奖励领取失败，请稍后重试"))
            }
        }
    }

    /** 模拟游玩（无真实游戏时的 demo 交互），完成后刷新首页状态 */
    fun simulatePlay(taskId: String) {
        viewModelScope.launch {
            val achieved = localAdventureManager.simulatePlay(taskId)
            loadGameData()
            if (achieved) {
                messageService.showMessage(UiMessage.Success(message = "任务达成！可以领取奖励了 🎉"))
            } else {
                messageService.showMessage(UiMessage.Info(message = "正在进行中，继续努力！"))
            }
        }
    }

    /** 执行升级操作，成功后刷新首页状态 */
    fun doLevelUp() {
        viewModelScope.launch {
            val result = localAdventureManager.tryLevelUp()
            if (result.success) {
                loadGameData()
                messageService.showMessage(
                    UiMessage.Dialog(
                        title = "晋级成功",
                        message = result.displayMessage.ifBlank { "🎊 恭喜晋级！解锁了下一章新挑战！" }
                    )
                )
            } else {
                messageService.showMessage(UiMessage.Error(message = "升级条件未满足，还需完成更多挑战"))
            }
        }
    }

    /** 导航到历练任务详情页 */
    fun navigateToTaskDetail(taskId: String) {
        viewModelScope.launch {
            eventManager.emitNavigationEvent(NavigationEvent.NavigateToAdventureTaskDetail(taskId))
        }
    }

    /** 从地图页进入章节入口任务 */
    fun navigateToChapterEntry(chapterId: String) {
        viewModelScope.launch {
            val taskId = localAdventureManager.getChapterEntryTaskId(chapterId)
            if (taskId.isNullOrBlank()) {
                messageService.showMessage(UiMessage.Info(message = "该章节暂时没有可进入的挑战任务"))
                return@launch
            }
            eventManager.emitNavigationEvent(NavigationEvent.NavigateToAdventureTaskDetail(taskId))
        }
    }

    // 仅刷新 SDK，不刷新游戏列表
    fun refreshSdkOnly() {
        viewModelScope.launch {
            try {
                // 这里只触发 SDK 预加载/更新逻辑，不改动游戏列表状态
                dataManager.preloadSdkOnly()
            } catch (e: Exception) {
                Log.e(TAG, "刷新 SDK 失败", e)
                messageService.showMessage(
                    UiMessage.Error(
                        message = e.message ?: "刷新 SDK 失败"
                    )
                )
            }
        }
    }

    private suspend fun buildAdventureState(games: List<GameConfigItem>) =
        run {
            runCatching { dataManager.syncAdventureConfigIfNeeded(force = false) }
                .onFailure { Log.w(TAG, "同步远端历练配置失败，继续使用本地配置", it) }
            localAdventureManager.loadHomeUiState(games)
        }

    private fun trackHomeView(adventureHome: com.example.gameboxone.data.model.AdventureHomeUiState) {
        analyticsManager.track(
            AnalyticsEventNames.HOME_VIEW,
            mapOf(
                "level" to adventureHome.currentLevel,
                "chapter_id" to adventureHome.currentChapterId,
                "task_count" to adventureHome.totalTaskCount,
                "upgrade_ready" to adventureHome.upgradeReady
            )
        )
    }
}
