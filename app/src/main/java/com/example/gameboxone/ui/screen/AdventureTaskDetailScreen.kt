package com.example.gameboxone.ui.screen

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.data.model.TaskStageUiModel
import com.example.gameboxone.data.state.AdventureTaskDetailState
import com.example.gameboxone.data.viewmodel.AdventureTaskDetailViewModel

// ── Warm palette (mirrors GameDetailScreen) ────────────────────────────────
private val ATD_OrangeGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFFFFD180), Color(0xFFFF9100))
)
private val ATD_WarmBg = Brush.verticalGradient(
    colors = listOf(Color(0xFFFFF8E1), Color(0xFFFFF3E0), Color(0xFFFFFFFF))
)
private val ATD_OrangePrimary = Color(0xFFFFA726)
private val ATD_OrangeDeep   = Color(0xFFFF9100)
private val ATD_TextDark     = Color(0xFF4E342E)
private val ATD_TextMid      = Color(0xFF6D4C41)
private val ATD_TextLight    = Color(0xFF8D6E63)
private val ATD_NodeComplete = Color(0xFF4CAF50)
private val ATD_NodePending  = Color(0xFFE8E8E8)
private val ATD_NodeBadge    = Color(0xFFFFA726)
private val ATD_PathColor    = Color(0xFFCCCCCC)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun AdventureTaskDetailScreen(
    viewModel: AdventureTaskDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    BackHandler { viewModel.onBackPressed() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ATD_WarmBg)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // ── Top bar ────────────────────────────────────────────────────
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
                        tint = ATD_OrangeDeep
                    )
                }
                Text(
                    text = state.playerTitle.ifBlank { "历练任务" },
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = ATD_OrangeDeep,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center
                )
                // Mirror icon for balance
                Box(modifier = Modifier.size(48.dp))
            }

            when {
                state.isLoading && state.gameName.isBlank() -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = ATD_OrangePrimary)
                    }
                }
                state.error != null && state.gameName.isBlank() -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("⚠️ 加载失败", color = ATD_TextMid, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(8.dp))
                            Text(state.error ?: "", color = ATD_TextLight, style = MaterialTheme.typography.bodySmall)
                            Spacer(Modifier.height(16.dp))
                            Button(onClick = { viewModel.loadTaskDetail() }) { Text("重试") }
                        }
                    }
                }
                else -> {
                    TaskDetailBody(
                        state = state,
                        onStart = { viewModel.startAdventure() },
                        onDownloadConfirm = { viewModel.confirmDownload() },
                        onDownloadDismiss = { viewModel.dismissDownloadDialog() }
                    )
                }
            }
        }
    }
}

// ── Body ──────────────────────────────────────────────────────────────────────
@Composable
private fun TaskDetailBody(
    state: AdventureTaskDetailState,
    onStart: () -> Unit,
    onDownloadConfirm: () -> Unit,
    onDownloadDismiss: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 88.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(12.dp))

            // ── Game title + description ───────────────────────────────────
            Text(
                text = state.gameName,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.ExtraBold,
                color = ATD_TextDark,
                modifier = Modifier.padding(horizontal = 24.dp),
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = state.gameDescription,
                style = MaterialTheme.typography.bodyMedium,
                color = ATD_TextMid,
                modifier = Modifier.padding(horizontal = 32.dp),
                textAlign = TextAlign.Center,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(Modifier.height(28.dp))

            // ── Stage map ─────────────────────────────────────────────────
            if (state.stages.isNotEmpty()) {
                StageMapSection(
                    stages = state.stages,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp)
                )
            }

            Spacer(Modifier.height(20.dp))

            // ── Reward info ───────────────────────────────────────────────
            if (state.rewardText.isNotBlank()) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFFFF3E0),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            Icons.Default.EmojiEvents,
                            contentDescription = null,
                            tint = ATD_OrangePrimary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = "完成奖励：${state.rewardText}",
                            style = MaterialTheme.typography.bodySmall,
                            color = ATD_OrangeDeep,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // ── Download progress ─────────────────────────────────────────
            if (state.isDownloading) {
                Spacer(Modifier.height(16.dp))
                DownloadProgressCard(state = state)
            }

            // ── Download confirm ──────────────────────────────────────────
            if (state.showDownloadDialog && state.downloadInfo != null) {
                Spacer(Modifier.height(16.dp))
                DownloadConfirmInlineCard(
                    gameName = state.downloadInfo.gameName,
                    onConfirm = onDownloadConfirm,
                    onDismiss = onDownloadDismiss,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )
            }

            Spacer(Modifier.height(16.dp))
        }

        // ── Fixed bottom button ────────────────────────────────────────────
        if (!state.isDownloading && !state.showDownloadDialog) {
            val (btnText, btnIcon) = when {
                state.game == null         -> "演示一次" to Icons.Default.PlayArrow
                !state.game.isLocal        -> "踏上征程" to Icons.Default.Explore
                else                       -> "开始冒险" to Icons.Default.PlayArrow
            }

            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 20.dp)
                    .navigationBarsPadding()
                    .height(56.dp)
                    .clip(RoundedCornerShape(28.dp))
                    .background(ATD_OrangeGradient)
                    .clickable(onClick = onStart),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(btnIcon, null, tint = Color.White, modifier = Modifier.size(22.dp))
                    Spacer(Modifier.width(10.dp))
                    Text(
                        btnText,
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp
                    )
                }
            }
        }
    }
}

