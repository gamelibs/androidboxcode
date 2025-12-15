package com.example.gameboxone.ui.screen

import com.example.gameboxone.AppLog as Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.* // 引入 height 等扩展
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.viewmodel.GameDetailViewModel
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.Check
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.draw.clip

import kotlin.math.sin
@Composable
fun GameDetailScreen(
    viewModel: GameDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    // 从 ViewModel 中获取已验证的 gameId
    val gameId = viewModel.gameId

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

    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            topBar = {
                // Custom Top Bar（去除 statusBarsPadding，避免状态栏显隐导致内容位移）
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 8.dp)
                ) {
                    IconButton(
                        onClick = { viewModel.onBackPressed() },
                        modifier = Modifier.align(Alignment.CenterStart)
                    ) {
                        Icon(
                            imageVector = androidx.compose.material.icons.Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color(0xFFFF9800) // Orange tint
                        )
                    }
                    
                    Text(
                        text = "探索者",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFF9800),
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            },
            containerColor = Color.Transparent // Make transparent to show background
        ) { paddingValues ->
            // 主要内容
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFFFFF8E1), // Light Yellow/Orange
                                Color(0xFFFFFFFF)  // White
                            )
                        )
                    )
            ) {
                // Add Adventure Path Background
                DetailPathBackground()
                
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
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

        // 内嵌覆盖层形式的“下载游戏”弹窗，不再使用系统级 Dialog，避免触发布局伸缩
        if (state.showDownloadDialog) {
            state.downloadInfo?.let { info ->
                DownloadOverlay(
                    gameName = info.gameName,
                    onConfirm = { viewModel.startDownload() },
                    onDismiss = { viewModel.dismissDownloadDialog() }
                )
            }
        }

        // 内嵌覆盖层形式的下载进度弹窗
        if (state.isDownloading) {
            DownloadProgressOverlay(progress = state.downloadProgress)
        }
    }
}

@Composable
private fun DetailPathBackground() {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val path = Path().apply {
            // Simple S-curve path
            moveTo(100f, size.height - 300f)
            cubicTo(
                100f, size.height - 500f,
                size.width - 100f, size.height - 400f,
                size.width - 150f, size.height / 2
            )
            cubicTo(
                size.width - 200f, size.height / 2 - 200f,
                200f, 300f,
                size.width / 2, 200f
            )
        }

        drawPath(
            path = path,
            color = Color.LightGray.copy(alpha = 0.5f),
            style = Stroke(
                width = 40f,
                pathEffect = PathEffect.dashPathEffect(floatArrayOf(40f, 40f), 0f)
            )
        )
    }
}

