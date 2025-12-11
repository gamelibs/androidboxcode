package com.example.gameboxone.data.viewmodel

import com.example.gameboxone.AppLog as Log
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.viewModelScope
import com.example.gameboxone.WebViewActivity
import com.example.gameboxone.manager.DataManager
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.ResourceManager
import com.example.gameboxone.base.UiMessage
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.state.GameDetailState
import com.example.gameboxone.data.state.GameResourceState
import com.example.gameboxone.event.GameEvent
import com.example.gameboxone.manager.MyGameManager
import com.example.gameboxone.navigation.NavigationEvent
import com.example.gameboxone.service.MessageService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import dagger.hilt.android.qualifiers.ApplicationContext
import android.content.Context


/**
 * 游戏详情页面的 ViewModel
 * 负责管理游戏详情数据和状态
 */
@HiltViewModel
class GameDetailViewModel @Inject constructor(
    private val dataManager: DataManager,
    private val resourceManager: ResourceManager,
    eventManager: EventManager,
    private val messageService: MessageService,
    private val myGameManager: MyGameManager,
    @ApplicationContext private val context: Context,  // 添加Context注入
    savedStateHandle: SavedStateHandle
) : GameViewModel(eventManager) {



    // 从导航参数中获取游戏ID
    val gameId: String = checkNotNull(savedStateHandle["gameId"]) {
        "游戏ID不能为空"
    }

    // 实现父类要求的状态流
    override val _state = MutableStateFlow(GameDetailState())
    val state: StateFlow<GameDetailState> = _state.asStateFlow()

    /**
     * 加载游戏详情
     */
    fun loadGameDetails(gameId:String) {
        if (gameId.isBlank()) {
            Log.w(TAG, "游戏ID为空，跳过加载")
            return
        }
        viewModelScope.launch {
            try {
                setLoading(true)
                Log.d(TAG, "开始加载游戏详情: $gameId")

                // 优先从缓存获取游戏数据
                val gameData = dataManager.getCachedGameData(gameId)

                if (gameData != null) {
                    // 创建完整的HotGameData对象，而不是只包含ID的空对象
//                    val hotGameData = Custom.HotGameData(
//                        id = gameData.id,
//                        name = gameData.name,
//                        gameId = gameData.gameId ?: gameData.id,
//                        gameRes = gameData.gameRes ?: "",
//                        description = gameData.description ?: "",
//                        iconUrl = gameData.iconUrl,
//                        downloadUrl = gameData.downloadUrl ?: "",
//                        isLocal = gameData.isLocal,
//                        localPath = gameData.localPath ?: "",
//                        rating = gameData.rating ?: 0,
//                        patch = gameData.patch ?: 1
//                    )
                    
                    _state.value = GameDetailState(
                        game = gameData,
                        isLoading = false,
                        error = null
                    )
                    Log.d(TAG, "游戏详情加载成功: ${gameData.name}, 详细信息已保存到state")

                } else {
                    handleError("未找到游戏数据")
                }
            } catch (e: Exception) {
                Log.e(TAG, "加载游戏详情失败", e)
                handleError("加载游戏详情失败：${e.message}")
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message
                )
            } finally {
                setLoading(false)
            }
        }
    }

    /**
     * 刷新游戏数据
     */
//    fun refreshGameData(gameId:String) {
////        loadGameDetails(gameId)
//        viewModelScope.launch {
//            try {
//                setLoading(true)
//                // 强制从数据库重新加载
//                val game = dataManager.getGameById(gameId)
//
//                if (game != null) {
//                    _state.value = GameDetailState(
//                        game = game,//Custom.ToBaseData(game.id?:"101"),
//                        isLoading = false,
//                        error = null
//                    )
//                    // 刷新时发送加载完成事件
//                    eventManager.emitGameEvent(GameEvent.GameLoaded(Custom.ToBaseData(game.id,game.name,game.iconUrl)))
//                } else {
//                    handleError("未找到游戏数据")
//                }
//            } catch (e: Exception) {
//                handleError("刷新游戏数据失败：${e.message}")
//            } finally {
//                setLoading(false)
//            }
//        }
//
//    }

    /**
     * 更新状态的扩展函数
     */
    private fun setState(update: GameDetailState.() -> GameDetailState) {
        _state.value = update(_state.value)
    }


    /**
     * 处理游戏收藏
     */
//    fun toggleFavorite() {
//        viewModelScope.launch {
//            try {
//                val currentGame = state.value.game ?: return@launch

