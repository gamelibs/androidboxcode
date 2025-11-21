package com.example.gameboxone.navigation

import com.example.gameboxone.AppLog as Log
import androidx.navigation.NavController
import com.example.gameboxone.ui.navigation.NavGraphBuilders
import kotlinx.coroutines.flow.SharedFlow

/**
 * 应用导航控制器
 * 集中处理所有导航事件
 */
class AppNavigator(private val navController: NavController) {
    
    private val TAG = "AppNavigator"
    
    /**
     * 处理导航事件
     */
    suspend fun handleNavigationEvents(events: SharedFlow<NavigationEvent>) {
        events.collect { event ->
            try {
                handleNavigationEvent(event)
            } catch (e: Exception) {
                Log.e(TAG, "导航事件处理异常", e)
            }
        }
    }
    
    /**
     * 处理单个导航事件
     */
    private fun handleNavigationEvent(event: NavigationEvent) {
        when (event) {
            is NavigationEvent.Navigate -> {
                Log.d(TAG, "处理导航事件: Navigate to ${event.route}")
                navController.navigate(event.route)
            }
            is NavigationEvent.NavigateToGameDetail -> {
                Log.d(TAG, "处理导航事件: NavigateToGameDetail id=${event.gameId}")
                navController.navigate("gameDetail/${event.gameId}")
            }
//            is NavigationEvent.NavigateToGamePlayer -> {
//                Log.d(TAG, "处理导航事件: NavigateToGamePlayer id=${event.gameId}")
//                // 对路径进行URL编码
//                val encodedPath = java.net.URLEncoder.encode(event.localPath, "UTF-8")
//                navController.navigate("gamePlayer/${event.gameId}?path=$encodedPath")
//            }
            is NavigationEvent.PopBackStack -> handlePopBackStack()
            is NavigationEvent.NavigateUp -> {
                Log.d(TAG, "处理导航事件: NavigateUp")
                navController.navigateUp()
            }
//            else -> Log.w(TAG, "未知的导航事件: $event")
            else -> {Log.w(TAG, "未知的导航事件: $event")}
        }
    }
    
    /**
     * 处理返回导航
     */
    private fun handlePopBackStack() {
        Log.d(TAG, "处理导航事件: PopBackStack, 当前栈顶: ${navController.currentBackStackEntry?.destination?.route}")
        if (navController.previousBackStackEntry != null) {
            // 记录返回前的状态
            val previousRoute = navController.previousBackStackEntry?.destination?.route
            Log.d(TAG, "将返回到: $previousRoute")
            
            // 尝试使用强制返回到首页的方法
            val result = navController.popBackStack(
                route = NavGraphBuilders.Routes.HOME, 
                inclusive = false
            )
            
            Log.d(TAG, "返回操作结果: $result")
            
            // 如果常规返回失败，尝试直接导航到首页
            if (!result) {
                Log.w(TAG, "常规返回失败，尝试直接导航到首页")
                navController.navigate(NavGraphBuilders.Routes.HOME) {
                    popUpTo(NavGraphBuilders.Routes.HOME) { inclusive = true }
                }
            }
        } else {
            Log.w(TAG, "无法返回：导航栈为空")
        }
    }
}
