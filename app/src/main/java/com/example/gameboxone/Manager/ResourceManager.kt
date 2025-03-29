package com.example.gameboxone.manager

import android.content.Context
import android.content.res.AssetManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import androidx.annotation.DrawableRes

import com.example.gameboxone.base.AppDatabase
import com.example.gameboxone.data.exception.GameResourceException
import com.example.gameboxone.data.model.Custom

import com.example.gameboxone.data.state.GameResourceState
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.URL
import java.util.concurrent.ConcurrentHashMap
import java.util.zip.ZipInputStream
import javax.inject.Inject
import javax.inject.Singleton


/**
 * 资源管理器
 * 负责管理游戏资源，包括游戏数据和图片资源的加载和缓存
 */
@Singleton
class ResourceManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val networkManager: NetManager,  // 注入 NetworkManager 实例
    private val database: AppDatabase,
) {

    private val TAG = "ResourceManager"
    // 图片缓存，使用线程安全的 ConcurrentHashMap
    private val imageCache = ConcurrentHashMap<String, Bitmap>()

    /**
     * 检查游戏资源是否可用，按照"已下载->本地缓存->保底目录->网络下载"的顺序
     * 这是优化后的资源获取流程，提供了更完善的检查机制
     */
    suspend fun ensureGameResourceAvailable(game: Custom.HotGameData): GameResourceState {
        try {
            Log.d(TAG, "检查游戏资源: ${game.name}")
            
            // 0. 首先检查游戏的isLocal标记，该标记表示游戏已在某个位置下载完成
            if (game.isLocal && game.localPath != "") {
                val localPathFile = File(game.localPath)
                // 验证本地路径是否有效
                if (isValidGameFolder(localPathFile)) {
                    Log.d(TAG, "游戏已在本地路径: ${game.localPath}")
                    return GameResourceState.Available(game.localPath.toString())
                } else {
                    // isLocal标记为true，但实际文件不存在，需要重置状态
                    Log.w(TAG, "游戏标记为本地可用，但目录不存在或无效: ${game.localPath}")
                    // 重置游戏本地状态
                    updateGameLocalStatus(game.id, "", false)
                }
            }

            // 1. 检查应用私有缓存目录
            if (isGameAvailableInLocalCache(game)) {
                // 游戏在应用私有缓存中
                val localPath = getLocalCachePath(game)
                Log.d(TAG, "游戏在应用缓存中: $localPath")
                
                // 更新游戏的本地状态
                finalizeGameLoad(game, localPath)
                
                return GameResourceState.Available(localPath)
            }

            // 2. 检查保底目录(assets)
            if (isGameAvailableInBackupDirectory(game)) {
                // 游戏在保底目录中，需要加载到缓存
                Log.d(TAG, "游戏在保底目录中，准备加载到缓存")
                return GameResourceState.LoadingFromBackup
            }

            // 3. 如果都没有，需要从网络下载
            Log.d(TAG, "游戏资源不存在，需要从网络下载")
            return GameResourceState.NeedDownload(
                gameName = game.name,
                downloadUrl = game.downloadUrl,
                targetPath = getTargetDownloadPath(game)
            )

        } catch (e: Exception) {
            Log.e(TAG, "检查游戏资源时出错", e)
            return GameResourceState.Error("检查游戏资源失败: ${e.message}")
        }
    }

    /**
     * 检查是否为有效的游戏目录
     */
    private fun isValidGameFolder(folder: File): Boolean {
        return folder.exists() &&
                folder.isDirectory &&
                File(folder, "index.html").exists() &&
                File(folder, ".downloaded").exists()  // 添加下载完成标记检查
    }

    /**
     * 检查游戏是否在 assets 中
     */
    private fun isGameInAssets(gameFolder: String): Boolean {
        return try {
            val assetList = context.assets.list("games/$gameFolder")
            assetList?.isNotEmpty() == true &&
                    context.assets.open("games/$gameFolder/index.html").use { true }
        } catch (e: Exception) {
            false
        }
    }

    private suspend fun copyGameFromAssets(gameFolder: String, targetDir: File) {
        withContext(Dispatchers.IO) {
            try {
                val assetManager = context.assets
                val sourcePath = "games/$gameFolder"

                // 创建目标目录
                targetDir.mkdirs()

                // 复制所有游戏文件
                copyAssetFolder(assetManager, sourcePath, targetDir)

                Log.d(TAG, "游戏资源从 assets 复制完成: $gameFolder")
            } catch (e: Exception) {
                throw GameResourceException("复制游戏资源失败: ${e.message}")
            }
        }
    }

    private fun copyAssetFolder(assetManager: AssetManager, path: String, targetDir: File) {
        assetManager.list(path)?.forEach { fileName ->
            val subPath = "$path/$fileName"
            val targetFile = File(targetDir, fileName)

            try {
                if (isAssetFolder(assetManager, subPath)) {
                    targetFile.mkdirs()
                    copyAssetFolder(assetManager, subPath, targetFile)
                } else {
                    assetManager.open(subPath).use { input ->
                        FileOutputStream(targetFile).use { output ->
                            input.copyTo(output)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "复制资源失败: $subPath", e)
                throw e
            }
        }
    }

    private fun isAssetFolder(assetManager: AssetManager, path: String): Boolean {
        return try {
            assetManager.list(path)?.isNotEmpty() == true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 下载并安装游戏
     */
    suspend fun downloadAndInstallGame(
        downloadUrl: String,
        targetPath: String,
        onProgress: (Float) -> Unit
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val downloadFile = File(context.cacheDir, "game_download.zip")
            Log.d(TAG, "开始下载游戏: $downloadUrl 到 ${downloadFile.absolutePath}")

            // 下载游戏包
            networkManager.downloadFile(downloadUrl, downloadFile, onProgress).getOrThrow()
            Log.d(TAG, "游戏下载完成，文件大小: ${downloadFile.length()} 字节")

            // 创建临时解压目录
            val tempDir = File(context.cacheDir, "temp_extract")
            tempDir.deleteRecursively() // 清理旧文件
            tempDir.mkdirs()
            Log.d(TAG, "创建临时解压目录: ${tempDir.absolutePath}")

            // 解压到临时目录
            var fileCount = 0
            ZipInputStream(downloadFile.inputStream()).use { zip ->
                Log.d(TAG, "开始解压ZIP文件到临时目录")
                var entry = zip.nextEntry
                while (entry != null) {
                    if (!entry.name.startsWith("__MACOSX")) { // 忽略 Mac 系统文件
                        val file = File(tempDir, entry.name)
                        if (entry.isDirectory) {
                            file.mkdirs()
                            Log.v(TAG, "创建目录: ${file.absolutePath}")
                        } else {
                            file.parentFile?.mkdirs()
                            FileOutputStream(file).use { output ->
                                zip.copyTo(output)
                                fileCount++
                                if (fileCount % 50 == 0) {
                                    Log.d(TAG, "已解压 $fileCount 个文件...")
                                }
                            }
                        }
                    }
                    entry = zip.nextEntry
                }
                Log.d(TAG, "解压完成，共解压 $fileCount 个文件")
            }

            // 列出临时目录中的内容
            Log.d(TAG, "临时目录内容: ${tempDir.listFiles()?.joinToString { it.name }}")

            // 查找实际的游戏目录（包含 index.html 的目录）
            val gameDir = findGameDirectory(tempDir)
            if (gameDir == null) {
                Log.e(TAG, "未找到有效的游戏目录，临时目录内容: ${tempDir.listFiles()?.joinToString { it.name }}")
                throw Exception("未找到有效的游戏目录")
            }
            Log.d(TAG, "找到游戏根目录: ${gameDir.absolutePath}")

            // 创建最终目标目录
            val targetDir = File(targetPath)
            targetDir.deleteRecursively() // 清理旧文件
            targetDir.mkdirs()
            Log.d(TAG, "创建最终目标目录: ${targetDir.absolutePath}")

            // 将游戏文件移动到目标目录
            Log.d(TAG, "将游戏文件复制到目标目录")
            gameDir.listFiles()?.forEach { file ->
                file.copyRecursively(File(targetDir, file.name), true)
                Log.d(TAG, "复制: ${file.name} -> ${targetDir.absolutePath}/${file.name}")
            }

            // 添加下载完成标记
            File(targetDir, ".downloaded").createNewFile()
            Log.d(TAG, "添加下载完成标记")

            // 清理临时文件
            downloadFile.delete()
            tempDir.deleteRecursively()
            Log.d(TAG, "清理临时文件完成")

            // 验证安装
            Log.d(TAG, "验证游戏安装: ${targetDir.absolutePath}")
            Log.d(TAG, "目标目录内容: ${targetDir.listFiles()?.joinToString { it.name }}")
            val indexFile = File(targetDir, "index.html")
            Log.d(TAG, "检查index.html: 存在=${indexFile.exists()}")
            
            if (!isValidGameFolder(targetDir)) {
                Log.e(TAG, "游戏资源验证失败: index.html存在=${File(targetDir, "index.html").exists()}, .downloaded存在=${File(targetDir, ".downloaded").exists()}")
                throw Exception("游戏资源不完整")
            }
            
            // 注意：这里不直接更新数据库，因为我们不知道游戏ID
            // 调用者应该在获取结果后调用updateGameLocalStatus方法

            Result.success(targetDir.absolutePath)
        } catch (e: Exception) {
            Log.e(TAG, "游戏下载安装失败", e)
            Result.failure(e)
        }
    }

    /**
     * 查找包含index.html的游戏目录
     * 会递归查找，找出最接近根目录的有效游戏目录
     */
    private fun findGameDirectory(dir: File): File? {
        // 如果当前目录包含index.html，直接返回
        if (File(dir, "index.html").exists()) {
            return dir
        }

        // 获取所有子目录
        val subDirs = dir.listFiles { file -> file.isDirectory }
        if (subDirs != null) {
            // 遍历所有子目录
            for (subDir in subDirs) {
                Log.d(TAG, "检查子目录: ${subDir.name}")
                // 递归调用查找子目录
                val result = findGameDirectory(subDir)
                if (result != null) {
                    return result
                }
            }
        }
        // 没有找到合适的目录，返回null
        return null
    }

    /**
     * 获取下载信息
     */
    fun getDownloadInfo(game: Custom.HotGameData): DownloadInfo {
        return DownloadInfo(
            downloadUrl = game.downloadUrl,
            targetPath = getTargetDownloadPath(game)
        )
    }

    /**
     * 检查游戏是否在本地缓存中可用
     */
    private fun isGameAvailableInLocalCache(game: Custom.HotGameData): Boolean {
        val cacheDir = File(context.getDir("games", Context.MODE_PRIVATE), getGameResPath(game))
        return isValidGameFolder(cacheDir)
    }

    /**
     * 检查游戏是否在保底目录中可用
     */
    private fun isGameAvailableInBackupDirectory(game: Custom.HotGameData): Boolean {
        // 检查应用的 assets/games 目录
        val backupPath = getBackupGamePath(game)
        return isGameInAssets(backupPath)
    }

    /**
     * 获取本地缓存路径
     */
    private fun getLocalCachePath(game: Custom.HotGameData): String {
        return File(context.getDir("games", Context.MODE_PRIVATE), getGameResPath(game)).absolutePath
    }

    /**
     * 获取游戏资源路径（统一处理路径格式）
     */
    private fun getGameResPath(game: Custom.HotGameData): String {
        return game.gameRes.trim('/')
    }

    /**
     * 获取游戏在备份目录中的路径
     */
    private fun getBackupGamePath(game: Custom.HotGameData): String {
        return getGameResPath(game)
    }

    /**
     * 获取保底目录路径
     */
    private fun getBackupDirectoryPath(game: Custom.HotGameData): String {
        return "games/${getBackupGamePath(game)}"
    }

    /**
     * 获取下载目标路径
     */
    private fun getTargetDownloadPath(game: Custom.HotGameData): String {
        return getLocalCachePath(game)
    }

    /**
     * 从保底目录复制游戏文件到缓存
     */
    private suspend fun copyGameFilesFromBackup(backupPath: String, targetPath: String) {
        withContext(Dispatchers.IO) {
            val targetDir = File(targetPath)
            targetDir.mkdirs()
            
            copyGameFromAssets(backupPath.substringAfter("games/"), targetDir)
            
            // 添加下载完成标记
            File(targetDir, ".downloaded").createNewFile()
        }
    }

    /**
     * 更新游戏本地状态到数据库
     */
    private suspend fun updateGameLocalStatus(gameId: String, localPath: String, isLocal: Boolean) {
        withContext(Dispatchers.IO) {
            try {
                // 获取游戏配置DAO
                val gameConfigDao = database.gameConfigDao()
                
                // 根据gameId获取游戏记录
                val game = gameConfigDao.getGameById(gameId)
                
                if (game != null) {
                    // 更新游戏本地状态
                    val updatedGame = game.copy(
                        isLocal = isLocal,
                        localPath = localPath
                    )
                    
                    // 保存更新后的游戏记录
                    gameConfigDao.update(updatedGame)
                    
                    Log.d(TAG, "已更新游戏本地状态: gameId=$gameId, isLocal=$isLocal, localPath=$localPath")
                } else {
                    Log.w(TAG, "未找到游戏记录，无法更新本地状态: gameId=$gameId")
                }
            } catch (e: Exception) {
                Log.e(TAG, "更新游戏本地状态失败: gameId=$gameId", e)
            }
        }
    }
    
    /**
     * 从ID获取游戏数据并更新缓存状态
     * @param gameId 游戏ID
     * @param localPath 本地路径
     * @param isLocal 是否本地可用
     */
    suspend fun updateGameStatus(gameId: String, localPath: String, isLocal: Boolean) {
        updateGameLocalStatus(gameId, localPath, isLocal)
    }


    /**
     * 从备份目录加载游戏资源到本地缓存
     * @param game 游戏数据
     * @return 成功时返回本地路径，失败时返回错误
     */
    suspend fun loadFromBackupDirectory(game: Custom.HotGameData): Result<String> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "从备份目录加载游戏: ${game.name}")
            
            // 获取目标路径
            val targetPath = getTargetDownloadPath(game)
            val targetDir = File(targetPath)
            
            // 确保目录存在
            targetDir.mkdirs()
            
            // 获取游戏在assets中的路径（使用统一的路径获取方法）
            val assetPath = getBackupDirectoryPath(game).substringAfter("games/")
            
            try {
                Log.d(TAG, "从assets复制游戏资源: $assetPath -> $targetPath")
                
                // 复制游戏资源
                copyGameFromAssets(assetPath, targetDir)
                
                // 添加下载完成标记
                File(targetDir, ".downloaded").createNewFile()
                
                // 验证游戏目录是否有效
                if (!isValidGameFolder(targetDir)) {
                    Log.e(TAG, "游戏资源验证失败: $targetPath")
                    targetDir.deleteRecursively() // 清理失败的文件
                    return@withContext Result.failure(GameResourceException("游戏资源验证失败"))
                }
                
                // 更新游戏的本地状态
                finalizeGameLoad(game, targetPath)
                
                Log.d(TAG, "从备份目录加载游戏成功: ${game.name}, 路径: $targetPath")
                return@withContext Result.success(targetPath)
            } catch (e: Exception) {
                Log.e(TAG, "复制游戏资源失败", e)
                // 清理可能部分复制的文件
                targetDir.deleteRecursively()
                return@withContext Result.failure(e)
            }
        } catch (e: Exception) {
            Log.e(TAG, "从备份目录加载游戏失败: ${game.name}", e)
            return@withContext Result.failure(e)
        }
    }
    
    /**
     * 检查游戏是否需要更新
     * @param game 游戏数据
     * @return 是否需要更新
     */
    private suspend fun isGameUpdateRequired(game: Custom.HotGameData): Boolean {
        // 已下载的游戏会有一个版本信息文件
        val localVersionFile = File(getLocalCachePath(game), ".version")
        
        if (!localVersionFile.exists()) {
            return true // 没有版本文件，认为需要更新
        }
        
        try {
            val localVersion = localVersionFile.readText().trim().toIntOrNull() ?: 0
            val remoteVersion = game.patch // 假设patch字段代表版本号
            
            return remoteVersion > localVersion
        } catch (e: Exception) {
            Log.e(TAG, "检查游戏更新失败: ${game.name}", e)
            return false // 出错时保守处理，不强制更新
        }
    }

    /**
     * 保存游戏版本信息
     */
    private fun saveGameVersion(game: Custom.HotGameData, localPath: String) {
        try {
            val versionFile = File(localPath, ".version")
            versionFile.writeText((game.patch).toString())
            Log.d(TAG, "保存游戏版本信息: ${game.name}, 版本: ${game.patch}")
        } catch (e: Exception) {
            Log.e(TAG, "保存游戏版本信息失败: ${game.name}", e)
        }
    }

    /**
     * 完成游戏加载并更新状态
     */
    private suspend fun finalizeGameLoad(game: Custom.HotGameData, localPath: String) {
        updateGameLocalStatus(game.id , localPath, true)
        saveGameVersion(game, localPath)
        Log.d(TAG, "游戏加载完成并更新状态: ${game.name}, 路径: $localPath")
    }

    /**
     * 下载信息数据类
     */
    data class DownloadInfo(
        val downloadUrl: String,
        val targetPath: String
    )
}
