package com.example.gameboxone.event

import androidx.compose.material3.SnackbarDuration
import com.example.gameboxone.data.model.Custom

/**
 * 游戏相关事件的密封类
 * 用于定义所有可能的游戏事件类型
 */
sealed class GameEvent {

    // UI 提示事件
    sealed class UI : GameEvent() {
        data class Toast(val message: String) : UI()
        data class Snackbar(
            val message: String,
            val actionLabel: String? = null,
            val action: (() -> Unit)? = null,
            val duration: SnackbarDuration = SnackbarDuration.Short
        ) : UI()

        // 显示 Bridge 对话框
        data class ShowBridgeDialog(
            val title: String,
            val message: String,
            val callback: String
        ) : UI()

        // Bridge 对话框结果
        data class BridgeDialogResult(
            val callback: String,
            val confirmed: Boolean
        ) : UI()
    }

    // 错误事件
    sealed class Error : GameEvent() {
        data class Config(val message: String) : Error()
        data class General(val message: String, val throwable: Throwable? = null) : Error()
        data class Network(val message: String) : Error()
        data class System(val message: String) : Error()
        data class Game(val message: String) : Error()
        data class Resource(val message: String) : Error()
        data class Server(
            val path: String,
            val message: String
        ) : GameEvent()
    }

    // 导航相关事件游戏交互事件
    data class GameClicked(val game: Custom.GameData) : GameEvent()
    object NavigateBack : GameEvent()

    // 游戏状态事件
    data class GameLoaded(val game: Custom.baseGameData) : GameEvent()
    data class GameFavoriteChanged(
        val game: Custom.HotGameData,
        val isFavorite: Boolean = false
    ) : GameEvent()

    // UI相关事件
    data class ShowToast(val message: String) : GameEvent()
    data class ShowSnackbar(val message: String) : GameEvent()


    // 游戏相关事件
    sealed class Game : GameEvent() {
        data class Started(val gameId: String) : Game()
        data class Paused(val gameId: String) : Game()
        data class Ended(val gameId: String, val score: Int) : Game()
    }

    // 游戏列表加载完成
    data class GameListLoaded(val games: List<Custom.GameData>) : GameEvent()

    // 游戏下载相关事件
    data class GameDownloadStarted(val game: Custom.baseGameData) : GameEvent()
    data class GameDownloadProgress(val game: Custom.baseGameData, val progress: Float) : GameEvent()
    data class GameDownloadCompleted(val game: Custom.baseGameData) : GameEvent()


    // 游戏安装相关事件
    data class GameInstalled(val game: Custom.baseGameData) : GameEvent()

    // 游戏启动事件,直接由导航事件处理
//    data class GameLaunched(val loadPath: String?) : GameEvent()

    // 网络状态变化
    data class NetworkStatusChanged(val isConnected: Boolean) : GameEvent()

    // 图标相关事件
    data class IconLoadRequested(
        val gameId: String,
        val iconUrl: String
    ) : GameEvent()

    data class IconLoaded(
        val gameId: String,
        val iconPath: String
    ) : GameEvent()
    // 在现有 GameEvent 类中添加这些事件
    object NavigateToAllHotGames : GameEvent()
    object NavigateToAllRecentlyPlayed : GameEvent()
    object NavigateToAllRecommendations : GameEvent()

    /**
     * 游戏启动事件
     */
    data class GameStart(val gameName: String) : GameEvent()

    /**
     * 游戏停止事件
     */
    data class GameEnd(val gameName: String) : GameEvent()

    /**
     * 游戏加载完成事件
     */
    data class GameLaunched(val gameData: Custom.HotGameData) : GameEvent()

    /**
     * 游戏进度更新
     */
    data class GameProgress(val gameId: String, val progress: Float) : GameEvent()
}