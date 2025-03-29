package com.example.gameboxone.data.model

import androidx.compose.ui.graphics.vector.ImageVector
import com.example.gameboxone.ui.navigation.NavGraphBuilders

sealed class Custom{

    object NavRoutes {
        const val HOT = "hot"
        const val RECOMMEND = "recommend"
        const val PROFILE = "profile"
    }

    /**
     * 导航项目定义
     * 用于底部导航栏显示
     */
    data class NavItem(
        val route: String,
        val title: String,
        val icon: () -> ImageVector
    )

    /**
     * 主界面UI状态
     */
    data class MainUiState(
        val currentRoute: String = NavGraphBuilders.Routes.HOME,
        val isBottomBarVisible: Boolean = true,
        val isLoading: Boolean = false,
        val error: String? = null
    )

    /**
     * 原始游戏数据
     */
    data class GameData(
        val id: String,
        val gameId: String? = null,           // 游戏业务ID
        val pubId: Int,                       // 发布者ID
        val ret: Int,                         // 状态码
        val name: String,                     // 游戏名称
        val icon: String,                     // 图标路径
        var rating: Int,                      // 评分
        val gameRes: String,                  // 游戏路径
        val info: String,                     // 游戏描述
        val diff: Int = 0,                    // 难度等级
        val download: String,                 // 下载地址
        val downicon: String,                 // 下载图标地址
        val patch: Int = 1,                   // 补丁版本
        val timestamp: String,                // 更新时间戳
        val isLocal: Boolean = false,         // 是否已下载到本地
        val localPath: String? = null,        // 本地存储路径
    )

    data class baseGameData(
        val id: String,
        val name: String,
        val iconUrl: String
    )

    /**
     * 热门游戏数据
     */
    data class HotGameData(
        val id: String,
        val gameId: String?,
        val name: String,
        val iconUrl: String,
        val gameRes: String,
        val rating: Int = 0,
        val patch: Int = 1,
        var description: String,
        var downloadUrl: String,
        var isLocal: Boolean,
        var localPath: String
    )

    companion object {
        fun ToBaseData(id: String,name: String,iconUrl: String): baseGameData {
            return baseGameData(id, name, iconUrl)
        }
    }
    /**
     * 下载信息数据类
     * 用于保存游戏下载相关的信息
     */
    data class DownloadInfo(
        val gameName: String,        // 游戏名称
        val downloadUrl: String,     // 下载地址
        val targetPath: String       // 目标保存路径
    )

    object FakeData {
            val gameList = listOf(
                HotGameData(
                    id = "1",
                    gameId = "",
                    name = "测试游戏1",
                    gameRes="",
                    description = "这是测试游戏1的描述。",
                    iconUrl = "R.drawable.ic_game_default",
                    downloadUrl = "https://example.com/games/test1.zip",
                    isLocal = false,
                    localPath = ""
                ),
                HotGameData(
                    id = "2",
                    name = "测试游戏2",
                    gameId = "",
                    gameRes="",
                    description = "这是测试游戏2的精彩描述。",
                    iconUrl = "R.drawable.ic_game_default",
                    downloadUrl = "https://example.com/games/test2.zip",
                    isLocal = false,
                    localPath = "null"
                ),
                HotGameData(
                    id = "3",
                    name = "测试游戏3",
                    gameId = "",
                    gameRes="",
                    description = "这是测试游戏3的特色描述。",
                    iconUrl = "R.drawable.ic_game_default",
                    downloadUrl = "https://example.com/games/test3.zip",
                    isLocal = false,
                    localPath = "null"
                )
            )
            val playerList = listOf(
                Player("Player A", 1500),
                Player("Player B", 1200),
                Player("Player C", 1800),
                Player("Player D", 900),
                Player("Player E", 2000),
                Player("Player F", 1100),
                Player("Player G", 1600),
                Player("Player H", 1300),
                Player("Player I", 1900),
                Player("Player J", 1000)
            )

    }

    // 排行榜数据
    data class Player(
        val name: String,
        val score: Int
    )



}
