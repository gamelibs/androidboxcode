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
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.draw.clip
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.UserProfile
import com.example.gameboxone.data.model.UserLevelConfig
import com.example.gameboxone.R
import com.example.gameboxone.data.viewmodel.MyGameViewModel
import com.example.gameboxone.data.viewmodel.UserProfileViewModel
import com.example.gameboxone.data.viewmodel.HomeViewModel
import kotlinx.coroutines.launch

private const val TAG = "MyGameScreen"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyGameScreen(
    viewModel: MyGameViewModel = hiltViewModel(),
    userProfileViewModel: UserProfileViewModel = hiltViewModel()
) {
    val homeViewModel: HomeViewModel = hiltViewModel()

    val uiState by viewModel.uiState.collectAsState()
    val profile by userProfileViewModel.profile.collectAsState()

    // SDK version collected from ViewModel StateFlow so UI reflects updates
    val sdkVersion by viewModel.sdkVersion.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    
    // Delete Confirmation Dialog State
    var showDeleteDialog by remember { mutableStateOf(false) }
    var gameToDelete by remember { mutableStateOf<Custom.MyGameData?>(null) }

    // 初次进入页面加载数据 - 使用LaunchedEffect(key1 = true)确保只执行一次
    LaunchedEffect(key1 = true) {
        Log.d(TAG, "MyGameScreen LaunchedEffect: 初始化加载数据")
        Log.d(TAG, "MyGameScreen ViewModel instances: MyGameViewModel=${viewModel.hashCode()}, HomeViewModel=${homeViewModel.hashCode()}")
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
    
    // Log when sdkVersion changes so we can debug UI updates
    LaunchedEffect(sdkVersion) {
        Log.d(TAG, "UI observed sdkVersion = $sdkVersion")
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
        ) {
            val currentLevel = UserLevelConfig.levelForExp(profile.exp)
            val nextLevel = UserLevelConfig.nextLevel(currentLevel)
            
            // 游戏列表内容
            if (uiState.games.isEmpty() && !uiState.isLoading) {
                // 空状态
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // 1. User Profile Card
                    item {
                        UserProfileCard(
                            level = currentLevel.level,
                            title = currentLevel.title,
                            exp = profile.exp,
                            maxExp = nextLevel.requiredExp,
                            nickname = profile.nickname ?: "玩家",
                            coins = profile.coins,
                            serverLevel = profile.level,
                            expPercent = profile.expPercent,
                            sdkVersion = sdkVersion,
                            onSdkUpdate = { homeViewModel.refreshSdkOnly() },
                            onRefresh = { homeViewModel.syncGameConfig() }
                        )
                    }

                    // 2. Stats Row
                    item {
                        UserStatsRow(uiState.games.size, 48) // Mock 48h for now
                    }
                    
                    item {
                        EmptyGameList(onRefresh = { viewModel.refreshGameList() })
                    }
                }
            } else {
                // 游戏列表
                GameList(
                    games = uiState.games,
                    downloadingGameId = uiState.downloadingGameId,
                    downloadProgress = uiState.downloadProgress,
                    deletingGameId = uiState.deletingGameId,
                    sdkVersion = sdkVersion,
                    onSdkUpdate = { homeViewModel.refreshSdkOnly() },
                    onRefresh = { homeViewModel.syncGameConfig() },
                    onPlay = { viewModel.playGame(it) },
                    onDownload = { viewModel.downloadGame(it) },
                    onUpdate = { viewModel.updateGame(it) },
                    onDelete = { game ->
                        Log.d(TAG, "点击删除: ${game.name} (${game.gameId})")
                        gameToDelete = game
                        showDeleteDialog = true
                    },
                    userProfile = profile
                )
            }

            // 加载指示器
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            // Delete Confirmation Dialog - 放在内容之后，保证覆盖在列表之上
            val pendingDeleteGame = gameToDelete
            if (showDeleteDialog && pendingDeleteGame != null) {
                ConfirmOverlayDialog(
                    visible = true,
                    title = "确认删除",
                    message = "确定要删除游戏 \"${pendingDeleteGame.name}\" 吗？此操作不可撤销。",
                    confirmText = "删除",
                    dismissText = "取消",
                    onConfirm = {
                        viewModel.deleteGame(pendingDeleteGame)
                        showDeleteDialog = false
                        gameToDelete = null
                    },
                    onDismiss = {
                        showDeleteDialog = false
                        gameToDelete = null
                    }
                )
            }
        }
    }
}

