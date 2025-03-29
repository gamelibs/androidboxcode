package com.example.gameboxone.ui.screen

import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.viewmodel.GameDetailViewModel
import com.example.gameboxone.navigation.NavigationEvent
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.onEach


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameDetailScreen(
    viewModel: GameDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    // 从 ViewModel 中获取已验证的 gameId
    val gameId = viewModel.gameId

    // 显示下载对话框
    if (state.showDownloadDialog) {
        state.downloadInfo?.let { info ->
            AlertDialog(
                onDismissRequest = {
                    // 关闭对话框
                    viewModel.dismissDownloadDialog()
                },
                title = { Text("下载游戏") },
                text = {
                    Text("游戏 ${info.gameName} 需要下载才能运行，是否立即下载？")
                },
                confirmButton = {
                    Button(
                        onClick = { viewModel.startDownload() }
                    ) {
                        Text("下载")
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = { viewModel.dismissDownloadDialog() }
                    ) {
                        Text("取消")
                    }
                }
            )
        }
    }

    // 显示进度对话框
    if (state.isDownloading) {
        AlertDialog(
            onDismissRequest = { /* 下载时不允许取消 */ },
            title = { Text("下载中") },
            text = {
                Column {
                    LinearProgressIndicator(
                        progress = state.downloadProgress,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                    )
                    Text("下载进度: ${(state.downloadProgress * 100).toInt()}%")
                }
            },
            confirmButton = {}  // 下载时不显示按钮
        )
    }

    // 初始化加载
    LaunchedEffect(gameId) {
        viewModel.loadGameDetails(gameId)
    }

    LaunchedEffect(error) {
        error?.let { errorMessage ->
            // 只记录错误，实际显示由全局消息系统处理
            Log.e("GameDetailScreen", "错误: $errorMessage")
            
            // 10秒后自动清除错误状态
            kotlinx.coroutines.delay(10000)
            viewModel.clearError()
        }
    }

    Scaffold(
        topBar = {

            TopAppBar(
                title = { Text(text = state.game?.name ?: "游戏详情") },
                navigationIcon = {
                    IconButton(onClick = { viewModel.onBackPressed() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "返回")
                    }
                }
            )
        }
    ) { paddingValues ->
        // 主要内容
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)  // 添加 Scaffold 的内边距
        ) {
            when {
                isLoading -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CircularProgressIndicator()
                        
                        // 显示加载消息（如果有）
                        state.loadingMessage?.let { message ->
                            Text(
                                text = message,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
                state.game != null -> {
                    GameContent(
                        game = state.game!!,
                        onLaunchGame = { viewModel.launchGame() }
                    )
                }
                else -> {
                    EmptyContent()
                }
            }
        }
    }
}

@Composable
private fun GameContent(
    game: Custom.HotGameData,
    onLaunchGame: () -> Unit // 添加回调参数
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // 游戏信息
        Text(
            text = "游戏名称: ${game.name}",
            style = MaterialTheme.typography.headlineMedium
        )
        Text(
            text = "游戏描述: ${game.description}",
            style = MaterialTheme.typography.bodyLarge
        )

        // 操作按钮
        Button(
            onClick = onLaunchGame, // 这里调用回调函数
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = "开始游戏")
        }
    }
}

/**
 * 空内容显示组件
 * 当没有游戏数据时显示的界面
 */
@Composable
private fun EmptyContent(
    icon: ImageVector = Icons.Default.Warning,
    title: String = "未找到游戏信息",
    message: String = "请检查游戏ID是否正确"
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = "警告",
            modifier = Modifier.size(48.dp),
            tint = MaterialTheme.colorScheme.error
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun DownloadDialog(
    gameName: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("下载提示") },
        text = { Text("游戏 $gameName 需要下载才能运行，是否现在下载？") },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text("下载")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        }
    )
}