@Composable
private fun GameContent(
    game: Custom.HotGameData,
    onLaunchGame: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 游戏标题
        Text(
            text = game.name,
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // 游戏描述
        Text(
            text = game.description,
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        // 任务路径可视化
        val points = game.taskPoints ?: emptyList()
        if (points.isNotEmpty()) {
            Spacer(modifier = Modifier.height(24.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                 TaskPathVisualization(points = points)
            }
            // Add spacer to prevent overlap with button
            Spacer(modifier = Modifier.height(32.dp))
        } else {
            Spacer(modifier = Modifier.weight(1f))
        }

        // 开始冒险按钮
        StartGameButton(
            text = "开始冒险",
            onClick = onLaunchGame
        )
        
        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
private fun TaskPathVisualization(points: List<Int>) {
    val density = LocalDensity.current

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(horizontal = 32.dp)
    ) {
        val boxWidth = maxWidth
        val boxHeight = maxHeight
        val canvasWidthPx = with(density) { boxWidth.toPx() }
        val canvasHeightPx = with(density) { boxHeight.toPx() }

        val nodeCount = points.size

        // 计算节点位置
        val nodes = remember(points, canvasWidthPx, canvasHeightPx) {
            points.mapIndexed { index, score ->
                val progress = index.toFloat() / (nodeCount - 1).coerceAtLeast(1)
                // Adjust Y range to keep nodes away from bottom edge (button area)
                // Bottom node (progress=0) will be at canvasHeightPx - 120f
                // Top node (progress=1) will be at 50f
                val y = canvasHeightPx - (progress * (canvasHeightPx - 170f)) - 120f
                val xOffset = (canvasWidthPx / 3) * sin(progress * Math.PI * 1.5).toFloat()
                val x = (canvasWidthPx / 2) + xOffset
                Triple(x, y, score)
            }
        }

        // 绘制虚线路径
        Canvas(modifier = Modifier.fillMaxSize()) {
            val path = Path()
            if (nodes.isNotEmpty()) {
                path.moveTo(nodes[0].first, nodes[0].second)
                for (i in 0 until nodes.size - 1) {
                    val p1 = nodes[i]
                    val p2 = nodes[i + 1]

                    val cx1 = p1.first
                    val cy1 = (p1.second + p2.second) / 2
                    val cx2 = p2.first
                    val cy2 = (p1.second + p2.second) / 2

                    path.cubicTo(cx1, cy1, cx2, cy2, p2.first, p2.second)
                }
            }

            drawPath(
                path = path,
                color = Color.LightGray,
                style = Stroke(
                    width = 10f,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(20f, 20f), 0f)
                )
            )
        }

        // 绘制节点
        nodes.forEachIndexed { index, (x, y, score) ->
            val xDp = with(density) { x.toDp() }
            val yDp = with(density) { y.toDp() }

            Box(
                modifier = Modifier
                    .offset(x = xDp - 40.dp, y = yDp - 40.dp) // Center the larger node (80.dp / 2)
                    .size(80.dp)
            ) {
                TaskNode(index = index + 1, score = score, isCompleted = index == 0)
            }
        }
    }
}

@Composable
fun TaskNode(index: Int, score: Int, isCompleted: Boolean) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        // 节点圆圈
        androidx.compose.material3.Surface(
            shape = CircleShape,
            color = if (isCompleted) Color(0xFF4CAF50) else Color(0xFFF5F5F5),
            tonalElevation = 6.dp,
            shadowElevation = 6.dp,
            border = androidx.compose.foundation.BorderStroke(
                width = 5.dp,
                color = if (isCompleted) Color.White else Color(0xFFE0E0E0)
            ),
            modifier = Modifier.size(64.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                if (isCompleted) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Completed",
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                } else {
                    Text(
                        text = "$index",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.Gray
                    )
                }
            }
        }

        // 分数标签
        androidx.compose.material3.Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color(0xFFFFC107),
            tonalElevation = 4.dp,
            shadowElevation = 4.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.White),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .offset(y = 16.dp)
        ) {
            Text(
                text = "$score",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
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
                        Color(0xFFFFD180), // Light Orange
                        Color(0xFFFF9100)  // Deep Orange
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
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
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
    DownloadOverlay(
        gameName = gameName,
        onConfirm = onConfirm,
        onDismiss = onDismiss
    )
}

@Composable
private fun DownloadOverlay(
    gameName: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.3f))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFFFFF8E1)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier
                .padding(horizontal = 32.dp)
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Text(
                    text = "下载游戏",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF5D4037)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "游戏 $gameName 需要下载才能运行，是否立即下载？",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF6D4C41)
                )

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text(
                            text = "取消",
                            color = Color(0xFFFFA726)
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Button(
                        onClick = onConfirm,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFFFA726),
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text("下载")
                    }
                }
            }
        }
    }
}

@Composable
private fun DownloadProgressOverlay(
    progress: Float
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.3f)),
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFFFFF8E1)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier
                .padding(horizontal = 32.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Text(
                    text = "下载中",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF5D4037)
                )

                Spacer(modifier = Modifier.height(12.dp))

                LinearProgressIndicator(
                    progress = progress,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = Color(0xFFFFA726),
                    trackColor = Color(0xFFFFCC80)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "下载进度: ${(progress * 100).toInt()}%",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF6D4C41)
                )
            }
        }
    }
}
