package com.example.gameboxone.data.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.ResourceManager
import com.example.gameboxone.manager.WebServerManager
import com.example.gameboxone.data.state.GamePlayerUiState
import com.example.gameboxone.event.GameEvent
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class GamePlayerViewModel @Inject constructor(
    private val webServerManager: WebServerManager,
    val eventManager: EventManager,
    private val resourceManager: ResourceManager
) : ViewModel() {

    private val TAG = "GamePlayerViewModel"
    
    // UI 状态
    private val _uiState = MutableStateFlow(GamePlayerUiState())
    val uiState: StateFlow<GamePlayerUiState> = _uiState.asStateFlow()

    // 服务器端口
    private val _serverPort = MutableStateFlow(0)
    val serverPort: StateFlow<Int> = _serverPort.asStateFlow()

    // 游戏路径
    private var localGamePath: String? = null

    /**
     * 启动游戏
     */
    fun startGame(gamePath: String) {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true) }
                
                // 获取游戏目录
                val gameDir = File(gamePath)
                if (!gameDir.exists() || !gameDir.isDirectory) {
                    throw Exception("游戏目录不存在: $gamePath")
                }
                
                // 保存路径以便后续使用
                localGamePath = gamePath
                
                // 启动Web服务器
                val port = webServerManager.startServer(gameDir)
                Log.d(TAG, "Web服务器启动成功，端口: $port")
                
                // 设置游戏URL - 修改为所需格式
                val gameName = gameDir.name
                val gameUrl = buildGameUrl(port, gameDir)
                _uiState.update {
                    it.copy(
                        gameUrl = gameUrl,
                        isLoading = false
                    )
                }
                
                // 发送游戏启动事件
                eventManager.emitGameEvent(GameEvent.GameStart(gameName = gameName))
                
                Log.d(TAG, "游戏URL: $gameUrl")
            } catch (e: Exception) {
                Log.e(TAG, "启动游戏失败", e)
                _uiState.update {
                    it.copy(
                        error = e.message ?: "启动游戏失败",
                        isLoading = false
                    )
                }
            }
        }
    }

    /**
     * 停止游戏
     */
    fun stopGame() {
        viewModelScope.launch {
            try {
                // 停止本地服务器
                webServerManager.stopServer()
                
                // 发送游戏结束事件
                localGamePath?.let {
                    val gameDir = File(it)
                    eventManager.emitGameEvent(GameEvent.GameEnd(gameDir.name))
                }
                
                Log.d(TAG, "游戏已停止")
            } catch (e: Exception) {
                Log.e(TAG, "停止游戏失败", e)
            }
        }
    }

    /**
     * 设置加载状态
     */
    fun setLoading(isLoading: Boolean) {
        _uiState.value = _uiState.value.copy(isLoading = isLoading)
    }

    /**
     * 检查游戏目录有效性
     */
    private fun isValidGameDirectory(dir: File): Boolean {
        return dir.exists() && dir.isDirectory && File(dir, "index.html").exists()
    }

    /**
     * 构建游戏URL
     */
    private fun buildGameUrl(port: Int, gameDir: File): String {
        val gameName = gameDir.name
        return "http://127.0.0.1:$port/$gameName/index.html"
    }

    override fun onCleared() {
        super.onCleared()
        // 确保在ViewModel销毁时停止服务器
        webServerManager.stopServer()
    }
}
