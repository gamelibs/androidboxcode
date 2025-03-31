package com.example.gameboxone.navigation

/**
 * 导航事件
 */
sealed class NavigationEvent {
    /**
     * 导航到指定路由
     */
    data class Navigate(val route: String) : NavigationEvent()

    /**
     * 导航到游戏详情页
     */
    data class NavigateToGameDetail(val gameId: String) : NavigationEvent()

    /**
     * 返回上一页
     */
    object PopBackStack : NavigationEvent()

    /**
     * 导航向上
     */
    object NavigateUp : NavigationEvent()

    /**
     * 导航到游戏播放器
     */
//    data class NavigateToGamePlayer(
//        val gameId: String?,
//        val localPath: String
//    ) : NavigationEvent()
}