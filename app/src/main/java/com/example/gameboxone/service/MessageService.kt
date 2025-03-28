package com.example.gameboxone.service

import android.util.Log
import com.example.gameboxone.base.UiMessage
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 全局消息服务
 * 用于在应用的不同部分之间传递消息
 */
@Singleton
class MessageService @Inject constructor() {
    private val _messageFlow = MutableSharedFlow<UiMessage>()
    val messageFlow: SharedFlow<UiMessage> = _messageFlow.asSharedFlow()
    
    /**
     * 发送一条全局消息
     * 将被所有订阅者（通常是 MainViewModel）接收
     */
    suspend fun showMessage(message: UiMessage) {
        Log.d(TAG, "发送消息: $message")
        _messageFlow.emit(message)
    }
    
    companion object {
        private const val TAG = "MessageService"
    }
}
