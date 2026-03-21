package com.example.gameboxone.data.viewmodel

import com.example.gameboxone.AppLog as Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.content.Context
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.state.MyGameState
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.event.GameEvent
import com.example.gameboxone.manager.DataManager
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.IconCacheManager
import com.example.gameboxone.manager.MyGameManager
import com.example.gameboxone.manager.NetManager
import com.example.gameboxone.utils.ModelConverter
import com.example.gameboxone.WebViewActivity
import com.example.gameboxone.base.AppDatabase
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

private const val TAG = "MyGameViewModel"

@HiltViewModel
class MyGameViewModel @Inject constructor(
    private val myGameManager: MyGameManager,
    private val dataManager: DataManager,
    private val eventManager: EventManager,
    private val database: AppDatabase,
    private val netManager: NetManager,
    val iconCacheManager: IconCacheManager,
    @ApplicationContext private val context: Context
) : ViewModel() {
    // UI 状态
    private val _uiState = MutableStateFlow(MyGameState())
    val uiState: StateFlow<MyGameState> = _uiState.asStateFlow()

    // SDK version exposed as StateFlow so UI can observe changes
    private val _sdkVersion = MutableStateFlow("0.0.0")
    val sdkVersion = _sdkVersion.asStateFlow()

    // 添加标记，防止重复加载
    private var isDataLoaded = false
    // 添加加载中标记，避免并发加载
    private var isLoading = false
    // 标记“我的游戏”页是否正在主动执行远端刷新，避免 RefreshCompleted 再触发一次本地加载
    private var isRefreshingFromMyGame = false

    init {
        // 注册事件监听
        eventManager.registerSubscriber()

        // 监听数据事件
        viewModelScope.launch {
            eventManager.dataEvents.collect { event ->
                when (event) {
                    // RefreshStarted 不再设置 isLoading，避免与 loadGameData 产生双 spinner
                    is DataEvent.Initialized -> {
                        // 初始化完成后，远端/保底 params 可能刚写入 DB，此时刷新一次 SDK 版本显示
                        refreshSdkVersionFromDb("Initialized")
                        // 首次初始化时仍然遵守"仅当未加载时才加载"的约束
                        if (!isDataLoaded) {
                            loadGameData()
                        }
                    }
                    is DataEvent.RefreshCompleted -> {
                        // 远端刷新完成后，params 与 remote_sdk_version 可能更新，刷新 SDK 版本显示
                        refreshSdkVersionFromDb("RefreshCompleted")
                        if (isRefreshingFromMyGame) {
                            Log.d(TAG, "跳过 RefreshCompleted 自动 loadGameData：当前由 MyGame.refreshAll() 自行收尾")
                            return@collect
                        }
                        // 远程刷新完成后，必须重新加载"我的游戏"以重新计算 hasUpdate
                        isDataLoaded = false
                        loadGameData()
                    }
                    is DataEvent.SdkLoaded -> {
                        // 当 SDK 加载/更新完成时，重新读取 DB 中的 sdk_version 并推送到 Flow
                        refreshSdkVersionFromDb("SdkLoaded")
                    }
                    is DataEvent.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = event.message
                        )
                    }
                    else -> { /* 忽略其他事件 */ }
                }
            }
        }

        // 加载初始数据 - 只在初始化时主动加载一次
        loadGameData()

        // 读取并发布初始 SDK 版本到 Flow
        refreshSdkVersionFromDb("Init")
    }

    /** 将图标相对路径解析为完整 URL；绝对 URL 原样返回 */
    private fun resolveIconUrl(rawUrl: String): String {
        if (rawUrl.isBlank()) return rawUrl
        return if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            rawUrl
        } else {
            try {
                netManager.resolveResourceUrl(rawUrl.trimStart('/'))
            } catch (e: Exception) {
                Log.w(TAG, "图标 URL 解析失败: $rawUrl", e)
                rawUrl
            }
        }
    }

    private fun refreshSdkVersionFromDb(reason: String) {
        viewModelScope.launch {
            try {
                val v = getSdkVersion()
                _sdkVersion.value = v
                Log.d(TAG, "SDK 版本刷新($reason): $v")
            } catch (e: Exception) {
                Log.w(TAG, "SDK 版本刷新失败($reason)", e)
            }
        }
    }

    /** 优先使用 downicon，其次使用 icon，并统一解析为完整 URL */
    private fun resolveDisplayIconUrl(item: com.example.gameboxone.data.model.GameConfigItem): String {
        val preferred = item.downicon?.takeIf { it.isNotBlank() } ?: item.icon
        return resolveIconUrl(preferred)
    }

    /**
     * 加载游戏数据 - 强化防重复机制并只加载已安装的游戏，同时检查更新
     */
    fun loadGameData() {
        // 检查是否已有数据且正在加载，如果是则直接返回
        if ((isDataLoaded && _uiState.value.games.isNotEmpty()) || isLoading) {
            Log.d(TAG, "跳过重复加载: 已加载=${isDataLoaded}, 游戏数量=${_uiState.value.games.size}, 加载中=${isLoading}")
            return
        }

        viewModelScope.launch {
            try {
                isLoading = true // 标记为加载中
                Log.d(TAG, "开始加载已安装游戏数据...")
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                // 已安装游戏（含 hasUpdate 状态）
                val installedGames = myGameManager.getAllGames()
                Log.d(TAG, "已安装游戏数量: ${installedGames.size}个")

                // 全部游戏（完整目录），合并已安装状态
                val allConfigItems = dataManager.getGameConfigItems()
                val installedById = installedGames.associateBy { it.gameId }
                val allGames = allConfigItems.map { item ->
                    val installed = installedById[item.gameId]
                    // 已安装的游戏保留原始数据（iconUrl 已由 MyGameManager 解析为完整 URL）
                    // 未安装的游戏优先使用 downicon，并解析为完整 URL
                    installed ?: ModelConverter.toMyGameData(item).copy(
                        isLocal = item.isLocal,
                        iconUrl = resolveDisplayIconUrl(item)
                    )
                }
                Log.d(TAG, "全部游戏数量: ${allGames.size}个")

                _uiState.value = _uiState.value.copy(
                    games = installedGames,
                    allGames = allGames,
                    isLoading = false
                )

                isDataLoaded = true
            } catch (e: Exception) {
                Log.e(TAG, "加载游戏数据失败", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "加载游戏数据失败: ${e.message}"
                )
            } finally {
                isLoading = false // 无论成功失败，都标记加载完成
            }
        }
    }

    /**
     * 下载游戏
     */
    fun downloadGame(game: Custom.MyGameData) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    downloadingGameId = game.id,
                    downloadProgress = 0f
                )

                // 使用MyGameManager下载游戏
                myGameManager.downloadAndInstallGame(
                    game = game,
                    onProgress = { progress ->
                        _uiState.value = _uiState.value.copy(downloadProgress = progress)
                    }
                ).fold(
                    onSuccess = {
                        // 下载成功，刷新游戏列表
                        isDataLoaded = false
                        loadGameData()
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            error = "下载游戏失败: ${error.message}"
                        )
                    }
                )

                _uiState.value = _uiState.value.copy(
                    downloadingGameId = null,
                    downloadProgress = 0f
                )
            } catch (e: Exception) {
                Log.e(TAG, "请求下载游戏失败", e)
                _uiState.value = _uiState.value.copy(
                    downloadingGameId = null,
                    error = "请求下载游戏失败: ${e.message}"
                )
            }
        }
    }

    /**
     * 更新游戏 - 使用MyGameManager处理
     */
    fun updateGame(game: Custom.MyGameData) {
        viewModelScope.launch {
            try {
                // 设置更新状态
                _uiState.value = _uiState.value.copy(
                    downloadingGameId = game.id,
                    downloadProgress = 0f
                )
                
                // 先删除旧版本游戏
                Log.d(TAG, "开始删除旧版游戏: ${game.name}")
                myGameManager.deleteGame(game.id)
                
                // 使用copy创建适用于下载的数据对象（重置本地状态）
                val downloadableGame = game.copy(
                    isLocal = false,
                    localPath = ""
                )
                
                // 下载新版游戏
                Log.d(TAG, "开始下载新版游戏: ${game.name}")
                myGameManager.downloadAndInstallGame(
                    game = downloadableGame,
                    onProgress = { progress ->
                        _uiState.value = _uiState.value.copy(downloadProgress = progress)
                    }
                ).fold(
                    onSuccess = { 
                        // 刷新游戏列表
                        isDataLoaded = false
                        loadGameData()
                        Log.d(TAG, "游戏更新完成: ${game.name}")
                    },
                    onFailure = { error ->
                        Log.e(TAG, "游戏更新失败: ${game.name}", error)
                        _uiState.value = _uiState.value.copy(
                            error = "游戏更新失败: ${error.message}"
                        )
                    }
                )
                
                // 清除下载状态
                _uiState.value = _uiState.value.copy(
                    downloadingGameId = null,
                    downloadProgress = 0f
                )
            } catch (e: Exception) {
                Log.e(TAG, "游戏更新过程出错", e)
                _uiState.value = _uiState.value.copy(
                    downloadingGameId = null,
                    downloadProgress = 0f,
                    error = "游戏更新失败: ${e.message}"
                )
            }
        }
    }

    /**
     * 删除游戏 - 使用MyGameManager
     */
    fun deleteGame(game: Custom.MyGameData) {
        viewModelScope.launch {
            try {
                // 显示正在删除状态
                _uiState.value = _uiState.value.copy(
                    deletingGameId = game.id
                )

                // 删除游戏
                val success = myGameManager.deleteGame(game.id)
                if (!success) {
                    _uiState.value = _uiState.value.copy(
                        error = "删除游戏失败: 游戏不存在或已被删除"
                    )
                }

                // 重新加载游戏列表
                isDataLoaded = false
                loadGameData()

                // 清除删除状态
                _uiState.value = _uiState.value.copy(
                    deletingGameId = null
                )
            } catch (e: Exception) {
                Log.e(TAG, "删除游戏失败", e)
                _uiState.value = _uiState.value.copy(
                    deletingGameId = null,
                    error = "删除游戏失败: ${e.message}"
                )
            }
        }
    }

    /**
     * 刷新游戏列表 - 保留此方法用于代码中手动刷新，不再暴露给UI
     */
    fun refreshGameList() {
        Log.d(TAG, "手动刷新游戏列表")
        isDataLoaded = false // 重置加载标记，允许重新加载
        loadGameData() // 重新加载数据
    }

    /**
     * 从远端刷新数据后重新加载游戏列表（替代 homeViewModel.syncGameConfig()）
     * 仅在 MyGameScreen 的"刷新"按钮中调用，保证 loading 状态由本 ViewModel 统一管理
     */
    fun refreshAll() {
        if (isLoading) return
        viewModelScope.launch {
            try {
                isRefreshingFromMyGame = true
                isLoading = true
                // 远端 refresh 时使用全局 loading，避免与 MainScreen 的全局圈叠加出两个 loading
                _uiState.value = _uiState.value.copy(error = null)
                // 触发远端数据刷新（会通过事件总线通知所有订阅方）
                try {
                    dataManager.refreshAllData(isInitialLoad = false)
                } catch (e: Exception) {
                    Log.w(TAG, "refreshAll: 远程刷新失败，仍继续加载本地数据", e)
                }
                // 刷新本地游戏列表
                val installedGames = myGameManager.getAllGames()
                val allConfigItems = dataManager.getGameConfigItems()
                val installedById = installedGames.associateBy { it.gameId }
                val allGames = allConfigItems.map { item ->
                    val installed = installedById[item.gameId]
                    installed ?: ModelConverter.toMyGameData(item).copy(
                        isLocal = item.isLocal,
                        iconUrl = resolveDisplayIconUrl(item)
                    )
                }
                _uiState.value = _uiState.value.copy(
                    games = installedGames,
                    allGames = allGames,
                    isLoading = false
                )
                isDataLoaded = true
                refreshSdkVersionFromDb("refreshAll")
            } catch (e: Exception) {
                Log.e(TAG, "refreshAll: 刷新游戏数据失败", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "刷新失败: ${e.message}"
                )
            } finally {
                isRefreshingFromMyGame = false
                isLoading = false
            }
        }
    }

    /**
     * 启动已安装的游戏
     */
    fun playGame(game: Custom.MyGameData) {
        viewModelScope.launch {
            try {
                if (!game.isLocal || game.localPath.isBlank()) {
                    Log.w(TAG, "无法启动游戏：未安装或本地路径为空, gameId=${game.id}, name=${game.name}")
                    _uiState.value = _uiState.value.copy(
                        error = "无法启动游戏：未安装或本地路径无效"
                    )
                    return@launch
                }

                Log.d(TAG, "[GAMEBOX] 从我的游戏启动: gameId=${game.id}, name=${game.name}, path=${game.localPath}")

                // 直接启动 WebViewActivity 加载本地游戏
                WebViewActivity.start(context, game.localPath, game.id)

                // 发送游戏启动事件（用于统计/埋点）
                eventManager.emitGameEvent(GameEvent.GameStart(game.name))
            } catch (e: Exception) {
                Log.e(TAG, "启动游戏失败: ${game.name}", e)
                _uiState.value = _uiState.value.copy(
                    error = "启动游戏失败: ${e.message}"
                )
            }
        }
    }

    /**
     * 获取当前 SDK 版本（从 app_config 表中读取 sdk_version 或 remote_sdk_version）
     */
    suspend fun getSdkVersion(): String {
        return try {
            val local = database.appConfigDao().getLatestValue("sdk_version")?.trim().orEmpty()
            val remote = database.appConfigDao().getLatestValue("remote_sdk_version")?.trim().orEmpty()

            // 优先展示“有意义”的版本号：
            // - 如果本地 sdk_version 为空或仍是默认 0.0.0，则回退展示 remote_sdk_version（如 1.1.0）
            // - 否则展示本地 sdk_version（代表已落盘的 SDK 版本）
            when {
                local.isBlank() || local == "0.0.0" -> remote.ifBlank { "0.0.0" }
                else -> local
            }
        } catch (e: Exception) {
            Log.w(TAG, "读取 SDK 版本失败", e)
            "0.0.0"
        }
    }

    /**
     * 清理资源
     */
    override fun onCleared() {
        super.onCleared()
        eventManager.unregisterSubscriber()
    }
}
