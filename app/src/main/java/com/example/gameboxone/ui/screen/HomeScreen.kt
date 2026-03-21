package com.example.gameboxone.ui.screen

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.data.model.AdventureHomeUiState
import com.example.gameboxone.data.model.AdventureTaskStatus
import com.example.gameboxone.data.model.AdventureTaskUiModel
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.viewmodel.HomeViewModel
import com.example.gameboxone.ui.component.GameCardEnhanced
import com.example.gameboxone.ui.component.HomeStatusHeader

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onGameSelected: (GameConfigItem) -> Unit = {},
    onProfileClick: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.error) {
        uiState.error?.let { snackbarHostState.showSnackbar(message = it) }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            if (uiState.isLoading && !uiState.adventureHome.isInitialized) {
                LoadingContent()
            } else {
                Column(modifier = Modifier.fillMaxSize()) {
                    // 固定顶部：本章历练总卡
                    ChapterOverviewCard(
                        adventure = uiState.adventureHome,
                        onLevelUp = { viewModel.doLevelUp() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .statusBarsPadding()
                            .padding(horizontal = 16.dp, vertical = 10.dp)
                    )
                    // 可滚动内容
                    AdventureHomeContent(
                        adventure = uiState.adventureHome,
                        games = uiState.games,
                        viewModel = viewModel,
                        onGameClick = onGameSelected
                    )
                }
            }
        }
    }
}