// ── Stage map with zigzag path ─────────────────────────────────────────────
@Composable
private fun StageMapSection(
    stages: List<TaskStageUiModel>,
    modifier: Modifier = Modifier
) {
    val nodeSize = 72.dp
    val rowHeight = 150.dp
    val displayStages = stages.reversed()   // highest stage at top
    val totalHeight = rowHeight * stages.size

    // Fractions for left/right node x-center positions (relative to full container width)
    val leftFrac  = 0.30f
    val rightFrac = 0.65f

    var containerWidthPx by remember { mutableIntStateOf(0) }

    Box(
        modifier = modifier
            .height(totalHeight)
            .onSizeChanged { containerWidthPx = it.width }
    ) {
        // ── Dashed path (Canvas) ────────────────────────────────────────
        if (containerWidthPx > 0) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val pathEffect = PathEffect.dashPathEffect(floatArrayOf(16f, 12f), 0f)
                val rowH = rowHeight.toPx()

                val xCenters = displayStages.indices.map { idx ->
                    if (idx % 2 == 0) containerWidthPx * leftFrac else containerWidthPx * rightFrac
                }
                val yCenters = displayStages.indices.map { idx ->
                    rowH * idx + rowH / 2
                }

                for (i in 0 until displayStages.size - 1) {
                    drawLine(
                        color = ATD_PathColor,
                        start = Offset(xCenters[i], yCenters[i]),
                        end   = Offset(xCenters[i + 1], yCenters[i + 1]),
                        strokeWidth = 8f,
                        pathEffect  = pathEffect
                    )
                }
            }
        }

        // ── Node items ──────────────────────────────────────────────────
        displayStages.forEachIndexed { displayIdx, stage ->
            val isLeft = displayIdx % 2 == 0
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(rowHeight)
                    .offset(y = rowHeight * displayIdx),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (isLeft) {
                    // Node at ~leftFrac from left
                    Spacer(Modifier.weight(leftFrac))
                    NodeItemColumn(stage = stage, size = nodeSize)
                    Spacer(Modifier.weight(1f - leftFrac))
                } else {
                    // Node at ~rightFrac from left
                    Spacer(Modifier.weight(rightFrac))
                    NodeItemColumn(stage = stage, size = nodeSize)
                    Spacer(Modifier.weight(1f - rightFrac))
                }
            }
        }
    }
}

@Composable
private fun NodeItemColumn(stage: TaskStageUiModel, size: Dp) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        StageNodeCircle(stage = stage, size = size)
        Spacer(Modifier.height(4.dp))
        ScoreBadge(label = stage.scoreLabel)
    }
}

@Composable
private fun StageNodeCircle(stage: TaskStageUiModel, size: Dp) {
    val bgColor = when {
        stage.isCompleted -> ATD_NodeComplete
        stage.isCurrent   -> ATD_OrangePrimary.copy(alpha = 0.18f)
        else              -> ATD_NodePending
    }
    val borderColor = when {
        stage.isCompleted -> ATD_NodeComplete
        stage.isCurrent   -> ATD_OrangePrimary
        else              -> Color(0xFFBDBDBD)
    }

    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(bgColor)
            .then(
                if (!stage.isCompleted)
                    Modifier.border(2.5.dp, borderColor, CircleShape)
                else Modifier
            ),
        contentAlignment = Alignment.Center
    ) {
        if (stage.isCompleted) {
            Icon(
                Icons.Default.Check,
                contentDescription = "已完成",
                tint = Color.White,
                modifier = Modifier.size(size * 0.5f)
            )
        } else {
            Text(
                text = stage.stageNumber.toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = if (stage.isCurrent) ATD_OrangeDeep else Color(0xFF9E9E9E)
            )
        }
    }
}

@Composable
private fun ScoreBadge(label: String) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = ATD_NodeBadge
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.ExtraBold,
            color = Color.White
        )
    }
}

// ── Download progress card ─────────────────────────────────────────────────
@Composable
private fun DownloadProgressCard(state: AdventureTaskDetailState) {
    ElevatedCard(
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    "🗺 寻觅宝藏中，请稍候…",
                    style = MaterialTheme.typography.bodySmall, color = ATD_TextMid
                )
                Text(
                    "${(state.downloadProgress * 100).toInt()}%",
                    style = MaterialTheme.typography.labelSmall,
                    color = ATD_OrangeDeep, fontWeight = FontWeight.Bold
                )
            }
            Spacer(Modifier.height(6.dp))
            LinearProgressIndicator(
                progress = { state.downloadProgress },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                color = ATD_OrangeDeep,
                trackColor = Color(0xFFFFCC80)
            )
            Text(
                "正在召唤${state.gameName}，前路漫漫请耐心等待",
                style = MaterialTheme.typography.labelSmall,
                color = ATD_TextLight,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

// ── Download confirm card ──────────────────────────────────────────────────
@Composable
private fun DownloadConfirmInlineCard(
    gameName: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    ElevatedCard(shape = RoundedCornerShape(20.dp), modifier = modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Explore, null, tint = ATD_OrangePrimary,
                    modifier = Modifier.size(22.dp))
                Spacer(Modifier.width(8.dp))
                Text("踏上探索之旅", style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold, color = ATD_TextDark)
            }
            Spacer(Modifier.height(8.dp))
            Text(
                "「$gameName」尚在远方等候，寻觅归来方可展开对决，是否启程？",
                style = MaterialTheme.typography.bodySmall, color = ATD_TextMid,
                lineHeight = 20.sp
            )
            Spacer(Modifier.height(14.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss) { Text("稍后再说", color = ATD_TextLight) }
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = onConfirm,
                    colors = ButtonDefaults.buttonColors(containerColor = ATD_OrangePrimary),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Icon(Icons.Default.Explore, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("即刻启程")
                }
            }
        }
    }
}

