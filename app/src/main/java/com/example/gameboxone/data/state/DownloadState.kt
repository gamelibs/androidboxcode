package com.example.gameboxone.data.state

/**
 * 游戏下载状态
 */
data class DownloadState(
    val gameId: String,
    val progress: Float = 0f,
    val status: Status = Status.IDLE
) {
    enum class Status {
        IDLE,           // 空闲
        DOWNLOADING,    // 下载中
        PAUSED,        // 暂停
        COMPLETED,     // 完成
        ERROR          // 错误
    }
}