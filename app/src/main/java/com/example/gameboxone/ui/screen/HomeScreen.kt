package com.example.gameboxone.ui.screen

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.GenericShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.NotificationsNone
import androidx.compose.material.icons.filled.PersonOutline
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.data.model.AdventureHomeUiState
import com.example.gameboxone.data.model.AdventureTaskStatus
import com.example.gameboxone.data.model.AdventureTaskUiModel
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.viewmodel.HomeViewModel
import com.example.gameboxone.ui.component.AiAssistantFab
import com.example.gameboxone.ui.theme.AdventureThemeAssistantName
import com.example.gameboxone.ui.theme.AdventureThemeHomeSubline
import com.example.gameboxone.ui.theme.AdventureThemeNameCn
import com.example.gameboxone.ui.theme.AdventureThemeNameEn
import com.example.gameboxone.ui.theme.AdventureThemeTagline
import com.example.gameboxone.ui.component.GameCardEnhanced
import com.example.gameboxone.ui.theme.AdventureRealmBackgroundBottom
import com.example.gameboxone.ui.theme.AdventureRealmBackgroundMid
import com.example.gameboxone.ui.theme.AdventureRealmBackgroundTop
import com.example.gameboxone.ui.theme.AdventureRealmGlassBottom
import com.example.gameboxone.ui.theme.AdventureRealmGlassTop
import com.example.gameboxone.ui.theme.AdventureRealmGlow
import com.example.gameboxone.ui.theme.AdventureRealmGlowStrong
import com.example.gameboxone.ui.theme.AdventureRealmLine
import com.example.gameboxone.ui.theme.AdventureRealmSuccess
import com.example.gameboxone.ui.theme.AdventureRealmTextPrimary
import com.example.gameboxone.ui.theme.AdventureRealmTextSecondary
import kotlin.math.roundToInt

private val RealmHexShape = GenericShape { size, _ ->
    moveTo(size.width * 0.22f, 0f)
    lineTo(size.width * 0.78f, 0f)
    lineTo(size.width, size.height * 0.5f)
    lineTo(size.width * 0.78f, size.height)
    lineTo(size.width * 0.22f, size.height)
    lineTo(0f, size.height * 0.5f)
    close()
}

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onGameSelected: (GameConfigItem) -> Unit = {},
    onOpenAdventure: () -> Unit = {},
    onOpenProfile: () -> Unit = {},
    onOpenSettings: () -> Unit = {},
    onAiAssistantClick: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.error) {
        uiState.error?.let { snackbarHostState.showSnackbar(message = it) }
    }

    Scaffold(
        containerColor = Color.Transparent,
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            AdventureRealmBackgroundTop,
                            Color(0xFFE0A363),
                            AdventureRealmBackgroundMid,
                            AdventureRealmBackgroundBottom
                        )
                    )
                )
                .padding(padding)
        ) {
            AmbientParticles()

            if (uiState.isLoading && !uiState.adventureHome.isInitialized) {
                LoadingContent()
            } else {
                AdventureHomeContent(
                    adventure = uiState.adventureHome,
                    games = uiState.games,
                    viewModel = viewModel,
                    onGameClick = onGameSelected,
                    onOpenAdventure = onOpenAdventure,
                    onOpenProfile = onOpenProfile,
                    onOpenSettings = onOpenSettings,
                    onAiAssistantClick = onAiAssistantClick
                )
            }
        }
    }
}

@Composable
private fun LoadingContent() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(color = AdventureRealmGlow)
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "正在构建未来主界面…",
                style = MaterialTheme.typography.bodyMedium,
                color = AdventureRealmTextPrimary
            )
        }
    }
}

