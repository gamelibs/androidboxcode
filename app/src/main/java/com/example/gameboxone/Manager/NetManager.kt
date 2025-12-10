package com.example.gameboxone.manager

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Build
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.data.model.GameConfigItem
import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import javax.inject.Inject
import javax.inject.Singleton
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

@Singleton
class NetManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val TAG = "NetManager"

    // 默认超时设置
    private val DEFAULT_TIMEOUT = 60 * 1000L

    // 连接管理器延迟初始化
    private val connectivityManager by lazy {
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    }

    // 网络可用状态
    private var _isNetworkAvailable = AtomicBoolean(false)
    val isNetworkAvailable: Boolean get() = _isNetworkAvailable.get()

    // 防止重复注册 NetworkCallback
    private val networkCallbackRegistered = AtomicBoolean(false)

    /**
     * 实时检查当前网络连接状态
     * 不依赖缓存的网络状态标志，而是直接查询系统
     * @return 当前是否有可用网络连接
     */
    fun checkNetworkNow(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

        val isAvailable: Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = cm.activeNetwork ?: return false.also { _isNetworkAvailable.set(false) }
            val actNw = cm.getNetworkCapabilities(network) ?: return false.also { _isNetworkAvailable.set(false) }
            actNw.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                    actNw.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                    actNw.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
        } else {
            @Suppress("DEPRECATION")
            val networkInfo = cm.activeNetworkInfo
            @Suppress("DEPRECATION")
            networkInfo != null && networkInfo.isConnected
        }

        // 更新缓存并记录日志
        _isNetworkAvailable.set(isAvailable)
        if (isAvailable) {
            Log.d(TAG, "Network check: available")
        } else {
            Log.d(TAG, "Network check: not available")
        }

        return isAvailable
    }

    // 创建OkHttpClient实例，配置超时和连接池
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(DEFAULT_TIMEOUT, TimeUnit.MILLISECONDS)
        .readTimeout(DEFAULT_TIMEOUT, TimeUnit.MILLISECONDS)
        .writeTimeout(DEFAULT_TIMEOUT, TimeUnit.MILLISECONDS)
        // 配置连接池以支持更高级别的并发
        .connectionPool(okhttp3.ConnectionPool(10, 5, TimeUnit.MINUTES))
        .retryOnConnectionFailure(true)
        .build()

    // 初始化时定义 networkCallback
     private val networkCallback = object : ConnectivityManager.NetworkCallback() {
         override fun onAvailable(network: Network) {
             super.onAvailable(network)
             // 只有当之前状态为 false 时才记录和更新，避免重复日志
             if (_isNetworkAvailable.compareAndSet(false, true)) {
                Log.d(TAG, "网络可用 (instance=${this@NetManager.hashCode()})")
             }
         }

         override fun onLost(network: Network) {
             super.onLost(network)
             // 只有当之前状态为 true 时才记录和更新
             if (_isNetworkAvailable.compareAndSet(true, false)) {
                Log.d(TAG, "网络中断 (instance=${this@NetManager.hashCode()})")
             }
         }
     }

    init {
        setupNetworkCallback()
    }

    private fun setupNetworkCallback() {
        // 避免重复注册回调
        if (!networkCallbackRegistered.compareAndSet(false, true)) {
            Log.d(TAG, "Network callback already registered, skip")
            return
        }

        try {
            val networkRequest = NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
                .addTransportType(NetworkCapabilities.TRANSPORT_CELLULAR)
                .build()

            connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
            Log.d(TAG, "Network callback registered successfully (instance=${this.hashCode()})")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to setup network callback", e)
            // 如果注册失败，重置标志以便后续重试
            networkCallbackRegistered.set(false)
        }
    }


    /**
     * 获取远程配置
     */
    suspend fun fetchRemoteConfig(): String = withContext(Dispatchers.IO) {
        try {
            if (REMOTE_CONFIG_URL.isBlank()) throw IOException("REMOTE_CONFIG_URL is blank, cannot fetch remote config")
            Log.d(TAG, "开始获取远程配置: $REMOTE_CONFIG_URL")
            val config = String(get(REMOTE_CONFIG_URL))
            Log.d(TAG, "成功获取配置: $config")
            config
        } catch (e: Exception) {
            Log.e(TAG, "获取远程配置失败: ${e.message}")
            throw e
        }
    }

    /**
     * 将JSON转换为特定类型
     */
    inline fun <reified T> parseJson(json: String): T {
        return Gson().fromJson(json, object : TypeToken<T>() {}.type)
    }

    /**
     * 获取并解析单个游戏信息
     * @param id 游戏 ID
     */
    suspend fun getGameIdInfo(id: String): Result<GameConfigItem> = withContext(Dispatchers.IO) {
        // 先检查网络状态
        if (!isNetworkAvailable) {
            Log.e(TAG, "网络不可用，无法获取游戏信息")
            return@withContext Result.failure(IOException("网络不可用"))
        }

        val url = "${BASE_URL}/getGameIdInfo/$id"
        var attempt = 0
        var lastException: Exception? = null

        while (attempt < MAX_RETRIES) {
            try {
                Log.d(TAG, "尝试获取游戏信息 (${attempt + 1}/$MAX_RETRIES): $url")

                val request = Request.Builder()
                    .url(url)
                    .get()
                    .build()

                val response = suspendCancellableCoroutine<String> { continuation ->
                    httpClient.newCall(request).enqueue(object : Callback {
                        override fun onFailure(call: Call, e: IOException) {
                            if (!continuation.isCompleted) {
                                continuation.resumeWithException(e)
                            }
                        }

                        override fun onResponse(call: Call, response: okhttp3.Response) {
                            if (!continuation.isCompleted) {
                                if (!response.isSuccessful) {
                                    continuation.resumeWithException(IOException("HTTP ${response.code}"))
                                    return
                                }

                                try {
                                    val responseBody = response.body?.string()
                                    if (responseBody != null) {
                                        continuation.resume(responseBody)
                                    } else {
                                        continuation.resumeWithException(IOException("Empty response"))
                                    }
                                } catch (e: Exception) {
                                    continuation.resumeWithException(e)
                                }
                            }
                        }
                    })

                    continuation.invokeOnCancellation {
                        httpClient.dispatcher.cancelAll()
                    }
                }

                // 解析JSON
                val gameInfo = parseJson<GameConfigItem>(response)
                Log.d(TAG, "成功获取游戏信息: $gameInfo")
                return@withContext Result.success(gameInfo)

            } catch (e: Exception) {
                lastException = e
                Log.e(TAG, "获取游戏信息失败 (${attempt + 1}/$MAX_RETRIES): ${e.message}")
                attempt++

                if (attempt < MAX_RETRIES) {
                    val delayTime = RETRY_DELAY_MILLIS * attempt
                    Log.d(TAG, "等待 ${delayTime}ms 后重试")
                    delay(delayTime)
                }
            }
        }

        Log.e(TAG, "获取游戏信息失败，已达到最大重试次数")
        return@withContext Result.failure(lastException ?: IOException("未知错误"))
    }

    /**
     * 获取并解析游戏列表
     */
    suspend fun getGameList(): Result<List<GameConfigItem>> = withContext(Dispatchers.IO) {
        if (REMOTE_CONFIG_URL.isBlank()) {
            Log.w(TAG, "REMOTE_CONFIG_URL is blank, cannot fetch game list")
            return@withContext Result.failure(IOException("REMOTE_CONFIG_URL is blank"))
        }
         var attempt = 0
         var lastException: Exception? = null

         while (attempt < MAX_RETRIES) {
            try {
                Log.d(TAG, "尝试获取游戏列表 (${attempt + 1}/$MAX_RETRIES)")

                // 使用专门针对此请求配置的客户端
                val client = httpClient.newBuilder()
                    .connectTimeout(TIMEOUT_MILLIS, TimeUnit.MILLISECONDS)
                    .readTimeout(TIMEOUT_MILLIS, TimeUnit.MILLISECONDS)
                    .writeTimeout(TIMEOUT_MILLIS, TimeUnit.MILLISECONDS)
                    .build()

                val request = Request.Builder()
                    .url(REMOTE_CONFIG_URL) // 旧的配置文件URL（可能被动态覆盖）
                    .get()
                    .build()

                // 执行请求
                val response = suspendCancellableCoroutine<String> { continuation ->
                    client.newCall(request).enqueue(object : Callback {
                        override fun onFailure(call: Call, e: IOException) {
                            if (!continuation.isCompleted) {
                                continuation.resumeWithException(e)
                            }
                        }

                        override fun onResponse(call: Call, response: okhttp3.Response) {
                            if (!continuation.isCompleted) {
                                if (!response.isSuccessful) {
                                    continuation.resumeWithException(IOException("HTTP ${response.code}"))
                                    return
                                }

                                try {
                                    val responseBody = response.body?.string()
                                    if (responseBody != null) {
                                        continuation.resume(responseBody)
                                    } else {
                                        continuation.resumeWithException(IOException("Empty response"))
                                    }
                                } catch (e: Exception) {
                                    continuation.resumeWithException(e)
                                }
                            }
                        }
                    })

                    continuation.invokeOnCancellation {
                        client.dispatcher.cancelAll()
                    }
                }

                // 解析JSON - 支持两种格式：
                //  1) 旧格式：{ "params": {...}, "gamelist": [ ... ] }
                //  2) 新格式：{ "success": true, "data": { "params": {...}, "gamelist": [ ... ] } }
                val gson = Gson()
                val parsedList: List<GameConfigItem> = try {
                    val jsonElement: JsonElement = gson.fromJson(response, JsonElement::class.java)

                    if (!jsonElement.isJsonObject) {
                        throw IOException("配置格式错误：顶层不是 JSON 对象")
                    }

                    val rootObj: JsonObject = jsonElement.asJsonObject

                    // 兼容新结构：如果存在 data 对象，则真正的配置在 data 下
                    val container: JsonObject = if (rootObj.has("data") && rootObj.get("data").isJsonObject) {
                        rootObj.getAsJsonObject("data")
                    } else {
                        rootObj
                    }

                    // 必须存在 params
                    val paramsObj = container.getAsJsonObject("params")
                        ?: throw IOException("配置中缺少 'params' 字段")

                    val env = paramsObj.getAsJsonPrimitive("env")?.asString ?: ""
                    val betaUrl = paramsObj.getAsJsonPrimitive("betaUrl")?.asString
                    val resUrl = paramsObj.getAsJsonPrimitive("resUrl")?.asString
                    val gameSdkUrl = paramsObj.getAsJsonPrimitive("gameSdkUrl")?.asString
                    val gameSdkName = paramsObj.getAsJsonPrimitive("gameSdkName")?.asString
                    val gameConfigUrl = paramsObj.getAsJsonPrimitive("gameConfigUrl")?.asString

                    val sdkVersion = paramsObj.getAsJsonPrimitive("sdkVersion")?.asString

                    val chosenBase = if (env.lowercase().trim() == "beta") {
                        betaUrl ?: resUrl ?: BASE_URL
                    } else {
                        resUrl ?: betaUrl ?: BASE_URL
                    }

                    updateBaseUrls(chosenBase, gameSdkUrl, sdkVersion, gameSdkName, gameConfigUrl)

                    // 必须存在 gamelist
                    val listElement = container.getAsJsonArray("gamelist")
                        ?: throw IOException("配置中缺少 'gamelist' 字段或它不是数组")

                    val type = object : TypeToken<List<GameConfigItem>>() {}.type
                    gson.fromJson(listElement, type)
                } catch (e: Exception) {
                    Log.e(TAG, "解析游戏列表失败", e)
                    throw e
                }

                Log.d(TAG, "成功获取游戏列表: ${parsedList.size} 个游戏")
                return@withContext Result.success(parsedList)

            } catch (e: Exception) {
                lastException = e
                Log.e(TAG, "获取游戏列表失败 (${attempt + 1}/$MAX_RETRIES): ${e.message}")
                attempt++

                if (attempt < MAX_RETRIES) {
                    val delayTime = RETRY_DELAY_MILLIS * attempt
                    Log.d(TAG, "等待 ${delayTime}ms 后重试")
                    delay(delayTime)
                }
            }
        }

        Log.e(TAG, "获取游戏列表失败，已达到最大重试次数")
        return@withContext Result.failure(lastException ?: IOException("未知错误"))
    }

    /**
     * 获取 SDK
     */
    suspend fun fetchSDK(): Result<ByteArray> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "开始获取 SDK: $SDK_URL")
            val bytes = get(SDK_URL)
            Log.d(TAG, "成功获取 SDK，大小: ${bytes.size} 字节")
            Result.success(bytes)
        } catch (e: Exception) {
            Log.e(TAG, "获取 SDK 失败: ${e.message}")
            Result.failure(e)
        }
    }

    /**
     * 健康检查：调用 BASE_URL/health 并解析 {"status":"ok", ...}
     * 返回 true 表示服务可用
     */
    suspend fun checkHealth(): Boolean = withContext(Dispatchers.IO) {
        try {
            val base = BASE_URL
            if (base.isBlank()) {
                Log.w(TAG, "BASE_URL blank, cannot check health")
                return@withContext false
            }

            val healthUrl = if (base.endsWith("/")) "${base}health" else "${base}/health"
            Log.d(TAG, "health check: $healthUrl")

            // 使用短超时的 OkHttp 客户端副本
            val client = httpClient.newBuilder()
                .connectTimeout(3000, TimeUnit.MILLISECONDS)
                .readTimeout(3000, TimeUnit.MILLISECONDS)
                .writeTimeout(3000, TimeUnit.MILLISECONDS)
                .build()

            return@withContext suspendCancellableCoroutine<Boolean> { cont ->
                val req = Request.Builder().url(healthUrl).get().build()
                client.newCall(req).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        Log.w(TAG, "health request failed: ${e.message}")
                        if (!cont.isCompleted) cont.resume(false)
                    }

                    override fun onResponse(call: Call, response: okhttp3.Response) {
                        if (cont.isCompleted) return
                        try {
                            if (!response.isSuccessful) {
                                Log.w(TAG, "health responded non-200: ${response.code}")
                                cont.resume(false)
                                return
                            }

                            val body = response.body?.string()
                            if (body.isNullOrBlank()) {
                                Log.w(TAG, "health response empty, code=${response.code}")
                                cont.resume(false)
                                return
                            }

                            Log.d(TAG, "health response code=${response.code}, body=$body")

                            // 尝试解析 JSON 中的 status 字段；如果解析失败但响应中包含 "ok" 字样，也视为通过（更宽松的判断，减少误报）
                            try {
                                val gson = Gson()
                                val je = gson.fromJson(body, JsonObject::class.java)
                                val status = je.getAsJsonPrimitive("status")?.asString
                                val ok = status?.lowercase() == "ok"
                                Log.d(TAG, "health status parsed: $status, ok=$ok")
                                if (ok) {
                                    cont.resume(true)
                                } else {
                                    // 如果解析出来不是 ok，则尝试通过简单文本匹配作为回退
                                    val fallbackOk = body.lowercase().contains("ok") || body.lowercase().contains("\"status\":\"ok\"")
                                    Log.d(TAG, "health fallback check: $fallbackOk")
                                    cont.resume(fallbackOk)
                                }
                            } catch (e: Exception) {
                                Log.w(TAG, "health parse failed, trying fallback text match", e)
                                val fallbackOk = body.lowercase().contains("ok") || body.lowercase().contains("\"status\":\"ok\"")
                                Log.d(TAG, "health fallback check after parse failure: $fallbackOk")
                                cont.resume(fallbackOk)
                            }
                         } catch (e: Exception) {
                             Log.w(TAG, "health handler error", e)
                             if (!cont.isCompleted) cont.resume(false)
                         }
                     }
                 })

                 cont.invokeOnCancellation { client.dispatcher.cancelAll() }
             }
         } catch (e: Exception) {
             Log.w(TAG, "health check exception", e)
             false
         }
    }

    /**
     * 执行GET请求 - 使用OkHttp和非阻塞协程实现
     */
    suspend fun get(url: String): ByteArray = withContext(Dispatchers.IO) {
        var attempt = 0
        var lastException: Exception? = null

        while (attempt < MAX_RETRIES) {
            try {
                Log.d(TAG, "尝试 GET 请求 (${attempt + 1}/$MAX_RETRIES): $url")

                return@withContext suspendCancellableCoroutine { continuation ->
                    val request = Request.Builder()
                        .url(url)
                        .get()
                        .build()

                    httpClient.newCall(request).enqueue(object : Callback {
                        override fun onFailure(call: Call, e: IOException) {
                            if (!continuation.isCompleted) {
                                Log.e(TAG, "OkHttp请求失败: ${e.message}")
                                continuation.resumeWithException(e)
                            }
                        }

                        override fun onResponse(call: Call, response: okhttp3.Response) {
                            if (!continuation.isCompleted) {
                                if (!response.isSuccessful) {
                                    continuation.resumeWithException(
                                        IOException("HTTP error: ${response.code}")
                                    )
                                    return
                                }

                                try {
                                    val bytes = response.body?.bytes() ?: ByteArray(0)
                                    Log.d(TAG, "GET 请求成功，响应长度: ${bytes.size}")
                                    continuation.resume(bytes)
                                } catch (e: Exception) {
                                    continuation.resumeWithException(e)
                                }
                            }
                        }
                    })

                    continuation.invokeOnCancellation {
                        // 取消请求
                        httpClient.dispatcher.cancelAll()
                    }
                }
            } catch (e: Exception) {
                lastException = e
                Log.e(TAG, "GET 请求失败 (${attempt + 1}/$MAX_RETRIES): ${e.message}")
                attempt++

                if (attempt < MAX_RETRIES) {
                    val delayTime = RETRY_DELAY_MILLIS * attempt
                    Log.d(TAG, "等待 ${delayTime}ms 后重试")
                    delay(delayTime)
                }
            }
        }

        throw lastException ?: IOException("请求失败，已达到最大重试次数")
    }

    /**
     * 检查网络类型
     */
    fun getNetworkType(): NetworkType {
        val network = connectivityManager.activeNetwork ?: return NetworkType.NONE
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return NetworkType.NONE

        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> NetworkType.WIFI
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> NetworkType.CELLULAR
            else -> NetworkType.OTHER
        }
    }

    /**
     * 获取网络信号强度
     */
    fun getSignalStrength(): Int {
        // TODO: 实现信号强度检测
        return 0
    }

    /**
     * 下载文件并显示进度
     */
    suspend fun downloadFile(
        url: String,
        targetFile: File,
        onProgress: (Float) -> Unit
    ): Result<File> = withContext(Dispatchers.IO) {
        try {
            val connection = URL(url).openConnection() as HttpURLConnection
            connection.connect()

            val fileLength = connection.contentLength
            var downloadedLength = 0L

            targetFile.parentFile?.mkdirs()

            connection.inputStream.use { input ->
                FileOutputStream(targetFile).use { output ->
                    val buffer = ByteArray(8192)
                    var read: Int

                    while (input.read(buffer).also { read = it } != -1) {
                        output.write(buffer, 0, read)
                        downloadedLength += read

                        // 更新进度
                        val progress = downloadedLength.toFloat() / fileLength
                        onProgress(progress)
                    }
                }
            }

            Result.success(targetFile)
        } catch (e: Exception) {
            Log.e(TAG, "文件下载失败: $url", e)
            Result.failure(e)
        }
    }

    /**
     * Apply params (env/betaUrl/resUrl/gameSdkUrl/gameConfigUrl) coming from remote or local config
     * This allows callers (e.g. DataManager when loading from assets fallback) to update base URLs
     */
    fun applyRemoteParams(
        env: String?,
        betaUrl: String?,
        resUrl: String?,
        gameSdkUrl: String?,
        sdkVersion: String?,
        gameSdkName: String? = null,
        gameConfigUrl: String? = null
    ) {
        try {
            val chosenBase = if (env?.lowercase()?.trim() == "beta") {
                betaUrl ?: resUrl ?: BASE_URL
            } else {
                resUrl ?: betaUrl ?: BASE_URL
            }
            updateBaseUrls(chosenBase, gameSdkUrl, sdkVersion, gameSdkName, gameConfigUrl)
        } catch (e: Exception) {
            Log.e(TAG, "applyRemoteParams failed", e)
        }
    }

    companion object {
        private const val TAG = "NetManager"
        // 默认 base（当远程配置不可用时的回退）
        private var BASE_URL: String = ""
        // 远程配置地址，基于 base（可能为空，表示不去请求远端）
        private var REMOTE_CONFIG_URL: String = ""
        // sdk 地址（会在解析远程配置后被覆盖）
        @Volatile
        private var SDK_URL: String = ""
        // sdk 存储的文件名（默认 sdk.min.js，仅作为本地文件名使用，真实名称由远端 gameSdkName 决定）
        @Volatile
        private var SDK_FILE_NAME: String = "sdk.min.js"

        // 远程 SDK 版本（默认 0.0.0）
        @Volatile
        private var REMOTE_SDK_VERSION: String = "0.0.0"
        private const val TIMEOUT_MILLIS = 30_000L
        private const val MAX_RETRIES = 3
        private const val RETRY_DELAY_MILLIS = 1000L

        // Update base urls dynamically when params provided by remote config
        private fun updateBaseUrls(
            chosenBase: String?,
            gameSdkUrl: String?,
            sdkVersion: String?,
            gameSdkName: String?,
            gameConfigUrl: String? = null
        ) {
            if (!chosenBase.isNullOrBlank()) {
                BASE_URL = chosenBase.trimEnd('/')
                // 如果提供了 gameConfigUrl，则优先使用；否则沿用 BASE_URL + /gameconfig
                REMOTE_CONFIG_URL = if (!gameConfigUrl.isNullOrBlank()) {
                    if (gameConfigUrl.startsWith("http")) {
                        gameConfigUrl
                    } else {
                        "${BASE_URL}/${gameConfigUrl.trimStart('/')}"
                    }
                } else {
                    "${BASE_URL}/gameconfig"
                }
            }
            // 解析并构建 SDK_URL：优先使用远端提供的 gameSdkUrl + gameSdkName
            SDK_URL = resolveSdkUrl(gameSdkUrl, gameSdkName)

            if (!sdkVersion.isNullOrBlank()) {
                REMOTE_SDK_VERSION = sdkVersion
            }
            if (!gameSdkName.isNullOrBlank()) {
                // 仅决定本地文件名，不做任何拼接或后缀修改
                SDK_FILE_NAME = gameSdkName
            }

            Log.d(
                TAG,
                "Updated BASE_URL=$BASE_URL, SDK_URL=$SDK_URL, REMOTE_CONFIG_URL=$REMOTE_CONFIG_URL, REMOTE_SDK_VERSION=$REMOTE_SDK_VERSION, SDK_FILE_NAME=$SDK_FILE_NAME"
            )
        }

        // Provide getters for other components
        fun getSdkUrlInternal(): String = SDK_URL
        fun getRemoteSdkVersionInternal(): String = REMOTE_SDK_VERSION
        fun getSdkFileNameInternal(): String = SDK_FILE_NAME
        fun getRemoteConfigUrlInternal(): String = REMOTE_CONFIG_URL

        /**
         * 根据远端配置构建 SDK_URL：
         * - 如果 gameSdkUrl 为空，则回退到 BASE_URL/sdk/sdk.min.js（兼容旧配置）
         * - 如果 gameSdkUrl 为绝对 URL：
         *      - 若以 / 结尾或末段不包含 .，且提供了 gameSdkName，则将文件名拼接到路径后；
         *      - 否则认为它已经是完整文件 URL，直接使用。
         * - 如果 gameSdkUrl 为相对路径：
         *      - 同样根据是否看起来像“目录”决定是否拼接 gameSdkName。
         */
        private fun resolveSdkUrl(gameSdkUrl: String?, gameSdkName: String?): String {
            if (gameSdkUrl.isNullOrBlank()) {
                return if (BASE_URL.isNotBlank()) "${BASE_URL}/sdk/sdk.min.js" else ""
            }

            fun looksLikeDirectory(path: String): Boolean {
                val trimmed = path.trim()
                if (trimmed.endsWith("/")) return true
                val last = trimmed.substringAfterLast('/')
                return !last.contains('.') // 没有扩展名，视为目录
            }

            return try {
                if (gameSdkUrl.startsWith("http")) {
                    val base = gameSdkUrl.trimEnd('/')
                    if (!gameSdkName.isNullOrBlank() && looksLikeDirectory(gameSdkUrl)) {
                        "$base/${gameSdkName}"
                    } else {
                        gameSdkUrl
                    }
                } else {
                    val path = gameSdkUrl.trimStart('/')
                    val basePath = if (BASE_URL.isNotBlank()) "${BASE_URL}/${path}".trimEnd('/') else path.trimEnd('/')
                    if (!gameSdkName.isNullOrBlank() && looksLikeDirectory(gameSdkUrl)) {
                        "$basePath/${gameSdkName}"
                    } else {
                        basePath
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "resolveSdkUrl failed, fallback to default path", e)
                if (BASE_URL.isNotBlank()) "${BASE_URL}/sdk/sdk.min.js" else ""
            }
        }
     }

    /**
     * 返回配置的 base url（不带末尾斜杠）
     */
    fun getBaseUrl(): String = BASE_URL

    fun getSdkUrl(): String = Companion.getSdkUrlInternal()
    fun getRemoteSdkVersion(): String = Companion.getRemoteSdkVersionInternal()
    fun getSdkFileName(): String = Companion.getSdkFileNameInternal()
    fun getGameConfigUrl(): String = Companion.getRemoteConfigUrlInternal()

     /**
      * 将一个相对路径解析为完整资源 URL（会去掉起始的斜杠以防重复）
      */
     fun resolveResourceUrl(relativePath: String): String {
         val path = relativePath.trimStart('/')
         return "${BASE_URL}/$path"
     }
 }

/**
 * 网络类型枚举
 */
enum class NetworkType {
    NONE,
    WIFI,
    CELLULAR,
    OTHER
}
