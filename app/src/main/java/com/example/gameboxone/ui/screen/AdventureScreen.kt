package com.example.gameboxone.ui.screen

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AdventureScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Background Path (Simplified visual representation)
        AdventurePathBackground()

        // Content Overlay
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Top Header
            Text(
                text = "历练之路",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(top = 16.dp, bottom = 24.dp)
            )

            // Adventure Nodes (Simulating the map)
            Box(modifier = Modifier.fillMaxSize()) {
                // Node 1: Daily Gift (Sign In)
                AdventureNode(
                    modifier = Modifier.align(Alignment.BottomStart).padding(bottom = 100.dp, start = 20.dp),
                    title = "每日签到",
                    icon = Icons.Default.Star,
                    color = Color(0xFF4CAF50), // Green
                    isUnlocked = true,
                    onClick = { /* TODO: Open Sign In Dialog */ }
                )

                // Node 2: Missions
                AdventureNode(
                    modifier = Modifier.align(Alignment.CenterStart).padding(start = 80.dp, top = 50.dp),
                    title = "任务",
                    icon = Icons.Default.Flag,
                    color = Color(0xFFFF9800), // Orange
                    isUnlocked = true,
                    onClick = { /* TODO: Open Missions */ }
                )

                // Node 3: Leaderboard (Ranking)
                AdventureNode(
                    modifier = Modifier.align(Alignment.CenterEnd).padding(end = 60.dp, bottom = 50.dp),
                    title = "排行榜",
                    icon = Icons.Default.EmojiEvents,
                    color = Color(0xFF2196F3), // Blue
                    isUnlocked = true,
                    onClick = { /* TODO: Open Leaderboard */ }
                )

                // Node 4: Locked Chest
                AdventureNode(
                    modifier = Modifier.align(Alignment.TopCenter).padding(top = 100.dp),
                    title = "神秘宝箱",
                    icon = Icons.Default.Lock,
                    color = Color.Gray,
                    isUnlocked = false,
                    onClick = { }
                )
            }
        }
    }
}

@Composable
fun AdventureNode(
    modifier: Modifier = Modifier,
    title: String,
    icon: ImageVector,
    color: Color,
    isUnlocked: Boolean,
    onClick: () -> Unit
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            onClick = onClick,
            enabled = isUnlocked,
            shape = CircleShape,
            color = if (isUnlocked) color else Color.LightGray,
            modifier = Modifier.size(72.dp),
            shadowElevation = 6.dp
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Surface(
            color = MaterialTheme.colorScheme.surface,
            shape = RoundedCornerShape(12.dp),
            shadowElevation = 2.dp
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                color = if (isUnlocked) MaterialTheme.colorScheme.onSurface else Color.Gray
            )
        }
    }
}

@Composable
fun AdventurePathBackground() {
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
