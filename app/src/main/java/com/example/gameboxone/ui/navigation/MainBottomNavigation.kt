package com.example.gameboxone.ui.navigation

import android.util.Log
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable


/**
 * 主界面底部导航栏
 */
@Composable
fun MainBottomNavigation(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    Log.d(TAG, "显示底部导航栏，当前路由: $currentRoute")
    // 安全打印
    Log.d(TAG, "导航项: ${NavGraphBuilders.bottomNavItems.size}项")

    NavigationBar {
        // 过滤掉null项
        NavGraphBuilders.bottomNavItems.filterNotNull().forEach { screen ->
            val selected = currentRoute == screen.route

            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = screen.icon(),
                        contentDescription = screen.title
                    )
                },
                label = { Text(screen.title) },
                selected = selected,
                onClick = {
                    Log.d(TAG, "点击导航到: ${screen.route}")
                    onNavigate(screen.route)
                }
            )
        }
    }
}

private const val TAG = "MainBottomNavigation"