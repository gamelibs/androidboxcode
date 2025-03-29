package com.example.gameboxone.manager

import android.util.Log
import com.example.gameboxone.event.GameEvent
import com.example.gameboxone.navigation.NavigationEvent
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton
import com.example.gameboxone.event.DataEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import java.util.LinkedList
import java.util.Queue

/**
 * 事件管理器
 * 负责应用内所有事件的发送和订阅，包括：
 * 1. 导航事件
 * 2. 游戏事件
 */
@Singleton
class EventManager @Inject constructor() {

    // 添加错误重试机制
    private suspend fun <T> withRetry(
        times: Int = 3,
        block: suspend () -> T
    ): T? {
        repeat(times) { attempt ->
            try {
                return block()
            } catch (e: Exception) {
                Log.e(TAG, "操作失败，尝试次数：${attempt + 1}", e)
                if (attempt == times - 1) throw e
                delay(100 * (attempt + 1).toLong())
            }
        }
        return null
    }

    // 系统事件流
    private val _systemEvents = MutableSharedFlow<SystemEvent>(
        replay = 1,
        extraBufferCapacity = 1,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val systemEvents: SharedFlow<SystemEvent> = _systemEvents.asSharedFlow()

    // 资源事件流
    private val _resourceEvents = MutableSharedFlow<ResourceEvent>()
    val resourceEvents: SharedFlow<ResourceEvent> = _resourceEvents.asSharedFlow()

    // 导航事件流
    private val _navigationEvents = MutableSharedFlow<NavigationEvent>()
    val navigationEvents: SharedFlow<NavigationEvent> = _navigationEvents.asSharedFlow()

    // 数据事件流
    private val _dataEvents = MutableSharedFlow<DataEvent>(replay = 5)
    val dataEvents: SharedFlow<DataEvent> = _dataEvents.asSharedFlow()
    
    // 缓冲队列，存储尚未消费的事件
    private val eventBuffer: Queue<DataEvent> = LinkedList()
    
    // 是否有活跃的订阅者
    private val hasActiveSubscribers = MutableStateFlow(false)
    
    init {
        // 监听订阅者状态，当有活跃订阅者时发送缓冲事件
        CoroutineScope(Dispatchers.Default).launch {
            hasActiveSubscribers.collect { active ->
                if (active) {
                    flushBuffer()
                }
            }
        }
    }

    /**
     * 发送系统事件
     */
    suspend fun emitSystemEvent(event: SystemEvent) {
        try {
            withRetry {
                _systemEvents.emit(event)
                Log.d(TAG, "系统事件已发送: $event")
            }
        } catch (e: Exception) {
            Log.e(TAG, "系统事件发送失败", e)
            emitGameEvent(GameEvent.Error.System("系统事件发送失败: ${e.message}"))
        }
    }

    /**
     * 发送资源事件
     */
    suspend fun emitResourceEvent(event: ResourceEvent) {
        try {
            withRetry {
                _resourceEvents.emit(event)
                Log.d(TAG, "资源事件已发送: $event")
            }
        } catch (e: Exception) {
            Log.e(TAG, "资源事件发送失败", e)
            emitGameEvent(GameEvent.Error.Resource("资源事件发送失败: ${e.message}"))
        }
    }
    // 游戏事件流
    private val _gameEvents = MutableSharedFlow<GameEvent>()
    val gameEvents: SharedFlow<GameEvent> = _gameEvents.asSharedFlow()

    companion object {
        private const val TAG = "EventManager"
        private const val MAX_BUFFER_SIZE = 100
        fun init() {
            Log.d(TAG, "Initializing EventManager")
        }

    }

    /**
     * 发送导航事件
     * @param event 导航事件
     */
    suspend fun emitNavigationEvent(event: NavigationEvent) {
        try {
            withRetry {
                Log.d(TAG, "准备发送导航事件: $event, 当前订阅者数: ${_navigationEvents.subscriptionCount.value}")
                _navigationEvents.emit(event)
                Log.d(TAG, "导航事件已发送: $event")
            }
        } catch (e: Exception) {
            Log.e(TAG, "导航事件发送失败", e)
            emitGameEvent(GameEvent.Error.System("导航事件发送失败: ${e.message}"))
        }
    }

    // 记录最近的错误事件时间
    private var lastErrorTime = 0L

    /**
     * 发送游戏事件
     * @param event 游戏事件
     */
    suspend fun emitGameEvent(event: GameEvent) {
        try {
            when (event) {
                is GameEvent.Error.Network -> {
                    // 防止短时间内重复发送相同错误
                    val currentTime = System.currentTimeMillis()
                    if (currentTime - lastErrorTime > 1000) {  // 1秒内不重复显示
                        lastErrorTime = currentTime
                        _gameEvents.emit(event)
                    }
                }
                else -> _gameEvents.emit(event)
            }
            Log.d(TAG, "游戏事件已发送: $event")
        } catch (e: Exception) {
            Log.e(TAG, "游戏事件发送失败", e)
        }
    }

    /**
     * 发送数据事件
     * 如果没有活跃订阅者，事件会被添加到缓冲队列
     */
    suspend fun emitDataEvent(event: DataEvent) {
        Log.d(TAG, "发送事件: $event")
        
        if (hasActiveSubscribers.value) {
            // 有活跃订阅者，直接发送
            _dataEvents.emit(event)
        } else {
            // 没有活跃订阅者，添加到缓冲队列
            synchronized(eventBuffer) {
                eventBuffer.add(event)
                Log.d(TAG, "事件已缓冲，当前缓冲队列大小: ${eventBuffer.size}")
            }
        }
    }
    
    /**
     * 注册活跃订阅者
     * 调用此方法表明有订阅者准备好接收事件
     */
    fun registerSubscriber() {
        Log.d(TAG, "注册活跃订阅者")
        hasActiveSubscribers.value = true
    }
    
    /**
     * 取消注册活跃订阅者
     */
    fun unregisterSubscriber() {
        Log.d(TAG, "取消注册活跃订阅者")
        hasActiveSubscribers.value = false
    }
    
    /**
     * 清空缓冲队列，发送所有缓冲事件
     */
    private suspend fun flushBuffer() {
        // 首先从缓冲区收集所有事件
        val eventsToEmit = mutableListOf<DataEvent>()
        
        synchronized(eventBuffer) {
            Log.d(TAG, "清空缓冲队列，大小: ${eventBuffer.size}")
            while (eventBuffer.isNotEmpty()) {
                val event = eventBuffer.poll()
                event?.let {
                    eventsToEmit.add(it)
                }
            }
        }
        
        // 在同步块外发送所有事件
        eventsToEmit.forEach { event ->
            Log.d(TAG, "发送缓冲事件: $event")
            _dataEvents.emit(event)
        }
    }
}
/**
 * 系统事件
 */
sealed class SystemEvent {
    data class Error(val message: String) : SystemEvent()
    data class Warning(val message: String) : SystemEvent()
    data class Info(val message: String) : SystemEvent()
}

/**
 * 资源事件
 */
sealed class ResourceEvent {
    data class LoadStarted(val resourceType: String) : ResourceEvent()
    data class LoadSuccess(val resourceType: String) : ResourceEvent()
    data class LoadError(val resourceType: String, val error: String) : ResourceEvent()
}