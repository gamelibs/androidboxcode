package com.example.gameboxone.ui.screen

import com.example.gameboxone.AppLog as Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
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
                title = { Text(text = "") },
                navigationIcon = {
                    IconButton(onClick = { viewModel.onBackPressed() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "返回")
                    }
                }
            )
        },
        containerColor = Color.White
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
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 游戏信息
        Text(
            text = game.name,
            style = MaterialTheme.typography.headlineMedium,
            color = Color.Black
        )
        Text(
            text = game.description,
            style = MaterialTheme.typography.bodyLarge,
            color = Color.Black
        )

        // 任务积分条（黄色任务条）
        val points = game.taskPoints ?: emptyList()
        if (points.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            TaskPointsSection(points = points)
        }

        // 占位，将开始按钮推到底部附近
        Spacer(modifier = Modifier.weight(1f))

        // 操作按钮 - 使用游戏风格的绿色圆角按钮
        StartGameButton(
            text = "开始游戏",
            onClick = onLaunchGame
        )
    }
}

@Composable
private fun TaskPointsSection(points: List<Int>) {
    // 只显示前四个任务点
    val toShow = points.take(4)
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
            .fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        toShow.forEachIndexed { index, value ->
            TaskPointBar(index = index + 1, score = value)
        }
    }
}

@Composable
private fun TaskPointBar(
    index: Int,
    score: Int
) {
    val pillShape = RoundedCornerShape(999.dp)

    Row(
        modifier = Modifier
            .fillMaxWidth(0.8f)
            .height(48.dp)
            .background(color = Color(0xFFFFB300), shape = pillShape)
            .border(
                width = 2.dp,
                color = Color.Black,
                shape = pillShape
            )
            .padding(horizontal = 24.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = score.toString(),
            color = Color.Black,
            style = MaterialTheme.typography.titleMedium
        )

        Box(
            modifier = Modifier
                .size(32.dp)
                .background(color = Color(0xFFFFEB3B), shape = CircleShape)
                .border(
                    width = 2.dp,
                    color = Color.Black,
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = index.toString(),
                color = Color.Black,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun StartGameButton(
    text: String,
    onClick: () -> Unit,
    enabled: Boolean = true
) {
    val shape = RoundedCornerShape(28.dp)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF8BF94A), // 顶部偏亮的绿色高光
                        Color(0xFF3FBF3A)  // 底部偏深的绿色
                    )
                ),
                shape = shape
            )
            .clickable(enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = Color.White,
            style = MaterialTheme.typography.titleMedium
        )
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