@Composable
private fun AdventureHomeContent(
    adventure: AdventureHomeUiState,
    games: List<GameConfigItem>,
    viewModel: HomeViewModel,
    onGameClick: (GameConfigItem) -> Unit,
    onOpenAdventure: () -> Unit,
    onOpenProfile: () -> Unit,
    onOpenSettings: () -> Unit,
    onAiAssistantClick: () -> Unit
) {
    val rewardTask = adventure.chapterTasks.firstOrNull { it.status == AdventureTaskStatus.ACHIEVED }
    val primaryTask = adventure.recommendedTasks.firstOrNull()
        ?: adventure.chapterTasks.firstOrNull {
            it.status == AdventureTaskStatus.AVAILABLE || it.status == AdventureTaskStatus.IN_PROGRESS
        }
    val taskConsoleItems = buildList {
        rewardTask?.let(::add)
        primaryTask?.let(::add)
        addAll(adventure.chapterTasks.filter { it.status != AdventureTaskStatus.LOCKED }.take(4))
    }.distinctBy { it.taskId }.take(4)
    val gameDockItems = games.take(3)
    val quickGame = games.firstOrNull()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 10.dp, bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            FutureRealmHero(
                adventure = adventure,
                primaryTask = primaryTask,
                rewardTask = rewardTask,
                quickGame = quickGame,
                onPrimaryTask = {
                    primaryTask?.let { viewModel.navigateToTaskDetail(it.taskId) }
                },
                onRewardTask = {
                    when {
                        rewardTask != null -> viewModel.claimReward(rewardTask.taskId)
                        primaryTask != null -> viewModel.navigateToTaskDetail(primaryTask.taskId)
                    }
                },
                onQuickGame = { quickGame?.let(onGameClick) },
                onLevelUp = { viewModel.doLevelUp() },
                onOpenAdventure = onOpenAdventure,
                onOpenProfile = onOpenProfile,
                onOpenSettings = onOpenSettings,
                onAiAssistantClick = onAiAssistantClick
            )
        }

        if (!adventure.emptyMessage.isNullOrBlank()) {
            item {
                RealmInfoCard(
                    title = if (adventure.chapterTasks.isEmpty()) "系统提示" else "挑战提示",
                    body = adventure.emptyMessage
                )
            }
        }

        if (taskConsoleItems.isNotEmpty()) {
            item {
                MissionConsoleCard(
                    adventure = adventure,
                    tasks = taskConsoleItems,
                    onTaskAction = { task ->
                        if (task.status == AdventureTaskStatus.ACHIEVED) {
                            viewModel.claimReward(task.taskId)
                        } else {
                            viewModel.navigateToTaskDetail(task.taskId)
                        }
                    }
                )
            }
        }

        if (adventure.recentActivities.isNotEmpty()) {
            item {
                SignalFeedCard(items = adventure.recentActivities)
            }
        }

        if (gameDockItems.isNotEmpty()) {
            item {
                GameDockCard(
                    games = gameDockItems,
                    viewModel = viewModel,
                    onGameClick = onGameClick
                )
            }
        }
    }
}