@Composable
fun UserProfileCard(
    level: Int,
    title: String,
    exp: Long,
    maxExp: Long,
    nickname: String = "玩家",
    coins: Int? = null,
    serverLevel: Int? = null,
    expPercent: Int? = null,
    sdkVersion: String = "0.0.0",
    onSdkUpdate: () -> Unit = {},
    onRefresh: () -> Unit = {}
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primary
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Avatar Placeholder
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "U",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = nickname.ifBlank { "玩家" },
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    androidx.compose.material3.Surface(
                        color = Color.White.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = if (serverLevel != null) {
                                "Lv.$serverLevel"
                            } else {
                                "Lv.$level $title"
                            },
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            color = Color.White,
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // EXP Bar
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "经验值",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                    Text(
                        text = if (expPercent != null) {
                            "${expPercent.coerceIn(0, 100)}%"
                        } else {
                            "$exp / $maxExp"
                        },
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = {
                        if (expPercent != null) {
                            (expPercent.coerceIn(0, 100) / 100f)
                        } else {
                            (exp.toFloat() / maxExp.toFloat()).coerceIn(0f, 1f)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = Color.White,
                    trackColor = Color.White.copy(alpha = 0.3f)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // SDK row: show version + action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "SDK: $sdkVersion",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                        coins?.let { c ->
                            Text(
                                text = "金币: $c",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.White.copy(alpha = 0.85f)
                            )
                        }
                    }

                    Row {
                        IconButton(onClick = onSdkUpdate) {
                            Icon(
                                imageVector = Icons.Default.CloudDownload,
                                contentDescription = "SDK Update",
                                tint = Color.White
                            )
                        }

                        IconButton(onClick = onRefresh) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Refresh",
                                tint = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun UserStatsRow(gamesCount: Int, hours: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        StatCard(
            modifier = Modifier.weight(1f),
            value = gamesCount.toString(),
            label = "拥有游戏",
            icon = Icons.Default.SportsEsports,
            color = MaterialTheme.colorScheme.secondaryContainer
        )
        StatCard(
            modifier = Modifier.weight(1f),
            value = "${hours}h",
            label = "游玩时长",
            icon = Icons.Default.History,
            color = MaterialTheme.colorScheme.tertiaryContainer
        )
    }
}

@Composable
fun StatCard(
    modifier: Modifier = Modifier,
    value: String,
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color)
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Start
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = value,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = label,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
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

        Button(onClick = onRefresh) {
            Icon(imageVector = Icons.Default.Refresh, contentDescription = "刷新")
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = "刷新")
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun GameList(
    games: List<Custom.MyGameData>,
    downloadingGameId: String?,
    downloadProgress: Float,
    deletingGameId: String?,
    sdkVersion: String = "0.0.0",
    onSdkUpdate: () -> Unit = {},
    onRefresh: () -> Unit = {},
    onPlay: (Custom.MyGameData) -> Unit,
    onDownload: (Custom.MyGameData) -> Unit,
    onUpdate: (Custom.MyGameData) -> Unit,
    onDelete: (Custom.MyGameData) -> Unit,
    userProfile: UserProfile
) {
    val currentLevel = UserLevelConfig.levelForExp(userProfile.exp)
    val nextLevel = UserLevelConfig.nextLevel(currentLevel)

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. User Profile Card
        item {
            UserProfileCard(
                level = currentLevel.level,
                title = currentLevel.title,
                exp = userProfile.exp,
                maxExp = nextLevel.requiredExp,
                nickname = userProfile.nickname ?: "玩家",
                coins = userProfile.coins,
                serverLevel = userProfile.level,
                expPercent = userProfile.expPercent,
                sdkVersion = sdkVersion,
                onSdkUpdate = onSdkUpdate,
                onRefresh = onRefresh
            )
        }

        // 2. Stats Row
        item {
            UserStatsRow(games.size, 48) // Mock 48h for now
        }

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

                        // Status Icon：仅未安装时显示云朵下载，不再在已安装游戏图标上显示播放三角
                        if (!game.isLocal) {
                            Box(
                                modifier = Modifier
                                    .size(18.dp)
                                    .align(Alignment.BottomEnd)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.secondary)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CloudDownload,
                                    contentDescription = "未安装",
                                    tint = Color.White,
                                    modifier = Modifier
                                        .size(12.dp)
                                        .align(Alignment.Center)
                                )
                            }
                        }

                        // Delete Button - Moved to Top Right of the ICON
                        if (game.isLocal && !isDownloading) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(2.dp)
                                    .size(20.dp)
                                    .clip(CircleShape)
                                    .background(Color.Black.copy(alpha = 0.4f))
                                    .clickable(onClick = onDelete)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Delete,
                                    contentDescription = "删除",
                                    tint = Color.White.copy(alpha = 0.9f),
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
                            text = if (game.size == "未知大小" || game.size == "0") "~" else "${game.size}MB",
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
                        modifier = Modifier
                            .padding(start = 8.dp)
                            .width(104.dp), // Slightly wider for better text fit
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        ),
                        contentPadding = PaddingValues(horizontal = 8.dp) // Reduce padding to fit text
                    ) {
                        Text(
                            text = primaryText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
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
                            progress = { animatedProgress },
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
