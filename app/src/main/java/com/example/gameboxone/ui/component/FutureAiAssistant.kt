package com.example.gameboxone.ui.component

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import kotlinx.coroutines.delay
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.gameboxone.ui.theme.AdventureRealmBackgroundMid
import com.example.gameboxone.ui.theme.AdventureRealmGlassBottom
import com.example.gameboxone.ui.theme.AdventureRealmGlassTop
import com.example.gameboxone.ui.theme.AdventureRealmGlow
import com.example.gameboxone.ui.theme.AdventureRealmGlowStrong
import com.example.gameboxone.ui.theme.AdventureRealmLine
import com.example.gameboxone.ui.theme.AdventureRealmTextPrimary
import com.example.gameboxone.ui.theme.AdventureRewardGold
import com.example.gameboxone.ui.theme.AdventureThemeAssistantName
import com.example.gameboxone.ui.theme.AdventureThemeNameCn
import com.example.gameboxone.ui.theme.AdventureWarmCard
import com.example.gameboxone.ui.theme.AdventureWarmOutline
import com.example.gameboxone.ui.theme.AdventureWarmPanel
import com.example.gameboxone.ui.theme.AdventureWarmText
import com.example.gameboxone.ui.theme.AdventureWarmTextMuted

@Composable
fun AiAssistantFab(
    modifier: Modifier = Modifier,
    size: androidx.compose.ui.unit.Dp = 76.dp,
    onClick: () -> Unit
) {
    val pulseTransition = rememberInfiniteTransition(label = "ai_fab_pulse")
    val scale by pulseTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.06f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400),
            repeatMode = RepeatMode.Reverse
        ),
        label = "ai_fab_scale"
    )
    // 左右交替：左亮(白)右暗 → 左暗右亮(白)，两眼都是白色
    var leftIsActive by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            leftIsActive = !leftIsActive
        }
    }
    val leftEyeAlpha by animateFloatAsState(
        targetValue = if (leftIsActive) 1f else 0.1f,
        animationSpec = tween(durationMillis = 150, easing = LinearEasing),
        label = "ai_left_eye"
    )
    val rightEyeAlpha by animateFloatAsState(
        targetValue = if (leftIsActive) 0.1f else 1f,
        animationSpec = tween(durationMillis = 150, easing = LinearEasing),
        label = "ai_right_eye"
    )

    Box(
        modifier = modifier
            .scale(scale)
            .size(size)
            .clip(CircleShape)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        AdventureRealmGlowStrong,
                        AdventureRewardGold.copy(alpha = 0.96f),
                        AdventureRealmBackgroundMid.copy(alpha = 0.92f)
                    )
                )
            )
            .border(
                width = 1.5.dp,
                color = AdventureRealmLine.copy(alpha = 0.98f),
                shape = CircleShape
            )
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size(size * 0.74f)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.16f))
                .border(1.dp, Color.White.copy(alpha = 0.28f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy((size * 0.13f).coerceAtLeast(6.dp)),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size((size * 0.17f).coerceAtLeast(10.dp))
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = leftEyeAlpha))
                )
                Box(
                    modifier = Modifier
                        .size((size * 0.13f).coerceAtLeast(8.dp))
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = rightEyeAlpha))
                )
            }
        }
    }
}

@Composable
fun AiWelcomeDialog(
    visible: Boolean,
    onDismiss: () -> Unit,
    onChallenge: () -> Unit
) {
    // 使用 AnimatedVisibility + Box 遮罩替代 Dialog，避免创建新 Window 导致界面上下偏移
    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(animationSpec = tween(200)),
        exit = fadeOut(animationSpec = tween(200))
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.54f))
                .clickable(onClick = onDismiss),
            contentAlignment = Alignment.Center
        ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            shape = RoundedCornerShape(28.dp),
            color = Color.Transparent,
            tonalElevation = 0.dp,
            shadowElevation = 0.dp
        ) {
            Column(
                modifier = Modifier
                    .clip(RoundedCornerShape(28.dp))
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(
                                AdventureRealmGlassTop,
                                AdventureRealmGlassBottom,
                                AdventureWarmCard.copy(alpha = 0.12f)
                            )
                        )
                    )
                    .border(
                        border = BorderStroke(1.dp, AdventureRealmLine.copy(alpha = 0.98f)),
                        shape = RoundedCornerShape(28.dp)
                    )
                    .clickable(onClick = onChallenge)
                    .padding(horizontal = 22.dp, vertical = 22.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(
                                brush = Brush.radialGradient(
                                    colors = listOf(
                                        AdventureRealmGlowStrong,
                                        AdventureRewardGold,
                                        AdventureRewardGold.copy(alpha = 0.92f)
                                    )
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(11.dp)
                                    .clip(CircleShape)
                                    .background(Color.White)
                            )
                            Box(
                                modifier = Modifier
                                    .size(11.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.85f))
                            )
                        }
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = AdventureThemeAssistantName,
                            style = MaterialTheme.typography.labelLarge,
                            color = AdventureRewardGold,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "欢迎进入 $AdventureThemeNameCn",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = AdventureRealmGlow
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "我已为你接通 OVOKIT 主控台。点击下方即可进入历练矩阵，开始未来科技感更强的升级与挑战。",
                    style = MaterialTheme.typography.bodyMedium,
                    color = AdventureRealmTextPrimary
                )

                Spacer(modifier = Modifier.height(22.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("稍后再说")
                    }
                    Spacer(modifier = Modifier.size(8.dp))
                    Button(
                        onClick = onChallenge,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AdventureRealmGlow,
                            contentColor = Color(0xFF8D4E17)
                        ),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("进入 OVOKIT", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        }
    }
}

