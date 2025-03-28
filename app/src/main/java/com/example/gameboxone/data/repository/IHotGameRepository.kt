package com.example.gameboxone.data.repository

import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem

interface IHotGameRepository {
    suspend fun getHotGames(): List<Custom.HotGameData>
    suspend fun updateGames(games: List<GameConfigItem>): Result<Boolean>
    suspend fun saveLocalConfig(config: String): Result<Boolean>
    suspend fun getLocalConfig(): Result<String>

    fun isIconLoaded(gameId: String): Boolean
    fun markIconLoaded(gameId: String)
}