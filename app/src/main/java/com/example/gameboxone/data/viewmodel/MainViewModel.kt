package com.example.gameboxone.data.viewmodel

import com.example.gameboxone.AppLog as Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.base.UiMessage
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.navigation.NavigationEvent
import com.example.gameboxone.service.MessageService
import com.example.gameboxone.ui.navigation.NavGraphBuilders
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val messageService: MessageService,
    private val eventManager: EventManager // 保留EventManager依赖
) : ViewModel() {

    // UI状态流
    private val _uiState = MutableStateFlow(Custom.MainUiState())
    val uiState = _uiState.asStateFlow()

    // 消息列表状态
    private val _messages = MutableStateFlow<List<UiMessage>>(emptyList())
    val messages = _messages.asStateFlow()

    // 移除重复的导航事件Channel，直接使用EventManager的事件流
    val navigationEvents = eventManager.navigationEvents

    // 添加防重复处理
    private var lastNavigationRoute: String? = null
    private var lastNavigationTime = 0L

    /**
     * 更新当前路由
     */
    fun updateCurrentRoute(route: String) {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(
                    currentRoute = route,
                    isBottomBarVisible = NavGraphBuilders.shouldShowBottomBar(route)
                ) }
                Log.d(TAG, "更新当前路由: $route, 底部导航栏: ${_uiState.value.isBottomBarVisible}")
            } catch (e: Exception) {
                Log.e(TAG, "更新导航状态失败", e)
            }
        }
    }

    /**
     * 导航到指定路由
     */
    fun navigateTo(route: String) {
        // 避免重复导航到相同页面
        if (route == uiState.value.currentRoute) {
            Log.d(TAG, "跳过导航: 已在当前页面 $route")
            return
        }

        // 防止短时间内重复触发
        val currentTime = System.currentTimeMillis()
        if (route == lastNavigationRoute && currentTime - lastNavigationTime < 300) {
            Log.d(TAG, "跳过导航: 短时间内重复请求 $route")
            return
        }

        Log.d(TAG, "发送导航事件: Navigate to $route")
        viewModelScope.launch {
            eventManager.emitNavigationEvent(NavigationEvent.Navigate(route))
        }
        
        lastNavigationRoute = route
        lastNavigationTime = currentTime
    }

    // 示例: 导航到游戏详情
    fun navigateToGameDetail(gameId: String) {
        viewModelScope.launch {
            eventManager.emitNavigationEvent(NavigationEvent.NavigateToGameDetail(gameId))
        }
    }

//    // 示例: 导航到游戏播放
//    fun navigateToGamePlayer(gameId: String, localPath: String) {
//        viewModelScope.launch {
//            eventManager.emitNavigationEvent(NavigationEvent.NavigateToGamePlayer(gameId, localPath))
//        }
//    }

    // 示例: 返回
    fun navigateBack() {
        Log.d(TAG, "发送返回事件")
        viewModelScope.launch {
            eventManager.emitNavigationEvent(NavigationEvent.PopBackStack)
        }
    }

    init {
        // 启动时先显示全局加载状态，直到收到数据事件（Initialized/Error 等）再关闭
        _uiState.update { it.copy(isLoading = true) }

        // 订阅全局消息流
        viewModelScope.launch {
            messageService.messageFlow.collect { message ->
                Log.d(TAG, "收到全局消息: $message")
                
                // 将消息添加到UI状态中，使其能够显示在屏幕上
                _messages.update { currentMessages ->
                    currentMessages + message
                }
                
                // 自动移除消息（可选，根据需求决定是否添加）
                // 如果是 Dialog 且 dismissOnConfirm == false，则不自动移除（需手动调用 dismissMessage）
                val shouldAutoRemove = when (message) {
                    is UiMessage.Dialog -> message.dismissOnConfirm
                    else -> true
                }

                if (shouldAutoRemove) {
                    if (message is UiMessage.Error) {
                        // 错误消息显示时间较长
                        kotlinx.coroutines.delay(5000)
                    } else {
                        // 普通消息显示较短时间
                        kotlinx.coroutines.delay(3000)
                    }

                    // 自动移除消息
                    _messages.update { currentMessages ->
                        currentMessages.filter { it.id != message.id }
                    }
                } else {
                    Log.d(TAG, "消息为不可自动关闭的 Dialog（id=${message.id}），等待手动关闭")
                }
             }
         }

        // 订阅数据事件，用于全局 loading 控制（例如启动时的游戏数据预检）
        viewModelScope.launch {
            eventManager.dataEvents.collect { event ->
                when (event) {
                    is DataEvent.RefreshStarted -> {
                        _uiState.update { it.copy(isLoading = true) }
                    }
                    is DataEvent.Initialized,
                    is DataEvent.RefreshCompleted,
                    is DataEvent.DataLoaded,
                    is DataEvent.Error -> {
                        _uiState.update { it.copy(isLoading = false) }
                    }
                    else -> { /* ignore */ }
                }
            }
        }
    }

    fun dismissMessage(id: String) {
        Log.d(TAG, "关闭消息: $id")
        _messages.update { it.filterNot { msg -> msg.id == id } }
    }
}

private const val TAG = "MainViewModel"
