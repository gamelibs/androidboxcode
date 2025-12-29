package com.example.gameboxone.ui.screen

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject
import com.example.gameboxone.manager.DataManager
import org.json.JSONObject

/**
 * 设置页面ViewModel
 */
@HiltViewModel
class SettingsViewModel @Inject constructor(
    @ApplicationContext private val appContext: Context,
    private val dataManager: DataManager
) : ViewModel() {
    private val TAG = "SettingsViewModel"

    // UI状态
    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<SettingsUiEvent>(extraBufferCapacity = 1)
    val events: SharedFlow<SettingsUiEvent> = _events

    // 设置项状态
    var isDarkMode by mutableStateOf(false)
        private set

    var isWifiOnlyDownload by mutableStateOf(true)
        private set

    var isHardwareAcceleration by mutableStateOf(true)
        private set

    var isSoundEnabled by mutableStateOf(true)
        private set

    // 新增：广告开关（控制 app_ads_on / ad_consent_enabled）
    var isAdsEnabled by mutableStateOf(true)
        private set

    // 环境与地址设置（env/betaUrl/resUrl）
    var currentEnv by mutableStateOf("release")
        private set

    var betaUrl by mutableStateOf("")
        private set

    var releaseUrl by mutableStateOf("")
        private set

    // 临时存储缓存大小
    private var _cacheSize = MutableStateFlow("计算中...")
    val cacheSize = _cacheSize.asStateFlow()

    init {
        viewModelScope.launch {
            calculateCacheSize()
        }
    }

    // 在 Composable 中调用，用于从 SharedPreferences 读取当前广告开关状态
    fun loadSettings(context: Context) {
        viewModelScope.launch {
            try {
                val prefs = context.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
                // 默认开启广告：默认值为 true
                val enabled = prefs.getBoolean("ad_consent_enabled", true)
                isAdsEnabled = enabled

                // 读取环境与地址配置（优先使用用户自定义，其次使用 assets/gameconfig.json 中的保底配置）
                val storedEnv = prefs.getString("env_type", null)
                val storedBeta = prefs.getString("env_beta_url", null)
                val storedRelease = prefs.getString("env_release_url", null)

                if (storedEnv != null || storedBeta != null || storedRelease != null) {
                    currentEnv = storedEnv ?: "release"
                    betaUrl = storedBeta.orEmpty()
                    releaseUrl = storedRelease.orEmpty()
                } else {
                    // 从 assets/gameconfig.json 中尝试解析出默认 env/betaUrl/resUrl
                    try {
                        val jsonString = appContext.assets.open("gameconfig.json")
                            .bufferedReader()
                            .use { it.readText() }

                        val root = JSONObject(jsonString)
                        // 支持新旧两种结构：直接 params 或 data.params
                        val container = if (root.has("data") && root.opt("data") is JSONObject) {
                            root.getJSONObject("data")
                        } else {
                            root
                        }
                        val params = if (container.has("params") && container.opt("params") is JSONObject) {
                            container.getJSONObject("params")
                        } else {
                            null
                        }

                        val envFromConfig = params?.optString("env")?.takeIf { it.isNotBlank() } ?: "release"
                        // 支持多种命名（beta / betaUrl）和（resUrl / release）
                        val betaFromConfig = params?.optString("betaUrl")
                            ?.takeIf { it.isNotBlank() }
                            ?: params?.optString("beta")?.takeIf { it.isNotBlank() }
                        val releaseFromConfig = params?.optString("resUrl")
                            ?.takeIf { it.isNotBlank() }
                            ?: params?.optString("release")?.takeIf { it.isNotBlank() }

                        currentEnv = envFromConfig
                        betaUrl = betaFromConfig.orEmpty()
                        releaseUrl = releaseFromConfig.orEmpty()
                    } catch (_: Exception) {
                        // 解析失败时使用默认值
                        currentEnv = "release"
                        betaUrl = ""
                        releaseUrl = ""
                    }
                }
            } catch (_: Exception) {
                // 读不到时保持默认 true
                isAdsEnabled = true
            }
        }
    }

    // 切换广告开关，并写回 SharedPreferences，供 GameDataBridge 使用
    fun toggleAdsEnabled(context: Context, enabled: Boolean) {
        isAdsEnabled = enabled
        viewModelScope.launch {
            try {
                val prefs = context.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
                prefs.edit().putBoolean("ad_consent_enabled", enabled).apply()
                com.example.gameboxone.AppLog.d(TAG, "切换广告开关: enabled=$enabled")
            } catch (_: Exception) {
                // 忽略持久化异常，保持内存状态
            }
        }
    }

    // 更新当前选择的环境（beta/release）
    fun updateEnv(env: String) {
        currentEnv = env.lowercase()
    }

    fun updateBetaUrl(url: String) {
        betaUrl = url
    }

    fun updateReleaseUrl(url: String) {
        releaseUrl = url
    }

    /**
     * 将当前在设置页中配置的环境和地址应用到网络层：
     *  - 持久化到 SharedPreferences，便于下次启动恢复
     *  - 调用 DataManager/NetManager 更新 BASE_URL / REMOTE_CONFIG_URL
     */
    fun applyEnvSettings(context: Context) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isApplyingEnv = true)
                val env = currentEnv.lowercase().trim().ifBlank { "release" }
                val beta = betaUrl.trim()
                val release = releaseUrl.trim()

                // 先将配置写入 SharedPreferences
                val prefs = context.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
                prefs.edit()
                    .putString("env_type", env)
                    .putString("env_beta_url", beta)
                    .putString("env_release_url", release)
                    .apply()

                // 当 beta/release 地址全部为空时，视为不覆盖，直接返回
                if (beta.isBlank() && release.isBlank()) {
                    com.example.gameboxone.AppLog.w(TAG, "applyEnvSettings: beta/release 地址均为空，跳过网络参数覆盖")
                    _events.tryEmit(SettingsUiEvent.Snackbar("环境配置已保存，但地址为空，未应用网络切换"))
                    return@launch
                }

                // 调用 DataManager，使用当前 env + 地址更新 NetManager，并同步写入 app_config
                try {
                    dataManager.applyEnvOverrideFromSettings(
                        env = env,
                        betaUrl = beta.takeIf { it.isNotBlank() },
                        resUrl = release.takeIf { it.isNotBlank() }
                    )
                    val chosenBase = if (env == "beta") {
                        beta.ifBlank { release }
                    } else {
                        release.ifBlank { beta }
                    }.trim().trimEnd('/')
                    _events.tryEmit(SettingsUiEvent.Snackbar("环境已应用：${env.uppercase()}（$chosenBase），正在刷新游戏列表和 SDK..."))
                    com.example.gameboxone.AppLog.d(
                        TAG,
                        "applyEnvSettings: 已应用环境配置 env=$env, beta=$beta, release=$release"
                    )

                    // 触发一次完整刷新：拉取新地址下的 gameconfig，并触发 SDK 更新/预加载
                    try {
                        dataManager.refreshAllData(isInitialLoad = false)
                    } catch (e: Exception) {
                        com.example.gameboxone.AppLog.w(TAG, "applyEnvSettings: 刷新游戏列表失败", e)
                    }
                    try {
                        dataManager.preloadSdkOnly(force = true)
                    } catch (e: Exception) {
                        com.example.gameboxone.AppLog.w(TAG, "applyEnvSettings: 刷新 SDK 失败", e)
                    }
                } catch (e: Exception) {
                    com.example.gameboxone.AppLog.w(TAG, "applyEnvSettings: 应用环境配置失败", e)
                    _events.tryEmit(SettingsUiEvent.Snackbar("应用环境失败：${e.message ?: "未知错误"}"))
                }
            } catch (e: Exception) {
                com.example.gameboxone.AppLog.w(TAG, "applyEnvSettings: 整体流程失败", e)
                _events.tryEmit(SettingsUiEvent.Snackbar("应用环境失败：${e.message ?: "未知错误"}"))
            } finally {
                _uiState.value = _uiState.value.copy(isApplyingEnv = false)
            }
        }
    }

    /**
     * 切换深色模式
     */
    fun toggleDarkMode(enabled: Boolean) {
        isDarkMode = enabled
        viewModelScope.launch {
            try {
                val prefs = appContext.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
                prefs.edit().putBoolean("dark_mode_enabled", enabled).apply()
                com.example.gameboxone.AppLog.d(TAG, "切换深色模式: enabled=$enabled")

                // 同步到全局 ThemeManager，立刻触发主题重绘
                com.example.gameboxone.ui.theme.ThemeManager.setDarkTheme(enabled)
            } catch (e: Exception) {
                com.example.gameboxone.AppLog.e(TAG, "保存深色模式设置失败", e)
            }
        }
    }

    /**
     * 切换WiFi下载设置
     */
    fun toggleWifiDownload(enabled: Boolean) {
        isWifiOnlyDownload = enabled
        // 持久化到 SharedPreferences，供下载逻辑读取
        viewModelScope.launch {
            try {
                val prefs = appContext.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
                prefs.edit().putBoolean("wifi_only_download", enabled).apply()
                com.example.gameboxone.AppLog.d(TAG, "切换仅WiFi下载: enabled=$enabled")
            } catch (_: Exception) { }
        }
    }

    /**
     * 切换硬件加速设置
     */
    fun toggleHardwareAcceleration(enabled: Boolean) {
        isHardwareAcceleration = enabled
        viewModelScope.launch {
            try {
                val prefs = appContext.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
                prefs.edit().putBoolean("hardware_accel_enabled", enabled).apply()
                com.example.gameboxone.AppLog.d(TAG, "切换硬件加速: enabled=$enabled")
            } catch (_: Exception) { }
        }
    }

    /**
     * 切换声音设置
     */
    fun toggleSound(enabled: Boolean) {
        isSoundEnabled = enabled
        viewModelScope.launch {
            try {
                val prefs = appContext.getSharedPreferences("game_preferences", Context.MODE_PRIVATE)
                prefs.edit().putBoolean("game_sound_enabled", enabled).apply()
                com.example.gameboxone.AppLog.d(TAG, "切换游戏音效: enabled=$enabled")
            } catch (_: Exception) { }
        }
    }

    /**
     * 计算缓存大小
     */
    private fun calculateCacheSize() {
        viewModelScope.launch {
            try {
                // 这里只粗略统计 WebView 相关缓存目录大小，避免误删已下载游戏资源
                val cacheDirs = mutableListOf<File>()
                try {
                    val baseCache = appContext.cacheDir
                    if (baseCache != null && baseCache.exists()) {
                        cacheDirs.add(baseCache)
                    }
                } catch (_: Exception) { }

                val sizeBytes = cacheDirs.sumOf { dir -> dir.walkBottomUp().filter { it.isFile }.sumOf { it.length() } }
                val sizeMb = sizeBytes.toDouble() / (1024 * 1024)
                _cacheSize.value = String.format("%.1f MB", sizeMb)
            } catch (_: Exception) {
                _cacheSize.value = "未知"
            }
        }
    }

    /**
     * 清除缓存
     */
    fun clearCache(context: Context, onComplete: () -> Unit) {
        viewModelScope.launch {
            try {
                // 清除 WebView 缓存（内存 + 磁盘）
                try {
                    val webView = android.webkit.WebView(context.applicationContext)
                    webView.clearCache(true)
                    webView.destroy()
                } catch (_: Exception) { }

                try {
                    android.webkit.WebStorage.getInstance().deleteAllData()
                } catch (_: Exception) { }

                // 重新计算缓存大小
                calculateCacheSize()
            } finally {
                onComplete()
            }
        }
    }
}

