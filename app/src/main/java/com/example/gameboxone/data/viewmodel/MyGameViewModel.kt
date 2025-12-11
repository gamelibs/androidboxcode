package com.example.gameboxone.data.viewmodel

import com.example.gameboxone.AppLog as Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.content.Context
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.state.MyGameState
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.event.GameEvent
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.MyGameManager
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
    private val eventManager: EventManager,
    private val database: AppDatabase,
    @ApplicationContext private val context: Context
) : ViewModel() {
    // UI 状态
    private val _uiState = MutableStateFlow(MyGameState())
    val uiState: StateFlow<MyGameState> = _uiState.asStateFlow()

    // 添加标记，防止重复加载
    private var isDataLoaded = false
    // 添加加载中标记，避免并发加载
    private var isLoading = false

    init {
        // 注册事件监听
        eventManager.registerSubscriber()

        // 监听数据事件
        viewModelScope.launch {
            eventManager.dataEvents.collect { event ->
                when (event) {
                    is DataEvent.RefreshStarted -> {
                        _uiState.value = _uiState.value.copy(isLoading = true)
                    }
                    is DataEvent.Initialized -> {
                        // 首次初始化时仍然遵守“仅当未加载时才加载”的约束
                        if (!isDataLoaded) {
                            loadGameData()
                        }
                    }
                    is DataEvent.RefreshCompleted -> {
                        // 远程刷新完成后，必须重新加载“我的游戏”以重新计算 hasUpdate
                        isDataLoaded = false
                        loadGameData()
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

                // 这里直接使用 MyGameManager.getAllGames()，它已经根据远程 game_config 写好了 hasUpdate 状态
                val installedGames = myGameManager.getAllGames()
                Log.d(TAG, "已安装游戏数量: ${installedGames.size}个")

                _uiState.value = _uiState.value.copy(
                    games = installedGames,
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
     * 清理资源
     */
    override fun onCleared() {
        super.onCleared()
        eventManager.unregisterSubscriber()
    }
}
