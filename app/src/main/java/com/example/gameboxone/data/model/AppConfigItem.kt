package com.example.gameboxone.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "app_config")
data class AppConfigItem(
    @PrimaryKey(autoGenerate = true) val id: Int = 0, // Primary key, auto-generated
    val name: String,
    val value: String
)