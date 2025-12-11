package com.example.gameboxone.ui.screen

import com.example.gameboxone.AppLog as Log
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Update
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.gameboxone.R
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.viewmodel.MyGameViewModel
import com.example.gameboxone.manager.IconCacheManager
import kotlinx.coroutines.launch
import java.io.File

private const val TAG = "MyGameScreen"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyGameScreen(
    viewModel: MyGameViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // 初次进入页面加载数据 - 使用LaunchedEffect(key1 = true)确保只执行一次
    LaunchedEffect(key1 = true) {
        Log.d(TAG, "MyGameScreen LaunchedEffect: 初始化加载数据")
        viewModel.loadGameData()
    }

    // 显示错误信息
    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            scope.launch {
                snackbarHostState.showSnackbar(message = it)
            }
        }
    }

    Scaffold(
        topBar = { com.example.gameboxone.ui.component.AppTopBar(title = null) },
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
        ) {
            // 游戏列表内容
            if (uiState.games.isEmpty() && !uiState.isLoading) {
                // 空状态
                EmptyGameList(onRefresh = { viewModel.refreshGameList() })
            } else {
                // 游戏列表
                GameList(
                    games = uiState.games,
                    downloadingGameId = uiState.downloadingGameId,
                    downloadProgress = uiState.downloadProgress,
                    deletingGameId = uiState.deletingGameId,
                    onPlay = { viewModel.playGame(it) },
                    onDownload = { viewModel.downloadGame(it) },
                    onUpdate = { viewModel.updateGame(it) },
                    onDelete = { viewModel.deleteGame(it) }
                )
            }

            // 加载指示器
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }
    }
}

