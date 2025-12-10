package com.example.gameboxone.manager

import android.content.Context
import android.content.res.AssetManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.example.gameboxone.AppLog as Log
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

            // 打印更多游戏信息用于调试
            Log.d(TAG, "游戏详细信息: ID=${game.id}, 名称=${game.name}, URL=${game.downloadUrl}, gameRes=${game.gameRes}")

            // 点击游戏时，基于版本文件与 patch 打印一次“是否需要更新”的提示日志（仅用于调试）
            try {
                val versionFile = File(getLocalCachePath(game.gameRes), ".version")
                val localVersion = if (versionFile.exists()) {
                    versionFile.readText().trim().toIntOrNull() ?: 0
                } else {
                    null
                }
                val remoteVersion = game.patch
                val needUpdate = localVersion == null || remoteVersion > localVersion
                Log.d(
                    TAG,
                    "点击游戏时版本检查: id=${game.id}, name=${game.name}, localVersion=${localVersion ?: "null"}, remoteVersion=$remoteVersion, needUpdate=$needUpdate"
                )
            } catch (e: Exception) {
                Log.w(TAG, "点击游戏时版本检查日志失败: ${game.name}", e)
            }

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
            if (isGameAvailableInLocalCache(game.gameRes)) {
                // 游戏在应用私有缓存中
                val localPath = getLocalCachePath(game.gameRes)
                Log.d(TAG, "游戏在应用缓存中: $localPath")

                // 更新游戏的本地状态
                finalizeGameLoad(game.id, game.name, game.patch, localPath)

                return GameResourceState.Available(localPath)
            }

            // 2. 检查保底目录(assets) - 增强检测逻辑
            val backupAvailable = checkBackupAvailability(game)
            if (backupAvailable) {
                // 游戏在保底目录中，需要加载到缓存
                Log.d(TAG, "游戏在保底目录中，准备加载到缓存")
                return GameResourceState.LoadingFromBackup
            }

            // 3. 如果都没有，但配置中提供了下载URL（可能是相对路径），尝试解析为完整URL后下载
            if (game.downloadUrl.isNotBlank()) {
                var resolvedUrl = game.downloadUrl

                // 若为相对路径，使用 NetManager 的解析逻辑（基于已加载的 params）
                if (!(resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://"))) {
                    try {
                        resolvedUrl = networkManager.resolveResourceUrl(resolvedUrl)
                    } catch (e: Exception) {
                        Log.w(TAG, "解析相对下载URL失败，尝试拼接base: ${game.downloadUrl}", e)
                        resolvedUrl = ""
                    }

                    if (resolvedUrl.isBlank()) {
                        val base = try { networkManager.getBaseUrl() } catch (e: Exception) { "" }
                        if (base.isNotBlank()) resolvedUrl = "${base.trimEnd('/')}/${game.downloadUrl.trimStart('/')}"
                    }
                }

                if (resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://")) {
                    Log.d(TAG, "游戏资源不存在，将从网络下载: $resolvedUrl")
                    return GameResourceState.NeedDownload(
                        gameName = game.name,
                        downloadUrl = resolvedUrl,
                        targetPath = getTargetDownloadPath(game.gameRes)
                    )
                }
            }

            // 4. URL无效且没有本地资源，返回错误
            Log.e(TAG, "游戏资源不存在且下载URL无效: ${game.downloadUrl}")
            return GameResourceState.Error("游戏资源不存在且下载URL无效")
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
     * 解析并返回下载信息（确保相对路径会被解析为完整URL）
     * 返回类型为 project 中定义的 Custom.DownloadInfo
     */
    fun resolveDownloadInfo(downloadUrl: String, gameRes: String): Custom.DownloadInfo {
        // 如果传入的是空字符串，保持为空以便上层决定是否从 assets 加载
        if (downloadUrl.isBlank()) return Custom.DownloadInfo("", "", getTargetDownloadPath(gameRes))

        // 如果已经是完整 URL，直接返回
        if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
            return Custom.DownloadInfo("", downloadUrl, getTargetDownloadPath(gameRes))
        }

        // 否则将相对路径解析为完整 URL（使用 NetManager 提供的 BASE_URL）
        var resolved = try {
            networkManager.resolveResourceUrl(downloadUrl)
        } catch (e: Exception) {
            Log.w(TAG, "解析相对下载地址失败，返回原始地址: $downloadUrl", e)
            ""
        }

        if (resolved.isBlank()) {
            val base = try { networkManager.getBaseUrl() } catch (e: Exception) { "" }
            if (base.isNotBlank()) resolved = "${base.trimEnd('/')}/${downloadUrl.trimStart('/')}"
        }

        return Custom.DownloadInfo("", resolved, getTargetDownloadPath(gameRes))
    }

    /**
     * 检查游戏是否在本地缓存中可用
     */
    private fun isGameAvailableInLocalCache(gameRes: String): Boolean {
        val cacheDir = File(context.getDir("games", Context.MODE_PRIVATE), getGameResPath(gameRes))
        return isValidGameFolder(cacheDir)
    }

    /**
     * 检查游戏是否在保底目录中可用
     */
    private fun isGameAvailableInBackupDirectory(gameRes: String): Boolean {
        // 检查应用的 assets/games 目录
        val backupPath = getBackupGamePath(gameRes)
        return isGameInAssets(backupPath)
    }

    /**
     * 获取本地缓存路径
     */
    private fun getLocalCachePath(gameRes: String): String {
        return File(context.getDir("games", Context.MODE_PRIVATE), getGameResPath(gameRes)).absolutePath
    }

    /**
     * 获取游戏资源路径（统一处理路径格式）
     */
    private fun getGameResPath(gameRes: String): String {
        return gameRes.trim('/')
    }

    /**
     * 获取游戏在备份目录中的路径
     */
    private fun getBackupGamePath(gameRes: String): String {
        return getGameResPath(gameRes)
    }

    /**
     * 获取保底目录路径
     */
    private fun getBackupDirectoryPath(gameRes: String): String {
        return "games/${getBackupGamePath(gameRes)}"
    }

    /**
     * 获取下载目标路径
     */
    private fun getTargetDownloadPath(gameRes: String): String {
        return getLocalCachePath(gameRes)
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
     * 增强版检查备份资源可用性，支持多种命名方式
     */
    private fun checkBackupAvailability(game: Custom.HotGameData): Boolean {
        val possiblePaths = listOf(
            game.gameRes,                  // 原始gameRes
            "game_${game.id}",             // 基于ID
            game.name.replace(" ", "_"),   // 基于名称(空格替换为下划线)
            game.name                      // 直接使用名称
        )

        Log.d(TAG, "检查可能的备份路径: $possiblePaths")

        for (path in possiblePaths) {
            if (path.isBlank()) continue

            // 检查目录格式
            if (isGameInAssets(path)) {
                Log.d(TAG, "找到有效的备份资源目录: $path")
                return true
            }

            // 检查ZIP格式
            try {
                val zipExists = context.assets.list("games")?.contains("$path.zip") == true
                if (zipExists) {
                    Log.d(TAG, "找到有效的备份资源ZIP: $path.zip")
                    return true
                }
            } catch (e: Exception) {
                Log.e(TAG, "检查ZIP资源失败: $path", e)
            }
        }

        Log.d(TAG, "未找到有效的备份资源")
        return false
    }

    /**
     * 增强版从assets提取游戏，支持多种可能的路径
     */
    private suspend fun extractGameFromAssetsEnhanced(
        game: Custom.HotGameData,
        targetPath: String,
        onProgress: (Float) -> Unit
    ): Result<String> = withContext(Dispatchers.IO) {
        // 可能的资源路径
        val possiblePaths = listOf(
            game.gameRes,                  // 原始gameRes
            "game_${game.id}",             // 基于ID
            game.name.replace(" ", "_"),   // 基于名称(空格替换为下划线)
            game.name                      // 直接使用名称
        )

        Log.d(TAG, "尝试提取游戏，检查可能的路径: $possiblePaths")

        for (path in possiblePaths.filter { it.isNotBlank() }) {
            try {
                // 检查目录格式资源
                if (isGameInAssets(path)) {
                    Log.d(TAG, "找到游戏目录资源: games/$path")

                    // 从目录复制
                    copyGameFromAssets(path, File(targetPath))
                    File(targetPath, ".downloaded").createNewFile()

                    // 更新游戏状态
                    finalizeGameLoad(game.id, game.name, game.patch, targetPath)

                    Log.d(TAG, "成功从assets目录提取游戏: ${game.name} 到 $targetPath")
                    return@withContext Result.success(targetPath)
                }

                // 检查ZIP格式资源
                val zipExists = context.assets.list("games")?.contains("$path.zip") == true
                if (zipExists) {
                    Log.d(TAG, "找到游戏ZIP资源: games/$path.zip")

                    // 从ZIP提取
                    val tempFile = File(context.cacheDir, "temp_game.zip")
                    context.assets.open("games/$path.zip").use { input ->
                        tempFile.outputStream().use { output ->
                            input.copyTo(output)
                        }
                    }

                    // 解压ZIP
                    val targetDir = File(targetPath)
                    targetDir.mkdirs()

                    var fileCount = 0
                    ZipInputStream(tempFile.inputStream()).use { zip ->
                        var entry = zip.nextEntry
                        while (entry != null) {
                            if (!entry.name.startsWith("__MACOSX")) {
                                val file = File(targetDir, entry.name)
                                if (entry.isDirectory) {
                                    file.mkdirs()
                                } else {
                                    file.parentFile?.mkdirs()
                                    FileOutputStream(file).use { output ->
                                        zip.copyTo(output)
                                        fileCount++
                                    }
                                }
                            }
                            entry = zip.nextEntry
                        }
                    }

                    // 删除临时文件
                    tempFile.delete()

                    // 添加下载完成标记
                    File(targetPath, ".downloaded").createNewFile()

                    // 更新游戏状态
                    finalizeGameLoad(game.id, game.name, game.patch, targetPath)

                    Log.d(TAG, "成功从assets ZIP提取游戏: ${game.name} 到 $targetPath")
                    return@withContext Result.success(targetPath)
                }
            } catch (e: Exception) {
                Log.e(TAG, "尝试路径 $path 失败", e)
                // 继续尝试下一个路径
            }
        }

        Log.e(TAG, "所有可能的资源路径都失败了")
        return@withContext Result.failure(Exception("未能找到有效的游戏资源"))
    }

    /**
     * 检查游戏是否需要更新
     * @param game 游戏数据
     * @return 是否需要更新
     */
    private suspend fun isGameUpdateRequired(game: Custom.MyGameData): Boolean {
        // 已下载的游戏会有一个版本信息文件
        val localVersionFile = File(getLocalCachePath(game.gameRes), ".version")

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

    /**ensureGameResourceAvailable
     * 保存游戏版本信息
     */
    private fun saveGameVersion(name:String, patch: Int, localPath: String) {
        try {
            val versionFile = File(localPath, ".version")
            versionFile.writeText((patch).toString())
            Log.d(TAG, "保存游戏版本信息: ${name}, 版本: ${patch}")
        } catch (e: Exception) {
            Log.e(TAG, "保存游戏版本信息失败: ${name}", e)
        }
    }

    /**
     * 完成游戏加载并更新状态
     */
    private suspend fun finalizeGameLoad(id:String,name:String,patch: Int, localPath: String) {
        updateGameLocalStatus(id , localPath, true)
        saveGameVersion(name,patch, localPath)
        Log.d(TAG, "游戏加载完成并更新状态: ${name}, 路径: $localPath")
    }

    /**
     * 删除游戏文件
     * @param localPath 游戏本地路径
     */
    suspend fun deleteGameFiles(localPath: String) = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "删除游戏文件: $localPath")
            val gameDir = File(localPath)
            if (gameDir.exists() && gameDir.isDirectory) {
                gameDir.deleteRecursively()
                Log.d(TAG, "游戏文件删除成功")
                true
            } else {
                Log.w(TAG, "游戏目录不存在或不是文件夹: $localPath")
                true // 即使不存在也视为成功
            }
        } catch (e: Exception) {
            Log.e(TAG, "删除游戏文件失败: $localPath", e)
            false
        }
    }

    /**
     * 获取游戏下载目标路径
     * @param gameId 游戏ID
     * @param gameRes 游戏资源路径
     * @return 下载目标路径
     */
    fun getTargetDownloadPath(gameId: String, gameRes: String): String {
        val gameResPath = gameRes.trim('/')
        return File(context.getDir("games", Context.MODE_PRIVATE), gameResPath).absolutePath
    }

    /**
     * 从assets目录提取游戏资源
     * 在网络下载失败或URL无效时使用
     *
     * @param gameId 游戏ID
     * @param gameRes 游戏资源名称
     * @param onProgress 进度回调
     * @return 成功时返回游戏本地路径，失败时返回错误
     */
    suspend fun extractGameFromAssets(
        gameId: String,
        gameRes: String,
        onProgress: (Float) -> Unit
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            // 创建一个模拟的游戏对象，使用增强版方法
            val game = Custom.HotGameData(
                id = gameId,
                name = "",  // 名称可能不需要
                gameId = gameId,
                gameRes = gameRes,
                description = "",
                iconUrl = "",
                downloadUrl = "",
                isLocal = false,
                localPath = "",
                rating = 0,
                patch = 1
            )

            // 获取目标路径
            val targetPath = getTargetDownloadPath(gameRes)

            return@withContext extractGameFromAssetsEnhanced(
                game = game,
                targetPath = targetPath,
                onProgress = onProgress
            )
        } catch (e: Exception) {
            Log.e(TAG, "从assets提取游戏失败", e)
            return@withContext Result.failure(e)
        }
    }

    /**
     * 从备份目录加载游戏资源到本地缓存，但不负责数据库操作
     * @param game 游戏数据
     * @return 成功时返回本地路径，失败时返回错误
     */
    suspend fun loadFromBackupDirectory(game: Custom.HotGameData): Result<String> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "从备份目录加载游戏: ${game.name}")

            // 获取目标路径
            val targetPath = getTargetDownloadPath(game.gameRes)
            val targetDir = File(targetPath)

            // 确保目录存在
            targetDir.mkdirs()

            // 尝试提取游戏从assets - 纯资源操作，不进行数据库更新
            val extractResult = extractGameFromAssetsEnhanced(
                game = game,
                targetPath = targetPath
            )

            // 返回处理结果，由调用者处理数据库更新
            return@withContext extractResult
        } catch (e: Exception) {
            Log.e(TAG, "从备份目录加载游戏失败: ${game.name}", e)
            return@withContext Result.failure(e)
        }
    }

    /**
     * 增强版从assets提取游戏，纯资源操作，不涉及数据库
     */
    private suspend fun extractGameFromAssetsEnhanced(
        game: Custom.HotGameData,
        targetPath: String
    ): Result<String> = withContext(Dispatchers.IO) {
        // 可能的资源路径
        val possiblePaths = listOf(
            game.gameRes,                  // 原始gameRes
            "game_${game.id}",             // 基于ID
            game.name.replace(" ", "_"),   // 基于名称(空格替换为下划线)
            game.name                      // 直接使用名称
        )

        Log.d(TAG, "尝试提取游戏，检查可能的路径: $possiblePaths")

        for (path in possiblePaths.filter { it.isNotBlank() }) {
            try {
                // 检查目录格式资源
                if (isGameInAssets(path)) {
                    Log.d(TAG, "找到游戏目录资源: games/$path")

                    // 从目录复制
                    copyGameFromAssets(path, File(targetPath))
                    File(targetPath, ".downloaded").createNewFile()

                    // 添加版本信息文件
                    saveVersionFile(targetPath, game.patch)

                    Log.d(TAG, "成功从assets目录提取游戏: ${game.name} 到 $targetPath")
                    return@withContext Result.success(targetPath)
                }

                // 检查ZIP格式资源
                val zipExists = context.assets.list("games")?.contains("$path.zip") == true
                if (zipExists) {
                    Log.d(TAG, "找到游戏ZIP资源: games/$path.zip")

                    // 从ZIP提取
                    extractZipFromAssets("games/$path.zip", targetPath)

                    // 添加版本信息文件
                    saveVersionFile(targetPath, game.patch)

                    Log.d(TAG, "成功从assets ZIP提取游戏: ${game.name} 到 $targetPath")
                    return@withContext Result.success(targetPath)
                }
            } catch (e: Exception) {
                Log.e(TAG, "尝试路径 $path 失败", e)
                // 继续尝试下一个路径
            }
        }

        Log.e(TAG, "所有可能的资源路径都失败了")
        return@withContext Result.failure(Exception("未能找到有效的游戏资源"))
    }

    /**
     * 保存游戏版本信息文件
     */
    private fun saveVersionFile(targetPath: String, version: Int) {
        try {
            val versionFile = File(targetPath, ".version")
            versionFile.writeText(version.toString())

            // 同时写入标准版本文件，增加兼容性
            val versionFile2 = File(targetPath, "version.txt")
            versionFile2.writeText(version.toString())
        } catch (e: Exception) {
            Log.e(TAG, "保存版本文件失败", e)
        }
    }

    /**
     * 从assets中解压ZIP文件
     */
    private suspend fun extractZipFromAssets(zipPath: String, targetPath: String) = withContext(Dispatchers.IO) {
        val tempFile = File(context.cacheDir, "temp_game.zip")
        context.assets.open(zipPath).use { input ->
            tempFile.outputStream().use { output ->
                input.copyTo(output)
            }
        }

        // 解压ZIP
        val targetDir = File(targetPath)
        targetDir.mkdirs()

        var fileCount = 0
        ZipInputStream(tempFile.inputStream()).use { zip ->
            var entry = zip.nextEntry
            while (entry != null) {
                if (!entry.name.startsWith("__MACOSX")) {
                    val file = File(targetDir, entry.name)
                    if (entry.isDirectory) {
                        file.mkdirs()
                    } else {
                        file.parentFile?.mkdirs()
                        FileOutputStream(file).use { output ->
                            zip.copyTo(output)
                            fileCount++
                        }
                    }
                }
                entry = zip.nextEntry
            }
        }

        // 添加下载完成标记
        File(targetPath, ".downloaded").createNewFile()

        // 删除临时文件
        tempFile.delete()

        Log.d(TAG, "从ZIP提取了 $fileCount 个文件")
    }

    /**
     * 从assets目录提取游戏资源，纯资源操作无数据库更新
     */
    suspend fun extractGameFromAssets(
        gameId: String,
        gameRes: String,
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            // 创建一个模拟游戏对象用于资源提取
            val game = Custom.HotGameData(
                id = gameId,
                name = "",
                gameId = gameId,
                gameRes = gameRes,
                description = "",
                iconUrl = "",
                downloadUrl = "",
                isLocal = false,
                localPath = "",
                rating = 0,
                patch = 1
            )

            // 获取目标路径
            val targetPath = getTargetDownloadPath(gameRes)

            return@withContext extractGameFromAssetsEnhanced(
                game = game,
                targetPath = targetPath
            )
        } catch (e: Exception) {
            Log.e(TAG, "从assets提取游戏失败", e)
            return@withContext Result.failure(e)
        }
    }
}