@Composable
private fun FutureRealmHero(
    adventure: AdventureHomeUiState,
    primaryTask: AdventureTaskUiModel?,
    rewardTask: AdventureTaskUiModel?,
    quickGame: GameConfigItem?,
    onPrimaryTask: () -> Unit,
    onRewardTask: () -> Unit,
    onQuickGame: () -> Unit,
    onLevelUp: () -> Unit,
    onOpenAdventure: () -> Unit,
    onOpenProfile: () -> Unit,
    onOpenSettings: () -> Unit,
    onAiAssistantClick: () -> Unit
) {
    val completedRatio = if (adventure.requiredTaskCount > 0) {
        (adventure.completedTaskCount.toFloat() / adventure.requiredTaskCount.toFloat()).coerceIn(0f, 1f)
    } else {
        0f
    }
    val mentalPower = deriveMentalPower(adventure)
    val rankLabel = deriveRank(adventure.currentLevel, completedRatio)

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .clip(RoundedCornerShape(34.dp))
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        AdventureRealmGlassTop,
                        AdventureRealmGlassBottom,
                        Color(0x1CFFFFFF)
                    )
                )
            )
            .border(1.dp, AdventureRealmLine.copy(alpha = 0.48f), RoundedCornerShape(34.dp))
            .padding(horizontal = 18.dp, vertical = 18.dp)
    ) {
        val isCompact = maxWidth < 380.dp
        val heroVisualHeight = if (isCompact) 560.dp else 640.dp
        val actionNodeWidth = if (isCompact) 90.dp else 108.dp
        val actionNodeHeight = if (isCompact) 82.dp else 98.dp
        val bottomNodeHorizontalPadding = if (isCompact) 2.dp else 12.dp
        // 塔底占 heroVisualHeight 的76%，下方留 24% 空间用于按鈕 + 间距
        val bottomNodeBottomPadding = (heroVisualHeight * 0.24f - actionNodeHeight - 12.dp).coerceAtLeast(8.dp)
        val metricSpacing = if (isCompact) 8.dp else 12.dp

        Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AiAssistantFab(
                        size = 50.dp,
                        onClick = onAiAssistantClick
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = AdventureThemeAssistantName,
                            color = AdventureRealmGlow,
                            fontWeight = FontWeight.ExtraBold,
                            style = MaterialTheme.typography.titleSmall
                        )
                        Text(
                            text = AdventureThemeTagline,
                            color = AdventureRealmTextSecondary,
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    RealmTopIconButton(
                        icon = Icons.Default.PersonOutline,
                        contentDescription = "个人中心",
                        onClick = onOpenProfile
                    )
                    RealmTopIconButton(
                        icon = Icons.Default.NotificationsNone,
                        contentDescription = "通知",
                        onClick = onOpenAdventure
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(metricSpacing)
            ) {
                val idSuffix = adventure.localPlayerName.takeLast(4).uppercase()
                RealmMetricTile(
                    modifier = Modifier.weight(1f).height(72.dp),
                    label = "Power",
                    value = mentalPower.toString(),
                    caption = "#$idSuffix"
                )
                RealmMetricTile(
                    modifier = Modifier.weight(1f).height(72.dp),
                    label = "段位",
                    value = adventure.currentTitle,
                    caption = rankLabel
                )
                RealmMetricTile(
                    modifier = Modifier.weight(1f).height(72.dp),
                    label = "Coins",
                    value = adventure.totalCoins.toString(),
                    caption = "EXP ${adventure.totalExp}"
                )
            }

            BoxWithConstraints(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(heroVisualHeight)
            ) {
                HologramStage(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .fillMaxSize(),
                    adventure = adventure,
                    progress = completedRatio
                )

                OrbitActionNode(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(start = 4.dp, top = 8.dp),
                    width = actionNodeWidth,
                    height = actionNodeHeight,
                    title = "推荐挑战",
                    subtitle = primaryTask?.taskTitle ?: "等待任务同步",
                    icon = Icons.Default.AutoAwesome,
                    onClick = onPrimaryTask
                )

                OrbitActionNode(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(end = 4.dp, top = 8.dp),
                    width = actionNodeWidth,
                    height = actionNodeHeight,
                    title = if (rewardTask != null) "立即领奖" else "今日任务",
                    subtitle = rewardTask?.rewardText ?: primaryTask?.statusLabel ?: "完成后可领奖",
                    icon = Icons.Default.EmojiEvents,
                    onClick = onRewardTask
                )

                OrbitActionNode(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(start = bottomNodeHorizontalPadding, bottom = bottomNodeBottomPadding),
                    width = actionNodeWidth,
                    height = actionNodeHeight,
                    title = "历练地图",
                    subtitle = "Lv.${adventure.currentLevel} 路径已解锁",
                    icon = Icons.Default.Explore,
                    onClick = onOpenAdventure
                )

                OrbitActionNode(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(end = bottomNodeHorizontalPadding, bottom = bottomNodeBottomPadding),
                    width = actionNodeWidth,
                    height = actionNodeHeight,
                    title = "游戏仓库",
                    subtitle = quickGame?.name ?: "查看可玩游戏",
                    icon = Icons.Default.SportsEsports,
                    onClick = onQuickGame
                )

                if (adventure.upgradeReady) {
                    Button(
                        onClick = onLevelUp,
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 14.dp),
                        shape = RoundedCornerShape(18.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AdventureRealmGlow,
                            contentColor = Color(0xFF8D4E17)
                        )
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("立即升至 ${adventure.nextLevelPreview}", fontWeight = FontWeight.Bold)
                    }
                }

                // 挑战进度 - 显示在底部两个六边形上方
                Text(
                    text = "挑战进度 ${(completedRatio * 100).roundToInt()}%",
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = bottomNodeBottomPadding + actionNodeHeight + 6.dp),
                    color = AdventureRealmTextPrimary,
                    style = MaterialTheme.typography.labelMedium
                )
            }

            RealmProgressPanel(adventure = adventure, progress = completedRatio)
        }
    }
}

