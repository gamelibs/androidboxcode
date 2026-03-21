package com.example.gameboxone.base

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.gameboxone.data.local.Converters
import com.example.gameboxone.data.local.AppConfigDao
import com.example.gameboxone.data.local.GameConfigDao
import com.example.gameboxone.data.local.LocalAdventureDao
import com.example.gameboxone.data.local.MyGameDao
import com.example.gameboxone.data.model.AppConfigItem
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.model.LocalAdventureProfileEntity
import com.example.gameboxone.data.model.LocalAdventureTaskDefinitionEntity
import com.example.gameboxone.data.model.LocalAdventureTaskProgressEntity
import com.example.gameboxone.data.model.MyGameItem

@Database(
    entities = [
        AppConfigItem::class,
        GameConfigItem::class,
        MyGameItem::class,
        LocalAdventureProfileEntity::class,
        LocalAdventureTaskDefinitionEntity::class,
        LocalAdventureTaskProgressEntity::class
    ],
    version = 7
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun gameConfigDao(): GameConfigDao
    abstract fun appConfigDao(): AppConfigDao
    abstract fun myGameDao(): MyGameDao
    abstract fun localAdventureDao(): LocalAdventureDao
}