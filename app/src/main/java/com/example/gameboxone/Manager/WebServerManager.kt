package com.example.gameboxone.manager

import android.content.Context
import android.util.Log
import fi.iki.elonen.NanoHTTPD
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.net.ServerSocket
import java.util.concurrent.atomic.AtomicBoolean
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WebServerManager @Inject constructor(
    private val context: Context
) {
    private val TAG = "WebServerManager"
    private var server: GameLocalServer? = null
    private val isRunning = AtomicBoolean(false)
    private var currentPort = 0
    private var rootDir: File? = null
    
    // 添加缺失的成员变量
    // MIME类型映射表
    private val mimeTypeMap: MutableMap<String, String> = mutableMapOf()
    // 安全头信息
    private val securityHeaders: MutableMap<String, String> = mutableMapOf()
    
    init {
        // 初始化基础MIME类型
        initDefaultMimeTypes()
        // 初始化基础安全头
        initDefaultSecurityHeaders()
    }
    
    /**
     * 初始化默认MIME类型
     */
    private fun initDefaultMimeTypes() {
        // 基本类型
        mimeTypeMap[".html"] = "text/html"
        mimeTypeMap[".js"] = "application/javascript"
        mimeTypeMap[".css"] = "text/css"
        mimeTypeMap[".json"] = "application/json"
        mimeTypeMap[".wasm"] = "application/wasm"
        mimeTypeMap[".png"] = "image/png"
        mimeTypeMap[".jpg"] = "image/jpeg"
        mimeTypeMap[".jpeg"] = "image/jpeg"
        mimeTypeMap[".gif"] = "image/gif"

        mimeTypeMap[".svg"] = "image/svg+xml"
        // 字体
        mimeTypeMap[".woff"] = "font/woff"
        mimeTypeMap[".woff2"] = "font/woff2"
        mimeTypeMap[".ttf"] = "font/ttf"
        mimeTypeMap[".eot"] = "application/vnd.ms-fontobject"
        mimeTypeMap[".otf"] = "font/otf"
        // 媒体
        mimeTypeMap[".mp3"] = "audio/mpeg"
        mimeTypeMap[".mp4"] = "video/mp4"
        mimeTypeMap[".wav"] = "video/wav"
        mimeTypeMap[".webm"] = "video/webm"
        mimeTypeMap[".ogg"] = "application/ogg"

        // 3D模型相关 - 添加.bin文件支持
        mimeTypeMap[".bin"] = "application/octet-stream"
        mimeTypeMap[".gltf"] = "model/gltf+json"
        mimeTypeMap[".glb"] = "model/gltf-binary"
    }
    
    /**
     * 初始化默认安全头
     */
    private fun initDefaultSecurityHeaders() {
        securityHeaders["Access-Control-Allow-Origin"] = "*"
        securityHeaders["Cache-Control"] = "no-cache, no-store, must-revalidate"
    }

    /**
     * 启动本地Web服务器
     * @param gameDir 游戏根目录
     * @return 服务器端口
     */
    fun startServer(gameDir: File): Int {
        if (isRunning.get()) {
            Log.d(TAG, "服务器已运行在端口: $currentPort")
            return currentPort
        }

        val rootDir = gameDir.parentFile ?: throw IllegalArgumentException("无法获取游戏目录的父目录")
        currentPort = findAvailablePort()

        try {
            server = GameLocalServer(currentPort, rootDir)
            server?.start()
            isRunning.set(true)
            Log.d(TAG, "本地服务器启动成功，端口: $currentPort, 根目录: ${rootDir.absolutePath}")

            // 设置WebGL支持
            setupWebGLSupport()

            return currentPort
        } catch (e: Exception) {
            Log.e(TAG, "启动本地服务器失败", e)
            throw e
        }
    }

    /**
     * 停止本地Web服务器
     */
    fun stopServer() {
        try {
            server?.stop()
            server = null
            isRunning.set(false)
            Log.d(TAG, "本地服务器已停止")
        } catch (e: Exception) {
            Log.e(TAG, "停止本地服务器失败", e)
        }
    }

    /**
     * 查找可用端口
     */
    private fun findAvailablePort(): Int {
        // 尝试常用端口，如果不可用则使用随机端口
        val preferredPorts = listOf(8080, 8081, 8082, 9090, 9091)
        
        for (port in preferredPorts) {
            if (isPortAvailable(port)) {
                return port
            }
        }
        
        // 使用随机端口
        return findRandomAvailablePort()
    }

    /**
     * 检查端口是否可用
     */
    private fun isPortAvailable(port: Int): Boolean {
        return try {
            val socket = ServerSocket(port)
            socket.close()
            true
        } catch (e: IOException) {
            false
        }
    }

    /**
     * 查找随机可用端口
     */
    private fun findRandomAvailablePort(): Int {
        return try {
            val socket = ServerSocket(0)
            val port = socket.localPort
            socket.close()
            port
        } catch (e: IOException) {
            // 如果失败，使用默认端口
            8888
        }
    }

    /**
     * 清理过期的缓存
     * @param maxAge 最大缓存时间（毫秒）
     */
    fun cleanupCache(maxAge: Long = 7 * 24 * 60 * 60 * 1000) { // 默认7天
        val cacheDir = File(context.getDir("games", Context.MODE_PRIVATE).path)
        val now = System.currentTimeMillis()
        
        try {
            cacheDir.listFiles()?.forEach { gameDir ->
                // 跳过非目录文件
                if (!gameDir.isDirectory) return@forEach
                
                // 检查游戏目录的最后修改时间
                val lastModified = gameDir.lastModified()
                if (now - lastModified > maxAge) {
                    // 检查该目录是否正在使用
                    val isActive = rootDir?.absolutePath == gameDir.absolutePath
                    
                    // 不删除当前正在使用的游戏目录
                    if (!isActive) {
                        Log.d(TAG, "清理过期缓存目录: ${gameDir.name}")
                        gameDir.deleteRecursively()
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "清理缓存失败", e)
        }
    }

    /**
     * 检查并限制缓存大小
     * @param maxSizeMB 最大缓存大小（MB）
     */
    fun limitCacheSize(maxSizeMB: Int = 500) {
        val cacheDir = File(context.getDir("games", Context.MODE_PRIVATE).path)
        val maxBytes = maxSizeMB * 1024 * 1024L
        
        try {
            // 计算当前缓存大小
            var totalSize = 0L
            val gameDirs = cacheDir.listFiles()?.filter { it.isDirectory }?.sortedBy { it.lastModified() }
            
            gameDirs?.forEach { gameDir ->
                totalSize += getDirSize(gameDir)
            }
            
            // 如果缓存超过限制，从最旧的开始删除
            if (totalSize > maxBytes && gameDirs != null) {
                for (gameDir in gameDirs) {
                    // 不删除当前正在使用的游戏目录
                    val isActive = rootDir?.absolutePath == gameDir.absolutePath
                    if (!isActive) {
                        Log.d(TAG, "删除缓存以控制大小: ${gameDir.name}")
                        val dirSize = getDirSize(gameDir)
                        gameDir.deleteRecursively()
                        totalSize -= dirSize
                        
                        if (totalSize <= maxBytes) break
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "限制缓存大小失败", e)
        }
    }
    
    /**
     * 获取目录大小
     */
    private fun getDirSize(dir: File): Long {
        var size = 0L
        
        try {
            dir.listFiles()?.forEach { file ->
                size += if (file.isDirectory) {
                    getDirSize(file)
                } else {
                    file.length()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "计算目录大小失败: ${dir.absolutePath}", e)
        }
        
        return size
    }

    /**
     * 处理WebGL专用的MIME类型和头信息
     */
    private fun setupWebGLSupport() {
        // 注册处理WebGL相关资源的MIME类型
        val webglMimeTypes = mapOf(
            ".glsl" to "text/plain",
            ".frag" to "text/plain",
            ".vert" to "text/plain",
            ".glb" to "model/gltf-binary",
            ".gltf" to "model/gltf+json"
        )
        
        // 添加到MIME类型映射
        webglMimeTypes.forEach { (extension, mimeType) ->
            mimeTypeMap[extension] = mimeType
        }
        
        // 添加WebGL友好的安全头
        securityHeaders["Cross-Origin-Embedder-Policy"] = "require-corp"
        securityHeaders["Cross-Origin-Opener-Policy"] = "same-origin"
    }

    /**
     * 游戏本地服务器实现
     */
    private inner class GameLocalServer(
        port: Int,
        private val rootDir: File
    ) : NanoHTTPD(port) {
        
        override fun serve(session: IHTTPSession): Response {
            val uri = session.uri
            
            try {
                // 处理根路径请求，指向index.html
                val requestedPath = if (uri == "/" || uri.isEmpty()) {
                    "/index.html"
                } else {
                    uri
                }
                
                
                // 解析请求的文件路径
                val file = File(rootDir, requestedPath)
                
                if (!file.exists()) {
                    Log.e(TAG, "文件不存在: ${file.absolutePath}")
                    return newFixedLengthResponse(
                        Response.Status.NOT_FOUND,
                        MIME_PLAINTEXT,
                        "404 文件未找到"
                    )
                }
                
                // 获取MIME类型
                val mimeType = getCustomMimeType(file.name)
                
                // 返回文件内容
                val fis = FileInputStream(file)
                val response = newFixedLengthResponse(
                    Response.Status.OK,
                    mimeType,
                    fis,
                    file.length()
                )
                
                // 添加WebGL兼容性头
                securityHeaders.forEach { (key, value) ->
                    response.addHeader(key, value)
                }
                
                return response
                
            } catch (e: Exception) {
                Log.e(TAG, "处理请求失败: $uri", e)
                return newFixedLengthResponse(
                    Response.Status.INTERNAL_ERROR,
                    MIME_PLAINTEXT,
                    "500 服务器错误: ${e.message}"
                )
            }
        }
        
        /**
         * 获取文件的MIME类型
         * 使用我们的自定义MIME类型映射
         */
        private fun getCustomMimeType(fileName: String): String {
            // 获取文件扩展名
            val extension = fileName.substringAfterLast('.', "")
            if (extension.isEmpty()) return "application/octet-stream"
            
            // 先查找我们的映射
            val extensionWithDot = ".$extension"
            return mimeTypeMap[extensionWithDot.lowercase()] ?: "application/octet-stream"
        }
    }
}