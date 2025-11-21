package com.example.gameboxone.ui.screen

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

/**
 * 设置页面ViewModel
 */
@HiltViewModel
class SettingsViewModel @Inject constructor() : ViewModel() {

    // UI状态
    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    // 设置项状态
    var isDarkMode by mutableStateOf(false)
        private set

    var isWifiOnlyDownload by mutableStateOf(true)
        private set

    var isHardwareAcceleration by mutableStateOf(true)
        private set

    var isSoundEnabled by mutableStateOf(true)
        private set

    // 临时存储缓存大小
    private var _cacheSize = MutableStateFlow("计算中...")
    val cacheSize = _cacheSize.asStateFlow()

    init {
        viewModelScope.launch {
            calculateCacheSize()
        }
    }

    /**
     * 切换深色模式
     */
    fun toggleDarkMode(enabled: Boolean) {
        isDarkMode = enabled
        // 实际项目中，这里需要保存设置并应用主题
    }

    /**
     * 切换WiFi下载设置
     */
    fun toggleWifiDownload(enabled: Boolean) {
        isWifiOnlyDownload = enabled
        // 实际项目中，这里需要保存设置
    }

    /**
     * 切换硬件加速设置
     */
    fun toggleHardwareAcceleration(enabled: Boolean) {
        isHardwareAcceleration = enabled
        // 实际项目中，这里需要保存设置
    }

    /**
     * 切换声音设置
     */
    fun toggleSound(enabled: Boolean) {
        isSoundEnabled = enabled
        // 实际项目中，这里需要保存设置
    }

    /**
     * 计算缓存大小
     */
    private fun calculateCacheSize() {
        // 实际项目中，这里需要异步计算应用缓存大小
        // 这里只是模拟
        _cacheSize.value = "156 MB"
    }

    /**
     * 清除缓存
     */
    fun clearCache(context: Context, onComplete: () -> Unit) {
        viewModelScope.launch {
            // 实际项目中，这里需要实际执行清除缓存操作
            // 模拟清除缓存延迟
            kotlinx.coroutines.delay(1000)
            _cacheSize.value = "0 MB"
            onComplete()
        }
    }
}

/**
 * 设置页面UI状态
 */
data class SettingsUiState(
    val isLoading: Boolean = false,
    val showClearCacheDialog: Boolean = false
)

/**
 * 设置页面主组件
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingScreen(
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val cacheSize by viewModel.cacheSize.collectAsState()
    val context = LocalContext.current

    // 对话框状态
    var showClearCacheDialog by remember { mutableStateOf(false) }
    var showAboutDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("设置") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // 应用外观设置
            item {
                SettingSectionHeader(title = "界面设置")
                SettingsSwitchItem(
                    title = "深色模式",
                    description = "使用深色主题",
                    icon = Icons.Default.DarkMode,
                    checked = viewModel.isDarkMode,
                    onCheckedChange = viewModel::toggleDarkMode
                )
            }

            // 存储与缓存
            item {
                SettingSectionHeader(title = "存储与缓存")
                SettingsClickableItem(
                    title = "清除缓存",
                    description = "当前缓存大小：$cacheSize",
                    icon = Icons.Default.DeleteSweep
                ) {
                    showClearCacheDialog = true
                }
                SettingsClickableItem(
                    title = "管理下载",
                    description = "查看和管理已下载的游戏",
                    icon = Icons.Default.Download
                ) {
                    // 导航到下载管理页面
                }
            }

            // 网络设置
            item {
                SettingSectionHeader(title = "网络设置")
                SettingsSwitchItem(
                    title = "仅在WIFI下下载",
                    description = "使用移动数据时不下载游戏",
                    icon = Icons.Default.Wifi,
                    checked = viewModel.isWifiOnlyDownload,
                    onCheckedChange = viewModel::toggleWifiDownload
                )
            }

            // 游戏体验
            item {
                SettingSectionHeader(title = "游戏体验")
                SettingsSwitchItem(
                    title = "硬件加速",
                    description = "提高游戏性能（可能增加耗电）",
                    icon = Icons.Default.Speed,
                    checked = viewModel.isHardwareAcceleration,
                    onCheckedChange = viewModel::toggleHardwareAcceleration
                )
                SettingsSwitchItem(
                    title = "游戏音效",
                    description = "启用游戏中的声音效果",
                    icon = Icons.Default.VolumeUp,
                    checked = viewModel.isSoundEnabled,
                    onCheckedChange = viewModel::toggleSound
                )
            }

            // 关于与帮助
            item {
                SettingSectionHeader(title = "关于")
                SettingsClickableItem(
                    title = "应用信息",
                    description = "版本、开发者信息等",
                    icon = Icons.Default.Info
                ) {
                    showAboutDialog = true
                }
                SettingsClickableItem(
                    title = "隐私政策",
                    description = "查看应用的隐私政策",
                    icon = Icons.Default.Shield
                ) {
                    // 导航到隐私政策页面或打开网页
                }
                SettingsClickableItem(
                    title = "用户协议",
                    description = "查看用户协议",
                    icon = Icons.Default.Description
                ) {
                    // 导航到用户协议页面或打开网页
                }
            }

            // 底部填充
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        // 清除缓存确认对话框
        if (showClearCacheDialog) {
            AlertDialog(
                onDismissRequest = { showClearCacheDialog = false },
                title = { Text("清除缓存") },
                text = { Text("确定要清除所有缓存数据吗？\n这不会影响您已下载的游戏。") },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.clearCache(context) {
                                showClearCacheDialog = false
                            }
                        }
                    ) {
                        Text("确认")
                    }
                },
                dismissButton = {
                    OutlinedButton(
                        onClick = { showClearCacheDialog = false }
                    ) {
                        Text("取消")
                    }
                }
            )
        }

        // 关于对话框
        if (showAboutDialog) {
            AlertDialog(
                onDismissRequest = { showAboutDialog = false },
                title = { Text("关于 GameBoxOne") },
                text = {
                    Column {
                        Text("版本: 1.0.0")
                        Text("开发者: GameBoxOne Team")
                        Text("© 2025 GameBoxOne. All rights reserved.")
                    }
                },
                confirmButton = {
                    Button(
                        onClick = { showAboutDialog = false }
                    ) {
                        Text("确认")
                    }
                }
            )
        }
    }
}

/**
 * 设置分区标题
 */
@Composable
fun SettingSectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium.copy(
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        ),
        modifier = Modifier.padding(vertical = 8.dp)
    )
}

/**
 * 带开关的设置项
 */
@Composable
fun SettingsSwitchItem(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(end = 16.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange
            )
        }
    }
}

/**
 * 可点击的设置项
 */
@Composable
fun SettingsClickableItem(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(end = 16.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}