@Composable
private fun RealmTopIconButton(
    icon: ImageVector,
    contentDescription: String,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .size(40.dp)
            .clickable(onClick = onClick),
        shape = CircleShape,
        color = Color.White.copy(alpha = 0.1f),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.18f))
    ) {
        Box(contentAlignment = Alignment.Center) {
            Icon(
                imageVector = icon,
                contentDescription = contentDescription,
                tint = AdventureRealmGlow,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun RealmMetricTile(
    modifier: Modifier = Modifier,
    label: String,
    value: String,
    caption: String
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(22.dp))
            .background(Color.White.copy(alpha = 0.08f))
            .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(22.dp))
            .padding(horizontal = 14.dp, vertical = 12.dp)
    ) {
        Text(
            text = "$label:",
            color = AdventureRealmTextPrimary,
            style = MaterialTheme.typography.labelMedium
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = value,
            color = AdventureRealmGlow,
            fontWeight = FontWeight.ExtraBold,
            style = MaterialTheme.typography.headlineSmall
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = caption,
            color = AdventureRealmTextSecondary,
            style = MaterialTheme.typography.labelMedium
        )
    }
}

@Composable
private fun HologramStage(
    modifier: Modifier = Modifier,
    adventure: AdventureHomeUiState,
    progress: Float
) {
    val transition = rememberInfiniteTransition(label = "stage_glow")
    val glowScale by transition.animateFloat(
        initialValue = 0.92f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2200),
            repeatMode = RepeatMode.Reverse
        ),
        label = "stage_scale"
    )
    val haloAlpha by transition.animateFloat(
        initialValue = 0.18f,
        targetValue = 0.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800),
            repeatMode = RepeatMode.Reverse
        ),
        label = "halo_alpha"
    )

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val baseWidth = size.width * 0.88f
            val centerX = size.width / 2f
            val baseY = size.height * 0.74f
            val towerTopTarget = size.height * 0.09f

            // 底座椭圆光晕
            drawOval(
                color = AdventureRealmGlow.copy(alpha = 0.30f),
                topLeft = Offset(centerX - baseWidth * 0.76f, baseY - 52f),
                size = Size(baseWidth * 1.52f, 104f)
            )
            drawOval(
                color = Color.White.copy(alpha = 0.12f),
                topLeft = Offset(centerX - baseWidth * 0.72f, baseY - 44f),
                size = Size(baseWidth * 1.44f, 88f),
                style = Stroke(width = 3f)
            )

            // 8圈螺旋平台：底部最亮，逐渐向上变淡
            val ringCount = 8
            val ringSpacing = (baseY - towerTopTarget - 40f) / (ringCount - 1).toFloat()
            repeat(ringCount) { index ->
                val ringWidth = baseWidth - index * (baseWidth * 0.08f)
                val ringHeight = 34f
                val ringY = baseY - index * ringSpacing
                // index 0=底部最亮(0.95)，index 7=顶部最淡(0.25)
                val alpha = 0.95f - index * 0.10f
                val strokeW = when (index) {
                    0 -> 10f
                    1 -> 8.5f
                    2 -> 7f
                    3 -> 6f
                    else -> 4.5f
                }
                drawOval(
                    color = AdventureRealmGlow.copy(alpha = alpha),
                    topLeft = Offset(centerX - ringWidth / 2f, ringY),
                    size = Size(ringWidth, ringHeight),
                    style = Stroke(width = strokeW)
                )
                // 内填充光：底亮顶暗
                val fillAlpha = (0.22f - index * 0.025f).coerceAtLeast(0.02f)
                drawOval(
                    color = AdventureRealmGlowStrong.copy(alpha = fillAlpha),
                    topLeft = Offset(centerX - ringWidth * 0.38f, ringY + 8f),
                    size = Size(ringWidth * 0.76f, ringHeight - 16f)
                )
            }

            // 塔身侧线
            val towerTopY = towerTopTarget
            val leftX = centerX - baseWidth * 0.36f
            val rightX = centerX + baseWidth * 0.36f
            drawLine(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        AdventureRealmLine.copy(alpha = 0.85f),
                        AdventureRealmLine.copy(alpha = 0.18f)
                    ),
                    startY = towerTopY,
                    endY = baseY
                ),
                start = Offset(leftX, baseY + 10f),
                end = Offset(centerX - 20f, towerTopY),
                strokeWidth = 4.5f,
                cap = StrokeCap.Round
            )
            drawLine(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        AdventureRealmLine.copy(alpha = 0.85f),
                        AdventureRealmLine.copy(alpha = 0.18f)
                    ),
                    startY = towerTopY,
                    endY = baseY
                ),
                start = Offset(rightX, baseY + 10f),
                end = Offset(centerX + 20f, towerTopY),
                strokeWidth = 4.5f,
                cap = StrokeCap.Round
            )
            // 中轴线
            drawLine(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        AdventureRealmGlow.copy(alpha = 0.55f),
                        AdventureRealmGlow.copy(alpha = 0.08f)
                    ),
                    startY = towerTopY,
                    endY = baseY
                ),
                start = Offset(centerX, baseY + 18f),
                end = Offset(centerX, towerTopY + 10f),
                strokeWidth = 3f,
                cap = StrokeCap.Round
            )

            // 塔身两侧能量节点（更多，交错）
            repeat(9) { index ->
                val y = baseY - index * (ringSpacing * 0.80f)
                val side = if (index % 2 == 0) 1f else -1f
                val dotAlpha = 0.65f - index * 0.05f
                drawCircle(
                    color = AdventureRealmGlow.copy(alpha = dotAlpha),
                    radius = 7f - index * 0.3f,
                    center = Offset(centerX + side * (baseWidth * 0.3f - index * 3f), y)
                )
                drawCircle(
                    color = AdventureRealmGlowStrong.copy(alpha = dotAlpha * 0.5f),
                    radius = 12f - index * 0.5f,
                    center = Offset(centerX + side * (baseWidth * 0.3f - index * 3f), y)
                )
            }

            // 塔尖光晕（脉冲）
            drawCircle(
                color = AdventureRealmGlowStrong.copy(alpha = haloAlpha * 1.5f),
                radius = 28f * glowScale,
                center = Offset(centerX, towerTopY)
            )
            drawCircle(
                color = AdventureRealmGlow.copy(alpha = 0.9f),
                radius = 10f,
                center = Offset(centerX, towerTopY)
            )

            // 动态光圈（底部大光晕）
            drawOval(
                color = AdventureRealmGlow.copy(alpha = haloAlpha),
                topLeft = Offset(centerX - baseWidth * 0.58f * glowScale, baseY - 24f * glowScale),
                size = Size(baseWidth * 1.16f * glowScale, 48f * glowScale),
                style = Stroke(width = 6f)
            )
        }


    }
}

