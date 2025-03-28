package com.example.gameboxone.data.state

/**
 * 游戏资源状态
 * 用于表示游戏资源的不同状态：已可用、需要下载等
 */
sealed class GameResourceState {
    /**
     * 游戏资源已可用
     * @param localPath 游戏本地路径
     */
    data class Available(
        val localPath: String
    ) : GameResourceState()

    /**
     * 需要下载游戏资源
     * @param gameName 游戏名称
     * @param downloadUrl 下载地址
     * @param targetPath 目标保存路径
     */
    data class NeedDownload(
        val gameName: String,
        val downloadUrl: String,
        val targetPath: String
    ) : GameResourceState()

    /**
     * 正在从保底目录加载
     */
    object LoadingFromBackup : GameResourceState()

    /**
     * 资源加载中
     */
    object Loading : GameResourceState()

    /**
     * 资源错误
     * @param message 错误信息
     * @param throwable 异常对象
     */
    data class Error(
        val message: String,
        val throwable: Throwable? = null
    ) : GameResourceState()
}