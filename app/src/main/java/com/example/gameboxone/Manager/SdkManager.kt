package com.example.gameboxone.manager

import android.content.Context
import android.util.Log
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
    private val eventManager: EventManager
) {
    private val TAG = "SdkManager"

    // SDK缓存目录 - 修正为app_games而非files/games
    private val sdkDir by lazy {
        context.getDir("games", Context.MODE_PRIVATE).apply {
            if (!exists()) mkdirs()
        }
    }

    // SDK文件
    private val sdkFile by lazy {
        File(sdkDir, "sdk.min.js")
    }

    /**
     * 预加载SDK，在应用启动时调用
     */
    suspend fun preloadSdk() {
        try {
            Log.d(TAG, "开始预加载SDK...")
            if (netManager.isNetworkAvailable) {
                // 尝试从网络获取最新SDK
                val result = fetchSdkFromNetwork()
                if (result) {
                    Log.d(TAG, "从网络加载SDK成功")
                    eventManager.emitDataEvent(DataEvent.SdkLoaded)
                    return
                }
            }
            
            // 网络获取失败，检查本地缓存
            if (sdkFile.exists() && sdkFile.length() > 0) {
                // 使用本地缓存
                Log.d(TAG, "使用本地SDK缓存: ${sdkFile.absolutePath}")
                eventManager.emitDataEvent(DataEvent.SdkLoaded)
            } else {
                // 没有缓存，使用assets中的保底SDK
                Log.d(TAG, "本地缓存不存在，从assets加载保底SDK")
                loadFallbackSdkFromAssets()
                eventManager.emitDataEvent(DataEvent.SdkLoaded)
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
        return sdkFile.absolutePath
    }

    /**
     * 从网络获取SDK
     * @return 是否成功
     */
    private suspend fun fetchSdkFromNetwork(): Boolean = withContext(Dispatchers.IO) {
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
                        saveSdkToFile(sdkBytes)
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
     * 将SDK保存到文件
     */
    private suspend fun saveSdkToFile(sdkBytes: ByteArray) = withContext(Dispatchers.IO) {
        try {
            // 确保目录存在
            sdkDir.mkdirs()
            
            // 先写入临时文件
            val tempFile = File(sdkDir, "sdk.temp.js")
            tempFile.writeBytes(sdkBytes)
            
            // 验证临时文件有效性 - 使用更宽松的验证
            if (isValidJavaScriptFile(tempFile)) {
                // 替换旧文件
                if (sdkFile.exists()) {
                    sdkFile.delete()
                }
                val renamed = tempFile.renameTo(sdkFile)
                Log.d(TAG, "SDK已保存到文件: ${sdkFile.absolutePath}, 重命名结果: $renamed")
                
                // 确认保存成功
                if (!sdkFile.exists() || sdkFile.length() == 0L) {
                    throw IOException("保存SDK文件失败：重命名后的文件不存在或为空")
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
     */
    private suspend fun loadFallbackSdkFromAssets() = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "从assets加载保底SDK...")
            
            // 打开assets中的文件
            context.assets.open("sdk.min.js").use { inputStream ->
                val sdkBytes = inputStream.readBytes()
                Log.d(TAG, "从assets读取SDK文件, 大小: ${sdkBytes.size} 字节")
                
                // 保存到文件
                saveSdkToFile(sdkBytes)
            }
            
            Log.d(TAG, "保底SDK加载成功")
        } catch (e: Exception) {
            Log.e(TAG, "加载保底SDK失败", e)
            throw e
        }
    }

    /**
     * 验证是否为有效的JavaScript文件
     * 使用更宽松的验证规则
     */
    private fun isValidJavaScriptFile(file: File): Boolean {
        if (!file.exists()) {
            Log.e(TAG, "文件不存在")
            return false
        }
        
        if (file.length() < 100) { // 最低100字节
            Log.e(TAG, "文件太小: ${file.length()} 字节")
            return false
        }
        
        try {
            // 读取文件前1KB内容进行检查
            val content = file.inputStream().use { input ->
                val buffer = ByteArray(minOf(1024, file.length().toInt()))
                input.read(buffer)
                String(buffer, Charsets.UTF_8)
            }
            
            // 检查是否包含典型JavaScript特征
            val isValidJs = content.contains("function") || 
                           content.contains("var ") || 
                           content.contains("let ") || 
                           content.contains("const ") ||
                           content.contains("=function") ||
                           content.contains("window.")
                           
            Log.d(TAG, "JavaScript文件验证结果: $isValidJs, 文件大小: ${file.length()} 字节")
            return isValidJs
        } catch (e: Exception) {
            Log.e(TAG, "验证JavaScript文件失败", e)
            return false
        }
    }
}