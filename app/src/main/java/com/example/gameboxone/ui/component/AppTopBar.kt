package com.example.gameboxone.ui.component

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.data.model.UserLevelConfig
import com.example.gameboxone.data.viewmodel.UserProfileViewModel
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/**
 * 应用统一顶部栏：
 * - 背景颜色与设置页一致（primaryContainer）
 * - 标题为页面名称
 * - 副标题展示当前用户等级：LvX 等级称号
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppTopBar(
    title: String? = null,
    showBack: Boolean = false,
    onBack: (() -> Unit)? = null,
    userProfileViewModel: UserProfileViewModel = hiltViewModel()
) {
    val profile by userProfileViewModel.profile.collectAsState()
    val level = UserLevelConfig.levelForExp(profile.exp)
    val levelText = level.title
    val currentExp = profile.exp
    // 计算当前等级区间内的经验进度
    val nextLevel = UserLevelConfig.nextLevel(level)
    val baseExp = level.requiredExp
    val nextExp = nextLevel.requiredExp
    val span = (nextExp - baseExp).coerceAtLeast(1)
    val progress = ((currentExp - baseExp).coerceAtLeast(0) / span.toFloat()).coerceIn(0f, 1f)

    TopAppBar(
        title = {
            Column {
                if (!title.isNullOrBlank()) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
                Text(
                    text = profile.nickname?.takeIf { it.isNotBlank() } ?: levelText,
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                )
                // 经验进度条
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .padding(top = 4.dp),
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.9f),
                    trackColor = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.2f)
                )
            }
        },
        navigationIcon = {
            if (showBack && onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "返回",
                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
            titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
        )
    )
}
