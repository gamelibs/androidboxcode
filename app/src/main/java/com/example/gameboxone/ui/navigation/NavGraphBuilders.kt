package com.example.gameboxone.ui.navigation

import android.util.Log
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.ui.screen.GameDetailScreen
import com.example.gameboxone.ui.screen.HomeScreen
import androidx.compose.runtime.LaunchedEffect
import com.example.gameboxone.ui.screen.GamePlayerScreen
import java.net.URLDecoder
import androidx.activity.compose.BackHandler
import com.example.gameboxone.data.viewmodel.GameDetailViewModel
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally

/**
 * 导航构建器
 * 集中管理应用导航定义和导航构建
 */
object NavGraphBuilders {
    // 页面路由定义
    object Routes {
        const val HOME = "hot"
        const val MY_GAME = "myGame"
        const val RANKING = "ranking"
        const val SETTING = "setting"
        const val GAME_DETAIL = "gameDetail/{gameId}"
        const val GAME_PLAYER = "gamePlayer/{gameId}?path={path}"
    }



    // 底部导航栏项目
    val bottomNavItems = listOf(
        Custom.NavItem(
            route = Routes.HOME,
            title = "热门",
            icon = { Icons.Default.Home }
        ),
        Custom.NavItem(
            route = Routes.MY_GAME,
            title = "我的游戏",
            icon = { Icons.Default.Person }
        ),
        Custom.NavItem(
            route = Routes.RANKING,
            title = "排行榜",
            icon = { Icons.Default.Star }
        ),
        Custom.NavItem(
            route = Routes.SETTING,
            title = "设置",
            icon = { Icons.Default.Settings }
        )
    )

    /**
     * 判断是否应该显示底部导航栏
     */
    fun shouldShowBottomBar(route: String): Boolean {
        return bottomNavItems.any { it.route == route }
    }

    /**
     * 日志函数，用于调试
     */
    fun logRoutes() {
        Log.d(TAG, "所有导航路由:")
        Log.d(TAG, "HOME = ${Routes.HOME}")
        Log.d(TAG, "MY_GAME = ${Routes.MY_GAME}")
        Log.d(TAG, "RANKING = ${Routes.RANKING}")
        Log.d(TAG, "SETTING = ${Routes.SETTING}")
        Log.d(TAG, "底部导航项:")
        bottomNavItems.forEachIndexed { index, navItem ->
            Log.d(TAG, "项目 $index: ${navItem.route}, ${navItem.title}")
        }
    }
}

///**
// * 首页导航图
// */
//fun NavGraphBuilder.homeNavGraph(
//    navController: NavController,
//    onGameSelected: (GameConfigItem) -> Unit = {}
//) {
//    composable(route = NavGraphBuilders.Routes.HOME) {
//        HomeScreen(
//            onGameSelected = onGameSelected
//        )
//    }
//}
//
///**
// * 我的游戏导航图
// */
//fun NavGraphBuilder.myGameNavGraph(navController: NavController) {
//    composable(route = NavGraphBuilders.Routes.MY_GAME) {
//        // TODO: 实现我的游戏页面
//    }
//}
//
///**
// * 排行榜导航图
// */
//fun NavGraphBuilder.rankingNavGraph(navController: NavController) {
//    composable(route = NavGraphBuilders.Routes.RANKING) {
//        // TODO: 实现排行榜页面
//    }
//}
//
///**
// * 设置导航图
// */
//fun NavGraphBuilder.settingNavGraph(navController: NavController) {
//    composable(route = NavGraphBuilders.Routes.SETTING) {
//        // TODO: 实现设置页面
//    }
//}

/**
 * 游戏详情导航图
 */
fun NavGraphBuilder.gameDetailNavGraph(navController: NavController) {
    Log.d(TAG, "构建游戏详情导航图")

    composable(
        route = "gameDetail/{gameId}",
        arguments = listOf(
            navArgument("gameId") { type = NavType.StringType }
        ),
        enterTransition = {
            fadeIn(animationSpec = tween(300)) +
                    slideInHorizontally(
                        initialOffsetX = { fullWidth -> fullWidth },
                        animationSpec = tween(300)
                    )
        },
        exitTransition = {
            fadeOut(animationSpec = tween(300)) +
                    slideOutHorizontally(
                        targetOffsetX = { fullWidth -> fullWidth },
                        animationSpec = tween(300)
                    )
        },
        popEnterTransition = {
            fadeIn(animationSpec = tween(300)) +
                    slideInHorizontally(
                        initialOffsetX = { fullWidth -> -fullWidth },
                        animationSpec = tween(300)
                    )
        },
        popExitTransition = {
            fadeOut(animationSpec = tween(300)) +
                    slideOutHorizontally(
                        targetOffsetX = { fullWidth -> fullWidth },
                        animationSpec = tween(300)
                    )
        }
    ) { backStackEntry ->
        val gameId = backStackEntry.arguments?.getString("gameId")
        
        // 使用LaunchedEffect确保日志只打印一次
        LaunchedEffect(gameId) {
            Log.d(TAG, "导航到游戏详情，ID: $gameId")
        }
        
        // 捕获返回键事件
        val viewModel = hiltViewModel<GameDetailViewModel>()
        
        // 添加处理系统返回键的逻辑
        BackHandler(enabled = true) {
            Log.d(TAG, "捕获到系统返回键，触发返回流程")
            viewModel.onBackPressed()
        }
        
        GameDetailScreen(
            navController = navController,
            viewModel = viewModel
        )
    }
}

/**
 * 游戏播放器导航图
 */
fun NavGraphBuilder.gamePlayerNavGraph(navController: NavController) {
    Log.d(TAG, "构建游戏播放器导航图")

    composable(
        route = "gamePlayer/{gameId}?path={path}",
        arguments = listOf(
            navArgument("gameId") { type = NavType.StringType },
            navArgument("path") { 
                type = NavType.StringType 
                nullable = true
            }
        ),
        enterTransition = {
            fadeIn(animationSpec = tween(300)) +
                    slideInHorizontally(
                        initialOffsetX = { fullWidth -> fullWidth },
                        animationSpec = tween(300)
                    )
        },
        exitTransition = {
            fadeOut(animationSpec = tween(300)) +
                    slideOutHorizontally(
                        targetOffsetX = { fullWidth -> fullWidth },
                        animationSpec = tween(300)
                    )
        }
    ) { backStackEntry ->
        val gameId = backStackEntry.arguments?.getString("gameId") ?: ""
        val path = backStackEntry.arguments?.getString("path") ?: ""
        
        // URL解码路径参数
        val decodedPath = URLDecoder.decode(path, "UTF-8")
        
        Log.d(TAG, "导航到游戏播放页面: gameId=$gameId, path=$decodedPath")
        
        // 显示游戏播放界面
        GamePlayerScreen(localGamePath = decodedPath)
    }
}

private const val TAG = "NavGraphBuilders"