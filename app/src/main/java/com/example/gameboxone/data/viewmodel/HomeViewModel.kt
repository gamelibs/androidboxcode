package com.example.gameboxone.data.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.gameboxone.manager.DataManager
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.IconCacheManager
import com.example.gameboxone.base.UiMessage
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.service.MessageService
import com.example.gameboxone.ui.state.HomeScreenState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    val iconCacheManager: IconCacheManager,
    private val dataManager: DataManager,
    private val messageService: MessageService,
    private val eventManager: EventManager // 添加 EventManager 依赖
) : ViewModel() {
    private val TAG = "HomeViewModel"
    private val _uiState = MutableStateFlow(HomeScreenState())
    val uiState: StateFlow<HomeScreenState> = _uiState.asStateFlow()


    init {
//        _uiState.value = _uiState.value.copy(isLoading = true)
        
        // 注册为活跃订阅者，确保接收所有事件
        eventManager.registerSubscriber()
        
        // 监听 DataManager 的事件流
        viewModelScope.launch {
            dataManager.dataEvents.collect { event ->
                Log.d(TAG, "收到事件: $event")
                when (event) {
                    // 当开始刷新数据时，显示加载动画
                    is DataEvent.RefreshStarted -> {
                        _uiState.value = _uiState.value.copy(isLoading = true)
                    }
                    // 当数据加载完成时，隐藏加载动画并更新数据
                    is DataEvent.RefreshCompleted, is DataEvent.Initialized -> {
                        loadGameData() // 加载最新数据但不显示加载动画
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
                        _uiState.value = _uiState.value.copy(isLoading = false)
                    }
                    else->{}
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
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                games = games,
                error = null
            )
            
            if (games.isEmpty()) {
                messageService.showMessage(
                    UiMessage.Info(
                        message = "没有找到可用的游戏",
                        actionLabel = "刷新",
                        onAction = { syncGameConfig() }
                    )
                )
            }
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
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false, 
                    games = games,
                    error = null
                )
                
                Log.d(TAG, "游戏数据加载完成，共 ${games.size} 个游戏")
                
                // 如果是空列表，显示空状态提示
                if (games.isEmpty()) {
                    messageService.showMessage(
                        UiMessage.Info(
                            message = "没有找到可用的游戏",
                            actionLabel = "刷新",
                            onAction = { syncGameConfig() }
                        )
                    )
                }
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

    // 保留同步配置方法，但内部调用 DataManager
    fun syncGameConfig() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, isSyncing = true)
            try {
                dataManager.refreshAllData()
                // 不在这里设置 isSyncing = false，等待事件通知
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, isSyncing = false)
                // 使用消息服务显示同步错误
                messageService.showMessage(
                    UiMessage.Error(
                        message = e.message ?: "同步游戏配置失败",
                        actionLabel = "重试",
                        onAction = { syncGameConfig() }
                    )
                )
            }
        }
    }
}
