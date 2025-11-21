package com.example.gameboxone.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Ignore

/**
 * 游戏数据实体类
 * 用于数据库存储的游戏信息模型
 */
@Entity(tableName = "game_config")
data class GameConfigItem(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,                      // 游戏ID
    val gameId: String = "",              // 游戏业务ID
    val pubId: Int = 0,                   // 发布者ID
    val ret: Int = 0,                     // 状态码
    val name: String = "",                // 游戏名称
    val icon: String = "",                // 图标路径
    var rating: Int = 0,                  // 评分
    val gameRes: String = "",             // 游戏路径
    val info: String? = null,             // 游戏描述
    val diff: Int = 0,                    // 难度等级
    val download: String = "",            // 下载地址
    val downicon: String? = null,         // 下载图标地址
    val patch: Int = 0,                   // 补丁版本
    val timestamp: String? = null,        // 更新时间戳
    val isLocal: Boolean = false,         // 是否已下载到本地
    val localPath: String = "",        // 本地存储路径
    val size: String = "",             // 游戏大小
    val categories: List<String> = emptyList(), // 游戏分类
    val tags: List<String> = emptyList(),       // 游戏标签

    // Persist task points as JSON string so Room can store it
    val taskPointsJson: String? = null
) {
    // Task structure parsed from incoming JSON - ignored by Room but used by Gson
    @Ignore
    var task: Task? = null

    data class Task(
        val desc: String? = null,
        val points: List<Int>? = null
    )
}
