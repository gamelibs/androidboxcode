package com.example.gameboxone.ui.screen

import com.example.gameboxone.AppLog as Log
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.gameboxone.data.viewmodel.MainViewModel
import com.example.gameboxone.navigation.AppNavigator
import com.example.gameboxone.ui.component.MessageDisplay
import com.example.gameboxone.ui.navigation.NavGraphBuilders
import com.example.gameboxone.ui.navigation.gameDetailNavGraph
import com.example.gameboxone.ui.navigation.gamePlayerNavGraph

private const val TAG = "MainScreen"

/**
 * 主界面
 * 提供应用骨架和全局导航
 */
@Composable
fun MainScreen(
    viewModel: MainViewModel = hiltViewModel()
) {
    Log.d(TAG, "MainScreen 初始化")

    // 状态收集
    val uiState by viewModel.uiState.collectAsState()
    val messages by viewModel.messages.collectAsState()
    val navController = rememberNavController()
    
    // 创建导航控制器
    val appNavigator = remember { AppNavigator(navController) }

    // 统一收集所有导航事件
    LaunchedEffect(appNavigator) {
        Log.d(TAG, "设置导航事件监听器")
        appNavigator.handleNavigationEvents(viewModel.navigationEvents)
    }

    // 监听导航目的地更改
    DisposableEffect(navController) {
        val listener = NavController.OnDestinationChangedListener { _, destination, arguments ->
            Log.d(TAG, "导航到: ${destination.route}, 参数: $arguments")
            // 更新当前路由，用于底部导航栏高亮显示
            destination.route?.let { route ->
                // 提取基本路由（不含参数）
                val baseRoute = route.split("/")[0]
                viewModel.updateCurrentRoute(baseRoute)
            }
        }
        navController.addOnDestinationChangedListener(listener)
        onDispose {
            navController.removeOnDestinationChangedListener(listener)
        }
    }

    // 主界面脚手架
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        contentColor = MaterialTheme.colorScheme.onBackground,
        // 底部导航栏
        bottomBar = {
            if (uiState.isBottomBarVisible) {
                NavigationBar {
                    val currentRoute = remember(uiState.currentRoute) {
                        uiState.currentRoute
                    }

                    NavGraphBuilders.bottomNavItems.forEach { screen ->
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    imageVector = screen.icon(),
                                    contentDescription = screen.title
                                )
                            },
                            label = { Text(screen.title) },
                            selected = currentRoute == screen.route,
                            onClick = { viewModel.navigateTo(screen.route) }
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // 全局导航容器
            NavHost(
                navController = navController,
                startDestination = NavGraphBuilders.Routes.HOME,
                modifier = Modifier.fillMaxSize()
            ) {
                // 添加动画的首页导航
                composable(
                    route = NavGraphBuilders.Routes.HOME,
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
                                    targetOffsetX = { fullWidth -> -fullWidth },
                                    animationSpec = tween(300)
                                )
                    }
                ) {
                    HomeScreen(
                        onGameSelected = { game ->
                            viewModel.navigateToGameDetail(game.id.toString())
                        }
                    )
//                    DefaultScreenContent("热门游戏", "该功能即将上线")
                }
                
                // 我的游戏（带动画）
                composable(
                    route = NavGraphBuilders.Routes.MY_GAME,
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
                                    targetOffsetX = { fullWidth -> -fullWidth },
                                    animationSpec = tween(300)
                                )
                    }
                ) {
                    MyGameScreen()
                    //DefaultScreenContent("我的游戏", "该功能即将上线")
                }
                
                // 排行榜（带动画）
                composable(
                    route = NavGraphBuilders.Routes.RANKING,
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
                                    targetOffsetX = { fullWidth -> -fullWidth },
                                    animationSpec = tween(300)
                                )
                    }
                ) {
                    RankingScreen(
                        onGameSelected = { game ->
                            viewModel.navigateToGameDetail(game.id)
                        }
                    )
                }
                
                // 设置（带动画）
                composable(
                    route = NavGraphBuilders.Routes.SETTING,
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
                                    targetOffsetX = { fullWidth -> -fullWidth },
                                    animationSpec = tween(300)
                                )
                    }
                ) {
                    SettingScreen()
                }
                
                // 游戏详情页带动画
                gameDetailNavGraph()
                
                // 游戏玩家页带动画
                gamePlayerNavGraph()
            }

            // 全局加载指示器
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .zIndex(2f)
                )
            }

            // 全局消息显示 - 使用原有的消息系统
            MessageDisplay(
                messages = messages,
                onDismiss = { message ->
                    viewModel.dismissMessage(message.id)
                }
            )
        }
    }
}

/**
 * 默认屏幕内容
 */
@Composable
fun DefaultScreenContent(title: String, message: String) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        androidx.compose.foundation.layout.Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
            
            Text(
                text = message,
                style = MaterialTheme.typography.bodyLarge,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.padding(top = 16.dp, start = 32.dp, end = 32.dp)
            )
        }
    }
}
