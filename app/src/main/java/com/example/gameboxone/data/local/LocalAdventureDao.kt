package com.example.gameboxone.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.gameboxone.data.model.LocalAdventureProfileEntity
import com.example.gameboxone.data.model.LocalAdventureTaskDefinitionEntity
import com.example.gameboxone.data.model.LocalAdventureTaskProgressEntity

@Dao
interface LocalAdventureDao {
    @Query("SELECT * FROM local_adventure_profile WHERE profileId = 1 LIMIT 1")
    suspend fun getProfile(): LocalAdventureProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertProfile(profile: LocalAdventureProfileEntity)

    @Query("SELECT * FROM local_adventure_task_definition WHERE chapterId = :chapterId ORDER BY slotNo ASC")
    suspend fun getTaskDefinitionsByChapter(chapterId: String): List<LocalAdventureTaskDefinitionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertTaskDefinitions(items: List<LocalAdventureTaskDefinitionEntity>)

    @Query("SELECT * FROM local_adventure_task_progress WHERE chapterId = :chapterId ORDER BY taskId ASC")
    suspend fun getTaskProgressByChapter(chapterId: String): List<LocalAdventureTaskProgressEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertTaskProgress(items: List<LocalAdventureTaskProgressEntity>)

    @Query("SELECT COUNT(*) FROM local_adventure_task_definition")
    suspend fun getTaskDefinitionCount(): Int

    @Query("SELECT COUNT(*) FROM local_adventure_task_definition WHERE chapterId = :chapterId")
    suspend fun getTaskDefinitionCountByChapter(chapterId: String): Int

    @Query("SELECT * FROM local_adventure_task_progress WHERE taskId = :taskId LIMIT 1")
    suspend fun getProgressByTaskId(taskId: String): LocalAdventureTaskProgressEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSingleTaskProgress(progress: LocalAdventureTaskProgressEntity)

    @Query("SELECT COUNT(*) FROM local_adventure_task_progress WHERE chapterId = :chapterId AND status IN ('CLAIMED','COMPLETED')")
    suspend fun getCompletedCountByChapter(chapterId: String): Int

    @Query("SELECT * FROM local_adventure_task_definition WHERE taskId = :taskId LIMIT 1")
    suspend fun getTaskDefinitionById(taskId: String): LocalAdventureTaskDefinitionEntity?
}
