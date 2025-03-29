package com.example.gameboxone.ui.component

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import com.example.gameboxone.base.UiMessage
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import kotlinx.coroutines.delay
import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.compose.material3.AlertDialog

/**
 * 全局消息显示组件
 * 处理各种类型的消息显示，包括Snackbar、Dialog等
 */
@Composable
fun MessageDisplay(
    messages: List<UiMessage>,
    onDismiss: (UiMessage) -> Unit
) {
    // 添加调试日志
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            Log.d("MessageDisplay", "显示 ${messages.size} 条消息")
        }
    }
    
    // 显示消息
    messages.forEach { message ->
        when (message) {
            is UiMessage.Error -> {
                ErrorMessage(
                    message = message,
                    onDismiss = { onDismiss(message) }
                )
            }
            // 处理其他类型消息
            else -> {
                InfoMessage(
                    message = message,
                    onDismiss = { onDismiss(message) }
                )
            }
        }
    }
}

@Composable
private fun ErrorMessage(
    message: UiMessage.Error,
    onDismiss: () -> Unit
) {
    // 使用Material3的Snackbar或AlertDialog显示错误
    val showDialog = remember { mutableStateOf(true) }
    
    if (showDialog.value) {
        AlertDialog(
            onDismissRequest = {
                showDialog.value = false
                onDismiss()
            },
            title = { Text("错误") },
            text = { Text(message.message) },
            confirmButton = {
                TextButton(onClick = {
                    showDialog.value = false
                    onDismiss()
                }) {
                    Text("确定")
                }
            }
        )
    }
}

@Composable
private fun InfoMessage(
    message: UiMessage,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {

            Text(
                text = message.message,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                contentAlignment = Alignment.CenterEnd
            ) {
                Button(
                    onClick = {
                        onDismiss()
                    }
                ) {
                    Text("确定")
                }
            }
        }
        }
}

/**
 * 消息对话框
 */
@Composable
fun MessageDialog(
    message: UiMessage.Dialog,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Text(
                text = message.title,
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(16.dp)
            )

            Text(
                text = message.message,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                contentAlignment = Alignment.CenterEnd
            ) {
                Button(
                    onClick = {
                        message.confirmAction()
                        onDismiss()
                    }
                ) {
                    Text("确定")
                }
            }
        }
    }
}