@Composable
fun EmptyGameList(onRefresh: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(120.dp))

        Icon(
            imageVector = Icons.Default.SportsEsports,
            contentDescription = null,
            modifier = Modifier.size(120.dp),
            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "暂无已安装的游戏",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "您可以在首页浏览和下载游戏",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun GameList(
    games: List<Custom.MyGameData>,
    downloadingGameId: String?,
    downloadProgress: Float,
    deletingGameId: String?,
    onPlay: (Custom.MyGameData) -> Unit,
    onDownload: (Custom.MyGameData) -> Unit,
    onUpdate: (Custom.MyGameData) -> Unit,
    onDelete: (Custom.MyGameData) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp)
    ) {
        items(games) { game ->
            GameItemCard(
                game = game,
                isDownloading = game.id == downloadingGameId,
                downloadProgress = if (game.id == downloadingGameId) downloadProgress else 0f,
                isDeleting = game.id == deletingGameId,
                onPlay = { onPlay(game) },
                onDownload = { onDownload(game) },
                onUpdate = { onUpdate(game) },
                onDelete = { onDelete(game) }
            )

            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@Composable
private fun GameCard(
    game: Custom.MyGameData,
    iconCacheManager: IconCacheManager,
    onPlayClick: () -> Unit = {},
    onDownloadClick: () -> Unit = {},
    onUpdateClick: () -> Unit = {}
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {

            // 获取图标文件
            val iconFile by produceState<File?>(initialValue = null, key1 = game.id) {
                // Use downicon/downloadUrl as the source; iconUrl deprecated
                value = iconCacheManager.getGameIcon(game.id.toInt(), "", game.downloadUrl)
            }
            // 游戏图标
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
            ) {
                AsyncImage(
                    model = iconFile,
                    contentDescription = "游戏图标",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                    error = painterResource(id = R.drawable.ic_game_default),
                    placeholder = painterResource(id = R.drawable.ic_game_default)
                )
            }
            
            // 游戏信息和操作按钮
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // 游戏名称
                Text(
                    text = game.name,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                
                // 游戏操作按钮
                when {
                    game.isLocal -> {
                        Button(
                            onClick = onPlayClick,
                            modifier = Modifier.padding(start = 8.dp)
                        ) {
                            Text("启动")
                        }
                        
                        if (game.hasUpdate) {
                            Button(
                                onClick = onUpdateClick,
                                modifier = Modifier.padding(start = 8.dp)
                            ) {
                                Text("更新")
                            }
                        }
                    }
                    else -> {
                        Button(
                            onClick = onDownloadClick,
                            modifier = Modifier.padding(start = 8.dp)
                        ) {
                            Text("下载")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun GameItemCard(
    game: Custom.MyGameData,
    isDownloading: Boolean,
    downloadProgress: Float,
    isDeleting: Boolean,
    onPlay: () -> Unit,
    onDownload: () -> Unit,
    onUpdate: () -> Unit,
    onDelete: () -> Unit
) {
    val animatedProgress by animateFloatAsState(
        targetValue = downloadProgress,
        label = "下载进度"
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            // 左上角删除 X 按钮
            IconButton(
                onClick = onDelete,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(4.dp)
                    .size(20.dp)
                    .background(
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.9f),
                        shape = CircleShape
                    )
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "删除游戏",
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                    modifier = Modifier.size(12.dp)
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 12.dp)
            ) {
                // 游戏信息部分
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // 游戏图标
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        if (game.iconUrl.isNotBlank()) {
                            AsyncImage(
                                model = ImageRequest.Builder(LocalContext.current)
                                    .data(game.iconUrl)
                                    .crossfade(true)
                                    .placeholder(R.drawable.ic_game_default)
                                    .error(R.drawable.ic_game_default)
                                    .fallback(R.drawable.ic_game_default)
                                    .build(),
                                contentDescription = game.name,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop,
                                error = painterResource(id = R.drawable.ic_game_default),
                                placeholder = painterResource(id = R.drawable.ic_game_default),
                                fallback = painterResource(id = R.drawable.ic_game_default)
                            )
                        } else {
                            Image(
                                painter = painterResource(id = R.drawable.ic_game_default),
                                contentDescription = "默认游戏图标",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Fit
                            )
                        }

                        if (game.isLocal) {
                            Box(
                                modifier = Modifier
                                    .size(18.dp)
                                    .align(Alignment.BottomEnd)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.SportsEsports,
                                    contentDescription = "已安装",
                                    tint = Color.White,
                                    modifier = Modifier
                                        .size(12.dp)
                                        .align(Alignment.Center)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    // 中间：名称 + 大小
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = game.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Text(
                            text = "${game.size}MB",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }

                    // 右侧：单一主按钮（启动 / 更新 / 下载）
                    val primaryText: String
                    val primaryAction: () -> Unit

                    when {
                        isDownloading -> {
                            primaryText = "下载中"
                            primaryAction = {}
                        }
                        game.isLocal && game.hasUpdate -> {
                            primaryText = "更新"
                            primaryAction = onUpdate
                        }
                        game.isLocal -> {
                            primaryText = "启动"
                            primaryAction = onPlay
                        }
                        else -> {
                            primaryText = "下载"
                            primaryAction = onDownload
                        }
                    }

                    Button(
                        onClick = primaryAction,
                        enabled = !isDownloading,
                        modifier = Modifier.padding(start = 12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Text(primaryText)
                    }
                }

                // 下载进度条
                AnimatedVisibility(
                    visible = isDownloading,
                    enter = fadeIn() + expandVertically(),
                    exit = fadeOut() + shrinkVertically()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                    ) {
                        LinearProgressIndicator(
                            progress = animatedProgress,
                            modifier = Modifier.fillMaxWidth(),
                            color = MaterialTheme.colorScheme.primary,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "下载中 ${(animatedProgress * 100).toInt()}%",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                // 删除中的提示保持不变
                AnimatedVisibility(
                    visible = isDeleting,
                    enter = fadeIn() + expandVertically(),
                    exit = fadeOut() + shrinkVertically()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "正在删除...",
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
        }
    }
}