@Composable
private fun LoadingContent() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator()
            Spacer(modifier = Modifier.height(16.dp))
            Text("正在加载历练任务…", style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun AdventureHomeContent(
    adventure: AdventureHomeUiState,
    games: List<GameConfigItem>,
    viewModel: HomeViewModel,
    onGameClick: (GameConfigItem) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {

        if (!adventure.emptyMessage.isNullOrBlank()) {
            item {
                HomeAdventureEmptyStateCard(
                    title = if (adventure.chapterTasks.isEmpty()) "历练内容准备中" else "挑战提示",
                    message = adventure.emptyMessage!!
                )
            }
        }

        // 模块 C：今日推荐挑战（top 3）
        if (adventure.recommendedTasks.isNotEmpty()) {
            item {
                SectionHeader(
                    title = if (adventure.achievedTaskCount > 0) "🎁 待领取奖励" else "⚔️ 今日推荐",
                    subtitle = "最适合你现在完成的挑战"
                )
            }
            items(adventure.recommendedTasks, key = { "rec_${it.taskId}" }) { task ->
                TaskCard(
                    task = task,
                    isHighlighted = true,
                    onPlay = { viewModel.navigateToTaskDetail(task.taskId) },
                    onClaim = { viewModel.claimReward(task.taskId) }
                )
            }
        }

        // 模块 D：历练进度点位条
        if (adventure.chapterTasks.isNotEmpty()) {
            item { TaskProgressDots(tasks = adventure.chapterTasks) }
        }

        // 模块 E：本章所有挑战任务
        if (adventure.chapterTasks.isNotEmpty()) {
            item {
                SectionHeader(
                    title = "📋 本章挑战（${adventure.completedTaskCount}/${adventure.totalTaskCount}）",
                    subtitle = "完成 ${adventure.requiredTaskCount} 个即可升级"
                )
            }
            items(adventure.chapterTasks, key = { "all_${it.taskId}" }) { task ->
                TaskCard(
                    task = task,
                    isHighlighted = false,
                    onPlay = { viewModel.navigateToTaskDetail(task.taskId) },
                    onClaim = { viewModel.claimReward(task.taskId) }
                )
            }
        } else if (games.isNotEmpty()) {
            item {
                HomeAdventureEmptyStateCard(
                    title = "先挑一款游戏开始吧",
                    message = "当前章节任务正在整理中，你也可以先进入下方游戏详情页查看并准备挑战。"
                )
            }
        }

        // 模块 F：最近动态
        if (adventure.recentActivities.isNotEmpty()) {
            item { SectionHeader(title = "📢 最近动态") }
            item { RecentActivitiesCard(items = adventure.recentActivities) }
        }

        // 模块 G：下一等级预告
        item { NextLevelPreviewCard(adventure = adventure) }

        // 额外：其他真实游戏
        val extraGames = games.drop(adventure.chapterTasks.size).take(4)
        if (extraGames.isNotEmpty()) {
            item { SectionHeader(title = "🎮 更多游戏") }
            items(extraGames, key = { "extra_${it.id}" }) { game ->
                GameCardEnhanced(
                    game = game,
                    iconCacheManager = viewModel.iconCacheManager,
                    onClick = { onGameClick(game) }
                )
            }
        }

        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}

@Composable
private fun HomeAdventureEmptyStateCard(
    title: String,
    message: String
) {
    OutlinedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// ── 模块 B：本章历练总卡 ──────────────────────────────────────
@Composable
private fun ChapterOverviewCard(
    adventure: AdventureHomeUiState,
    onLevelUp: () -> Unit,
    modifier: Modifier = Modifier
) {
    val progress = if (adventure.requiredTaskCount > 0)
        adventure.completedTaskCount.toFloat() / adventure.requiredTaskCount.toFloat()
    else 0f
    val remaining = (adventure.requiredTaskCount - adventure.completedTaskCount).coerceAtLeast(0)

    ElevatedCard(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = if (adventure.upgradeReady)
                MaterialTheme.colorScheme.tertiaryContainer
            else
                MaterialTheme.colorScheme.secondaryContainer
        ),
        elevation = CardDefaults.elevatedCardElevation(3.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(adventure.currentChapterTitle,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.ExtraBold)
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = if (adventure.upgradeReady) "✨ 已满足升级条件！"
                        else "还差 $remaining 个任务即可升至 ${adventure.nextLevelPreview}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (adventure.upgradeReady) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f)
                    )
                }
                Surface(
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                    shape = CircleShape
                ) {
                    Icon(
                        imageVector = if (adventure.upgradeReady) Icons.Default.EmojiEvents else Icons.Default.Star,
                        contentDescription = null,
                        modifier = Modifier.padding(10.dp).size(28.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(Modifier.height(16.dp))
            Row(modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween) {
                Text("完成进度", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                Text("${adventure.completedTaskCount} / ${adventure.requiredTaskCount}",
                    style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary)
            }
            Spacer(Modifier.height(6.dp))
            LinearProgressIndicator(
                progress = { progress.coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(5.dp)),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
            )

            if (adventure.upgradeReady) {
                Spacer(Modifier.height(16.dp))
                Button(
                    onClick = onLevelUp,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("立即升至 ${adventure.nextLevelPreview}", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ── 模块 D：进度点位条 ────────────────────────────────────────
@Composable
private fun TaskProgressDots(tasks: List<AdventureTaskUiModel>) {
    Card(
        modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            Text("关卡进度", style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(10.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 2.dp)
            ) {
                items(tasks, key = { "dot_${it.taskId}" }) { task ->
                    TaskDot(task = task)
                }
            }
        }
    }
}

@Composable
private fun TaskDot(task: AdventureTaskUiModel) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (task.status == AdventureTaskStatus.ACHIEVED) 1.2f else 1f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
        label = "scale"
    )
    val (dotColor, icon) = when (task.status) {
        AdventureTaskStatus.CLAIMED, AdventureTaskStatus.COMPLETED ->
            MaterialTheme.colorScheme.primary to Icons.Default.CheckCircle
        AdventureTaskStatus.ACHIEVED ->
            Color(0xFFFFB300) to Icons.Default.Star
        AdventureTaskStatus.IN_PROGRESS ->
            MaterialTheme.colorScheme.secondary to Icons.Default.PlayArrow
        AdventureTaskStatus.AVAILABLE ->
            MaterialTheme.colorScheme.surfaceVariant to Icons.Default.PlayArrow
        AdventureTaskStatus.LOCKED ->
            MaterialTheme.colorScheme.outlineVariant to Icons.Default.Lock
    }
    val isAvailable = task.status == AdventureTaskStatus.AVAILABLE
    Box(
        modifier = Modifier
            .scale(scale)
            .size(36.dp)
            .clip(CircleShape)
            .background(dotColor.copy(alpha = if (isAvailable) 0.3f else 1f))
            .then(if (isAvailable) Modifier.border(1.5.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), CircleShape) else Modifier),
        contentAlignment = Alignment.Center
    ) {
        Icon(imageVector = icon, contentDescription = task.statusLabel,
            modifier = Modifier.size(18.dp),
            tint = if (isAvailable) MaterialTheme.colorScheme.onSurfaceVariant else Color.White)
    }
}

// ── 任务卡片 ──────────────────────────────────────────────────
@Composable
private fun TaskCard(
    task: AdventureTaskUiModel,
    isHighlighted: Boolean,
    onPlay: () -> Unit,
    onClaim: () -> Unit
) {
    val isAchieved = task.status == AdventureTaskStatus.ACHIEVED
    val isClaimed = task.status == AdventureTaskStatus.CLAIMED || task.status == AdventureTaskStatus.COMPLETED
    val isLocked = task.status == AdventureTaskStatus.LOCKED
    val isMockGame = task.game == null

    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = when {
                isAchieved -> MaterialTheme.colorScheme.primaryContainer
                isClaimed -> MaterialTheme.colorScheme.surfaceVariant
                else -> MaterialTheme.colorScheme.surface
            }
        ),
        elevation = CardDefaults.elevatedCardElevation(if (isAchieved || isHighlighted) 3.dp else 1.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            TaskStatusIcon(status = task.status)
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically) {
                    Text(task.gameName, style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                    StatusBadge(status = task.status)
                }
                Spacer(Modifier.height(3.dp))
                Text(task.targetText, style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                if (!isClaimed && task.progressText.isNotBlank() && task.status != AdventureTaskStatus.AVAILABLE) {
                    Spacer(Modifier.height(2.dp))
                    Text(task.progressText, style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.85f))
                }
                Spacer(Modifier.height(5.dp))
                Surface(
                    color = if (isAchieved) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
                    else MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.7f),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(task.rewardText,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSecondaryContainer)
                }
                if (isMockGame && !isClaimed) {
                    Spacer(Modifier.height(2.dp))
                    Text("（演示模式·点击体验）", style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.outline, fontSize = 10.sp)
                }
            }
            Spacer(Modifier.width(8.dp))
            when {
                isAchieved -> Button(
                    onClick = onClaim,
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("领奖", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
                isClaimed -> Icon(Icons.Default.CheckCircle, contentDescription = "已完成",
                    tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f),
                    modifier = Modifier.size(28.dp))
                isLocked -> Icon(Icons.Default.Lock, contentDescription = "未解锁",
                    tint = MaterialTheme.colorScheme.outline, modifier = Modifier.size(24.dp))
                else -> FilledTonalButton(
                    onClick = onPlay, shape = CircleShape,
                    contentPadding = PaddingValues(0.dp), modifier = Modifier.size(40.dp)
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = "开始", modifier = Modifier.size(22.dp))
                }
            }
        }
    }
}

@Composable
private fun TaskStatusIcon(status: AdventureTaskStatus) {
    val infiniteTransition = rememberInfiniteTransition(label = "icon_pulse")
    val pulse by infiniteTransition.animateFloat(
        initialValue = 0.9f,
        targetValue = if (status == AdventureTaskStatus.ACHIEVED) 1.15f else 1f,
        animationSpec = infiniteRepeatable(tween(600), RepeatMode.Reverse),
        label = "icon_scale"
    )
    val (bg, icon, tint) = when (status) {
        AdventureTaskStatus.CLAIMED, AdventureTaskStatus.COMPLETED ->
            Triple(Color(0xFF4CAF50).copy(alpha = 0.15f), Icons.Default.CheckCircle, Color(0xFF4CAF50))
        AdventureTaskStatus.ACHIEVED ->
            Triple(Color(0xFFFFB300).copy(alpha = 0.2f), Icons.Default.EmojiEvents, Color(0xFFFFB300))
        AdventureTaskStatus.IN_PROGRESS ->
            Triple(MaterialTheme.colorScheme.primaryContainer, Icons.Default.PlayArrow, MaterialTheme.colorScheme.primary)
        AdventureTaskStatus.AVAILABLE ->
            Triple(MaterialTheme.colorScheme.secondaryContainer, Icons.Default.PlayArrow, MaterialTheme.colorScheme.secondary)
        AdventureTaskStatus.LOCKED ->
            Triple(MaterialTheme.colorScheme.surfaceVariant, Icons.Default.Lock, MaterialTheme.colorScheme.outline)
    }
    Box(
        modifier = Modifier.scale(pulse).size(44.dp).clip(RoundedCornerShape(12.dp)).background(bg),
        contentAlignment = Alignment.Center
    ) {
        Icon(imageVector = icon, contentDescription = null, modifier = Modifier.size(22.dp), tint = tint)
    }
}

@Composable
private fun StatusBadge(status: AdventureTaskStatus) {
    val (label, color) = when (status) {
        AdventureTaskStatus.ACHIEVED -> "待领奖" to Color(0xFFFFB300)
        AdventureTaskStatus.IN_PROGRESS -> "进行中" to MaterialTheme.colorScheme.primary
        AdventureTaskStatus.CLAIMED, AdventureTaskStatus.COMPLETED -> "已完成" to Color(0xFF4CAF50)
        AdventureTaskStatus.LOCKED -> "未解锁" to MaterialTheme.colorScheme.outline
        AdventureTaskStatus.AVAILABLE -> "可挑战" to MaterialTheme.colorScheme.secondary
    }
    Surface(color = color.copy(alpha = 0.12f), shape = RoundedCornerShape(4.dp)) {
        Text(label, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
            style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = color)
    }
}

// ── 模块 F：最近动态 ──────────────────────────────────────────
@Composable
private fun RecentActivitiesCard(items: List<String>) {
    OutlinedCard(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items.forEach { text ->
                Row(verticalAlignment = Alignment.Top) {
                    Text("•", color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold, modifier = Modifier.padding(end = 6.dp, top = 1.dp))
                    Text(text = text, style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface)
                }
            }
        }
    }
}

// ── 模块 G：下一等级预告 ──────────────────────────────────────
@Composable
private fun NextLevelPreviewCard(adventure: AdventureHomeUiState) {
    if (adventure.currentLevel >= 10) return
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.7f)
        )
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text("下一等级预告", style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.7f))
                Spacer(Modifier.height(4.dp))
                Text(adventure.nextLevelPreview, style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSecondaryContainer)
                Spacer(Modifier.height(4.dp))
                Text("完成 ${adventure.requiredTaskCount} 个挑战解锁下一阶段 10 个新任务",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.75f))
            }
            Spacer(Modifier.width(12.dp))
            Icon(Icons.Default.EmojiEvents, contentDescription = null,
                modifier = Modifier.size(40.dp),
                tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f))
        }
    }
}

@Composable
private fun SectionHeader(title: String, subtitle: String? = null) {
    Column {
        Text(title, style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
        if (subtitle != null) {
            Text(subtitle, style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
