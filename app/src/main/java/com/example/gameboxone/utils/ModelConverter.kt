package com.example.gameboxone.utils

import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.model.MyGameItem

/**
 * 模型转换器
 * 负责处理不同数据模型之间的转换
 * 确保模型转换逻辑一致和集中
 */
object ModelConverter {
    /**
     * GameConfigItem 转 HotGameData
     */
    fun toHotGameData(item: GameConfigItem): Custom.HotGameData {
        // parse task points from persisted JSON or transient task
        val points = item.taskPointsJson?.let {
            try { com.google.gson.Gson().fromJson(it, Array<Int>::class.java).toList() } catch (e: Exception) { null }
        } ?: item.task?.points

        return Custom.HotGameData(
             id = item.id.toString(),
             gameId = item.gameId ?: item.id.toString(),
             name = item.name,
             iconUrl = item.icon,
             gameRes = item.gameRes ?: "",
             description = item.info ?: "暂无描述",
             downloadUrl = item.download ?: "",
             isLocal = item.isLocal,
             localPath = item.localPath ?: "",
             rating = item.rating,
             patch = item.patch
            ,
            taskDesc = item.task?.desc,
            taskPoints = points
         )
     }

    /**
     * MyGameItem 转 MyGameData
     */
    fun toMyGameData(item: GameConfigItem): Custom.MyGameData {
        val points = item.taskPointsJson?.let {
            try { com.google.gson.Gson().fromJson(it, Array<Int>::class.java).toList() } catch (e: Exception) { null }
        } ?: item.task?.points

        return Custom.MyGameData(
             id = item.gameId,
             gameId = item.gameId,
             name = item.name,
             iconUrl = item.icon,
             gameRes = item.gameRes,
             description = item.info?:"暂无描述",
             downloadUrl = item.download,
             isLocal = true,
             localPath = item.localPath,
             rating = 0,
             patch = item.patch,
             size = item.size,
             installTime = "",
             lastPlayTime = "",
             playCount = 0,
             hasUpdate = false
            ,
            taskDesc = item.task?.desc,
            taskPoints = points
         )
     }

    /**
     * GameConfigItem 转 MyGameItem
     */
    fun toMyGameItem(config: GameConfigItem, localPath: String): MyGameItem {
        return MyGameItem(
            gameId = config.id.toString(),
            name = config.name,
            icon = config.icon,
            gameRes = config.gameRes ?: "",
            description = config.info ?: "暂无描述",
            downloadUrl = config.download ?: "",
            localPath = localPath,
            patch = config.patch,
            size = config.size ?: "未知大小",
            installTime = System.currentTimeMillis()
        )
    }
    
    /**
     * HotGameData 转 MyGameItem
     */
    fun toMyGameItem(game: Custom.HotGameData, localPath: String): MyGameItem {
        return MyGameItem(
            gameId = game.id,
            name = game.name,
            icon = game.iconUrl,
            gameRes = game.gameRes ?: "",
            description = game.description ?: "暂无描述",
            downloadUrl = game.downloadUrl ?: "",
            localPath = localPath,
            patch = game.patch ?: 1,
            size = "本地安装",
            installTime = System.currentTimeMillis()
        )
    }
}
