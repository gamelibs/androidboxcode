package com.example.gameboxone.event

/**
 * 数据相关事件
 */
sealed class DataEvent {
    /**
     * 数据初始化完成
     */
    object Initialized : DataEvent()

    /**
     * 开始刷新数据
     */
    object RefreshStarted : DataEvent()

    /**
     * 数据刷新完成
     */
    object RefreshCompleted : DataEvent()

    /**
     * 数据加载完成
     */
    object DataLoaded:DataEvent()

    /**
     * SDK加载完成事件
     */
    object SdkLoaded : DataEvent()

    /**
     * 错误事件
     */
    data class Error(val message: String) : DataEvent()
}