/**
 * 设置页面UI状态
 */
data class SettingsUiState(
    val isLoading: Boolean = false,
    val showClearCacheDialog: Boolean = false,
    val isApplyingEnv: Boolean = false
)

sealed class SettingsUiEvent {
    data class Snackbar(val message: String) : SettingsUiEvent()
}

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
    val snackbarHostState = remember { SnackbarHostState() }

    // 首次进入设置页时，从 SharedPreferences 加载广告开关状态
    LaunchedEffect(Unit) {
        viewModel.loadSettings(context)
    }

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is SettingsUiEvent.Snackbar -> snackbarHostState.showSnackbar(event.message)
            }
        }
    }

    // 对话框状态
    var showClearCacheDialog by remember { mutableStateOf(false) }
    var showAboutDialog by remember { mutableStateOf(false) }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
        // topBar removed
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // 界面设置
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

            // 新增：广告设置
            item {
                SettingSectionHeader(title = "广告设置")
                SettingsSwitchItem(
                    title = "启用游戏内广告",
                    description = "控制是否允许展示激励广告、插屏广告等（默认开启）",
                    icon = Icons.Default.Campaign,
                    checked = viewModel.isAdsEnabled,
                    onCheckedChange = { enabled ->
                        viewModel.toggleAdsEnabled(context, enabled)
                    }
                )
            }

            // 环境与地址设置
            item {
                SettingSectionHeader(title = "环境设置")
                EnvSettingsCard(
                    currentEnv = viewModel.currentEnv,
                    betaUrl = viewModel.betaUrl,
                    releaseUrl = viewModel.releaseUrl,
                    onEnvChange = { env -> viewModel.updateEnv(env) },
                    onBetaUrlChange = { url -> viewModel.updateBetaUrl(url) },
                    onReleaseUrlChange = { url -> viewModel.updateReleaseUrl(url) },
                    isApplying = uiState.isApplyingEnv,
                    onApplyClick = { viewModel.applyEnvSettings(context) }
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

        // 清除缓存确认对话框（自定义覆盖层，避免触发系统对话框导致状态栏重新显示）
        ConfirmOverlayDialog(
            visible = showClearCacheDialog,
            title = "清除缓存",
            message = "确定要清除所有缓存数据吗？\n这不会影响您已下载的游戏。",
            confirmText = "确认",
            dismissText = "取消",
            onConfirm = {
                viewModel.clearCache(context) {
                    showClearCacheDialog = false
                }
            },
            onDismiss = { showClearCacheDialog = false }
        )

        // 关于对话框，同样使用自定义覆盖层以保持全屏沉浸体验
        ConfirmOverlayDialog(
            visible = showAboutDialog,
            title = "关于 GameBoxOne",
            message = "版本: 1.0.0\n开发者: GameBoxOne Team\n© 2025 GameBoxOne. All rights reserved.",
            confirmText = "确认",
            dismissText = null,
            onConfirm = { showAboutDialog = false },
            onDismiss = { showAboutDialog = false }
        )
    }
}

