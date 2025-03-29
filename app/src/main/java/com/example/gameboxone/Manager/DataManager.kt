package com.example.gameboxone.manager

import android.content.Context
import android.database.sqlite.SQLiteConstraintException
import android.util.Log
import com.example.gameboxone.base.AppDatabase
import com.example.gameboxone.base.UiMessage
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.service.MessageService
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 数据管理器
 * 负责确保应用基础数据的存在性，不处理具体业务逻辑
 */
@Singleton
class DataManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val database: AppDatabase,
    private val netManager: NetManager,
    private val messageService: MessageService,
    private val eventManager: EventManager // 添加 EventManager 依赖
) {
    private val TAG = "DataManager"

    // 请求超时设置 (5秒)
    private val NETWORK_TIMEOUT = 5000L

    // 配置文件目录
    private val configDir by lazy {
        File(context.filesDir, "config").apply {
            if (!exists()) mkdirs()
        }
    }

    // 数据事件流 - 重定向到 EventManager 的事件流
    val dataEvents: SharedFlow<DataEvent> = eventManager.dataEvents

    // 中央数据缓存
    private var _gameConfigCache: List<GameConfigItem>? = null

    // 缓存访问器，确保线程安全
    private val cacheLock = Mutex()

    // 缓存时间戳
    private var lastCacheTime: Long = 0
    private val CACHE_VALID_TIME = 5 * 60 * 1000 // 5分钟

    /**
     * 预加载应用启动需要的核心数据
     * 在应用启动时调用，预热数据缓存
     */
    suspend fun preloadAppData() {
        try {
            Log.d(TAG, "开始预加载数据...")
            
            // 检查数据库和缓存状态
            val gameCount = getGameCount()
            if (gameCount == 0) {
                Log.d(TAG, "数据库为空，强制从网络获取数据")
                // 强制从网络加载，立即清空和重建数据库
//                refreshAllData(true)
                initializeData()
                return
            }

            // 预加载游戏配置数据
            val games = getGameConfigItems(forceRefresh = false)
            Log.d(TAG, "预加载完成，共 ${games.size} 条")

            // 发送初始化完成事件
            eventManager.emitDataEvent(DataEvent.Initialized)
        } catch (e: Exception) {
            Log.e(TAG, "预加载数据失败", e)
            messageService.showMessage(
                UiMessage.Error(
                    message = "预加载数据失败: ${e.message}"
                )
            )
            
            // 尝试恢复
            tryLoadFallbackData()
        }
    }

    /**
     * 尝试加载保底数据
     * 当所有其他方法都失败时调用
     */
    private suspend fun tryLoadFallbackData() {
        try {
            Log.d(TAG, "尝试加载保底数据...")
            loadFallbackDataToDatabase()

            // 检查是否成功加载了保底数据
            val count = getGameCount()
            if (count > 0) {
                Log.d(TAG, "成功加载保底数据，共 $count 条")
                cacheLock.withLock {
                    _gameConfigCache = database.gameConfigDao().getAll()
                    lastCacheTime = System.currentTimeMillis()
                }
                eventManager.emitDataEvent(DataEvent.Initialized)
            } else {
                Log.w(TAG, "无法加载任何数据")
                eventManager.emitDataEvent(DataEvent.Error("无法加载任何数据，请检查网络连接后重试"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "加载保底数据失败", e)
            eventManager.emitDataEvent(DataEvent.Error("无法加载任何数据: ${e.message}"))
        }
    }

    /**
     * 初始化基础数据
     * 检查数据库中是否有数据，如果没有则先尝试网络获取，然后加载保底数据
     */
    private suspend fun initializeData() {
        try {
            Log.d(TAG, "开始初始化基础数据")

            // 检查数据库中是否有游戏数据
            val hasData = database.gameConfigDao().getCount() > 0

            if (!hasData) {
                Log.d(TAG, "数据库为空，开始获取游戏数据")
                var dataLoaded = false
                
                // 1. 首先尝试从网络获取
                if (netManager.isNetworkAvailable) {
                    try {
                        Log.d(TAG, "尝试从网络获取初始游戏数据")
                        val result = netManager.getGameList()
                        result.fold(
                            onSuccess = { configItems ->
                                Log.d(TAG, "从网络获取初始游戏数据成功：${configItems.size} 个游戏")

                                // 处理数据转换，确保字段匹配和非空约束
                                val processedItems = configItems.map { item ->
                                    // 创建GameConfigItem对象，确保字段映射正确
                                    GameConfigItem(
                                        id = item.id,
                                        // 确保驼峰命名字段映射正确
                                        gameId = item.gameId,  // JSON中的gameid映射到gameId
                                        pubId = item.pubId,          // JSON中的pubid映射到pubId
                                        ret = item.ret,
                                        name = item.name,
                                        icon = item.icon,
                                        rating = item.rating,
                                        gameRes = item.gameRes,
                                        info = item.info,            // 允许为null
                                        diff = item.diff,
                                        download = item.download,
                                        downicon = item.downicon,    // 允许为null
                                        patch = item.patch,
                                        timestamp = item.timestamp,  // 允许为null
                                        size = item.size,            // 允许为null

                                        // 关键部分：确保集合字段不为null
                                        categories = item.categories,
                                        tags = item.tags,

                                        // 其他字段使用默认值
                                        isLocal = false,
                                        localPath = ""
                                    )
                                }

                                try {
                                    // 使用处理后的数据保存到数据库
                                    database.gameConfigDao().insertAll(processedItems)

                                    // 更新缓存状态...
                                    dataLoaded = true
                                    Log.d(TAG, "游戏数据已成功保存到数据库，共 ${processedItems.size} 条")
                                } catch (e: Exception) {
                                    Log.e(TAG, "保存刷新数据失败", e)
                                    // 记录更详细的错误信息
                                    Log.e(TAG, "错误详情：${e.message}")
                                    e.printStackTrace()
                                    eventManager.emitDataEvent(DataEvent.Error("保存数据失败: ${e.message}"))
                                }
                            },
                            onFailure = { error ->
                                Log.e(TAG, "从网络获取初始游戏数据失败：${error.message}")
                                // 网络失败，继续尝试加载保底数据
                            }
                        )
                    } catch (e: Exception) {
                        Log.e(TAG, "网络获取游戏数据时出现异常", e)
                        // 出现异常，继续尝试加载保底数据
                    }
                } else {
                    Log.d(TAG, "网络不可用，将尝试加载保底数据")
                }
                
                // 2. 如果网络获取失败，尝试加载保底数据
                if (!dataLoaded) {
                    loadFallbackDataToDatabase()
                    
                    // 更新缓存状态，使用加载的保底数据
                    cacheLock.withLock {
                        _gameConfigCache = database.gameConfigDao().getAll()
                        lastCacheTime = System.currentTimeMillis()
                    }
                }
                
                // 3. 初始化完成后，检查是否有数据加载成功
                val gameCount = database.gameConfigDao().getCount()
                if (gameCount == 0) {
                    Log.w(TAG, "初始化后数据库仍为空，没有可用的游戏数据")
                    eventManager.emitDataEvent(DataEvent.Error("无法加载游戏数据：请检查网络连接并重试"))
                }
            } else {
                Log.d(TAG, "数据库已有数据，跳过数据加载")
                
                // 更新缓存，使用数据库中的数据
                cacheLock.withLock {
                    if (_gameConfigCache == null) {
                        _gameConfigCache = database.gameConfigDao().getAll()
                        lastCacheTime = System.currentTimeMillis()
                    }
                }
            }

            // 使用 EventManager 发送事件
            eventManager.emitDataEvent(DataEvent.Initialized)

        } catch (e: Exception) {
            Log.e(TAG, "初始化数据失败", e)
            eventManager.emitDataEvent(DataEvent.Error("初始化数据失败: ${e.message}"))
        }
    }

    /**
     * 刷新所有数据
     * 从网络获取最新数据并更新到数据库
     * @param isInitialLoad 是否为初始加载
     */
    suspend fun refreshAllData(isInitialLoad: Boolean = false) {
        if (!netManager.isNetworkAvailable) {
            eventManager.emitDataEvent(DataEvent.Error("网络不可用，无法刷新数据"))
            if (isInitialLoad) {
                tryLoadFallbackData()
            }
            return
        }

        try {
            Log.d(TAG, "开始刷新所有数据，初始加载：$isInitialLoad")

            // 发送刷新开始事件
            eventManager.emitDataEvent(DataEvent.RefreshStarted)

            // 清空数据库中的游戏配置记录
            database.gameConfigDao().deleteAll()
            
            // 清空内存缓存
            invalidateCache()
            
            Log.d(TAG, "已清空现有数据，准备获取最新数据")

            // 添加超时处理的网络请求
            val networkResult = withTimeoutOrNull(NETWORK_TIMEOUT) {
                netManager.getGameList()
            }

            if (networkResult == null) {
                // 网络请求超时
                Log.e(TAG, "网络请求超时，无法获取最新数据")
                eventManager.emitDataEvent(DataEvent.Error("网络请求超时，无法获取最新数据"))
                
                // 如果是初次加载，尝试加载保底数据
                if (isInitialLoad) {
                    tryLoadFallbackData()
                } else {
                    // 尝试从数据库恢复数据
                    val databaseItems = database.gameConfigDao().getAll()
                    if (databaseItems.isNotEmpty()) {
                        cacheLock.withLock {
                            _gameConfigCache = databaseItems
                            lastCacheTime = System.currentTimeMillis()
                        }
                        Log.d(TAG, "已从数据库恢复 ${databaseItems.size} 条数据")
                    } else {
                        tryLoadFallbackData()
                    }
                }
                return
            }

            // 处理网络请求结果
            networkResult.fold(
                onSuccess = { configItems ->
                    try {
                        // 处理可能的空值，避免空指针异常
                        val validConfigItems = configItems.map { item ->
                            item.copy(
                                gameId = item.gameId,
                                name = item.name,
                                icon = item.icon,
                                gameRes = item.gameRes,
                                download = item.download
                            )
                        }
                        
                        if (validConfigItems.isEmpty()) {
                            Log.w(TAG, "网络返回数据为空")
                            eventManager.emitDataEvent(DataEvent.Error("网络返回数据为空"))
                            
                            if (isInitialLoad) {
                                tryLoadFallbackData()
                            }
                            return@fold
                        }
                        
                        // 直接保存到数据库
                        database.gameConfigDao().insertAll(validConfigItems)
                        
                        // 更新缓存
                        cacheLock.withLock {
                            _gameConfigCache = validConfigItems
                            lastCacheTime = System.currentTimeMillis()
                        }
                        
                        Log.d(TAG, "刷新数据成功，更新了 ${validConfigItems.size} 条记录")
                        eventManager.emitDataEvent(DataEvent.RefreshCompleted)
                    } catch (e: Exception) {
                        Log.e(TAG, "保存刷新数据失败", e)
                        eventManager.emitDataEvent(DataEvent.Error("保存数据失败: ${e.message}"))
                        
                        if (isInitialLoad) {
                            tryLoadFallbackData()
                        }
                    }
                },
                onFailure = { error ->
                    Log.e(TAG, "刷新数据失败", error)
                    eventManager.emitDataEvent(DataEvent.Error("刷新数据失败: ${error.message}"))
                    
                    if (isInitialLoad) {
                        tryLoadFallbackData() 
                    } else {
                        // 尝试恢复缓存
                        getGameConfigItems(false)
                    }
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "刷新数据失败", e)
            eventManager.emitDataEvent(DataEvent.Error("刷新数据失败: ${e.message}"))
            
            if (isInitialLoad) {
                tryLoadFallbackData()
            } else {
                // 尝试恢复缓存
                getGameConfigItems(false)
            }
        }
    }

    /**
     * 从assets加载保底数据到数据库
     * 如果保底文件不存在，直接通知用户无法获取数据
     */
    private suspend fun loadFallbackDataToDatabase() = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "尝试从assets加载保底数据")
            
            // 尝试读取保底数据文件
            val jsonString = try {
                context.assets.open("gameconfig.json")
                    .bufferedReader()
                    .use { it.readText() }
            } catch (e: java.io.FileNotFoundException) {
                Log.e(TAG, "保底配置文件不存在，无法加载数据", e)
                eventManager.emitDataEvent(DataEvent.Error("无法加载游戏数据：保底配置文件不存在"))
                return@withContext
            }

            // 解析数据
            val gson = Gson()
            val type = object : TypeToken<List<GameConfigItem>>() {}.type
            val configItems: List<GameConfigItem> = gson.fromJson(jsonString, type)

            if (configItems.isEmpty()) {
                Log.w(TAG, "解析的保底数据为空")
                eventManager.emitDataEvent(DataEvent.Error("保底数据为空"))
                return@withContext
            }
            
            // 清空旧数据
            database.gameConfigDao().deleteAll()
            
            // 直接使用数据库DAO保存数据
            database.gameConfigDao().insertAll(configItems)
            Log.d(TAG, "保底数据加载成功: ${configItems.size} 个游戏")
        } catch (e: Exception) {
            Log.e(TAG, "加载保底数据失败", e)
            eventManager.emitDataEvent(DataEvent.Error("无法加载游戏数据：${e.message}"))
        }
    }

    /**
     * 获取游戏配置数据缓存
     * @param forceRefresh 是否强制刷新缓存
     */
    suspend fun getGameConfigItems(forceRefresh: Boolean = false): List<GameConfigItem> {
        cacheLock.withLock {
            // 如果强制刷新或缓存过期或缓存为空
            if (forceRefresh || isCacheExpired() || _gameConfigCache == null) {
                try {
                    Log.d(TAG, "缓存过期或为空，开始获取游戏数据")
                    
                    // 1. 首先尝试从数据库加载
                    val dbItems = database.gameConfigDao().getAll()
                    
                    // 如果数据库有数据且不强制刷新，则使用数据库数据
                    if (dbItems.isNotEmpty() && !forceRefresh) {
                        Log.d(TAG, "从数据库加载游戏配置数据成功: ${dbItems.size} 个游戏")
                        _gameConfigCache = dbItems
                        lastCacheTime = System.currentTimeMillis()
                        return _gameConfigCache?.toList() ?: emptyList()
                    }
                    
                    // 2. 数据库为空或需强制刷新，尝试从网络获取
                    if (netManager.isNetworkAvailable) {
                        Log.d(TAG, "尝试从网络获取游戏配置数据")
                        try {
                            // 添加超时处理
                            val networkResult = withTimeoutOrNull(NETWORK_TIMEOUT) {
                                fetchGameConfigFromNetwork()
                            }
                            
                            if (networkResult != null && networkResult.isNotEmpty()) {
                                Log.d(TAG, "从网络获取游戏配置数据成功: ${networkResult.size} 个游戏")
                                _gameConfigCache = networkResult
                                lastCacheTime = System.currentTimeMillis()
                                return _gameConfigCache?.toList() ?: emptyList()
                            } else {
                                Log.e(TAG, "网络请求超时或返回空数据")
                                
                                // 如果数据库为空，尝试加载保底数据
                                if (dbItems.isEmpty()) {
                                    loadFallbackDataToDatabase()
                                    _gameConfigCache = database.gameConfigDao().getAll()
                                    lastCacheTime = System.currentTimeMillis()
                                    
                                    // 检查保底数据是否加载成功
                                    if (_gameConfigCache.isNullOrEmpty()) {
                                        Log.w(TAG, "无法加载任何数据")
                                        eventManager.emitDataEvent(DataEvent.Error("无法加载任何数据，请检查网络连接后重试"))
                                        return emptyList()
                                    }
                                }
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "从网络获取游戏配置数据失败", e)
                            
                            // 如果数据库为空，尝试加载保底数据
                            if (dbItems.isEmpty()) {
                                loadFallbackDataToDatabase()
                                _gameConfigCache = database.gameConfigDao().getAll()
                                lastCacheTime = System.currentTimeMillis()
                            } else {
                                // 使用数据库现有数据
                                _gameConfigCache = dbItems
                                lastCacheTime = System.currentTimeMillis()
                            }
                        }
                    } else {
                        Log.d(TAG, "网络不可用，加载保底数据")
                        
                        // 如果数据库为空，尝试加载保底数据
                        if (dbItems.isEmpty()) {
                            loadFallbackDataToDatabase()
                            _gameConfigCache = database.gameConfigDao().getAll()
                            lastCacheTime = System.currentTimeMillis()
                        } else {
                            // 使用数据库现有数据
                            _gameConfigCache = dbItems
                            lastCacheTime = System.currentTimeMillis()
                        }
                    }
                    
                    Log.d(TAG, "最终获取到游戏配置数据: ${_gameConfigCache?.size ?: 0} 个游戏")
                    
                } catch (e: Exception) {
                    Log.e(TAG, "加载游戏配置数据失败", e)
                    // 如果加载失败但有旧缓存，继续使用旧缓存
                    if (_gameConfigCache == null) {
                        // 尝试加载保底数据
                        loadFallbackDataToDatabase()
                        _gameConfigCache = database.gameConfigDao().getAll()
                        lastCacheTime = System.currentTimeMillis()
                        
                        if (_gameConfigCache.isNullOrEmpty()) {
                            eventManager.emitDataEvent(DataEvent.Error("无法加载任何数据：${e.message}"))
                            return emptyList()
                        }
                    }
                }
            } else {
                Log.d(TAG, "使用缓存的游戏配置数据: ${_gameConfigCache?.size ?: 0} 个游戏")
            }

            // 返回缓存的副本，避免外部修改缓存
            return _gameConfigCache?.toList() ?: emptyList()
        }
    }

    /**
     * 从网络获取游戏配置数据
     * 获取并解析远程配置，然后保存到数据库
     */
    private suspend fun fetchGameConfigFromNetwork(): List<GameConfigItem> = withContext(Dispatchers.IO) {
        try {
            // 使用NetworkManager获取游戏列表
            Log.d(TAG, "开始从网络获取游戏配置数据")
            
            val result = netManager.getGameList()
            result.fold(
                onSuccess = { configItems ->
                    // 验证数据有效性
                    if (configItems.isEmpty()) {
                        Log.e(TAG, "网络返回数据为空")
                        return@withContext emptyList<GameConfigItem>()
                    }
                    
                    // 处理可能的空值
                    val validConfigItems = configItems.map { item ->
                        item.copy(
                            gameId = item.gameId,
                            name = item.name,
                            icon = item.icon,
                            gameRes = item.gameRes,
                            download = item.download
                        )
                    }
                    
                    // 直接保存到数据库
                    database.gameConfigDao().insertAll(validConfigItems)
                    Log.d(TAG, "网络数据已保存到数据库: ${validConfigItems.size} 个游戏")
                    
                    // 从数据库重新获取，确保获取最新的完整数据
                    val refreshedItems = database.gameConfigDao().getAll()
                    return@withContext refreshedItems
                },
                onFailure = { error ->
                    Log.e(TAG, "从网络获取游戏配置数据失败: ${error.message}")
                    throw error
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "从网络获取游戏配置数据异常", e)
            throw e
        }
    }


    /**
     * 检查缓存是否过期
     */
    private fun isCacheExpired(): Boolean {
        return System.currentTimeMillis() - lastCacheTime > CACHE_VALID_TIME
    }

    /**
     * 使缓存失效
     */
    private fun invalidateCache() {
        CoroutineScope(Dispatchers.IO).launch {
            cacheLock.withLock {
                _gameConfigCache = null
                lastCacheTime = 0
                Log.d(TAG, "游戏配置数据缓存已清除")
            }
        }
    }

    /**
     * 从缓存获取游戏数据
     * 根据gameId查找并转换为GameData对象
     * @param gameId 游戏业务ID暂无用
     * @return 游戏数据对象，未找到则返回null
     */
    fun getCachedGameData(id: String): Custom.HotGameData? {
        return _gameConfigCache?.find { it.id.toString() == id || it.gameId == id }?.let { configItem ->
            // 将GameConfigItem转换为Custom.GameData
            Custom.HotGameData(
                id = configItem.id.toString(),
                gameId = configItem.gameId,
                name = configItem.name,
                iconUrl = configItem.icon,
                gameRes = configItem.gameRes,
                description = configItem.info?: "暂无描述",
                downloadUrl = configItem.download,
                isLocal = configItem.isLocal,
                localPath = configItem.localPath,
                rating = configItem.rating
            )
        }?.also {
            Log.d(TAG, "从缓存获取游戏数据: ${it.name}")
        }
    }

    /**
     * 根据ID获取游戏数据
     * 先从缓存查找，如果没有则从数据库查询
     * @param gameId 游戏ID
     * @return 游戏数据，未找到则返回null
     */
    suspend fun getGameById(gameId: String): Custom.HotGameData? = withContext(Dispatchers.IO) {
        try {
            // 先尝试从缓存获取
            val cachedGame = getCachedGameData(gameId)
            if (cachedGame != null) {
                return@withContext cachedGame
            }

            // 如果缓存未命中，尝试从数据库获取
            val gameConfigItem = database.gameConfigDao().getGameById(gameId.toIntOrNull() ?: 0)
            
            // 转换并返回找到的游戏数据
            return@withContext gameConfigItem?.let { configItem ->
                Custom.HotGameData(
                    id = configItem.id.toString(),
                    gameId = configItem.gameId,
                    name = configItem.name,
                    iconUrl = configItem.icon,
                    gameRes = configItem.gameRes,
                    description = configItem.info?: "暂无描述",
                    downloadUrl = configItem.download,
                    isLocal = configItem.isLocal,
                    localPath = configItem.localPath,
                    rating = configItem.rating
                )
            }?.also {
                Log.d(TAG, "从数据库获取游戏数据: ${it.name}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "获取游戏数据失败: $gameId", e)
            null
        }
    }

    /**
     * 获取数据库中游戏的数量
     * 用于检查数据是否存在
     */
    suspend fun getGameCount(): Int = withContext(Dispatchers.IO) {
        database.gameConfigDao().getCount()
    }

    /**
     * 清除所有数据
     * 谨慎使用，一般用于测试或重置应用
     */
    suspend fun clearAllData() = withContext(Dispatchers.IO) {
        try {
            database.gameConfigDao().deleteAll()
            database.appConfigDao().deleteAll()

            // 删除配置文件
            File(configDir, "gameconfig.json").delete()

            Log.d(TAG, "所有数据已清除")
        } catch (e: Exception) {
            Log.e(TAG, "清除数据失败", e)
            throw e
        }
    }

}