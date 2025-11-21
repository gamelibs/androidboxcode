package com.example.gameboxone.data.viewmodel

import com.example.gameboxone.AppLog as Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.event.GameEvent
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * 游戏视图模型基类
 * 提供通用的游戏相关功能和状态管理
 */
abstract class GameViewModel(
    open val eventManager: EventManager
) : ViewModel() {

    // 基础状态
    protected val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    protected val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // 抽象状态，子类必须实现
    protected abstract val _state: MutableStateFlow<*>


    // 添加 protected 修饰符，让子类可以访问
    protected suspend fun emitGameEvent(event: GameEvent) {
        eventManager.emitGameEvent(event)
    }

    /**
     * 处理游戏点击事件
     */
    fun onGameClicked(game: Custom.GameData) {
        viewModelScope.launch {
            try {
                eventManager.emitGameEvent(GameEvent.GameClicked(game))
                Log.d(TAG, "游戏点击事件已发送: ${game.name}")
            } catch (e: Exception) {
                handleError("处理游戏点击失败", e)
            }
        }
    }

    /**
     * 更新加载状态
     */
    protected fun setLoading(loading: Boolean) {
        _isLoading.value = loading
    }

    /**
     * 处理错误
     */
    open fun handleError(message: String, error: Exception? = null) {
        _error.value = message
        error?.let { Log.e(TAG, message, it) }
    }

    /**
     * 清除错误
     */
    fun clearError() {
        _error.value = null
    }



    companion object {
        private const val TAG = "GameViewModel"
    }
}