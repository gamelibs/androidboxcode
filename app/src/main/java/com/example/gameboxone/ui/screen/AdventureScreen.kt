package com.example.gameboxone.ui.screen

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lock
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.data.model.ChapterMapNode
import com.example.gameboxone.data.model.ChapterNodeState
import com.example.gameboxone.data.viewmodel.HomeViewModel
import com.example.gameboxone.ui.theme.AdventureRealmBackgroundBottom
import com.example.gameboxone.ui.theme.AdventureRealmBackgroundMid
import com.example.gameboxone.ui.theme.AdventureRealmBackgroundTop
import com.example.gameboxone.ui.theme.AdventureRealmGlassBottom
import com.example.gameboxone.ui.theme.AdventureRealmGlassTop
import com.example.gameboxone.ui.theme.AdventureRealmGlow
import com.example.gameboxone.ui.theme.AdventureRealmGlowStrong
import com.example.gameboxone.ui.theme.AdventureRealmTextPrimary
import com.example.gameboxone.ui.theme.AdventureRealmTextSecondary
import com.example.gameboxone.ui.theme.AdventureThemeAdventureSubline
import com.example.gameboxone.ui.theme.AdventureThemeNameCn
import com.example.gameboxone.ui.theme.AdventureThemeTrialsEn

@Composable
fun AdventureScreen(
    viewModel: HomeViewModel = hiltViewModel()
) {
    val chapterMap by viewModel.chapterMap.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val adventure = uiState.adventureHome
    val maxLevel = chapterMap.maxOfOrNull { it.level } ?: 10
    val currentLevel = chapterMap.firstOrNull { it.state == ChapterNodeState.CURRENT }?.level
        ?: adventure.currentLevel
    val overallProgress = (currentLevel.toFloat() / maxLevel.toFloat()).coerceIn(0f, 1f)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        AdventureRealmBackgroundTop,
                        AdventureRealmBackgroundMid,
                        AdventureRealmBackgroundBottom
                    )
                )
            )
            .statusBarsPadding()
    ) {
        AdventureAmbientGlow()

        if (chapterMap.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                AdventurePathHintCard(
                    title = AdventureThemeTrialsEn,
                    message = adventure.emptyMessage ?: "正在同步历练路径，请稍后再试。"
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 18.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item(span = { GridItemSpan(2) }) {
                    AdventurePathHeader(
                        currentLevel = currentLevel,
                        maxLevel = maxLevel,
                        progress = overallProgress,
                        currentTitle = adventure.currentTitle,
                        currentChapterTitle = adventure.currentChapterTitle
                    )
                }

                if (!adventure.emptyMessage.isNullOrBlank()) {
                    item(span = { GridItemSpan(2) }) {
                        AdventurePathHintCard(message = adventure.emptyMessage)
                    }
                }

                items(chapterMap, key = { it.chapterId }) { node ->
                    ChapterLevelPanel(
                        node = node,
                        onClick = {
                            if (node.state != ChapterNodeState.LOCKED) {
                                viewModel.navigateToChapterEntry(node.chapterId)
                            }
                        }
                    )
                }

                item(span = { GridItemSpan(2) }) {
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun AdventurePathHeader(
    currentLevel: Int,
    maxLevel: Int,
    progress: Float,
    currentTitle: String,
    currentChapterTitle: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 4.dp, bottom = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            color = Color.White.copy(alpha = 0.12f),
            shape = RoundedCornerShape(999.dp),
            border = BorderStroke(1.dp, AdventureRealmGlowStrong.copy(alpha = 0.24f))
        ) {
            Text(
                text = AdventureThemeNameCn,
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                color = AdventureRealmGlowStrong,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.labelLarge
            )
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = AdventureThemeTrialsEn,
            color = AdventureRealmGlow,
            fontWeight = FontWeight.ExtraBold,
            fontSize = 24.sp,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Level $currentLevel/$maxLevel · $currentTitle",
            color = AdventureRealmTextPrimary,
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(12.dp))
        LinearProgressIndicator(
            progress = { progress.coerceIn(0f, 1f) },
            modifier = Modifier
                .fillMaxWidth(0.42f)
                .height(9.dp),
            color = AdventureRealmGlowStrong,
            trackColor = Color.White.copy(alpha = 0.18f)
        )
        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = currentChapterTitle,
            color = AdventureRealmTextSecondary,
            style = MaterialTheme.typography.labelLarge,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = AdventureThemeAdventureSubline,
            color = AdventureRealmTextPrimary,
            style = MaterialTheme.typography.bodySmall,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun ChapterLevelPanel(
    node: ChapterMapNode,
    onClick: () -> Unit
) {
    val isLocked = node.state == ChapterNodeState.LOCKED
    val isCurrent = node.state == ChapterNodeState.CURRENT
    val isCompleted = node.state == ChapterNodeState.COMPLETED
    val accent = when (node.state) {
        ChapterNodeState.CURRENT -> AdventureRealmGlowStrong
        ChapterNodeState.COMPLETED -> AdventureRealmGlow
        ChapterNodeState.LOCKED -> AdventureRealmTextSecondary.copy(alpha = 0.6f)
    }
    val container = when (node.state) {
        ChapterNodeState.CURRENT -> Color(0x3DFFD4A6)
        ChapterNodeState.COMPLETED -> Color(0x24FFF2DD)
        ChapterNodeState.LOCKED -> Color(0x16764B30)
    }
    val primaryAction = when (node.state) {
        ChapterNodeState.CURRENT -> "ENTER CHALLENGE"
        ChapterNodeState.COMPLETED -> "SYNC REPLAY"
        ChapterNodeState.LOCKED -> "LOCKED"
    }
    val secondary = when (node.state) {
        ChapterNodeState.CURRENT -> "${(node.totalTasks - node.completedTasks).coerceAtLeast(0)} Challenges Ahead"
        ChapterNodeState.COMPLETED -> "${node.completedTasks} Quests Mastered"
        ChapterNodeState.LOCKED -> "Unlock at Level ${node.level}"
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(if (isCurrent) 12.dp else 4.dp, RoundedCornerShape(20.dp), clip = false)
            .then(if (!isLocked) Modifier.clickable(onClick = onClick) else Modifier),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            AdventureRealmGlassTop.copy(alpha = if (isCurrent) 0.92f else 0.66f),
                            container,
                            AdventureRealmGlassBottom.copy(alpha = if (isLocked) 0.78f else 0.56f)
                        )
                    )
                )
                .border(
                    width = if (isCurrent) 1.8.dp else 1.dp,
                    color = accent.copy(alpha = if (isLocked) 0.4f else 0.9f),
                    shape = RoundedCornerShape(20.dp)
                )
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "LEVEL ${node.level}",
                        color = AdventureRealmTextSecondary,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = node.title.uppercase(),
                        color = if (isLocked) AdventureRealmTextSecondary else AdventureRealmGlow,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        lineHeight = 22.sp
                    )
                }

                if (isCurrent) {
                    StatusChip(text = "CURRENT", color = AdventureRealmGlowStrong)
                } else if (isCompleted) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = AdventureRealmGlowStrong,
                        modifier = Modifier.size(18.dp)
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = null,
                        tint = AdventureRealmTextSecondary.copy(alpha = 0.9f),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Text(
                text = secondary,
                color = AdventureRealmTextPrimary,
                style = MaterialTheme.typography.bodySmall,
                lineHeight = 18.sp
            )

            if (!isLocked) {
                Text(
                    text = "${node.totalTasks} Challenges Total",
                    color = AdventureRealmTextSecondary,
                    style = MaterialTheme.typography.labelSmall
                )
            }

            Spacer(modifier = Modifier.height(2.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (!isLocked) {
                    LinearProgressIndicator(
                        progress = {
                            if (node.totalTasks <= 0) 0f
                            else (node.completedTasks.toFloat() / node.totalTasks.toFloat()).coerceIn(0f, 1f)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(5.dp),
                        color = accent,
                        trackColor = Color.White.copy(alpha = 0.12f)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                }

                ActionChip(
                    text = primaryAction,
                    emphasized = isCurrent,
                    locked = isLocked,
                    onClick = onClick
                )
            }
        }
    }
}

@Composable
private fun StatusChip(
    text: String,
    color: Color
) {
    Surface(
        color = color.copy(alpha = 0.18f),
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(1.dp, color.copy(alpha = 0.5f))
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            color = color,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun ActionChip(
    text: String,
    emphasized: Boolean,
    locked: Boolean,
    onClick: () -> Unit
) {
    val background = when {
        locked -> Color.White.copy(alpha = 0.06f)
        emphasized -> AdventureRealmGlowStrong
        else -> Color.White.copy(alpha = 0.12f)
    }
    val contentColor = when {
        locked -> AdventureRealmTextSecondary
        emphasized -> Color(0xFF7A3E18)
        else -> AdventureRealmGlow
    }

    Surface(
        modifier = Modifier.then(if (!locked) Modifier.clickable(onClick = onClick) else Modifier),
        color = background,
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(1.dp, contentColor.copy(alpha = 0.35f))
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            color = contentColor,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun AdventurePathHintCard(
    title: String = "当前提示",
    message: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.12f))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.Top
        ) {
            Surface(
                modifier = Modifier.size(28.dp),
                shape = CircleShape,
                color = AdventureRealmGlowStrong.copy(alpha = 0.2f)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.EmojiEvents,
                        contentDescription = null,
                        tint = AdventureRealmGlowStrong,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = AdventureRealmGlow
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall,
                    color = AdventureRealmTextPrimary
                )
            }
        }
    }
}

@Composable
private fun AdventureAmbientGlow() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.14f),
                        Color.Transparent
                    ),
                    radius = 820f
                )
            )
    )
}
