package com.example.gameboxone.ui.theme

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * 全局主题管理器
 * - 使用 StateFlow 保存当前是否为深色模式
 * - 由 MainActivity 在启动时设置初始值
 * - 由 SettingsViewModel 在用户切换时更新
 */
object ThemeManager {
    private val _isDarkTheme = MutableStateFlow(false)
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

    fun setDarkTheme(enabled: Boolean) {
        _isDarkTheme.value = enabled
    }
}

