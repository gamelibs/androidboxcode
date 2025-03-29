package com.example.gameboxone.manager

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.util.Log
import com.example.gameboxone.data.model.GameConfigItem
import com.google.gson.Gson
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
    private val DEFAULT_TIMEOUT = 10 * 1000L // 10秒

    // 连接管理器延迟初始化
    private val connectivityManager by lazy {
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    }

    // 网络可用状态
    private var _isNetworkAvailable = AtomicBoolean(false)
    val isNetworkAvailable: Boolean get() = _isNetworkAvailable.get()

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
            Log.d(TAG, "Network is available")
            _isNetworkAvailable.set(true)
        }

        override fun onLost(network: Network) {
            super.onLost(network)
            Log.d(TAG, "Network is lost")
            _isNetworkAvailable.set(false)
        }
    }

    init {
        setupNetworkCallback()
    }

    private fun setupNetworkCallback() {
        try {
            val networkRequest = NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
                .addTransportType(NetworkCapabilities.TRANSPORT_CELLULAR)
                .build()

            connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
            Log.d(TAG, "Network callback registered successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to setup network callback", e)
        }
    }


    /**
     * 获取远程配置
     */
    suspend fun fetchRemoteConfig(): String = withContext(Dispatchers.IO) {
        try {
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
     * 获取并解析游戏列表
     * 支持自定义超时时间
     */

    /**
     * 获取并解析游戏列表
     */
    suspend fun getGameList(): Result<List<GameConfigItem>> = withContext(Dispatchers.IO) {
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
                    .url(REMOTE_CONFIG_URL) // 使用 https://app.gameslog.top/gameconfig
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

                // 解析JSON
                val gameList = parseJson<List<GameConfigItem>>(response)
                Log.d(TAG, "成功获取游戏列表: ${gameList.size} 个游戏")
                return@withContext Result.success(gameList)

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

    companion object {
        private const val TAG = "NetManager"
        private const val BASE_URL = "https://app.gameslog.top/"
        private const val REMOTE_CONFIG_URL = "${BASE_URL}gameconfig"  // 修改为正确的配置文件URL
        private const val SDK_URL = "${BASE_URL}sdk/sdk.min.js"
        private const val TIMEOUT_MILLIS = 30_000L
        private const val MAX_RETRIES = 3
        private const val RETRY_DELAY_MILLIS = 1000L
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
