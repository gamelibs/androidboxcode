package com.example.gameboxone.manager

import android.content.Context
import android.graphics.Bitmap
import com.example.gameboxone.AppLog as Log
import android.util.LruCache
import com.example.gameboxone.R
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class IconCacheManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val netManager: NetManager
) {
    private val TAG = "IconCacheManager"
    
    private val iconDir by lazy {
        File(context.cacheDir, "gamesicon").apply {
            if (!exists()) mkdirs()
        }
    }

    // 创建一个记录当前正在下载的图标的Map
    private val activeDownloads = ConcurrentHashMap<String, Boolean>()

    // 添加内存缓存
    private val memoryCache = LruCache<String, Bitmap>(
        (Runtime.getRuntime().maxMemory() / 1024 / 8).toInt()
    )

    /**
     * 获取游戏图标
     * 优先从缓存读取，如果没有则下载
     * @param gameId 游戏ID
     * @param iconUrl 游戏图标URL或相对路径
     * @param downIconUrl 可选的下载图标完整URL
     */
    suspend fun getGameIcon(gameId: Int, iconUrl: String, downIconUrl: String? = null): File? = coroutineScope {
        try {
            // Ensure we save icons under the dedicated iconDir and use only the filename
            // If `iconUrl` is empty (new config uses only `downicon`), derive filename from downIconUrl
            val iconFileName = when {
                iconUrl.isNotBlank() -> iconUrl.substringAfterLast('/')
                !downIconUrl.isNullOrBlank() -> downIconUrl.substringAfterLast('/')
                else -> null
            }

            if (iconFileName == null) {
                Log.e(TAG, "无法确定图标文件名: iconUrl='$iconUrl', downIconUrl='$downIconUrl'")
                return@coroutineScope null
            }

            val iconFile = File(iconDir, iconFileName)
            Log.d(TAG, "开始获取图标: $gameId, URL: $iconUrl, 文件路径: ${iconFile.absolutePath}")

            // 添加文件有效性检查
            if (iconFile.exists() && iconFile.length() > 0) {
                Log.d(TAG, "从缓存读取图标: $gameId")
                return@coroutineScope iconFile
            }

            // 尝试使用 downIconUrl (优先), 或使用 iconUrl（可能为绝对或相对路径）
            val fullIconUrl = getValidIconUrl(iconUrl, downIconUrl)
            if (fullIconUrl == null) {
                Log.e(TAG, "无效的图标URL: iconUrl=$iconUrl, downIconUrl=$downIconUrl")
                return@coroutineScope null
            }

            // 检查是否已经在下载此URL
            if (activeDownloads.putIfAbsent(fullIconUrl, true) != null) {
                Log.d(TAG, "已有相同图标正在下载中，等待完成: $fullIconUrl")
                // 等待直到下载完成(检查文件是否存在)
                var waitCount = 0
                while (!iconFile.exists() && waitCount < 10) {
                    delay(200) // 等待200毫秒再检查
                    waitCount++
                }

                if (iconFile.exists() && iconFile.length() > 0) {
                    Log.d(TAG, "等待下载完成后读取图标: $gameId")
                    activeDownloads.remove(fullIconUrl)
                    return@coroutineScope iconFile
                }
            }

            try {
                // 下载图标
                Log.d(TAG, "开始下载图标: $fullIconUrl")
                val iconBytes = netManager.get(fullIconUrl)

                if (iconBytes.isEmpty()) {
                    Log.e(TAG, "下载的图标数据为空")
                    activeDownloads.remove(fullIconUrl)
                    return@coroutineScope null
                }

                // 确保目录存在
                iconFile.parentFile?.mkdirs()

                // 写入文件
                iconFile.writeBytes(iconBytes)
                Log.d(TAG, "图标已保存到: ${iconFile.absolutePath}, 大小: ${iconBytes.size}字节")

                activeDownloads.remove(fullIconUrl)
                return@coroutineScope iconFile
            } catch (e: Exception) {
                Log.e(TAG, "下载图标失败: $fullIconUrl", e)
                activeDownloads.remove(fullIconUrl)
                return@coroutineScope null
            }
        } catch (e: Exception) {
            Log.e(TAG, "获取游戏图标失败: $gameId, URL: $iconUrl", e)
            return@coroutineScope null
        }
    }

    /**
     * 获取有效的图标URL，优先使用downIconUrl
     */
    private fun getValidIconUrl(iconUrl: String, downIconUrl: String?): String? {
        // 优先使用 downIconUrl（若为绝对 URL 则直接使用，若为相对路径则使用 netManager.resolveResourceUrl）
        val down = downIconUrl?.trim()
        if (!down.isNullOrBlank()) {
            val resolved = if (down.startsWith("http://") || down.startsWith("https://")) {
                down
            } else {
                // 允许 downIconUrl 以或不以斜杠开头，例如 "downicon/MergeHeroes.png" 或 "/downicon/MergeHeroes.png"
                netManager.resolveResourceUrl(down.trimStart('/'))
            }
            Log.d(TAG, "Resolved icon URL from downIconUrl: $resolved (original='$down')")
            return resolved
        }

        // 如果没有 downIconUrl，则检查 iconUrl（同样支持绝对或相对路径）
        val icon = iconUrl.trim()
        if (icon.isNotBlank()) {
            val resolved = if (icon.startsWith("http://") || icon.startsWith("https://")) {
                icon
            } else {
                netManager.resolveResourceUrl(icon.trimStart('/'))
            }
            Log.d(TAG, "Resolved icon URL from iconUrl: $resolved (original='$icon')")
            return resolved
        }

        Log.w(TAG, "Both iconUrl and downIconUrl are blank after trimming: iconUrl='$iconUrl', downIconUrl='$downIconUrl'")
        return null
    }

    /**
     * 清理过期图标
     */
    suspend fun cleanupIcons(currentGameIds: Set<String>) = withContext(Dispatchers.IO) {
        try {
            iconDir.listFiles()?.forEach { file ->
                val gameId = file.nameWithoutExtension.removePrefix("icon_")
                if (gameId !in currentGameIds) {
                    file.delete()
                    Log.d(TAG, "删除过期图标: ${file.name}")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "清理图标缓存失败", e)
        }
    }
}
