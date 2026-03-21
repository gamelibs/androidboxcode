package com.example.gameboxone.ui.screen

import com.example.gameboxone.AppLog as Log
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.example.gameboxone.data.model.AdventureTaskStatus
import com.example.gameboxone.data.model.AdventureTaskUiModel
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.viewmodel.GameDetailViewModel

// ── Warm palette (matches HomeScreen) ────────────────────────────────────────
private val OrangeGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFFFFD180), Color(0xFFFF9100))
)
private val WarmBg = Brush.verticalGradient(
    colors = listOf(Color(0xFFFFF8E1), Color(0xFFFFF3E0), Color(0xFFFFFFFF))
)
private val CardBg      = Color(0xFFFFFDE7)
private val OrangePrimary = Color(0xFFFFA726)
private val OrangeDeep   = Color(0xFFFF9100)
private val TextDark     = Color(0xFF4E342E)
private val TextMid      = Color(0xFF6D4C41)
private val TextLight    = Color(0xFF8D6E63)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun GameDetailScreen(
    viewModel: GameDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val gameId = viewModel.gameId

    LaunchedEffect(gameId) { viewModel.loadGameDetails(gameId) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(WarmBg)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // ── Top bar ───────────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 4.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { viewModel.onBackPressed() }) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "返回",
                        tint = OrangeDeep
                    )
                }
                Text(
                    text = state.game?.name ?: "游戏详情",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = OrangeDeep,
                    modifier = Modifier.weight(1f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // ── Scrollable body ───────────────────────────────────────────
            when {
                state.isLoading && state.game == null -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = OrangePrimary)
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = state.loadingMessage ?: "加载中…",
                                color = TextMid,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
                state.game != null -> {
                    GameBody(
                        state = state,
                        onLaunch = { viewModel.launchGame() },
                        onDownloadConfirm = { viewModel.startDownload() },
                        onDownloadDismiss = { viewModel.dismissDownloadDialog() }
                    )
                }
                else -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.Warning,
                                contentDescription = null,
                                tint = OrangePrimary,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("未找到游戏信息", color = TextMid, fontWeight = FontWeight.Bold)
                            state.error?.let {
                                Text(it, color = TextLight, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ── Game body (scrollable) ────────────────────────────────────────────────────
@Composable
private fun GameBody(
    state: com.example.gameboxone.data.state.GameDetailState,
    onLaunch: () -> Unit,
    onDownloadConfirm: () -> Unit,
    onDownloadDismiss: () -> Unit
) {
    val game = state.game ?: return
    val scroll = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scroll)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Spacer(modifier = Modifier.height(4.dp))

        // ── 1. Game info card ─────────────────────────────────────────────
        GameInfoCard(game = game)

        // ── 2. Adventure task card ────────────────────────────────────────
        state.adventureTask?.let { task ->
            TaskChallengeCard(task = task)
        } ?: run {
            // Minimal info if no task found
            val desc = game.taskDesc
            if (!desc.isNullOrBlank()) {
                SimpleTaskHint(desc = desc)
            }
        }

        // ── 3. Download/update status + action ───────────────────────────
        GameActionSection(
            game = game,
            state = state,
            onLaunch = onLaunch,
            onDownloadConfirm = onDownloadConfirm,
            onDownloadDismiss = onDownloadDismiss
        )

        Spacer(modifier = Modifier.height(16.dp))
    }
}

// ── Game info card ────────────────────────────────────────────────────────────
@Composable
private fun GameInfoCard(game: Custom.HotGameData) {
    ElevatedCard(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = CardBg),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 3.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon
            if (game.iconUrl.isNotBlank()) {
                AsyncImage(
                    model = game.iconUrl,
                    contentDescription = game.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(76.dp)
                        .clip(RoundedCornerShape(16.dp))
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(76.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(OrangePrimary.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.SportsEsports, null, tint = OrangePrimary, modifier = Modifier.size(36.dp))
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = game.name,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                // Rating stars
                Row(verticalAlignment = Alignment.CenterVertically) {
                    repeat(5) { i ->
                        Icon(
                            if (i < game.rating) Icons.Default.Star else Icons.Default.StarBorder,
                            null,
                            tint = OrangePrimary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    if (game.rating > 0) {
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            "${game.rating}.0",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextLight
                        )
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = game.description.ifBlank { "精彩游戏等你来挑战" },
                    style = MaterialTheme.typography.bodySmall,
                    color = TextMid,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

// ── Adventure task card ───────────────────────────────────────────────────────
@Composable
private fun TaskChallengeCard(task: AdventureTaskUiModel) {
    val statusColor = when (task.status) {
        AdventureTaskStatus.ACHIEVED  -> Color(0xFF4CAF50)
        AdventureTaskStatus.CLAIMED,
        AdventureTaskStatus.COMPLETED -> Color(0xFF9E9E9E)
        AdventureTaskStatus.IN_PROGRESS -> OrangePrimary
        else -> Color(0xFF78909C)
    }
    val statusIcon = when (task.status) {
        AdventureTaskStatus.ACHIEVED  -> Icons.Default.CheckCircle
        AdventureTaskStatus.CLAIMED,
        AdventureTaskStatus.COMPLETED -> Icons.Default.CheckCircle
        AdventureTaskStatus.IN_PROGRESS -> Icons.Default.PlayCircle
        else -> Icons.Default.RadioButtonUnchecked
    }

    ElevatedCard(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = CardBg),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 3.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.EmojiEvents,
                    null,
                    tint = OrangePrimary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    "当前历练挑战",
                    style = MaterialTheme.typography.labelMedium,
                    color = OrangeDeep,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                // Status badge
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = statusColor.copy(alpha = 0.15f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(statusIcon, null, tint = statusColor, modifier = Modifier.size(12.dp))
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(task.statusLabel, color = statusColor, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Task title
            Text(
                task.taskTitle,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            if (task.taskDescription.isNotBlank()) {
                Text(
                    task.taskDescription,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextMid,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp), color = Color(0xFFFFE0B2))

            // Target & progress row
            Row(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("挑战目标", style = MaterialTheme.typography.labelSmall, color = TextLight)
                    Text(task.targetText, style = MaterialTheme.typography.bodyMedium, color = TextDark, fontWeight = FontWeight.Medium)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text("当前进度", style = MaterialTheme.typography.labelSmall, color = TextLight)
                    Text(task.progressText, style = MaterialTheme.typography.bodyMedium, color = OrangeDeep, fontWeight = FontWeight.Medium)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Reward row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFFFFF3E0))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("🏆 完成奖励", style = MaterialTheme.typography.labelSmall, color = TextMid, modifier = Modifier.weight(1f))
                Text(task.rewardText, style = MaterialTheme.typography.bodySmall, color = OrangeDeep, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun SimpleTaskHint(desc: String) {
    ElevatedCard(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = CardBg),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Info, null, tint = OrangePrimary, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(desc, style = MaterialTheme.typography.bodySmall, color = TextMid)
        }
    }
}

// ── Action section (download / update / play) ─────────────────────────────────
@Composable
private fun GameActionSection(
    game: Custom.HotGameData,
    state: com.example.gameboxone.data.state.GameDetailState,
    onLaunch: () -> Unit,
    onDownloadConfirm: () -> Unit,
    onDownloadDismiss: () -> Unit
) {
    val isUpdate = game.isLocal && state.hasUpdate
    val needsDownload = !game.isLocal

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {

        // ── Status chip：仅在有新版本或正在下载时显示 ──────────────────────
        when {
            state.isDownloading -> {
                // 下载中进度卡（不另显示 chip）
            }
            isUpdate -> {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = OrangePrimary.copy(alpha = 0.12f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AutoAwesome, null, tint = OrangePrimary,
                            modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(5.dp))
                        Text("新宝藏降世", color = OrangePrimary,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold)
                    }
                }
            }
            game.isLocal && !state.hasUpdate -> {
                // 已下载且无更新：仅显示本地标签，不展示任何下载入口
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFF4CAF50).copy(alpha = 0.10f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(5.dp))
                        Text("已驻守本地", color = Color(0xFF4CAF50),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // ── 下载 / 更新进度条（诗意提示）─────────────────────────────────
        if (state.isDownloading) {
            ElevatedCard(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = CardBg),
                elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            if (isUpdate) "✨ 新宝藏正在降临…" else "🗺 寻觅宝藏中，请稍候…",
                            style = MaterialTheme.typography.bodySmall, color = TextMid
                        )
                        Text(
                            "${(state.downloadProgress * 100).toInt()}%",
                            style = MaterialTheme.typography.labelSmall,
                            color = OrangeDeep, fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    LinearProgressIndicator(
                        progress = { state.downloadProgress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = OrangeDeep,
                        trackColor = Color(0xFFFFCC80)
                    )
                    Text(
                        if (isUpdate) "新版本${game.name}即将就绪，请耐心等待"
                        else "正在召唤${game.name}，前路漫漫请稍候",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextLight,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }

        // ── 确认下载卡：仅在未下载 或 有更新 时才显示 ────────────────────
        if (state.showDownloadDialog && state.downloadInfo != null &&
            (needsDownload || isUpdate)) {
            DownloadConfirmCard(
                gameName = state.downloadInfo.gameName,
                isUpdate = isUpdate,
                onConfirm = onDownloadConfirm,
                onDismiss = onDownloadDismiss
            )
        }

        // ── 主操作按钮 ────────────────────────────────────────────────────
        if (!state.isDownloading) {
            val (btnText, btnIcon) = when {
                needsDownload -> "踏上征程" to Icons.Default.Explore
                isUpdate      -> "获取新宝藏" to Icons.Default.AutoAwesome
                else          -> "开始挑战" to Icons.Default.PlayArrow
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .clip(RoundedCornerShape(28.dp))
                    .background(OrangeGradient)
                    .clickable(enabled = !state.showDownloadDialog, onClick = onLaunch),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(btnIcon, null, tint = Color.White, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(btnText, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                }
            }
        }
    }
}

// ── Download / Update confirm card ────────────────────────────────────────────
@Composable
private fun DownloadConfirmCard(
    gameName: String,
    isUpdate: Boolean = false,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    ElevatedCard(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = CardBg),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 4.dp),
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    if (isUpdate) Icons.Default.AutoAwesome else Icons.Default.Explore,
                    null, tint = OrangePrimary, modifier = Modifier.size(22.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    if (isUpdate) "有新宝藏出世" else "踏上探索之旅",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold, color = TextDark
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                if (isUpdate)
                    "「$gameName」已有新版本降临，承载着更多精彩，获取后方可尽享。"
                else
                    "「$gameName」尚在远方等候，寻觅归来方可展开对决，是否启程？",
                style = MaterialTheme.typography.bodySmall,
                color = TextMid,
                lineHeight = 20.sp
            )
            Spacer(modifier = Modifier.height(14.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onDismiss) {
                    Text("稍后再说", color = TextLight)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = onConfirm,
                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Icon(
                        if (isUpdate) Icons.Default.AutoAwesome else Icons.Default.Explore,
                        null, modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(if (isUpdate) "立即获取" else "即刻启程")
                }
            }
        }
    }
}

// ── Legacy compat (kept for any remaining call sites) ─────────────────────────
@Composable
fun DownloadDialog(gameName: String, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    DownloadConfirmCard(gameName = gameName, isUpdate = false, onConfirm = onConfirm, onDismiss = onDismiss)
}
