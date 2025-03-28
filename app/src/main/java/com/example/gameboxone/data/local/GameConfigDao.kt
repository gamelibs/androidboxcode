package com.example.gameboxone.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.gameboxone.data.model.GameConfigItem

/**
 * 游戏数据访问对象
 * 负责游戏数据的数据库操作
 */
@Dao
interface GameConfigDao {
    /**
     * 获取所有游戏
     * @return 游戏列表
     */
    @Query("SELECT * FROM game_config")
    suspend fun getAll(): List<GameConfigItem>

    /**
     * 批量插入或更新游戏
     * 如果已存在相同id的游戏，则替换
     * @param games 要插入的游戏列表
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(games: List<GameConfigItem>)

    /**
     * 插入或更新单个游戏
     * @param gameItem 要插入的游戏
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGame(gameItem: GameConfigItem)

    /**
     * 根据游戏ID查询游戏
     * @param gameId 游戏ID
     * @return 游戏数据，如果不存在返回null
     */
    @Query("SELECT * FROM game_config WHERE gameId = :gameId")
    suspend fun getGameById(gameId: String): GameConfigItem?

    /**
     * 根据ID查询游戏
     * @param id 数据库ID
     * @return 游戏数据，如果不存在返回null
     */
    @Query("SELECT * FROM game_config WHERE id = :id")
    suspend fun getById(id: Int): GameConfigItem?

    /**
     * 根据游戏ID获取游戏配置
     * @param id 游戏ID
     * @return 游戏配置项，未找到则返回null
     */
    @Query("SELECT * FROM game_config WHERE id = :id")
    suspend fun getGameById(id: Int): GameConfigItem?

    /**
     * 更新游戏信息
     * @param game 要更新的游戏数据
     */
    @Update
    suspend fun update(game: GameConfigItem)

    /**
     * 删除指定游戏
     * @param game 要删除的游戏
     */
    @Delete
    suspend fun delete(game: GameConfigItem)

    /**
     * 删除所有游戏
     */
    @Query("DELETE FROM game_config")
    suspend fun deleteAll()

    /**
     * 获取游戏总数
     * @return 游戏数量
     */
    @Query("SELECT COUNT(*) FROM game_config")
    suspend fun getCount(): Int

    /**
     * 根据名称搜索游戏
     * @param name 游戏名称（模糊匹配）
     * @return 匹配的游戏列表
     */
    @Query("SELECT * FROM game_config WHERE name LIKE '%' || :name || '%'")
    suspend fun searchByName(name: String): List<GameConfigItem>
}