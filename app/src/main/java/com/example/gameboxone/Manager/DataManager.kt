package com.example.gameboxone.manager

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.base.AppDatabase
import com.example.gameboxone.base.UiMessage
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.AppConfigItem
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.model.MyGameItem
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
import java.util.concurrent.atomic.AtomicBoolean
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton
import com.example.gameboxone.di.ApplicationScope

/**
 * 数据管理器
 * 负责确保应用基础数据的存在性，处理e及更新具体数据
 */
@Singleton
class DataManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val database: AppDatabase,
    private val netManager: NetManager,
    private val messageService: MessageService,
    private val eventManager: EventManager, // 添加 EventManager 依赖
    private val sdkManager: SdkManager, // 注入 SdkManager，用于在远端对比后触发 SDK 预加载/更新
    @ApplicationScope private val applicationScope: CoroutineScope // 注入进程级 CoroutineScope，替代 GlobalScope
) {
    private val TAG = "DataManager"

    // 避免重复弹窗（请求远程配置失败）
    private val remoteConfigFailureShown = AtomicBoolean(false)


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

            // 判定本地是否已有“可用缓冲”：既有游戏数据，又已分配 base_url/远端参数
            val hasLocalGames = try {
                getGameCount() > 0
            } catch (e: Exception) {
                Log.w(TAG, "检查本地游戏数量失败，视为无本地游戏", e)
                false
            }

            val baseUrlAssigned = try {
                isBaseUrlAssigned()
            } catch (e: Exception) {
                Log.w(TAG, "检查 base_url 状态失败，假定未赋值", e)
                false
            }

            val hasUsableBuffer = hasLocalGames && baseUrlAssigned

            if (!hasUsableBuffer) {
                Log.d(TAG, "本地无可用缓冲（游戏数据或 base_url 不完整），进入初始化流程 initializeData()")
                initializeData()
                return
            }

            Log.d(TAG, "检测到本地已有缓冲（游戏数据 + base_url），先展示本地数据，再后台刷新远端 gameconfig")

            // 先用本地缓冲数据更新内存缓存并通知 UI 显示列表
            try {
                updateConfigCache()
                Log.d(TAG, "预加载路径：已从本地缓冲更新配置缓存，当前数量=${_gameConfigCache?.size ?: 0}")
            } catch (e: Exception) {
                Log.w(TAG, "预加载路径：更新本地缓冲缓存失败", e)
            }
            // 通知首页等订阅方可以加载/展示游戏列表
            try {
                eventManager.emitDataEvent(DataEvent.Initialized)
            } catch (e: Exception) {
                Log.w(TAG, "预加载路径：发送 Initialized 事件失败（将继续后台刷新）", e)
            }

            // 后台异步刷新远端配置，统一通过 fetchGameConfigFromNetwork 处理
            try {
                applicationScope.launch(Dispatchers.IO) {
                    try {
                        // 确保 NetManager 具备远端参数并通过健康检查
                        val paramsOk = try {
                            applyParamsFromAssets()
                        } catch (e: Exception) {
                            Log.w(TAG, "预加载路径：applyParamsFromAssets 失败，跳过远端刷新", e)
                            false
                        }

                        if (!paramsOk) {
                            Log.w(TAG, "预加载路径：远端健康检查未通过，继续使用本地缓冲数据")
                            return@launch
                        }

                        Log.d(TAG, "预加载路径：开始通过 fetchGameConfigFromNetwork 刷新远端配置")
                        val merged = fetchGameConfigFromNetwork()
                        Log.d(TAG, "预加载路径：远端刷新完成，最新数据量=${merged.size}")
                    } catch (e: Exception) {
                        Log.w(TAG, "预加载路径：后台刷新远端配置失败，继续使用本地缓冲数据", e)
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "预加载路径：调度后台刷新任务失败", e)
            }
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

                // 触发 SDK 对比/预加载（保证即便是在 fallback 路径也会去检查 SDK）
                try {
                    Log.d(TAG, "fallback 路径：触发 SDK 对比/预加载")
                    applicationScope.launch(Dispatchers.IO) {
                        try {
                            sdkManager.preloadSdk()
                            Log.d(TAG, "fallback 路径：SDK 对比/预加载完成")
                        } catch (e: Exception) {
                            Log.w(TAG, "fallback 路径：触发 SDK 预加载失败", e)
                        }
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "调度 fallback SDK 预加载任务失败", e)
                }

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


            Log.d(TAG, "数据库为空，优先从保底 assets 加载数据到数据库（确保有本地数据和请求地址）")

            try {
                loadFallbackDataToDatabase()
            } catch (e: Exception) {
                Log.e(TAG, "加载保底数据失败（initializeData），将继续尝试后续网络请求", e)
            }


            // 更新缓存，使用刚写入的保底数据
            try {
                updateConfigCache()
                Log.d(
                    TAG,
                    "保底数据已写入数据库并更新缓存，当前数据量: ${_gameConfigCache?.size ?: 0}"
                )
            } catch (e: Exception) {
                Log.w(TAG, "更新缓存失败（initializeData）", e)
            }

            // 确保 NetManager 已应用 params
            try {
                val paramsOk = applyParamsFromAssets()
                if (!paramsOk) {
                    Log.w(TAG, "applyParamsFromAssets reports unhealthy remote; skip remote fetch and continue with local data")
                    eventManager.emitDataEvent(DataEvent.Initialized)
                    return
                }
            } catch (e: Exception) {
                Log.w(TAG, "applyParamsFromAssets failed (initializeData)", e)
            }

            /**
             * ////////////////保底数据载入完成,开始对比远程数据
             * */
            // 现在尝试去拉取远端配置以便后续更新（如果网络可用且 REMOTE_CONFIG_URL 已设置）
            try {
                val merged = fetchGameConfigFromNetwork()
                if (merged.isNotEmpty()) {
                    Log.d(TAG, "初始化路径：远端配置获取并合并完成，共 ${merged.size} 条游戏数据")
                } else {
                    Log.d(TAG, "初始化路径：未从远端获取到配置（可能无网络或远端返回空），保留保底数据")
                }
            } catch (e: Exception) {
                Log.w(TAG, "尝试从远端更新配置失败，已保留本地保底数据", e)
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

            // 使用统一方法获取并合并远端配置（内部负责合并 DB、更新缓存和 SDK 版本对比）
            // 注意：不再在刷新前清空本地数据，避免远端失败时本地列表被清空
            val merged = fetchGameConfigFromNetwork()
            if (merged.isNotEmpty()) {
                Log.d(TAG, "刷新路径：远端配置获取并合并完成，共 ${merged.size} 条游戏数据")
                eventManager.emitDataEvent(DataEvent.RefreshCompleted)
            } else {
                Log.e(TAG, "刷新路径：远端返回空或合并失败，保留本地数据")
                eventManager.emitSystemEvent(SystemEvent.Info("没有数据可以刷新，已保留本地数据"))
            }


        } catch (e: Exception) {
            Log.e(TAG, "刷新数据失败", e)
            eventManager.emitDataEvent(DataEvent.Error("刷新数据失败: ${e.message}"))


        }
    }

    /**
     * 仅刷新 SDK，不动游戏列表数据
     * - 根据缓冲版本与远端版本对比后决定是否更新 SDK
     */
    suspend fun preloadSdkOnly() {
        try {
            Log.d(TAG, "preloadSdkOnly: 开始仅刷新 SDK")

            // 1) 先检查实时网络状态
            if (!netManager.checkNetworkNow()) {
                Log.w(TAG, "preloadSdkOnly: 网络不可用，跳过 SDK 刷新")
                return
            }

            // 2) 确保 NetManager 已有可用的 base_url 等参数，并通过 /health 校验
            val paramsOk = try {
                applyParamsFromAssets()
            } catch (e: Exception) {
                Log.w(TAG, "preloadSdkOnly: applyParamsFromAssets 失败", e)
                false
            }
            if (!paramsOk) {
                Log.w(TAG, "preloadSdkOnly: 远端健康检查未通过，跳过 SDK 刷新")
                return
            }

            // 3) 拉取远端配置（以获取最新 sdkVersion），但不改动本地游戏列表
            val result = netManager.getGameList()
            result.fold(
                onSuccess = { configItems ->
                    if (configItems.isEmpty()) {
                        Log.e(TAG, "preloadSdkOnly: 远端返回空配置")
                        return@fold
                    }

                    // 成功拉取到远端数据，清除之前的失败提示标志
                    remoteConfigFailureShown.set(false)

                    // 3.1 将最新 params 持久化到 DB（与 fetchGameConfigFromNetwork 中保持一致）
                    try {
                        database.appConfigDao().insertConfig(
                            AppConfigItem(
                                name = "base_url",
                                value = netManager.getBaseUrl()
                            )
                        )
                        database.appConfigDao().insertConfig(
                            AppConfigItem(
                                name = "sdk_url",
                                value = netManager.getSdkUrl()
                            )
                        )
                        database.appConfigDao().insertConfig(
                            AppConfigItem(
                                name = "sdk_file_name",
                                value = netManager.getSdkFileName()
                            )
                        )
                        database.appConfigDao().insertConfig(
                            AppConfigItem(
                                name = "remote_sdk_version",
                                value = netManager.getRemoteSdkVersion()
                            )
                        )
                        Log.d(
                            TAG,
                            "preloadSdkOnly: 已将远端 params 写入 DB (base/sdk_url/sdk_file_name/remote_sdk_version)"
                        )
                    } catch (e: Exception) {
                        Log.w(TAG, "preloadSdkOnly: 写入远端 params 到 DB 失败", e)
                    }

                    // 3.2 比对远端 SDK 版本与本地缓冲版本，仅在不一致时更新 SDK
                    try {
                        val remoteSdkVersion = netManager.getRemoteSdkVersion()
                        val localSdkVersion = try {
                            val configs = database.appConfigDao().getAllConfigs()
                            configs.find { it.name == "sdk_version" }?.value
                        } catch (e: Exception) {
                            Log.w(TAG, "preloadSdkOnly: 读取本地 sdk_version 失败", e)
                            null
                        }

                        if (!remoteSdkVersion.isNullOrBlank()) {
                            if (remoteSdkVersion != localSdkVersion) {
                                Log.d(
                                    TAG,
                                    "preloadSdkOnly: 检测到 SDK 版本变更，本地=$localSdkVersion, 远端=$remoteSdkVersion，触发 SDK 更新"
                                )
                                try {
                                    applicationScope.launch(Dispatchers.IO) {
                                        try {
                                            sdkManager.preloadSdk(remoteSdkVersion)
                                            Log.d(
                                                TAG,
                                                "preloadSdkOnly: SDK 版本更新完成，当前版本=$remoteSdkVersion"
                                            )
                                        } catch (e: Exception) {
                                            Log.w(TAG, "preloadSdkOnly: SDK 版本更新失败", e)
                                        }
                                    }
                                } catch (e: Exception) {
                                    Log.w(TAG, "preloadSdkOnly: 调度 SDK 更新任务失败", e)
                                }
                            } else {
                                Log.d(
                                    TAG,
                                    "preloadSdkOnly: SDK 版本相同，无需更新 (version=$remoteSdkVersion)"
                                )
                            }
                        } else {
                            Log.d(TAG, "preloadSdkOnly: 远端未返回 sdkVersion，跳过 SDK 版本对比")
                        }
                    } catch (e: Exception) {
                        Log.w(TAG, "preloadSdkOnly: SDK 版本对比或更新流程失败", e)
                    }
                },
                onFailure = { error ->
                    Log.e(TAG, "preloadSdkOnly: 获取远端配置失败", error)
                    if (remoteConfigFailureShown.compareAndSet(false, true)) {
                        try {
                            withContext(Dispatchers.Main) {
                                messageService.showMessage(
                                    UiMessage.Dialog(
                                        title = "请求远程配置失败",
                                        message = "无法从远端获取配置，请检查网络或域名是否可达。",
                                        confirmAction = {},
                                        cancelable = false,
                                        dismissOnConfirm = true
                                    )
                                )
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "preloadSdkOnly: 展示远端失败弹窗时出错", e)
                        }
                    }
                }
            )
        } catch (e: Exception) {
            Log.w(TAG, "preloadSdkOnly: 整体流程失败", e)
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

            // Apply params (env/betaUrl/resUrl/gameSdkUrl/gameConfigUrl) so NetManager has correct BASE_URL and REMOTE_CONFIG_URL
            try {
                if (rootObj.has("params") && rootObj.get("params").isJsonObject) {
                    val params = rootObj.getAsJsonObject("params")
                    val env = params.getAsJsonPrimitive("env")?.asString
                    // 支持多种命名（beta / betaUrl）和（resUrl / release）以兼容不同的配置
                    val betaUrl = params.getAsJsonPrimitive("betaUrl")?.asString
                        ?: params.getAsJsonPrimitive("beta")?.asString
                    val resUrl = params.getAsJsonPrimitive("resUrl")?.asString
                        ?: params.getAsJsonPrimitive("release")?.asString
                    val gameSdkUrl = params.getAsJsonPrimitive("gameSdkUrl")?.asString
                    val sdkVersion = params.getAsJsonPrimitive("sdkVersion")?.asString
                    // 支持正确或拼写错误的 gameSdkName 字段
                    val gameSdkName = params.getAsJsonPrimitive("gameSdkName")?.asString
                    // 新增：支持可选的 gameConfigUrl 字段，用于指定远程 gameconfig 地址
                    val gameConfigUrl = params.getAsJsonPrimitive("gameConfigUrl")?.asString

                    // apply to netManager
                    netManager.applyRemoteParams(
                        env,
                        betaUrl,
                        resUrl,
                        gameSdkUrl,
                        sdkVersion,
                        gameSdkName,
                        gameConfigUrl
                    )
                    Log.d(
                        TAG,
                        "Applied remote params from fallback: env=$env, betaUrl=$betaUrl, resUrl=$resUrl, gameSdkUrl=$gameSdkUrl, sdkVersion=$sdkVersion, gameSdkName=$gameSdkName, gameConfigUrl=$gameConfigUrl"
                    )

                    // 持久化 params 到 app_config（即使 gamelist 为空，我们也认为 params 已成功应用并需保存）
                    try {
                        database.appConfigDao().insertConfig(AppConfigItem(name = "base_url", value = netManager.getBaseUrl()))
                        database.appConfigDao().insertConfig(AppConfigItem(name = "sdk_url", value = netManager.getSdkUrl()))
                        database.appConfigDao().insertConfig(AppConfigItem(name = "sdk_file_name", value = netManager.getSdkFileName()))
                        database.appConfigDao().insertConfig(AppConfigItem(name = "remote_sdk_version", value = netManager.getRemoteSdkVersion()))
                        // 新增：缓冲远程 gameConfigUrl，便于后续从 DB 恢复
                        database.appConfigDao().insertConfig(AppConfigItem(name = "game_config_url", value = netManager.getGameConfigUrl()))
                        Log.d(TAG, "已将保底 params 写入 DB (base/sdk_url/sdk_file_name/remote_sdk_version/game_config_url)")
                    } catch (e: Exception) {
                        Log.w(TAG, "写入保底 params 到 DB 失败", e)
                    }
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

            // 检查gamelist是否为空,这里不返回,因为后续要从线上更新ss
//            if (parsedItems.isEmpty()) {
//                Log.w(TAG, "解析的保底数据为空")
//                eventManager.emitDataEvent(DataEvent.Error("保底数据为空"))
//                return@withContext
//            }

            // 将 task 字段提取为 taskPointsJson，并规范化 gameRes（使用去空格的游戏名称）
            val configItems = parsedItems.map { item ->
                val taskJson = item.task?.points?.let { gson.toJson(it) }
                val normalizedGameRes = item.name.replace(" ", "")
                item.copy(
                    gameRes = normalizedGameRes,
                    taskPointsJson = taskJson
                )
            }

            // 清空旧数据
            database.gameConfigDao().deleteAll()

            // 保存处理后的数据
            database.gameConfigDao().insertAll(configItems)
            Log.d(TAG, "保底数据加载成功: ${configItems.size} 个游戏")

            // 读取刚写入的记录并打印摘要，便于调试和确认写入内容
            try {
                val saved = database.gameConfigDao().getAll()
                if (saved.isNotEmpty()) {
                    val summary = saved.joinToString(separator = "\n") { item ->
                        val pts = item.taskPointsJson ?: item.task?.points?.toString() ?: "[]"
                        "gameId=${item.gameId}, name=${item.name}, download=${item.download}, taskPoints=$pts"
                    }
                    Log.d(TAG, "保底数据写入详情 (共 ${saved.size} 条):\n$summary")
                } else {
                    Log.w(TAG, "写入后读取到的保底数据为空（unexpected）")
                }
            } catch (e: Exception) {
                Log.w(TAG, "读取已写入保底数据以打印详情时失败", e)
            }
        } catch (e: Exception) {
            Log.e(TAG, "加载保底数据失败", e)
            eventManager.emitDataEvent(DataEvent.Error("无法加载游戏数据：${e.message}"))
        }
    }

    /**
     * 仅用于确保 NetManager 在第一次网络请求之前有 BASE_URL/REMOTE_CONFIG_URL
     * @return true if params are applied (or none needed) and remote health OK; false if health check failed (dialog shown)
     */
    private suspend fun applyParamsFromAssets(): Boolean = withContext(Dispatchers.IO) {
        try {
            // 1) 检查运行时是否已有 base url（如果有，仍会执行 health 校验）
            var effectiveBase: String? = null
            try {
                val memBase = netManager.getBaseUrl()
                if (!memBase.isNullOrBlank()) {
                    Log.d(TAG, "applyParamsFromAssets: netManager already has BASE_URL=$memBase, will verify health")
                    effectiveBase = memBase
                }
            } catch (e: Exception) {
                Log.w(TAG, "applyParamsFromAssets: check mem base failed", e)
            }

            // 2) 若内存未设置 base，则尝试从持久化缓冲（app_config 表）中恢复 params
            if (effectiveBase.isNullOrBlank()) {
                try {
                    val configs = database.appConfigDao().getAllConfigs()
                    val base = configs.find { it.name == "base_url" }?.value
                    val sdkUrl = configs.find { it.name == "sdk_url" }?.value
                    val sdkFile = configs.find { it.name == "sdk_file_name" }?.value
                    val sdkVersion = configs.find { it.name == "remote_sdk_version" }?.value
                    val gameConfigUrl = configs.find { it.name == "game_config_url" }?.value
                    // 未来如果需要持久化 gameConfigUrl，可在此读取并传入 applyRemoteParams

                    if (!base.isNullOrBlank()) {
                        try {
                            netManager.applyRemoteParams(null, base, base, sdkUrl, sdkVersion, sdkFile, gameConfigUrl)
                            Log.d(TAG, "applyParamsFromAssets applied from DB: base=$base, sdkUrl=$sdkUrl, sdkFile=$sdkFile, sdkVersion=$sdkVersion, gameConfigUrl=$gameConfigUrl")
                            effectiveBase = netManager.getBaseUrl()
                        } catch (e: Exception) {
                            Log.w(TAG, "applyParamsFromAssets: applyRemoteParams failed", e)
                        }
                    } else {
                        Log.d(TAG, "applyParamsFromAssets: no base_url found in DB buffer, skipping health check")
                        // 没有 base 可用，无法做 health 校验，返回 true 以继续使用本地保底数据
                        return@withContext true
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "applyParamsFromAssets failed to read app_config from DB", e)
                    // 如果读取 DB 出错，视为无法继续远端请求，提示并返回 false
                    try {
                        withContext(Dispatchers.Main) {
                            try {
                                messageService.showMessage(
                                    UiMessage.Dialog(
                                        title = "请求远程配置失败",
                                        message = "无法读取本地配置以初始化远端请求，请稍后重试。",
                                        confirmAction = {},
                                        cancelable = false,
                                        dismissOnConfirm = true
                                    )
                                )
                            } catch (ex: Exception) {
                                Log.w(TAG, "展示本地配置读取失败弹窗时出错", ex)
                            }
                        }
                     } catch (ex: Exception) {
                         Log.w(TAG, "展示本地配置读取失败弹窗时出错", ex)
                     }
                     return@withContext false
                 }
             }

             // 3) 到此已有 effectiveBase，可进行 /health 校验
             try {
                 // 使用 NetManager 统一的 3 次重试健康检查逻辑
                 val healthy = try {
                     netManager.checkHealthWithRetry(3)
                 } catch (e: Exception) {
                     Log.w(TAG, "health check exception", e)
                     false
                 }

                 Log.d(TAG, "applyParamsFromAssets: health check result for base=$effectiveBase => $healthy (netManager.getBaseUrl=${netManager.getBaseUrl()})")

                 if (!healthy) {
                     Log.e(TAG, "健康检查失败: 无法访问远端服务 base=$effectiveBase")
                     try {
                        withContext(Dispatchers.Main) {
                            try {
                                messageService.showMessage(
                                    UiMessage.Dialog(
                                        title = "网络错误",
                                        message = "当前网络状态不稳定，暂时无法连接远端服务，将使用本地数据。",
                                        confirmAction = {},
                                        cancelable = false,
                                        dismissOnConfirm = true
                                    )
                                )
                            } catch (e: Exception) {
                                Log.w(TAG, "展示远端健康检查失败弹窗时出错", e)
                            }
                        }
                     } catch (e: Exception) {
                         Log.w(TAG, "展示远端健康检查失败弹窗时出错", e)
                     }
                     return@withContext false
                 }

                 // 健康检查通过
                 Log.d(TAG, "applyParamsFromAssets: remote health check OK (base=$effectiveBase)")
                 return@withContext true
             } catch (e: Exception) {
                 Log.w(TAG, "applyParamsFromAssets health check unexpected error", e)
                 try {
                    withContext(Dispatchers.Main) {
                        try {
                            messageService.showMessage(
                                UiMessage.Dialog(
                                    title = "网络错误",
                                    message = "远程健康检查异常，将暂时使用本地数据。错误信息：${e.message}",
                                    confirmAction = {},
                                    cancelable = false,
                                    dismissOnConfirm = true
                                )
                            )
                        } catch (ex: Exception) {
                            Log.w(TAG, "展示远程异常弹窗时出错", ex)
                        }
                    }
                 } catch (ex: Exception) {
                     Log.w(TAG, "展示远程异常弹窗时出错", ex)
                 }
                 return@withContext false
             }
        } catch (e: Exception) {
            Log.w(TAG, "applyParamsFromAssets outer failure", e)
            return@withContext false
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
                    if (dbItems.isEmpty()) {
                        // 数据库没有数据 —— 优先把 APK 内的保底配置加载写入数据库并返回保底数据。
                        // 这样能保证应用在首次启动时有可用数据和正确的请求地址（params）。
                        Log.d(
                            TAG,
                            "数据库为空：从保底 assets 写入数据库并返回保底数据（随后可异步尝试更新远端）"
                        )
                        try {
                            loadFallbackDataToDatabase()
                        } catch (e: Exception) {
                            Log.e(TAG, "loadFallbackDataToDatabase failed in getGameConfigItems", e)
                        }

                        // 读取刚写入的保底数据到缓存并返回
                        val cacheAfterLoad = _gameConfigCache ?: database.gameConfigDao().getAll()
                        Log.d(TAG, "已加载保底数据到缓存，数量：${cacheAfterLoad.size}")
                        return cacheAfterLoad.toList()
                    }

                    // 如果数据库本来就有数据，且需要刷新（forceRefresh 或 缓存过期），再走网络拉取流程
                    if (netManager.isNetworkAvailable) {
                        // 确保 NetManager 有 params
                        try {
                            val paramsOk = applyParamsFromAssets()
                            if (!paramsOk) {
                                Log.w(TAG, "applyParamsFromAssets reports unhealthy remote; skipping network refresh and returning local data")
                                // 返回当前缓存或数据库数据
                                val fallback = _gameConfigCache ?: database.gameConfigDao().getAll()
                                return fallback.toList()
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "applyParamsFromAssets threw", e)
                        }
                        Log.d(TAG, "尝试从网络刷新游戏配置数据")
                        try {
                            val merged = fetchGameConfigFromNetwork()
                            if (merged.isNotEmpty()) {
                                Log.d(TAG, "网络刷新成功: ${merged.size} 个游戏，合并到数据库")
                                updateConfigCache()
                                val cacheNow = database.gameConfigDao().getAll()
                                return cacheNow.toList()
                            } else {
                                Log.d(TAG, "网络刷新返回空，保留本地数据")
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "网络刷新失败，保留本地数据", e)
                        }
                    } else {
                        Log.d(TAG, "网络不可用，继续使用本地/缓存数据")
                    }

                    // 继续到最后统一返回已有缓存（此处 _gameConfigCache 有可能为 dbItems）
                } catch (e: Exception) {
                    Log.e(TAG, "加载游戏配置数据失败", e)
                    // 如果加载失败但有旧缓存，继续使用旧缓存
                    if (_gameConfigCache == null) {
                        // 尝试加载保底数据
                        loadFallbackDataToDatabase()
                        val loaded = database.gameConfigDao().getAll()
                        _gameConfigCache = loaded
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

            // 返回前统一根据“我的游戏”表对 isLocal/localPath 做一次对齐，
            // 确保首页等位置在展示游戏列表时就能正确识别已安装状态
            val finalCache = _gameConfigCache ?: database.gameConfigDao().getAll()
            val mergedWithMyGames = try {
                mergeWithMyGames(finalCache)
            } catch (e: Exception) {
                Log.e(TAG, "合并我的游戏状态失败，继续使用原始配置列表", e)
                finalCache
            }
            _gameConfigCache = mergedWithMyGames
            lastCacheTime = System.currentTimeMillis()

            // 返回副本，避免外部修改缓存
            return mergedWithMyGames.toList()
        }
    }

    /**
     * 将 game_config 中的配置与 my_games 表进行对齐，
     * 以 my_games 作为已安装状态的“真源”，修正 isLocal 和 localPath。
     */
    private suspend fun mergeWithMyGames(configItems: List<GameConfigItem>): List<GameConfigItem> {
        if (configItems.isEmpty()) return configItems

        return withContext(Dispatchers.IO) {
            val myGames: List<MyGameItem> = try {
                database.myGameDao().getAllGamesList()
            } catch (e: Exception) {
                Log.e(TAG, "读取我的游戏列表失败，跳过状态合并", e)
                emptyList()
            }

            if (myGames.isEmpty()) {
                // 没有任何已安装游戏，则全部标记为未安装
                return@withContext configItems.map { it.copy(isLocal = false, localPath = "") }
            }

            val myGameMap = myGames.associateBy { it.gameId }

            configItems.map { config ->
                val myGame = myGameMap[config.gameId]
                if (myGame != null) {
                    // 已安装：以 my_games 为准写回 isLocal/localPath
                    config.copy(
                        isLocal = true,
                        localPath = myGame.localPath.ifBlank { config.localPath }
                    )
                } else {
                    // 未安装：清理本地标记，避免误显示为已安装
                    config.copy(
                        isLocal = false,
                        localPath = ""
                    )
                }
            }
        }
    }

    /**
     * 从网络获取游戏配置数据
     * 对比并更新数据库与缓存（fetch + merge + cache update）
     * @return 合并后的本地数据（来自 DB）
     */
    private suspend fun fetchGameConfigFromNetwork(): List<GameConfigItem> =
        withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "开始从网络获取游戏配置数据")

                // 1) 可达性检查：BASE_URL/health，使用 NetManager 统一的 3 次重试机制
                val healthOk = try {
                    netManager.checkHealthWithRetry(3)
                } catch (e: Exception) {
                    Log.w(TAG, "fetchGameConfigFromNetwork: 健康检查异常", e)
                    false
                }

                if (!healthOk) {
                    Log.e(TAG, "fetchGameConfigFromNetwork: 远端健康检查失败，放弃拉取 gameconfig")
                    if (remoteConfigFailureShown.compareAndSet(false, true)) {
                        try {
                            withContext(Dispatchers.Main) {
                                messageService.showMessage(
                                    UiMessage.Dialog(
                                        title = "网络错误",
                                        message = "网络连接异常，暂时无法获取游戏列表，请检查网络后重试。",
                                        confirmAction = {},
                                        cancelable = false,
                                        dismissOnConfirm = true
                                    )
                                )
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "展示远端健康检查失败弹窗时出错", e)
                        }
                    }
                    return@withContext emptyList()
                }

                val result = netManager.getGameList()
                return@withContext result.fold(
                    onSuccess = { configItems ->
                        if (configItems.isEmpty()) {
                            // 远端返回空，可能是域名不可达或远端没有数据——展示一次性弹窗提示用户
                            Log.e(TAG, "网络返回数据为空或远端不可达: $ { netManager.getBaseUrl() }")
                            if (remoteConfigFailureShown.compareAndSet(false, true)) {
                                try {
                                    withContext(Dispatchers.Main) {
                                        messageService.showMessage(
                                            UiMessage.Dialog(
                                                title = "网络错误",
                                                message = "未能获取游戏列表，请检查网络连接或稍后重试。",
                                                confirmAction = {},
                                                cancelable = false,
                                                dismissOnConfirm = true
                                            )
                                        )
                                    }
                                } catch (e: Exception) {
                                    Log.w(TAG, "展示远端失败弹窗时出错", e)
                                }
                            }
                            emptyList()
                        } else {
                            // 成功拉取到远端数据，清除之前的失败提示标志
                            remoteConfigFailureShown.set(false)

                            // 在写入前对比并打印时间戳变更情况（基于 gameId 或 id）
                            try {
                                val existing = database.gameConfigDao().getAll()
                                val byGameId = existing.associateBy { it.gameId }
                                val byId = existing.associateBy { it.id }

                                configItems.forEach { remote ->
                                    // 优先使用业务 gameId 作为匹配键，兜底用自增 id
                                    val keyGameId = remote.gameId
                                    val local = if (keyGameId.isNotBlank()) {
                                        byGameId[keyGameId]
                                    } else {
                                        byId[remote.id]
                                    }
                                    val localTs = local?.timestamp
                                    val remoteTs = remote.timestamp
                                    val equal = localTs == remoteTs
                                    Log.d(
                                        TAG,
                                        "[GAMEBOX] 时间戳对比: gameId=$keyGameId, name=${remote.name}, localTs=$localTs, remoteTs=$remoteTs, equal=$equal"
                                    )
                                }
                            } catch (e: Exception) {
                                Log.w(TAG, "时间戳对比日志打印失败", e)
                            }

                            // 远端返回成功，持久化当前 NetManager 的 params 到 DB，保证后继启动读取一致
                            try {
                                database.appConfigDao().insertConfig(
                                    AppConfigItem(
                                        name = "base_url",
                                        value = netManager.getBaseUrl()
                                    )
                                )
                                database.appConfigDao().insertConfig(
                                    AppConfigItem(
                                        name = "sdk_url",
                                        value = netManager.getSdkUrl()
                                    )
                                )
                                database.appConfigDao().insertConfig(
                                    AppConfigItem(
                                        name = "sdk_file_name",
                                        value = netManager.getSdkFileName()
                                    )
                                )
                                database.appConfigDao().insertConfig(
                                    AppConfigItem(
                                        name = "remote_sdk_version",
                                        value = netManager.getRemoteSdkVersion()
                                    )
                                )
                                database.appConfigDao().insertConfig(
                                    AppConfigItem(
                                        name = "game_config_url",
                                        value = netManager.getGameConfigUrl()
                                    )
                                )
                                Log.d(
                                    TAG,
                                    "已将远端 params 写入 DB (base/sdk_url/sdk_file_name/remote_sdk_version/game_config_url)"
                                )
                            } catch (e: Exception) {
                                Log.w(TAG, "写入远端 params 到 DB 失败", e)
                            }

                            // 远端 SDK 版本对比：仅当版本不同才触发 SDK 更新
                            try {
                                val remoteSdkVersion = netManager.getRemoteSdkVersion()
                                val localSdkVersion = try {
                                    val configs = database.appConfigDao().getAllConfigs()
                                    configs.find { it.name == "sdk_version" }?.value
                                } catch (e: Exception) {
                                    Log.w(TAG, "读取本地 sdk_version 失败", e)
                                    null
                                }

                                if (!remoteSdkVersion.isNullOrBlank()) {
                                    if (remoteSdkVersion != localSdkVersion) {
                                        Log.d(
                                            TAG,
                                            "检测到 SDK 版本变更，本地=$localSdkVersion, 远端=$remoteSdkVersion，触发 SDK 更新"
                                        )
                                        try {
                                            applicationScope.launch(Dispatchers.IO) {
                                                try {
                                                    sdkManager.preloadSdk(remoteSdkVersion)
                                                    Log.d(
                                                        TAG,
                                                        "SDK 版本更新完成，当前版本=$remoteSdkVersion"
                                                    )
                                                } catch (e: Exception) {
                                                    Log.w(TAG, "SDK 版本更新失败", e)
                                                }
                                            }
                                        } catch (e: Exception) {
                                            Log.w(TAG, "调度 SDK 更新任务失败", e)
                                        }
                                    } else {
                                        Log.d(
                                            TAG,
                                            "SDK 版本相同，无需更新 (version=$remoteSdkVersion)"
                                        )
                                    }
                                } else {
                                    Log.d(TAG, "远端未返回 sdkVersion，跳过 SDK 版本对比")
                                }
                            } catch (e: Exception) {
                                Log.w(TAG, "SDK 版本对比或更新流程失败", e)
                            }

                            // 处理并 upsert 远端数据（序列化 task points 等）
                            val processed = try {
                                configItems.map { item ->
                                    val taskJson = item.task?.points?.let { Gson().toJson(it) }
                                    val normalizedGameRes = item.name.replace(" ", "")
                                    GameConfigItem(
                                        id = item.id,
                                        gameId = item.gameId,
                                        pubId = item.pubId,
                                        ret = item.ret,
                                        name = item.name,
                                        icon = item.icon,
                                        rating = item.rating,
                                        // 不再直接使用远端 gameRes 字段，而是用去空格的游戏名称作为资源目录名
                                        gameRes = normalizedGameRes,
                                        info = item.info,
                                        diff = item.diff,
                                        download = item.download,
                                        downicon = item.downicon,
                                        patch = item.patch,
                                        timestamp = item.timestamp,
                                        size = item.size,
                                        categories = item.categories,
                                        tags = item.tags,
                                        taskPointsJson = taskJson,
                                        isLocal = false,
                                        localPath = ""
                                    )
                                }
                            } catch (e: Exception) {
                                Log.e(TAG, "处理远端数据失败", e)
                                emptyList<GameConfigItem>()
                            }

                            try {
                                if (processed.isNotEmpty()) {
                                    database.gameConfigDao().insertAll(processed)
                                    Log.d(TAG, "已保存/更新 ${processed.size} 条远端返回的游戏数据到数据库")
                                }
                            } catch (e: Exception) {
                                Log.e(TAG, "保存远端数据到数据库失败", e)
                            }

                            // 删除本地中不在远端列表中的项（按 gameId 识别）
                            try {
                                val remoteIds = configItems.mapNotNull { it.gameId }.toSet()
                                val localAll = database.gameConfigDao().getAll()
                                val toDelete = localAll.filter { it.gameId.isNotBlank() && it.gameId !in remoteIds }
                                if (toDelete.isNotEmpty()) {
                                    Log.d(TAG, "合并：将删除 ${toDelete.size} 个本地已移除的游戏条目")
                                    toDelete.forEach { item ->
                                        try {
                                            database.gameConfigDao().delete(item)
                                        } catch (e: Exception) {
                                            Log.w(TAG, "删除本地已移除游戏失败: ${item.gameId}", e)
                                        }
                                    }
                                }
                            } catch (e: Exception) {
                                Log.w(TAG, "合并：删除本地已移除项失败", e)
                            }

                            // 更新内存缓存并返回合并后的数据库内容
                            return@fold try {
                                cacheLock.withLock {
                                    _gameConfigCache = database.gameConfigDao().getAll()
                                    lastCacheTime = System.currentTimeMillis()
                                }
                                database.gameConfigDao().getAll()
                            } catch (e: Exception) {
                                Log.w(TAG, "合并后读取 DB 并更新缓存失败", e)
                                emptyList()
                            }
                        }
                    },
                    onFailure = { error ->
                        Log.e(TAG, "从网络获取游戏配置数据失败: ${error?.message}")
                        //  展示一次性弹窗通知用户远端配置请求失败（避免重复弹窗）
                        if (remoteConfigFailureShown.compareAndSet(false, true)) {
                            try {
                                withContext(Dispatchers.Main) {
                                    messageService.showMessage(
                                        UiMessage.Dialog(
                                            title = "请求远程配置失败",
                                            message = "无法从远端获取配置，请检查网络或域名是否可达。错误： ${error?.message}",
                                            confirmAction = {},
                                            cancelable = false,
                                            dismissOnConfirm = true
                                        )
                                    )
                                }
                            } catch (e: Exception) {
                                Log.w(TAG, "展示远端失败弹窗时出错", e)
                            }
                        }
                        emptyList()
                    }
                 )
             } catch (e: Exception) {
                Log.e(TAG, "从网络获取游戏配置数据异常", e)
                if (remoteConfigFailureShown.compareAndSet(false, true)) {
                    try {
                        withContext(Dispatchers.Main) {
                            messageService.showMessage(
                                UiMessage.Dialog(
                                    title = "请求远程配置失败",
                                    message = "无法从远端获取配置，请检查网络或域名是否可达。异常： ${e.message}",
                                    confirmAction = {},
                                    cancelable = false,
                                    dismissOnConfirm = true
                                )
                            )
                        }
                    } catch (ex: Exception) {
                        Log.w(TAG, "展示远程异常弹窗时出错", ex)
                    }
                }
                emptyList()
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
        return _gameConfigCache?.find { it.id.toString() == id || it.gameId == id }
            ?.let { configItem ->
                // 将GameConfigItem转换为Custom.GameData
                val points = configItem.taskPointsJson?.let {
                    try {
                        com.google.gson.Gson().fromJson(it, Array<Int>::class.java).toList()
                    } catch (e: Exception) {
                        null
                    }
                } ?: configItem.task?.points

                Custom.HotGameData(
                    id = configItem.id.toString(),
                    gameId = configItem.gameId,
                    name = configItem.name,
                    iconUrl = configItem.icon,
                    gameRes = configItem.gameRes,
                    description = configItem.info ?: "暂无描述",
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
                    try {
                        com.google.gson.Gson().fromJson(it, Array<Int>::class.java).toList()
                    } catch (ex: Exception) {
                        null
                    }
                } ?: configItem.task?.points

                Custom.HotGameData(
                    id = configItem.id.toString(),
                    gameId = configItem.gameId,
                    name = configItem.name,
                    iconUrl = configItem.icon,
                    gameRes = configItem.gameRes,
                    description = configItem.info ?: "暂无描述",
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

    /**
     * 判断是否已为网络层分配了 base_url。
     * 优先检查内存中的 netManager.getBaseUrl()，若为空则查找持久化的 app_config 表中的 base_url 值。
     */
    private suspend fun isBaseUrlAssigned(): Boolean {
        // 先检查运行时内存中的 base url
        try {
            val memBase = netManager.getBaseUrl()
            if (!memBase.isNullOrBlank()) return true
        } catch (e: Exception) {
            Log.w(TAG, "检查 netManager.getBaseUrl() 失败", e)
        }

        // 若内存未设置，则检查数据库中的 app_config 项
        return withContext(Dispatchers.IO) {
            try {
                val configs = database.appConfigDao().getAllConfigs()
                val base = configs.find { it.name == "base_url" }?.value
                !base.isNullOrBlank()
            } catch (e: Exception) {
                Log.w(TAG, "从 DB 检查 base_url 失败", e)
                false
            }
        }
    }
}
