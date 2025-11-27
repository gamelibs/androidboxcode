package com.example.gameboxone.manager

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.base.UiMessage
import com.example.gameboxone.event.DataEvent
import com.example.gameboxone.service.MessageService
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * SDK管理器
 * 负责SDK的加载、缓存和更新
 */
@Singleton
class SdkManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val netManager: NetManager,
    private val messageService: MessageService,
    private val eventManager: EventManager,
    private val database: com.example.gameboxone.base.AppDatabase
) {
    private val TAG = "SdkManager"

    // SDK缓存目录 - 修正为app_games而非files/games
    private val sdkDir by lazy {
        context.getDir("games", Context.MODE_PRIVATE).apply {
            if (!exists()) mkdirs()
        }
    }

    // SDK文件（可能为空，如果未配置则返回 null）
    // 注意：不再使用默认的 "sdk.min.js"，文件名必须由远程 params 或本地配置提供
    private val sdkFile: File?
        get() {
            val name = netManager.getSdkFileName()
            return if (name.isNullOrBlank()) null else File(sdkDir, name)
        }

    // SDK 版本文件
    private val sdkVersionFile by lazy {
        File(sdkDir, "sdk.version")
    }

    /**
     * 预加载SDK，在应用启动时调用
     *
     * @param remoteVersion 可选的远端 SDK 版本号；如果提供，将作为期望版本参与版本比对与持久化
     */
    suspend fun preloadSdk(remoteVersion: String? = null) {
        try {
            Log.d(TAG, "开始预加载SDK... remoteVersion=$remoteVersion")

            // 如果提供了远端版本号，并且本地版本与之相同，则直接复用本地缓存，避免重复下载
            if (!remoteVersion.isNullOrBlank()) {
                try {
                    val localVersion = readLocalSdkVersion()
                    if (remoteVersion == localVersion) {
                        val localFile = sdkFile
                        if (localFile != null && localFile.exists() && localFile.length() > 0) {
                            Log.d(
                                TAG,
                                "预加载SDK: 远端版本与本地版本相同 (version=$remoteVersion)，且本地缓存可用，跳过网络下载"
                            )
                            eventManager.emitDataEvent(DataEvent.SdkLoaded)
                            return
                        } else {
                            Log.d(
                                TAG,
                                "预加载SDK: 版本相同但本地文件不存在或无效，将继续按正常流程尝试下载/回退"
                            )
                        }
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "预加载SDK: 比较本地/远端版本失败，继续按正常流程处理", e)
                }
            }

            // 直接根据配置的 SDK_URL 尝试下载（无版本对比）
            try {
                val sdkUrl = netManager.getSdkUrl()
                if (!sdkUrl.isNullOrBlank() && netManager.isNetworkAvailable) {
                    Log.d(TAG, "尝试从网络下载 SDK: $sdkUrl")
                    val result = fetchSdkFromNetwork(remoteVersion)
                    if (result) {
                        Log.d(TAG, "从网络加载SDK成功")
                        eventManager.emitDataEvent(DataEvent.SdkLoaded)
                        return
                    } else {
                        Log.w(TAG, "从网络下载 SDK 失败，回退到本地/ assets")
                    }
                } else {
                    Log.w(TAG, "无效的 SDK_URL 或网络不可用，跳过网络下载")
                }
            } catch (e: Exception) {
                Log.w(TAG, "尝试下载 SDK 时出错，回退到本地/ assets", e)
            }

            // 如果本地缓存存在，直接使用本地缓存
            val localFile = sdkFile
            if (localFile != null && localFile.exists() && localFile.length() > 0) {
                Log.d(TAG, "使用本地SDK缓存: ${localFile.absolutePath}")
                eventManager.emitDataEvent(DataEvent.SdkLoaded)
                return
            }

            // 本地没有缓存，尝试从 assets 加载保底 SDK（仅尝试使用 netManager 配置的文件名）
            Log.d(TAG, "本地缓存不存在，尝试从 assets 加载保底 SDK（仅使用配置的文件名）")
            val fallbackOk = loadFallbackSdkFromAssets()
            if (fallbackOk) {
                eventManager.emitDataEvent(DataEvent.SdkLoaded)
            } else {
                Log.w(TAG, "未找到保底 SDK，跳过 SDK 加载（等待手动触发或后续更新）")
            }
        } catch (e: Exception) {
            Log.e(TAG, "预加载SDK失败", e)
            messageService.showMessage(
                UiMessage.Error(
                    message = "SDK加载失败: ${e.message}"
                )
            )
            eventManager.emitDataEvent(DataEvent.Error("SDK加载失败: ${e.message}"))
        }
    }

    /**
     * 获取SDK文件路径
     * @return SDK文件路径
     */
    fun getSdkPath(): String {
        return sdkFile?.absolutePath ?: ""
    }

    /**
     * 从网络获取SDK
     * @return 是否成功
     */
    private suspend fun fetchSdkFromNetwork(expectedRemoteVersion: String? = null): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "从网络获取SDK...")
            // 使用NetManager获取SDK
            val result = netManager.fetchSDK()
            result.fold(
                onSuccess = { sdkBytes ->
                    if (sdkBytes.isEmpty()) {
                        Log.e(TAG, "获取的SDK数据为空")
                        false
                    } else {
                        // 保存SDK到文件
                        // 确保 netManager 已提供 SDK 文件名，否则无法保存
                        val configuredName = netManager.getSdkFileName()
                        if (configuredName.isNullOrBlank()) {
                            Log.e(TAG, "未配置 SDK 文件名，无法保存从网络获取的 SDK")
                            return@fold false
                        }
                        val targetFile = File(sdkDir, configuredName)
                        // write to temp then move
                        saveSdkToFileWithTargetName(sdkBytes, targetFile)
                        // 保存版本信息（如果有）
                        expectedRemoteVersion?.let {
                            writeLocalSdkVersion(it)
                            // 同步写入数据库
                            try {
                                database.appConfigDao().insertConfig(
                                    com.example.gameboxone.data.model.AppConfigItem(
                                        name = "sdk_version",
                                        value = it
                                    )
                                )
                                Log.d(TAG, "已将远程 SDK 版本写入 DB: sdk_version=$it")
                            } catch (e: Exception) {
                                Log.w(TAG, "将远程 SDK 版本写入 DB 失败", e)
                            }
                        }
                        true
                    }
                },
                onFailure = { error ->
                    Log.e(TAG, "从网络获取SDK失败", error)
                    false
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "从网络获取SDK时发生异常", e)
            false
        }
    }

    /**
     * 将 SDK 保存到指定目标文件（原子替换）
     */
    private suspend fun saveSdkToFileWithTargetName(sdkBytes: ByteArray, targetFile: File) = withContext(Dispatchers.IO) {
        try {
            // 确保目录存在
            sdkDir.mkdirs()

            // 先写入临时文件
            val tempFile = File(sdkDir, "sdk.temp.js")
            tempFile.writeBytes(sdkBytes)

            // 验证临时文件有效性 - 使用更宽松的验证
            if (isValidJavaScriptFile(tempFile)) {
                // 替换旧文件（如果名字不同也要删除旧文件）
                if (targetFile.exists()) {
                    targetFile.delete()
                }
                val renamed = tempFile.renameTo(targetFile)
                Log.d(TAG, "SDK已保存到文件: ${targetFile.absolutePath}, 重命名结果: $renamed")
                // 记录到日志：保存目录和文件
                Log.d(TAG, "保存成功: path=${targetFile.absolutePath}, size=${targetFile.length()} bytes")

                // 若存在远程版本信息，则写入到数据库 app_config 表，key使用 sdk_version
                try {
                    val currentVersion = readLocalSdkVersion()
                    // 在 suspend 环境中直接调用 DAO 的 suspend 方法，避免使用 runBlocking
                    try {
                        database.appConfigDao().insertConfig(
                            com.example.gameboxone.data.model.AppConfigItem(
                                name = "sdk_version",
                                value = currentVersion
                            )
                        )
                        Log.d(TAG, "已将 SDK 版本写入 DB: sdk_version=$currentVersion")
                    } catch (e: Exception) {
                        Log.w(TAG, "写入 SDK 版本到 DB 失败", e)
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "记录 SDK 路径/版本到 DB 时发生异常", e)
                }
            } else {
                val fileSize = tempFile.length()
                val firstBytes = tempFile.readBytes().take(100).joinToString(" ") { "%02X".format(it) }
                Log.e(TAG, "无效的SDK文件，大小: $fileSize 字节, 前100字节: $firstBytes")
                tempFile.delete()
                throw IOException("无效的JavaScript文件 (大小: $fileSize 字节)")
            }
        } catch (e: Exception) {
            Log.e(TAG, "保存SDK文件失败", e)
            throw e
        }
    }

    /**
     * 从assets加载保底SDK
     * 行为说明（中文）：
     *  - 仅尝试使用 NetManager 提供的 SDK 文件名（gameSdkName）作为 assets 名称；
     *  - 如果未配置文件名或 assets 中不存在该文件，会在主线程弹出对话提示用户并抛出 FileNotFoundException；
     *  - 成功加载则保存为本地文件并写入默认版本 0.0.0。
     */
    private suspend fun loadFallbackSdkFromAssets(): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "从assets加载保底SDK...")

            // 仅使用 NetManager 提供的文件名
            val configuredName = netManager.getSdkFileName()
            if (configuredName.isNullOrBlank()) {
                Log.e(TAG, "未配置 SDK 文件名，无法从 assets 加载保底 SDK")
                // 在主线程弹窗提示用户并抛出异常
                withContext(Dispatchers.Main) {
                    messageService.showMessage(
                        com.example.gameboxone.base.UiMessage.Dialog(
                            title = "缺少保底 SDK 配置",
                            message = "未配置 SDK 文件名 (gameSdkName)。请在配置中指定保底 SDK 名称或联系开发者。",
                            confirmAction = {}
                        )
                    )
                }
                return@withContext false
            }

            try {
                context.assets.open(configuredName).use { inputStream ->
                    val sdkBytes = inputStream.readBytes()
                    Log.d(TAG, "从assets读取保底SDK文件 '$configuredName', 大小: ${sdkBytes.size} 字节")

                    // 保存到文件
                    val targetFile = File(sdkDir, configuredName)
                    saveSdkToFileWithTargetName(sdkBytes, targetFile)
                    // assets 中没有版本信息，写入默认 0.0.0
                    writeLocalSdkVersion("0.0.0")
                    try {
                        database.appConfigDao().insertConfig(
                            com.example.gameboxone.data.model.AppConfigItem(
                                name = "sdk_version",
                                value = "0.0.0"
                            )
                        )
                        Log.d(TAG, "已将保底 SDK 版本写入 DB: sdk_version=0.0.0")
                    } catch (e: Exception) {
                        Log.w(TAG, "写入保底 SDK 版本到 DB 失败", e)
                    }
                    Log.d(TAG, "保底SDK加载成功")
                    return@withContext true
                }
            } catch (e: java.io.FileNotFoundException) {
                Log.e(TAG, "assets 中未找到保底 SDK 文件: $configuredName", e)
                // 在主线程弹窗提示用户并返回 false
                withContext(Dispatchers.Main) {
                    messageService.showMessage(
                        com.example.gameboxone.base.UiMessage.Dialog(
                            title = "缺少保底 SDK",
                            message = "应用缺少保底 SDK 文件 ($configuredName)。请将该文件放入 assets 目录后重启应用。",
                            confirmAction = {}
                        )
                    )
                }
                return@withContext false
            }
        } catch (e: Exception) {
            Log.e(TAG, "加载保底SDK时发生异常", e)
            return@withContext false
        }
    }

    // Helper: 简单校验 JavaScript 文件是否有效（宽松）
    private fun isValidJavaScriptFile(file: File): Boolean {
        return try {
            if (!file.exists() || file.length() < 20) return false
            val sample = file.inputStream().use { stream ->
                val bytes = ByteArray(256)
                val read = stream.read(bytes)
                String(bytes, 0, if (read > 0) read else 0)
            }
            // 检查是否包含常见 JS 片段
            sample.contains("function ") || sample.contains("var ") || sample.contains("const ") || sample.contains("let ") || sample.contains("=>")
        } catch (e: Exception) {
            Log.w(TAG, "isValidJavaScriptFile 检查失败", e)
            false
        }
    }

    // Helper: 读取本地 SDK 版本（如果不存在返回 "0.0.0"）
    private fun readLocalSdkVersion(): String {
        return try {
            if (!sdkVersionFile.exists()) return "0.0.0"
            sdkVersionFile.readText().trim().ifBlank { "0.0.0" }
        } catch (e: Exception) {
            Log.w(TAG, "读取本地 SDK 版本失败", e)
            "0.0.0"
        }
    }

    // Helper: 写入本地 SDK 版本（简单覆盖）
    private fun writeLocalSdkVersion(version: String) {
        try {
            sdkVersionFile.parentFile?.mkdirs()
            sdkVersionFile.writeText(version)
            Log.d(TAG, "写入本地 SDK 版本: $version")
        } catch (e: Exception) {
            Log.w(TAG, "写入本地 SDK 版本失败", e)
        }
    }

}
