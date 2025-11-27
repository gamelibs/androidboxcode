package com.example.gameboxone.base

import androidx.compose.material3.SnackbarDuration
import java.util.UUID

/**
 * 表示应用中显示给用户的消息
 * 支持多种类型的消息，包括普通信息、错误、成功、对话框等
 */
sealed class UiMessage(
    open val id: String = UUID.randomUUID().toString(),
    open val message: String,
    open val actionLabel: String? = null,
    open val onAction: (() -> Unit)? = null,
    open val dismissOnAction: Boolean = true
) {

    /**
     * 对话框消息
     */
    data class Dialog(
        override val id: String = UUID.randomUUID().toString(),
        val title: String,
        override val message: String,
        val confirmAction: () -> Unit = {},
        // 是否可以通过点击外部/返回来取消对话
        val cancelable: Boolean = true,
        // 点击确认后是否自动关闭对话
        val dismissOnConfirm: Boolean = true
    ) : UiMessage(id, message)

    /**
     * Snackbar消息
     */
    data class Snackbar(
        override val id: String = UUID.randomUUID().toString(),
        override val message: String,
        override val actionLabel: String? = null,
        override val onAction: (() -> Unit)? = null,
        val duration: SnackbarDuration = SnackbarDuration.Short,
        val action: (() -> Unit)? = null
    ) : UiMessage(id, message, actionLabel, onAction)

    /**
     * 信息消息
     */
    data class Info(
        override val id: String = UUID.randomUUID().toString(),
        override val message: String,
        override val actionLabel: String? = null,
        override val onAction: (() -> Unit)? = null
    ) : UiMessage(id, message, actionLabel, onAction)

    /**
     * 错误消息
     */
    data class Error(
        override val id: String = UUID.randomUUID().toString(),
        override val message: String,
        override val actionLabel: String? = null,
        override val onAction: (() -> Unit)? = null,
        val throwable: Throwable? = null
    ) : UiMessage(id, message, actionLabel, onAction)

    /**
     * 成功消息
     */
    data class Success(
        override val id: String = UUID.randomUUID().toString(),
        override val message: String,
        override val actionLabel: String? = null,
        override val onAction: (() -> Unit)? = null
    ) : UiMessage(id, message, actionLabel, onAction)
}