@Composable
private fun OrbitActionNode(
    modifier: Modifier = Modifier,
    width: Dp,
    height: Dp,
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    val transition = rememberInfiniteTransition(label = "node_pulse_$title")
    val pulse by transition.animateFloat(
        initialValue = 0.96f,
        targetValue = 1.04f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800),
            repeatMode = RepeatMode.Reverse
        ),
        label = "node_scale_$title"
    )

    Surface(
        modifier = modifier
            .size(width = width, height = height)
            .scale(pulse)
            .clickable(onClick = onClick),
        shape = RealmHexShape,
        color = Color.White.copy(alpha = 0.08f),
        border = BorderStroke(1.3.dp, AdventureRealmLine.copy(alpha = 0.92f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 10.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = AdventureRealmGlow,
                    modifier = Modifier.size(17.dp)
                )
            }
            Spacer(modifier = Modifier.height(7.dp))
            Text(
                text = title,
                color = AdventureRealmGlow,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.labelMedium,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = subtitle,
                color = AdventureRealmTextPrimary,
                style = MaterialTheme.typography.labelSmall,
                textAlign = TextAlign.Center,
                maxLines = 2
            )
        }
    }
}

@Composable
private fun RealmProgressPanel(
    adventure: AdventureHomeUiState,
    progress: Float
) {
    val remaining = (adventure.requiredTaskCount - adventure.completedTaskCount).coerceAtLeast(0)
    val clearRemaining = (adventure.requiredClearTaskCount - adventure.completedClearTaskCount).coerceAtLeast(0)
    val eliteRemaining = (adventure.requiredEliteTaskCount - adventure.completedEliteTaskCount).coerceAtLeast(0)
    val hint = buildList {
        if (remaining > 0) add("任务 $remaining")
        if (clearRemaining > 0) add("通关 $clearRemaining")
        if (eliteRemaining > 0) add("精英 $eliteRemaining")
    }.joinToString(" · ").ifBlank { "已满足本章晋级条件" }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White.copy(alpha = 0.08f))
            .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "OVOKIT 晋级矩阵",
                    color = AdventureRealmTextPrimary,
                    style = MaterialTheme.typography.labelLarge
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${adventure.completedTaskCount}/${adventure.requiredTaskCount} 已完成",
                    color = AdventureRealmGlow,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "下一阶段：${adventure.nextLevelPreview}",
                    color = AdventureRealmTextSecondary,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Surface(
                shape = RoundedCornerShape(16.dp),
                color = if (adventure.upgradeReady) AdventureRealmSuccess.copy(alpha = 0.18f) else Color.White.copy(alpha = 0.08f),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.12f))
            ) {
                Text(
                    text = if (adventure.upgradeReady) "UPGRADE READY" else "IN PROGRESS",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    color = AdventureRealmGlow,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.labelLarge
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.16f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progress)
                    .height(10.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(AdventureRealmGlow, AdventureRealmGlowStrong, Color.White)
                        )
                    )
            )
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = hint,
            color = AdventureRealmTextPrimary,
            style = MaterialTheme.typography.bodySmall
        )
    }
}

