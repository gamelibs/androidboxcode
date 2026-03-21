package com.example.gameboxone.ui.screen

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.data.model.ChapterMapNode
import com.example.gameboxone.data.model.ChapterNodeState
import com.example.gameboxone.data.viewmodel.HomeViewModel

@Composable
fun AdventureScreen(
    viewModel: HomeViewModel = hiltViewModel()
) {
    val chapterMap by viewModel.chapterMap.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val adventure = uiState.adventureHome

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
    ) {
        // 顶部标题区
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Text(
                text = "历练之路",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "Lv.${adventure.currentLevel} ${adventure.currentTitle} · ${adventure.currentChapterTitle}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (!adventure.emptyMessage.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(12.dp))
                AdventureMapHintCard(message = adventure.emptyMessage)
            }
        }

        // 章节时间轴
        if (chapterMap.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                AdventureMapHintCard(
                    title = "章节地图准备中",
                    message = "正在整理你的历练路线，请稍后再试。"
                )
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(0.dp)
            ) {
                items(chapterMap, key = { it.chapterId }) { node ->
                    ChapterTimelineNode(
                        node = node,
                        onClick = {
                            if (node.state != ChapterNodeState.LOCKED) {
                                viewModel.navigateToChapterEntry(node.chapterId)
                            }
                        }
                    )
                }
                item { Spacer(Modifier.height(24.dp)) }
            }
        }
    }
}

@Composable
private fun ChapterTimelineNode(
    node: ChapterMapNode,
    onClick: () -> Unit
) {
    val isCompleted = node.state == ChapterNodeState.COMPLETED
    val isCurrent = node.state == ChapterNodeState.CURRENT
    val isLocked = node.state == ChapterNodeState.LOCKED

    val infiniteTransition = rememberInfiniteTransition(label = "node_pulse_${node.level}")
    val pulse by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isCurrent) 1.12f else 1f,
        animationSpec = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label = "scale"
    )

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        // 左侧：竖轴 + 节点圆
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.width(56.dp)
        ) {
            // 上方连接线（第一章不显示）
            if (node.level > 1) {
                Box(
                    modifier = Modifier
                        .width(3.dp)
                        .height(12.dp)
                        .background(
                            if (isLocked) MaterialTheme.colorScheme.surfaceVariant
                            else MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)
                        )
                )
            } else {
                Spacer(Modifier.height(12.dp))
            }

            // 节点圆
            val (nodeColor, nodeIcon) = when (node.state) {
                ChapterNodeState.COMPLETED ->
                    MaterialTheme.colorScheme.primary to Icons.Default.CheckCircle
                ChapterNodeState.CURRENT ->
                    MaterialTheme.colorScheme.primary to Icons.Default.MyLocation
                ChapterNodeState.LOCKED ->
                    MaterialTheme.colorScheme.surfaceVariant to Icons.Default.Lock
            }

            Box(
                modifier = Modifier
                    .scale(pulse)
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(if (isLocked) nodeColor else nodeColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    shape = CircleShape,
                    color = if (isLocked) Color.Transparent else nodeColor,
                    modifier = Modifier.size(if (isCurrent) 40.dp else 36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        if (node.level == 10 && isCompleted) {
                            Icon(
                                imageVector = Icons.Default.EmojiEvents,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Icon(
                                imageVector = nodeIcon,
                                contentDescription = null,
                                tint = if (isLocked) MaterialTheme.colorScheme.outline else Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }

            // 下方连接线（最后一章不显示）
            if (node.level < 10) {
                Box(
                    modifier = Modifier
                        .width(3.dp)
                        .height(if (isCompleted || isCurrent) 24.dp else 32.dp)
                        .background(
                            if (isLocked) MaterialTheme.colorScheme.surfaceVariant
                            else MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)
                        )
                )
            }
        }

        Spacer(Modifier.width(12.dp))

        // 右侧：章节内容卡片
        Box(modifier = Modifier.weight(1f).padding(bottom = 8.dp)) {
            ChapterCard(node = node, onClick = onClick)
        }
    }
}

@Composable
private fun ChapterCard(
    node: ChapterMapNode,
    onClick: () -> Unit
) {
    val isCompleted = node.state == ChapterNodeState.COMPLETED
    val isCurrent = node.state == ChapterNodeState.CURRENT
    val isLocked = node.state == ChapterNodeState.LOCKED

    val cardColor = when (node.state) {
        ChapterNodeState.CURRENT -> MaterialTheme.colorScheme.primaryContainer
        ChapterNodeState.COMPLETED -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
        ChapterNodeState.LOCKED -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .then(
                if (!isLocked) Modifier.clickable(onClick = onClick) else Modifier
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor),
        elevation = CardDefaults.cardElevation(if (isCurrent) 3.dp else 0.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // 章节标题行
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Lv.${node.level} ${node.title}",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (isLocked)
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                        else
                            MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        text = node.chapterTitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isLocked)
                            MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                        else
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // 状态徽章
                val (badgeText, badgeColor) = when (node.state) {
                    ChapterNodeState.CURRENT -> "进行中" to MaterialTheme.colorScheme.primary
                    ChapterNodeState.COMPLETED -> "已通关" to Color(0xFF4CAF50)
                    ChapterNodeState.LOCKED -> "未解锁" to MaterialTheme.colorScheme.outline
                }
                Surface(
                    color = badgeColor.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = badgeText,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = badgeColor
                    )
                }
            }

            // 进度条（只对当前章节和已完成章节显示）
            if (!isLocked) {
                Spacer(Modifier.height(10.dp))
                val progress = if (node.totalTasks > 0)
                    node.completedTasks.toFloat() / node.totalTasks.toFloat()
                else 0f
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "任务进度",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${node.completedTasks} / ${node.totalTasks}",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = if (isCompleted) Color(0xFF4CAF50)
                        else MaterialTheme.colorScheme.primary
                    )
                }
                Spacer(Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = { progress.coerceIn(0f, 1f) },
                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                    color = if (isCompleted) Color(0xFF4CAF50) else MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            } else {
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "完成上一阶段升级后解锁",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.35f),
                    fontSize = 11.sp
                )
            }

            // 当前章节：显示升级预告
            if (isCurrent) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "升级目标 → ${node.nextLevelPreview}",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            } else if (isCompleted) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "点击回看本章挑战与完成情况",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
private fun AdventureMapHintCard(
    title: String = "当前提示",
    message: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.55f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.Top
        ) {
            Icon(
                imageVector = Icons.Default.EmojiEvents,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
