package com.example.gameboxone.di

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

/**
 * Database migrations for the Room database
 */
object DatabaseMigrations {
    /**
     * Migration from version 3 to version 4
     * Update this to match your schema changes
     */
    val MIGRATION_3_4 = object : Migration(3, 4) {
        override fun migrate(database: SupportSQLiteDatabase) {
            // Implement your database schema changes here
            // For example, if you added a new column:
            // database.execSQL("ALTER TABLE game_config ADD COLUMN categories TEXT NOT NULL DEFAULT ''")
            // database.execSQL("ALTER TABLE game_config ADD COLUMN tags TEXT NOT NULL DEFAULT ''")
        }
    }
}