@Composable
private fun MissionConsoleCard(
    adventure: AdventureHomeUiState,
    tasks: List<AdventureTaskUiModel>,
    onTaskAction: (AdventureTaskUiModel) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .background(Color.White.copy(alpha = 0.08f))
            .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(28.dp))
            .padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "OVOKIT 指令台",
            color = AdventureRealmGlow,
            fontWeight = FontWeight.ExtraBold,
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "${adventure.currentChapterTitle} · 待处理信号 ${tasks.size} 条",
            color = AdventureRealmTextPrimary,
            style = MaterialTheme.typography.bodyMedium
        )

        tasks.forEach { task ->
            CompactTaskRow(task = task, onTaskAction = { onTaskAction(task) })
        }
    }
}

@Composable
private fun CompactTaskRow(
    task: AdventureTaskUiModel,
    onTaskAction: () -> Unit
) {
    val accent = when (task.status) {
        AdventureTaskStatus.ACHIEVED -> AdventureRealmGlowStrong
        AdventureTaskStatus.CLAIMED, AdventureTaskStatus.COMPLETED -> AdventureRealmSuccess
        AdventureTaskStatus.IN_PROGRESS -> Color(0xFFFFE4B3)
        AdventureTaskStatus.AVAILABLE -> Color(0xFFFFF0CC)
        AdventureTaskStatus.LOCKED -> AdventureRealmTextPrimary
    }
    val buttonLabel = when (task.status) {
        AdventureTaskStatus.ACHIEVED -> "领奖"
        AdventureTaskStatus.CLAIMED, AdventureTaskStatus.COMPLETED -> "完成"
        AdventureTaskStatus.LOCKED -> "锁定"
        else -> "进入"
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(Color.White.copy(alpha = 0.08f))
            .padding(14.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(accent.copy(alpha = 0.14f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (task.status == AdventureTaskStatus.ACHIEVED) {
                    Icons.Default.EmojiEvents
                } else {
                    Icons.Default.AutoAwesome
                },
                contentDescription = task.statusLabel,
                tint = accent,
                modifier = Modifier.size(22.dp)
            )
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = task.taskTitle,
                color = AdventureRealmGlow,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleSmall
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = task.targetText,
                color = AdventureRealmTextPrimary,
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = task.rewardText,
                color = AdventureRealmTextSecondary,
                style = MaterialTheme.typography.labelSmall
            )
        }

        if (task.status == AdventureTaskStatus.CLAIMED || task.status == AdventureTaskStatus.COMPLETED) {
            Surface(
                color = AdventureRealmSuccess.copy(alpha = 0.18f),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = buttonLabel,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 9.dp),
                    color = AdventureRealmSuccess,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.labelLarge
                )
            }
        } else {
            FilledTonalButton(
                onClick = onTaskAction,
                enabled = task.status != AdventureTaskStatus.LOCKED,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = Color.White.copy(alpha = 0.14f),
                    contentColor = AdventureRealmGlow,
                    disabledContainerColor = Color.White.copy(alpha = 0.08f),
                    disabledContentColor = AdventureRealmTextPrimary
                )
            ) {
                Text(buttonLabel, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun SignalFeedCard(items: List<String>) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(26.dp))
            .background(Color.White.copy(alpha = 0.08f))
            .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(26.dp))
            .padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text(
            text = "OVOKIT 讯号流",
            color = AdventureRealmGlow,
            fontWeight = FontWeight.ExtraBold,
            style = MaterialTheme.typography.titleLarge
        )
        items.take(4).forEach { message ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "•",
                    color = AdventureRealmGlowStrong,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = message,
                    color = AdventureRealmTextPrimary,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun GameDockCard(
    games: List<GameConfigItem>,
    viewModel: HomeViewModel,
    onGameClick: (GameConfigItem) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .background(Color.White.copy(alpha = 0.08f))
            .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(28.dp))
            .padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "OVOKIT 游戏舱",
            color = AdventureRealmGlow,
            fontWeight = FontWeight.ExtraBold,
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "从未来主控台直接进入你的可玩游戏仓库",
            color = AdventureRealmTextPrimary,
            style = MaterialTheme.typography.bodyMedium
        )
        games.forEach { game ->
            GameCardEnhanced(
                game = game,
                iconCacheManager = viewModel.iconCacheManager,
                onClick = { onGameClick(game) }
            )
        }
    }
}

