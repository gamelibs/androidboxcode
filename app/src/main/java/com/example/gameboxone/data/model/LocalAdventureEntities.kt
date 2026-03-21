package com.example.gameboxone.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "local_adventure_profile")
data class LocalAdventureProfileEntity(
    @PrimaryKey
    val profileId: Int = 1,
    val localPlayerId: String,
    val localPlayerName: String,
    val currentLevel: Int,
    val currentChapterId: String,
    val totalExp: Long,
    val totalCoins: Long,
    val updatedAt: Long
)

@Entity(tableName = "local_adventure_task_definition")
data class LocalAdventureTaskDefinitionEntity(
    @PrimaryKey
    val taskId: String,
    val chapterId: String,
    val level: Int,
    val slotNo: Int,
    val gameId: String,
    val taskType: String,
    val targetValue: Int,
    val taskTitle: String,
    val taskDescription: String,
    val rewardExp: Int,
    val rewardCoins: Int,
    val isRequiredForUpgrade: Boolean
)

@Entity(tableName = "local_adventure_task_progress")
data class LocalAdventureTaskProgressEntity(
    @PrimaryKey
    val taskId: String,
    val chapterId: String,
    val gameId: String,
    val status: String,
    val currentScore: Int,
    val currentStage: Int,
    val clearCount: Int,
    val startCount: Int = 0,
    val totalPlaySeconds: Int = 0,
    val exitCount: Int = 0,
    val achievedAt: Long?,
    val claimedAt: Long?,
    val updatedAt: Long
)

