package com.example.gameboxone.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * 我的游戏数据库实体类
 * 用于存储已安装的游戏信息
 */
@Entity(tableName = "my_games")
data class MyGameItem(
    @PrimaryKey
    val gameId: String,          // 游戏ID，作为主键
    val name: String,            // 游戏名称
    val icon: String,            // 游戏图标URL
    val gameRes: String,         // 游戏资源路径
    val description: String,     // 游戏描述
    val downloadUrl: String,     // 下载URL
    val localPath: String,       // 本地路径
    val patch: Int = 1,          // 补丁版本
    val size: String = "未知",    // 游戏大小
    val installTime: Long = System.currentTimeMillis(), // 安装时间
    val lastPlayTime: Long? = null, // 最后游玩时间
    val playCount: Int = 0       // 游玩次数

)