@Composable
private fun RealmInfoCard(
    title: String,
    body: String
) {
    OutlinedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.18f)),
        colors = CardDefaults.outlinedCardColors(containerColor = Color.White.copy(alpha = 0.08f))
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = title,
                color = AdventureRealmGlow,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = body,
                color = AdventureRealmTextPrimary,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun AmbientParticles() {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val particles = listOf(
            Triple(0.08f, 0.18f, 2.2f),
            Triple(0.13f, 0.22f, 1.4f),
            Triple(0.82f, 0.14f, 2.4f),
            Triple(0.9f, 0.19f, 1.8f),
            Triple(0.14f, 0.48f, 1.8f),
            Triple(0.2f, 0.55f, 1.3f),
            Triple(0.76f, 0.44f, 2.1f),
            Triple(0.86f, 0.52f, 1.4f),
            Triple(0.11f, 0.78f, 2.2f),
            Triple(0.22f, 0.84f, 1.6f),
            Triple(0.87f, 0.76f, 2.3f),
            Triple(0.93f, 0.82f, 1.5f)
        )

        particles.forEach { (x, y, radius) ->
            drawCircle(
                color = Color.White.copy(alpha = 0.36f),
                radius = radius,
                center = Offset(size.width * x, size.height * y)
            )
        }

        drawLine(
            color = Color.White.copy(alpha = 0.25f),
            start = Offset(size.width * 0.9f, size.height * 0.08f),
            end = Offset(size.width * 0.97f, size.height * 0.06f),
            strokeWidth = 4f,
            cap = StrokeCap.Round
        )
        drawLine(
            color = Color.White.copy(alpha = 0.25f),
            start = Offset(size.width * 0.84f, size.height * 0.22f),
            end = Offset(size.width * 0.95f, size.height * 0.18f),
            strokeWidth = 4f,
            cap = StrokeCap.Round
        )
    }
}

private fun deriveMentalPower(adventure: AdventureHomeUiState): Int {
    return (
        adventure.currentLevel * 24 +
            adventure.completedTaskCount * 8 +
            adventure.achievedTaskCount * 12 +
            (adventure.totalExp / 18L).toInt()
        ).coerceAtLeast(1)
}

private fun deriveRank(level: Int, progress: Float): String {
    return when {
        level >= 10 || progress >= 0.98f -> "S+"
        level >= 8 || progress >= 0.85f -> "A+"
        level >= 6 || progress >= 0.7f -> "A"
        level >= 4 || progress >= 0.5f -> "B+"
        else -> "B"
    }
}
