package com.example.gameboxone.base

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.gameboxone.data.local.Converters
import com.example.gameboxone.data.local.AppConfigDao
import com.example.gameboxone.data.local.GameConfigDao
import com.example.gameboxone.data.model.AppConfigItem
import com.example.gameboxone.data.model.GameConfigItem

@Database(entities = [AppConfigItem::class, GameConfigItem::class], version = 3)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun gameConfigDao(): GameConfigDao
    abstract fun appConfigDao(): AppConfigDao
}