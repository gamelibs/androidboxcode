package com.example.gameboxone.di

import android.content.Context
import androidx.room.Room
import com.example.gameboxone.manager.EventManager
import com.example.gameboxone.manager.WebServerManager
import com.example.gameboxone.base.AppDatabase
import com.example.gameboxone.service.MessageService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * 主应用模块，提供全局单例依赖
 */
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    /**
     * 提供 AppDatabase 实例
     * 使用 @Singleton 确保整个应用只有一个数据库实例
     */
    @Singleton
    @Provides
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java, 
            "gameboxone-db"
        ).fallbackToDestructiveMigration() // 仅开发阶段使用
     .build()
    }
    
    /**
     * 提供全局消息服务实例
     */
    @Singleton
    @Provides
    fun provideMessageService(): MessageService {
        return MessageService()
    }
    
    /**
     * 提供事件管理器实例
     */
    @Singleton
    @Provides
    fun provideEventManager(): EventManager {
        return EventManager()
    }
    
    /**
     * 提供WebServer管理器实例
     * 使用动态端口分配避免冲突
     */
    @Singleton
    @Provides
    fun provideWebServerManager(@ApplicationContext context: Context): WebServerManager {
        return WebServerManager(context)
    }
    
    // 如果需要提供DAO，可以在这里添加
    // @Provides
    // fun provideGameDao(database: AppDatabase): GameDao {
    //     return database.gameDao()
    // }
    
    // 可以在这里提供其他全局单例依赖
}