//                eventManager.emitGameEvent(GameEvent.GameFavoriteChanged(currentGame))
//            } catch (e: Exception) {
//                handleError("更改收藏状态失败：${e.message}")
//            }
//        }
//    }

    /**
     * 清理状态
     */
    fun clearState() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "清理详情页状态")
                _state.value = GameDetailState()
                setLoading(false)
            } catch (e: Exception) {
                Log.e(TAG, "清理状态失败", e)
            }
        }
    }


    /**
     * 处理返回按钮点击
     */
    fun onBackPressed() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "开始处理返回事件")
                // 直接发出返回导航事件，避免在动画期间清空状态导致 UI 闪一下错误页
                eventManager.emitNavigationEvent(NavigationEvent.PopBackStack)
                
                Log.d(TAG, "返回事件处理完成")
            } catch (e: Exception) {
                Log.e(TAG, "返回事件处理失败", e)
                handleError("返回失败：${e.message}")
            }
        }
    }

    // 添加 onCleared 处理
    override fun onCleared() {
        super.onCleared()
        _state.value = GameDetailState()
        setLoading(false)
    }

    /**
     * 处理游戏启动 - 使用优化后的资源检查流程
     */
    fun launchGame() {
        viewModelScope.launch {
            try {
                val game = state.value.game
                if (game == null) {
                    handleError("游戏数据不存在")
                    return@launch
                }

                setLoading(true)
                Log.d(TAG, "准备启动游戏: ${game.name}, 正在检查资源...")

                // 使用 ResourceManager 统一检查资源状态
                when (val resourceState = resourceManager.ensureGameResourceAvailable(game)) {
                    is GameResourceState.Available -> {
                        // 资源已就绪，直接启动
                        Log.d(TAG, "游戏资源已就绪，直接启动: ${game.name}, path=${resourceState.localPath}")
                        WebViewActivity.start(context, resourceState.localPath, game.id)
                    }

                    is GameResourceState.LoadingFromBackup -> {
                        // 从保底目录安装，并写入我的游戏
                        Log.d(TAG, "从保底目录加载游戏资源: ${game.name}")
                        setState {
                            copy(
                                isLoading = true,
                                loadingMessage = "正在准备游戏资源..."
                            )
                        }

                        // 通过 MyGameManager 进行安装（包含 DB 记录和事件）
                        myGameManager.installGameFromBackup(game).onSuccess { localPath ->
                            Log.d(TAG, "保底资源安装成功，写入我的游戏并启动: ${game.name}, path=$localPath")
                            WebViewActivity.start(context, localPath, game.id)
                        }.onFailure { error ->
                            Log.w(TAG, "保底资源安装失败，尝试网络下载: ${game.name}", error)
                            handleError("从本地资源加载失败: ${error.message}")
                            handleNeedDownload(game)
                        }
                    }

                    is GameResourceState.NeedDownload -> {
                        // 需要从网络下载：弹出下载对话框，后续通过 startDownload 调用 MyGameManager 下载并写入 my_games
                        Log.d(TAG, "游戏资源不存在，准备走下载流程: ${game.name}")
                        handleNeedDownload(game)
                    }

                    is GameResourceState.Error -> {
                        handleError(resourceState.message)
                    }

                    GameResourceState.Loading -> {
                        // 已在其他地方加载中，这里不重复处理
                        Log.d(TAG, "游戏资源正在加载中，等待完成: ${game.name}")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "游戏启动过程中出错", e)
                handleError("启动游戏失败: ${e.message}")
            } finally {
                setLoading(false)
            }
        }
    }

    /**
     * 处理需要下载的情况：展示下载对话框，由 startDownload 触发实际下载
     */
    private fun handleNeedDownload(game: Custom.HotGameData) {
        Log.d(TAG, "游戏资源不存在，需要下载: ${game.name}")

        if (game.downloadUrl.isBlank()) {
            Log.w(TAG, "下载URL为空，尝试从本地资源加载: ${game.name}")
            tryLoadFromLocalAssets(game)
            return
        }

        val resolvedInfo = resourceManager.resolveDownloadInfo(game.downloadUrl, game.gameRes)

        setState {
            copy(
                showDownloadDialog = true,
                downloadInfo = Custom.DownloadInfo(
                    gameName = game.name,
                    downloadUrl = resolvedInfo.downloadUrl,
                    targetPath = resolvedInfo.targetPath
                )
            )
        }
    }

    /**
     * 尝试直接从本地资源获取游戏，并写入“我的游戏”
     */
    private fun tryLoadFromLocalAssets(game: Custom.HotGameData) {
        viewModelScope.launch {
            try {
                setState { copy(isLoading = true, loadingMessage = "正在从本地资源加载游戏...") }

                // 使用 MyGameManager 统一处理资源提取和写 DB
                myGameManager.installGameFromBackup(game).fold(
                    onSuccess = { localPath ->
                        Log.d(TAG, "从本地资源成功加载并记录游戏: ${game.name}, path=$localPath")
                        WebViewActivity.start(context, localPath, game.id)
                        setState { copy(isLoading = false, loadingMessage = null) }
                    },
                    onFailure = { error ->
                        Log.e(TAG, "从本地资源加载游戏失败: ${game.name}", error)
                        handleError("无法加载游戏: ${error.message}")
                        setState { copy(isLoading = false, loadingMessage = null) }
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "尝试从本地资源加载游戏时出错", e)
                handleError("从本地资源加载游戏失败: ${e.message}")
                setState { copy(isLoading = false, loadingMessage = null) }
            }
        }
    }

    /**
     * 开始下载游戏：通过 MyGameManager 完成下载+安装+写入 my_games
     */
    fun startDownload() {
        viewModelScope.launch {
            try {
                val downloadInfo = state.value.downloadInfo
                val game = state.value.game
                if (downloadInfo == null || game == null) {
                    handleError("下载信息或游戏数据不存在")
                    return@launch
                }

                setState {
                    copy(
                        showDownloadDialog = false,
                        isDownloading = true,
                        downloadProgress = 0f,
                        loadingMessage = "正在下载游戏...",
                        error = null
                    )
                }

                // 发送下载开始事件
                emitGameEvent(GameEvent.GameDownloadStarted(Custom.ToBaseData(game.id, game.name, game.iconUrl)))

                // 统一通过 MyGameManager 下载并安装（内部会调用 ResourceManager.downloadAndInstallGame + 写 my_games + 更新 game_config）
                // 将 HotGameData 转换为 MyGameData 以符合 MyGameManager.downloadAndInstallGame 的参数类型
                val myGameData = Custom.MyGameData(
                    id = game.id,
                    gameId = game.gameId,
                    name = game.name,
                    iconUrl = game.iconUrl,
                    gameRes = game.gameRes,
                    rating = game.rating,
                    patch = game.patch,
                    description = game.description,
                    downloadUrl = downloadInfo.downloadUrl,
                    isLocal = false,
                    localPath = "",
                    size = null,
                    hasUpdate = false,
                    installTime = System.currentTimeMillis().toString(),
                    lastPlayTime = "0",
                    playCount = 0,
                    taskDesc = game.taskDesc,
                    taskPoints = game.taskPoints
                )

                myGameManager.downloadAndInstallGame(
                    game = myGameData,
                    onProgress = { progress ->
                        setState { copy(downloadProgress = progress) }
                    }
                ).fold(
                    onSuccess = { localPath ->
                        Log.d(TAG, "游戏下载并安装成功，写入我的游戏: ${game.name}, path=$localPath")

                        // 发送完成事件
                        emitGameEvent(
                            GameEvent.GameDownloadCompleted(
                                Custom.ToBaseData(game.id, game.name, game.iconUrl)
                            )
                        )

                        // 下载完成后直接启动游戏
                        WebViewActivity.start(context, localPath, game.id)

                        setState {
                            copy(
                                isDownloading = false,
                                downloadProgress = 0f,
                                loadingMessage = null
                            )
                        }
                    },
                    onFailure = { error ->
                        Log.e(TAG, "游戏下载/安装失败: ${game.name}", error)
                        handleError("游戏下载失败: ${error.message}")
                        setState {
                            copy(
                                isDownloading = false,
                                downloadProgress = 0f,
                                loadingMessage = null
                            )
                        }
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "开始下载游戏时出错", e)
                handleError("请求下载游戏失败: ${e.message}")
                setState {
                    copy(
                        isDownloading = false,
                        downloadProgress = 0f,
                        loadingMessage = null
                    )
                }
            }
        }
    }

    /**
     * 关闭下载对话框
     */
    fun dismissDownloadDialog() {
        setState {
            copy(
                showDownloadDialog = false,
                downloadInfo = null
            )
        }
    }

    /**
     * 处理错误
     * 将错误发送到全局消息系统
     */
    override fun handleError(message: String, error: Exception?) {
        // 更新本地错误状态
        _error.value = message
        
        // 在协程中调用 suspend 函数
        viewModelScope.launch {
            try {
                messageService.showMessage(
                    UiMessage.Error(
                        message = message
                    )
                )
            } catch (e: Exception) {
                Log.e(TAG, "发送全局消息失败", e)
            }
        }
        
        // 记录日志
        error?.let { Log.e(TAG, message, it) }
    }

    companion object {
        private const val TAG = "GameDetailViewModel"
    }
}