/**
 * 全屏覆盖层样式的确认对话框，避免使用系统 AlertDialog 破坏沉浸式状态栏隐藏。
 */
@Composable
fun ConfirmOverlayDialog(
    visible: Boolean,
    title: String,
    message: String,
    confirmText: String,
    dismissText: String? = null,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (!visible) return

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.35f))
            // 点击遮罩区域关闭（可根据需要调整）
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() }
            ) { onDismiss() },
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier
                .padding(horizontal = 32.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(24.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (dismissText != null) {
                        OutlinedButton(
                            modifier = Modifier.weight(1f),
                            onClick = onDismiss
                        ) {
                            Text(dismissText)
                        }
                    }
                    Button(
                        modifier = Modifier.weight(1f),
                        onClick = onConfirm
                    ) {
                        Text(confirmText)
                    }
                }
            }
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

/**
 * 环境与地址设置卡片（beta/release 切换 + 地址编辑）
 */
@Composable
fun EnvSettingsCard(
    currentEnv: String,
    betaUrl: String,
    releaseUrl: String,
    onEnvChange: (String) -> Unit,
    onBetaUrlChange: (String) -> Unit,
    onReleaseUrlChange: (String) -> Unit,
    isApplying: Boolean = false,
    onApplyClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "环境选择",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
            )
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { onEnvChange("beta") }
                ) {
                    RadioButton(
                        selected = currentEnv.lowercase() == "beta",
                        onClick = { onEnvChange("beta") }
                    )
                    Text(text = "Beta", style = MaterialTheme.typography.bodyMedium)
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { onEnvChange("release") }
                ) {
                    RadioButton(
                        selected = currentEnv.lowercase() != "beta",
                        onClick = { onEnvChange("release") }
                    )
                    Text(text = "Release", style = MaterialTheme.typography.bodyMedium)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Beta 地址",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            OutlinedTextField(
                value = betaUrl,
                onValueChange = onBetaUrlChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                singleLine = true,
                textStyle = LocalTextStyle.current.copy(fontSize = 12.sp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Release 地址",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            OutlinedTextField(
                value = releaseUrl,
                onValueChange = onReleaseUrlChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                singleLine = true,
                textStyle = LocalTextStyle.current.copy(fontSize = 12.sp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                modifier = Modifier.align(Alignment.End),
                onClick = onApplyClick,
                enabled = !isApplying
            ) {
                Text(text = if (isApplying) "应用中..." else "应用环境")
            }
        }
    }
}
