package com.example.gameboxone.manager

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.base.AppDatabase
import com.example.gameboxone.base.UiMessage
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.event.GameEvent
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
            if (getGameCount() == 0 &&  _gameConfigCache == null) {
                Log.d(TAG, "数据库为空，强制从网络获取数据")

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
            val hasData = getGameCount() > 0

            if (!hasData) {
                Log.d(TAG, "数据库为空，开始获取游戏数据")


                val networkResult =  fetchGameConfigFromNetwork()

                if (networkResult.isNotEmpty()){
                    // 先清除现有数据，再保存新数据
                    clearGameConfigData()
                    val savedItems =  saveGameConfigToDatabase(networkResult)
                    Log.d(TAG, "从网络成功获取并保存了 ${savedItems.size} 条游戏数据")
                    updateConfigCache()
                }else{
                    loadFallbackDataToDatabase() // 如果网络获取失败，尝试加载保底数据
                }

                // 初始化完成后，检查是否有数据加载成功
                val gameCount = getGameCount() > 0
                if (!gameCount) {
                    Log.w(TAG, "初始化后数据库仍为空，没有可用的游戏数据")
                    eventManager.emitDataEvent(DataEvent.Error("无法加载游戏数据：请检查网络连接并重试"))
                }
            }
            else {
                Log.d(TAG, "数据库已有数据，跳过数据加载")

                // 更新缓存，使用数据库中的数据
                updateConfigCache()
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
        if (!netManager.checkNetworkNow()) {
            eventManager.emitDataEvent(DataEvent.DataLoaded)
            eventManager.emitSystemEvent(SystemEvent.Info("没有数据可以刷新"))
            if (isInitialLoad) {
                tryLoadFallbackData()
            }
            return
        }

        try {
            Log.d(TAG, "开始刷新所有数据，初始加载：$isInitialLoad")

            // 发送刷新开始事件
            eventManager.emitDataEvent(DataEvent.RefreshStarted)

            // 清除数据
            clearGameConfigData()
            
            Log.d(TAG, "已清空现有数据，准备获取最新数据")

            // 使用提取的方法获取并保存数据
            val networkResult =  fetchGameConfigFromNetwork()
            val savedItems=  saveGameConfigToDatabase(networkResult)
            if (savedItems.isNotEmpty()) {
                // 更新缓存
                updateConfigCache()
                eventManager.emitDataEvent(DataEvent.RefreshCompleted)
            }else{
                Log.e(TAG, "没有数据可以刷新")
                eventManager.emitSystemEvent(SystemEvent.Info("没有数据可以刷新"))
            }




        } catch (e: Exception) {
            Log.e(TAG, "刷新数据失败", e)
            eventManager.emitDataEvent(DataEvent.Error("刷新数据失败: ${e.message}"))
            

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

            // 解析数据：仅支持新格式 { "params": {...}, "gamelist": [ ... ] }
            val gson = Gson()
            val rootObj = try {
                gson.fromJson(jsonString, com.google.gson.JsonObject::class.java)
            } catch (e: Exception) {
                Log.e(TAG, "保底配置解析为 JSON 对象失败", e)
                eventManager.emitDataEvent(DataEvent.Error("保底配置格式错误: ${e.message}"))
                return@withContext
            }

            if (rootObj == null) {
                Log.e(TAG, "保底配置不是有效的 JSON 对象")
                eventManager.emitDataEvent(DataEvent.Error("保底配置格式错误"))
                return@withContext
            }

            // Apply params (env/betaUrl/resUrl/gameSdkUrl) so NetManager has correct BASE_URL for resources
            try {
                if (rootObj.has("params") && rootObj.get("params").isJsonObject) {
                    val params = rootObj.getAsJsonObject("params")
                    val env = params.getAsJsonPrimitive("env")?.asString
                    val betaUrl = params.getAsJsonPrimitive("betaUrl")?.asString
                    val resUrl = params.getAsJsonPrimitive("resUrl")?.asString
                    val gameSdkUrl = params.getAsJsonPrimitive("gameSdkUrl")?.asString
                    // apply to netManager
                    netManager.applyRemoteParams(env, betaUrl, resUrl, gameSdkUrl)
                    Log.d(TAG, "Applied remote params from fallback: env=$env, betaUrl=$betaUrl, resUrl=$resUrl, gameSdkUrl=$gameSdkUrl")
                }
            } catch (e: Exception) {
                Log.w(TAG, "应用 params 失败，继续解析 gamelist", e)
            }

            // 必须包含 params 和 gamelist
            if (!rootObj.has("params") || !rootObj.has("gamelist")) {
                Log.e(TAG, "保底配置缺少 params 或 gamelist 字段")
                eventManager.emitDataEvent(DataEvent.Error("保底配置缺少 params 或 gamelist 字段"))
                return@withContext
            }

            val listEl = try {
                rootObj.getAsJsonArray("gamelist")
            } catch (e: Exception) {
                Log.e(TAG, "gamelist 字段不是数组", e)
                eventManager.emitDataEvent(DataEvent.Error("保底配置 gamelist 格式错误"))
                return@withContext
            }

            val type = object : TypeToken<List<GameConfigItem>>() {}.type
            val parsedItems: List<GameConfigItem> = try {
                gson.fromJson(listEl, type)
            } catch (e: Exception) {
                Log.e(TAG, "解析 gamelist 项失败", e)
                eventManager.emitDataEvent(DataEvent.Error("保底 gamelist 解析失败: ${e.message}"))
                return@withContext
            }

            if (parsedItems.isEmpty()) {
                Log.w(TAG, "解析的保底数据为空")
                eventManager.emitDataEvent(DataEvent.Error("保底数据为空"))
                return@withContext
            }

            // 将 task 字段提取为 taskPointsJson，以便 Room 能持久化
            val configItems = parsedItems.map { item ->
                val taskJson = item.task?.points?.let { gson.toJson(it) }
                item.copy(taskPointsJson = taskJson)
            }

            // 清空旧数据
            database.gameConfigDao().deleteAll()

            // 保存处理后的数据
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

                            val   networkResult =  fetchGameConfigFromNetwork()

                            
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
     * 只负责数据获取，不进行数据库操作
     * @return 网络获取的游戏配置数据
     */
    private suspend fun fetchGameConfigFromNetwork(): List<GameConfigItem> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "开始从网络获取游戏配置数据")

            val result = netManager.getGameList()
            result.fold(
                onSuccess = { configItems ->
                    if (configItems.isEmpty()) {
                        Log.e(TAG, "网络返回数据为空")
                        emptyList()
                    } else {
                        configItems
                    }
                },
                onFailure = { error ->
                    Log.e(TAG, "从网络获取游戏配置数据失败: ${error.message}")
//                    throw error
                    emptyList()
                }

            )
        } catch (e: Exception) {
            Log.e(TAG, "从网络获取游戏配置数据异常", e)
            emptyList()
//            throw e
        }
    }

    /**
     * 保存游戏配置数据到数据库
     * @param configItems 游戏配置数据
     * @return 处理并保存后的数据
     */
    private suspend fun saveGameConfigToDatabase(configItems: List<GameConfigItem>): List<GameConfigItem> {
        if (configItems.isEmpty()) {
            Log.e(TAG, "保存失败：数据为空")
            return emptyList()
        }

        // 处理数据转换，确保字段匹配和非空约束
        val processedItems = configItems.map { item ->
            // 创建GameConfigItem对象，确保字段映射正确
            val taskJson = item.task?.points?.let { Gson().toJson(it) }
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

                // Persist task points JSON
                taskPointsJson = taskJson,

                // 其他字段使用默认值
                isLocal = false,
                localPath = ""
            )
        }

        try {
            // 保存到数据库
            database.gameConfigDao().insertAll(processedItems)
            Log.d(TAG, "成功保存 ${processedItems.size} 条游戏配置数据到数据库")
            return processedItems
        } catch (e: Exception) {
            Log.e(TAG, "保存游戏配置数据失败", e)
            throw e
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
            val points = configItem.taskPointsJson?.let {
                try { com.google.gson.Gson().fromJson(it, Array<Int>::class.java).toList() } catch (e: Exception) { null }
            } ?: configItem.task?.points

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
                rating = configItem.rating,
                taskDesc = configItem.task?.desc,
                taskPoints = points
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
                val points = configItem.taskPointsJson?.let {
                    try { com.google.gson.Gson().fromJson(it, Array<Int>::class.java).toList() } catch (ex: Exception) { null }
                } ?: configItem.task?.points

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
                    rating = configItem.rating,
                    taskDesc = configItem.task?.desc,
                    taskPoints = points
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
     * 获取游戏数量
     * @return 数据库中游戏的数量
     */
    private suspend fun getGameCount(): Int {
         return withContext(Dispatchers.IO) {
             try {
                database.gameConfigDao().getCount()
             } catch (e: Exception) {
                 Log.e(TAG, "获取游戏数量失败", e)
                 0
             }
         }
     }

    /**
     * 清除游戏配置数据
     * 从数据库和缓存中清除所有游戏配置数据
     */
    private suspend fun clearGameConfigData() {
        withContext(Dispatchers.IO) {
            try {
                database.gameConfigDao().deleteAll()
                Log.d(TAG, "游戏配置数据已清除")
            } catch (e: Exception) {
                Log.e(TAG, "清除游戏配置数据失败", e)
            }
        }

        // 清空缓存
        cacheLock.withLock {
            _gameConfigCache = null
            lastCacheTime = 0
        }
    }

    /**
     * 更新配置缓存
     * 从数据库加载最新的游戏配置数据到缓存
     */
    private suspend fun updateConfigCache() {
        cacheLock.withLock {
            try {
                _gameConfigCache = database.gameConfigDao().getAll()
                lastCacheTime = System.currentTimeMillis()
                Log.d(TAG, "配置缓存已更新，当前缓存大小: ${_gameConfigCache?.size}")
            } catch (e: Exception) {
                Log.e(TAG, "更新配置缓存失败", e)
            }
        }
    }

    /**
     * 检查缓存是否过期
     * @return 如果缓存过期返回true，否则返回false
     */
    private fun isCacheExpired(): Boolean {
        val currentTime = System.currentTimeMillis()
        return (currentTime - lastCacheTime) > CACHE_VALID_TIME
    }
}
