package com.example.gameboxone.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.gameboxone.data.model.AppConfigItem

@Dao
interface AppConfigDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertConfig(configItem: AppConfigItem)

    @Query("SELECT * FROM app_config")
    suspend fun getAllConfigs(): List<AppConfigItem>

    /**
     * 删除所有游戏
     */
    @Query("DELETE FROM app_config")
    suspend fun deleteAll()
}