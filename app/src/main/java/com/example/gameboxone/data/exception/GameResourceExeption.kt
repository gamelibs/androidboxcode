package com.example.gameboxone.data.exception

/**
 * 游戏资源异常
 * 用于处理游戏资源加载、复制等操作时的错误
 */
class GameResourceException : Exception {
    constructor(message: String?) : super(message)
    constructor(message: String?, cause: Throwable?) : super(message, cause)
    constructor(cause: Throwable?) : super(cause)
}