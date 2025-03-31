package com.example.gameboxone.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.gameboxone.data.model.MyGameItem
import kotlinx.coroutines.flow.Flow

/**
 * 我的游戏数据库访问对象
 */
@Dao
interface MyGameDao {
    @Query("SELECT * FROM my_games ORDER BY installTime DESC")
    fun getAllGames(): Flow<List<MyGameItem>>
    
    @Query("SELECT * FROM my_games ORDER BY installTime DESC")
    suspend fun getAllGamesList(): List<MyGameItem>

    @Query("SELECT * FROM my_games WHERE gameId = :gameId LIMIT 1")
    suspend fun getGameById(gameId: String): MyGameItem?

    @Query("SELECT COUNT(*) FROM my_games")
    suspend fun getCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(game: MyGameItem)

    @Update
    suspend fun update(game: MyGameItem)

    @Delete
    suspend fun delete(game: MyGameItem)
    
    @Query("DELETE FROM my_games WHERE gameId = :gameId")
    suspend fun deleteById(gameId: String)
    
    @Query("UPDATE my_games SET lastPlayTime = :timestamp, playCount = playCount + 1 WHERE gameId = :gameId")
    suspend fun updatePlayInfo(gameId: String, timestamp: Long = System.currentTimeMillis())
}
