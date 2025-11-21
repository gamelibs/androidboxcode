package com.example.gameboxone.manager

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.base.AppDatabase
import com.example.gameboxone.data.model.Custom
import com.example.gameboxone.data.model.GameConfigItem
import com.example.gameboxone.data.model.MyGameItem
import com.example.gameboxone.event.GameEvent
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 我的游戏管理器
 * 负责管理已安装游戏的增删改查
 */
@Singleton
class MyGameManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val database: AppDatabase,
    private val resourceManager: ResourceManager,
    private val netManager: NetManager,
    private val eventManager: EventManager
) {
    private val TAG = "MyGameManager"
    private val myGameDao = database.myGameDao()

    /**
     * 获取所有已安装游戏的Flow
     * @return 已安装游戏列表的Flow
     */
    fun getAllGamesFlow(): Flow<List<Custom.MyGameData>> {
        return myGameDao.getAllGames().map { games ->
            games.map { mapToMyGameData(it) }
        }
    }

    /**
     * 获取所有已安装游戏
     * @return 已安装游戏列表
     */
    suspend fun getAllGames(): List<Custom.MyGameData> = withContext(Dispatchers.IO) {
        return@withContext myGameDao.getAllGamesList().map { mapToMyGameData(it) }
    }

    /**
     * 根据ID获取游戏
     * @param gameId 游戏ID
     * @return 游戏数据，未找到则返回null
     */
    suspend fun getGameById(gameId: String): Custom.MyGameData? = withContext(Dispatchers.IO) {
        val game = myGameDao.getGameById(gameId) ?: return@withContext null
        return@withContext mapToMyGameData(game)
    }

    /**
     * 检查游戏是否已安装
     * @param gameId 游戏ID
     * @return 是否已安装
     */
    suspend fun isGameInstalled(gameId: String): Boolean = withContext(Dispatchers.IO) {
        return@withContext myGameDao.getGameById(gameId) != null
    }

    /**
     * 添加游戏到我的游戏
     * @param game 从总游戏列表获取的游戏数据
     * @param localPath 游戏本地路径
     * @return 添加是否成功
     */
    suspend fun addGame(game: GameConfigItem, localPath: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val myGame = MyGameItem(
                gameId = game.id.toString(),
                name = game.name,
                icon = game.icon,
                gameRes = game.gameRes,
                description = game.info ?: "暂无描述",
                downloadUrl = game.download,
                localPath = localPath,
                patch = game.patch,
                size = game.size ?: "未知"
            )
            
            myGameDao.insert(myGame)
            Log.d(TAG, "游戏添加成功: ${game.name}")
            
            // 发送游戏安装成功事件
            eventManager.emitGameEvent(GameEvent.GameInstalled(game.id.toString()))
            
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "添加游戏到我的游戏失败: ${game.name}", e)
            return@withContext false
        }
    }

    /**
     * 更新游戏
     * @param gameId 游戏ID
     * @param newLocalPath 新的本地路径
     * @param newPatch 新的补丁版本
     * @return 更新是否成功
     */
    suspend fun updateGame(gameId: String, newLocalPath: String, newPatch: Int): Boolean = withContext(Dispatchers.IO) {
        try {
            val existingGame = myGameDao.getGameById(gameId) ?: return@withContext false
            
            val updatedGame = existingGame.copy(
                localPath = newLocalPath,
                patch = newPatch
            )
            
            myGameDao.update(updatedGame)
            Log.d(TAG, "游戏更新成功: ${existingGame.name}, 新补丁版本: $newPatch")
            
            // 发送游戏更新成功事件
            eventManager.emitGameEvent(GameEvent.GameUpdated(gameId))
            
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "更新游戏失败: $gameId", e)
            return@withContext false
        }
    }

    /**
     * 删除游戏
     * @param gameId 游戏ID
     * @return 删除是否成功
     */
    suspend fun deleteGame(gameId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            // 获取游戏信息
            val game = myGameDao.getGameById(gameId) ?: return@withContext false
            
            // 删除游戏文件
            resourceManager.deleteGameFiles(game.localPath)
            
            // 从数据库中删除
            myGameDao.deleteById(gameId)
            
            Log.d(TAG, "游戏删除成功: ${game.name}")
            
            // 发送游戏删除成功事件
            eventManager.emitGameEvent(GameEvent.GameUninstalled(gameId))
            
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "删除游戏失败: $gameId", e)
            return@withContext false
        }
    }

    /**
     * 下载并安装游戏
     * @param game 游戏数据
     * @param onProgress 下载进度回调
     * @return 安装是否成功
     */
    suspend fun downloadAndInstallGame(
        game: Custom.MyGameData,
        onProgress: (Float) -> Unit
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            // 检查游戏是否已安装
            if (isGameInstalled(game.id)) {
                Log.d(TAG, "游戏已安装，跳过下载: ${game.name}")
                val existingGame = myGameDao.getGameById(game.id)
                return@withContext Result.success(existingGame?.localPath ?: "")
            }
            
            // 尝试的顺序：1. 网络下载  2. 本地资源
            var installPath: String? = null
            var installError: Exception? = null
            
            // 1. 尝试从网络下载
            if (game.downloadUrl.isNotBlank() && game.downloadUrl.startsWith("http")) {
                try {
                    Log.d(TAG, "尝试从网络下载游戏: ${game.name}")
                    val downloadInfo = resourceManager.resolveDownloadInfo(game.downloadUrl, game.gameRes)

                    val downloadResult = resourceManager.downloadAndInstallGame(
                        downloadUrl = downloadInfo.downloadUrl,
                        targetPath = downloadInfo.targetPath,
                        onProgress = onProgress
                    )
                    
                    if (downloadResult.isSuccess) {
                        installPath = downloadResult.getOrThrow()
                        Log.d(TAG, "网络下载成功: ${game.name}")
                    } else {
                        installError = downloadResult.exceptionOrNull() as Exception?
                        Log.w(TAG, "网络下载失败，准备尝试本地资源: ${game.name}", installError)
                    }
                } catch (e: Exception) {
                    installError = e
                    Log.w(TAG, "网络下载异常，准备尝试本地资源: ${game.name}", e)
                }
            } else {
                Log.d(TAG, "URL无效或为空，跳过网络下载: ${game.downloadUrl}")
            }
            
            // 2. 如果网络下载失败，尝试从本地资源获取
            if (installPath == null) {
                try {
                    Log.d(TAG, "尝试从本地资源获取游戏: ${game.name}")
                    val extractResult = resourceManager.extractGameFromAssets(
                        gameId = game.id,
                        gameRes = game.gameRes
                    )
                    
                    if (extractResult.isSuccess) {
                        installPath = extractResult.getOrThrow()
                        Log.d(TAG, "本地资源提取成功: ${game.name}")
                        installError = null
                    } else {
                        if (installError == null) {
                            installError = extractResult.exceptionOrNull() as Exception?
                        }
                        Log.e(TAG, "本地资源提取失败: ${game.name}", extractResult.exceptionOrNull())
                    }
                } catch (e: Exception) {
                    if (installError == null) {
                        installError = e
                    }
                    Log.e(TAG, "本地资源提取异常: ${game.name}", e)
                }
            }
            
            // 3. 如果安装路径存在，创建数据库记录
            if (installPath != null) {
                try {
                    // 创建MyGameItem
                    val myGameItem = MyGameItem(
                        gameId = game.id,
                        name = game.name,
                        icon = game.iconUrl,
                        gameRes = game.gameRes,
                        description = game.description,
                        downloadUrl = game.downloadUrl,
                        localPath = installPath,
                        patch = game.patch,
                        size = game.size ?: "未知大小",
                        installTime = System.currentTimeMillis()
                    )
                    
                    // 保存到数据库
                    myGameDao.insert(myGameItem)
                    
                    // 同时更新GameConfig表
                    updateGameConfig(game.id, installPath, true)
                    
                    // 发送安装成功事件
                    eventManager.emitGameEvent(GameEvent.GameInstalled(game.id))
                    
                    Log.d(TAG, "游戏安装成功: ${game.name}, 路径: $installPath")
                    return@withContext Result.success(installPath)
                } catch (e: Exception) {
                    Log.e(TAG, "创建游戏数据记录失败: ${game.name}", e)
                    // 回滚：删除已下载的文件
                    resourceManager.deleteGameFiles(installPath)
                    return@withContext Result.failure(e)
                }
            } else {
                // 所有方法都失败
                val errorMsg = "游戏安装失败: 无法通过网络或本地资源获取游戏"
                Log.e(TAG, errorMsg, installError)
                return@withContext Result.failure(installError ?: Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "游戏安装过程发生异常: ${game.name}", e)
            return@withContext Result.failure(e)
        }
    }

    /**
     * 安装游戏从备份目录
     * 完整流程：从assets加载资源 -> 创建数据库记录 -> 发送安装成功事件
     * @param game 游戏数据
     * @return 成功时返回路径，失败时返回错误
     */
    suspend fun installGameFromBackup(game: Custom.HotGameData): Result<String> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "正在从备份目录安装游戏: ${game.name}")
            
            // 1. 从资源管理器加载游戏文件 - 纯资源操作
            val loadResult = resourceManager.loadFromBackupDirectory(game)
            
            // 2. 资源加载成功后，更新数据库
            loadResult.fold(
                onSuccess = { localPath ->
                    // 转换为MyGameItem并保存到数据库
                    val myGameItem = MyGameItem(
                        gameId = game.id,
                        name = game.name,
                        icon = game.iconUrl,
                        gameRes = game.gameRes ?: "",
                        description = game.description ?: "暂无描述",
                        downloadUrl = game.downloadUrl ?: "",
                        localPath = localPath,
                        patch = game.patch ?: 1,
                        size = "从本地资源加载",
                        installTime = System.currentTimeMillis()
                    )
                    
                    // 更新数据库和发送事件
                    try {
                        // 检查是否已存在
                        val existingGame = myGameDao.getGameById(game.id)
                        if (existingGame != null) {
                            // 更新现有记录
                            val updatedGame = existingGame.copy(
                                name = game.name,
                                icon = game.iconUrl,
                                localPath = localPath,
                                patch = game.patch ?: 1
                            )
                            myGameDao.update(updatedGame)
                            Log.d(TAG, "更新现有游戏记录: ${game.name}")
                        } else {
                            // 插入新记录
                            myGameDao.insert(myGameItem)
                            Log.d(TAG, "添加新游戏记录: ${game.name}")
                        }
                        
                        // 同时更新GameConfig表中的记录
                        updateGameConfig(game.id, localPath, true)
                        
                        // 发送安装成功事件
                        eventManager.emitGameEvent(GameEvent.GameInstalled(game.id))
                        
                        Log.d(TAG, "游戏从备份目录安装成功: ${game.name}")
                        
                    } catch (e: Exception) {
                        Log.e(TAG, "更新数据库失败: ${game.name}", e)
                        // 资源已提取，但数据库更新失败，回滚删除资源
                        resourceManager.deleteGameFiles(localPath)
                        return@withContext Result.failure(e)
                    }
                },
                onFailure = { error ->
                    Log.e(TAG, "从备份目录加载游戏失败: ${game.name}", error)
                    return@withContext Result.failure(error)
                }
            )
            
            return@withContext loadResult
        } catch (e: Exception) {
            Log.e(TAG, "从备份目录安装游戏失败: ${game.name}", e)
            return@withContext Result.failure(e)
        }
    }

    /**
     * 更新游戏配置表中的数据（同步两个表）
     */
    private suspend fun updateGameConfig(gameId: String, localPath: String, isLocal: Boolean) = withContext(Dispatchers.IO) {
        try {
            val gameConfigItem = database.gameConfigDao().getGameById(gameId)
            if (gameConfigItem != null) {
                val updatedGame = gameConfigItem.copy(
                    isLocal = isLocal,
                    localPath = localPath
                )
                database.gameConfigDao().update(updatedGame)
                Log.d(TAG, "更新游戏配置表成功: $gameId")
            } else {
                Log.d(TAG, "游戏配置表中未找到记录: $gameId, 跳过更新")
            }
        } catch (e: Exception) {
            Log.e(TAG, "更新游戏配置表失败: $gameId", e)
        }
    }

    /**
     * 检查游戏是否有更新
     * @param gameId 游戏ID
     * @return 是否有更新
     */
    suspend fun checkForUpdate(gameId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            // 获取本地游戏数据
            val localGame = myGameDao.getGameById(gameId) ?: return@withContext false
            val localPatch = localGame.patch
            
            // 从网络获取最新补丁版本
            val latestPatch = try {
                val latestGameInfo = netManager.getGameIdInfo(gameId).toString() // 显式转换为字符串
                if (latestGameInfo.isNotBlank()) {
                    latestGameInfo.toInt()
                } else {
                    // 如果网络请求返回为空，则保持本地版本不变
                    localPatch
                }
            } catch (e: Exception) {
                Log.e(TAG, "获取游戏最新版本失败: $gameId", e)
                localPatch // 出错时使用本地版本
            }
            
            // 简单比较版本，如果网络版本大于本地版本则需要更新
            val hasUpdate = latestPatch > localPatch
            if (hasUpdate) {
                Log.d(TAG, "游戏有更新: ${localGame.name}, 本地版本: $localPatch, 最新版本: $latestPatch")
            }
            
            return@withContext hasUpdate
        } catch (e: Exception) {
            Log.e(TAG, "检查游戏更新失败: $gameId", e)
            return@withContext false
        }
    }

    /**
     * 从游戏目录获取补丁版本
     * @param gamePath 游戏路径
     * @return 补丁版本
     */
    private fun getPatchVersion(gamePath: String): Int {
        return try {
            val versionFile = File(gamePath, ".version")
            if (versionFile.exists()) {
                versionFile.readText().trim().toIntOrNull() ?: 1
            } else {
                val versionFile2 = File(gamePath, "version.txt")
                if (versionFile2.exists()) {
                    versionFile2.readText().trim().toIntOrNull() ?: 1
                } else {
                    1 // 默认版本
                }
            }
        } catch (e: Exception) {
            Log.e("MyGameManager", "读取补丁版本失败", e)
            1 // 出错时返回默认版本
        }
    }

    /**
     * 将MyGameItem转换为Custom.MyGameData
     */
    private fun mapToMyGameData(item: MyGameItem): Custom.MyGameData {
        return Custom.MyGameData(
            id = item.gameId,
            gameId = item.gameId,
            name = item.name,
            iconUrl = item.icon,
            gameRes = item.gameRes,
            description = item.description,
            downloadUrl = item.downloadUrl,
            isLocal = true,
            localPath = item.localPath,
            rating = 0,
            patch = item.patch,
            size = item.size,
            lastPlayTime = item.lastPlayTime.toString(),
            playCount = item.playCount,
            installTime = item.installTime.toString(),
            hasUpdate = false

        )
    }

    /**
     * 统一的数据模型转换方法 - GameConfigItem 转 MyGameItem
     */
    private fun convertGameConfigToMyGame(config: GameConfigItem, localPath: String): MyGameItem {
        return MyGameItem(
            gameId = config.id.toString(),
            name = config.name,
            icon = config.icon,
            gameRes = config.gameRes ?: "",
            description = config.info ?: "暂无描述",
            downloadUrl = config.download ?: "",
            localPath = localPath,
            patch = config.patch,
            size = config.size ?: "未知大小",
            installTime = System.currentTimeMillis()
        )
    }

    /**
     * 安装游戏到我的游戏列表（适用于从首页直接玩游戏的场景）
     */
    suspend fun installGame(
        gameId: String,
        name: String,
        icon: String,
        gameRes: String,
        description: String,
        downloadUrl: String,
        localPath: String,
        patch: Int,
        size: String
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            // 检查游戏是否已存在
            if (isGameInstalled(gameId)) {
                // 已安装，只更新播放信息
                updateGamePlayInfo(gameId)
                return@withContext true
            }
            
            // 创建新的游戏记录
            val myGame = MyGameItem(
                gameId = gameId,
                name = name,
                icon = icon,
                gameRes = gameRes,
                description = description,
                downloadUrl = downloadUrl,
                localPath = localPath,
                patch = patch,
                size = size,
                installTime = System.currentTimeMillis(),
                lastPlayTime = System.currentTimeMillis(),
                playCount = 1
            )
            
            myGameDao.insert(myGame)
            Log.d(TAG, "游戏添加成功: $name")
            
            // 发送游戏安装成功事件
            eventManager.emitGameEvent(GameEvent.GameInstalled(gameId))
            
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "添加游戏到我的游戏失败: $name", e)
            return@withContext false
        }
    }
    
    /**
     * 更新游戏播放信息
     * 更新最后播放时间和播放次数
     */
    suspend fun updateGamePlayInfo(gameId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val game = myGameDao.getGameById(gameId)
            if (game != null) {
                // 更新最后播放时间和播放次数
                val updatedGame = game.copy(
                    lastPlayTime = System.currentTimeMillis(),
                    playCount = game.playCount + 1
                )
                myGameDao.update(updatedGame)
                Log.d(TAG, "游戏播放信息更新成功: $gameId, 播放次数: ${updatedGame.playCount}")
                return@withContext true
            } else {
                Log.w(TAG, "尝试更新不存在的游戏信息: $gameId")
                return@withContext false
            }
        } catch (e: Exception) {
            Log.e(TAG, "更新游戏播放信息失败: $gameId", e)
            return@withContext false
        }
    }
}
