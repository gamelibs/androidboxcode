package com.example.gameboxone.manager

import android.content.Context
import com.example.gameboxone.AppLog as Log
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
    private val context: Context,
    private val sdkManager: SdkManager
) {
    private val TAG = "WebServerManager"
    private var server: GameLocalServer? = null
    private val isRunning = AtomicBoolean(false)
    private var currentPort = 0
    private var rootDir: File? = null

    // MIME类型映射表
    private val mimeTypeMap: MutableMap<String, String> = mutableMapOf()
    // 安全头信息
    private val securityHeaders: MutableMap<String, String> = mutableMapOf()

    init {
        initDefaultMimeTypes()
        initDefaultSecurityHeaders()
    }

    /**
     * 初始化默认MIME类型
     */
    private fun initDefaultMimeTypes() {
        // 网页基础类型
        mimeTypeMap[".html"] = "text/html"
        mimeTypeMap[".js"] = "application/javascript"
        mimeTypeMap[".css"] = "text/css"
        mimeTypeMap[".json"] = "application/json"

        // WebAssembly - 关键类型
        mimeTypeMap[".wasm"] = "application/wasm"

        // 图片类型
        mimeTypeMap[".png"] = "image/png"
        mimeTypeMap[".jpg"] = "image/jpeg"
        mimeTypeMap[".jpeg"] = "image/jpeg"
        mimeTypeMap[".gif"] = "image/gif"
        mimeTypeMap[".svg"] = "image/svg+xml"
        mimeTypeMap[".ico"] = "image/x-icon"

        // 字体
        mimeTypeMap[".woff"] = "font/woff"
        mimeTypeMap[".woff2"] = "font/woff2"
        mimeTypeMap[".ttf"] = "font/ttf"
        mimeTypeMap[".eot"] = "application/vnd.ms-fontobject"
        mimeTypeMap[".otf"] = "font/otf"

        // 媒体
        mimeTypeMap[".mp3"] = "audio/mpeg"
        mimeTypeMap[".mp4"] = "video/mp4"
        mimeTypeMap[".wav"] = "audio/wav"
        mimeTypeMap[".webm"] = "video/webm"
        mimeTypeMap[".ogg"] = "application/ogg"

        // 3D模型 - WebGL必备
        mimeTypeMap[".bin"] = "application/octet-stream"
        mimeTypeMap[".gltf"] = "model/gltf+json"
        mimeTypeMap[".glb"] = "model/gltf-binary"

        // WebGL着色器
        mimeTypeMap[".glsl"] = "text/plain"
        mimeTypeMap[".frag"] = "text/plain"
        mimeTypeMap[".vert"] = "text/plain"

        // 数据文件
        mimeTypeMap[".dat"] = "application/octet-stream"
        mimeTypeMap[".data"] = "application/octet-stream"
        mimeTypeMap[".unityweb"] = "application/octet-stream"
    }

    /**
     * 初始化安全头 - WebGL关键设置
     */
    private fun initDefaultSecurityHeaders() {
        // CORS支持 - 必要
        securityHeaders["Access-Control-Allow-Origin"] = "*"
        securityHeaders["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        securityHeaders["Access-Control-Allow-Headers"] = "Content-Type, Range"

        // 跨域隔离策略
        // 注意：
        // - 启用 Cross-Origin-Embedder-Policy: require-corp / Cross-Origin-Opener-Policy: same-origin
        //   会让页面进入跨源隔离模式。
        // - 在该模式下，页面无法加载没有 CORP 头的第三方 JS 资源（例如远程 SDK），
        //   典型报错为：net::ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep。
        // - 当前本地游戏场景通常不需要 SharedArrayBuffer 等跨源隔离能力，
        //   为了兼容外部 JS SDK，这里默认不再开启 COEP/COOP。
        // 如后续确有需要，可按需恢复下面两行：
        // securityHeaders["Cross-Origin-Embedder-Policy"] = "require-corp"
        // securityHeaders["Cross-Origin-Opener-Policy"] = "same-origin"

        securityHeaders["Cross-Origin-Resource-Policy"] = "cross-origin"

        // 内容安全策略
        securityHeaders["X-Content-Type-Options"] = "nosniff"

        // 缓存控制 - 允许缓存大型资源
        securityHeaders["Cache-Control"] = "max-age=86400"
    }

    /**
     * 启动服务器 - 字符串路径版本
     * @param gamePath 游戏路径
     * @return 服务器端口
     */
    fun startServer(gamePath: String): Int {
        if (isRunning.get()) {
            Log.d(TAG, "服务器已运行在端口: $currentPort")
            return currentPort
        }

        // 正确构建游戏目录路径 - 从app_games目录获取
        val gameDir = File(context.filesDir.parent, "app_games/$gamePath")
        
        // 详细日志记录
        Log.d(TAG, "检查游戏目录: ${gameDir.absolutePath}")
        
        if (!gameDir.exists()) {
            // 尝试直接使用完整路径
            val altGameDir = File(gamePath)
            if (altGameDir.exists()) {
                Log.d(TAG, "使用完整路径找到游戏目录: ${altGameDir.absolutePath}")
                return startServerWithDir(altGameDir)
            }
            
            // 尝试查找其他可能的位置
            val appGamesDir = File(context.filesDir.parent, "app_games")
            if (appGamesDir.exists()) {
                Log.d(TAG, "app_games目录存在，内容: ${appGamesDir.list()?.joinToString()}")
            }
            
            Log.e(TAG, "游戏目录不存在: $gamePath")
            throw IOException("游戏目录不存在: $gamePath")
        }
        
        return startServerWithDir(gameDir)
    }
    
    /**
     * 使用File对象启动服务器
     * @param gameDir 游戏目录
     * @return 服务器端口
     */
    private fun startServerWithDir(gameDir: File): Int {
        val rootDir = gameDir.parentFile ?: throw IllegalArgumentException("无法获取游戏目录的父目录")
        this.rootDir = rootDir
        currentPort = findAvailablePort()
        
        try {
            server = GameLocalServer(currentPort, rootDir)
            server?.start()
            isRunning.set(true)
            Log.d(TAG, "本地服务器启动成功，端口: $currentPort, 根目录: ${rootDir.absolutePath}")
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
     * 获取完整的游戏URL
     * @param gamePath 游戏相对路径
     * @return 完整的本地服务器游戏URL
     */
    fun getGameUrl(gamePath: String): String? {
        if (!isRunning.get()) {
            Log.e(TAG, "服务器未运行，无法获取游戏URL")
            return null
        }

        // 对游戏路径进行更精确的解析
        val gameDir = File(gamePath)
        val gameName = gameDir.name
        
        // 确保路径格式正确 (移除前导斜杠)
        val formattedPath = gameName.trim('/')
        
        Log.d(TAG, "构建游戏URL，使用游戏名称: $formattedPath")

        // 构建URL - 确保添加了相关参数
        return "http://localhost:$currentPort/$formattedPath/index.html"
    }

    /**
     * 查找可用端口
     */
    private fun findAvailablePort(): Int {
        val preferredPorts = listOf(8080, 8081, 8082, 9090, 9091)

        for (port in preferredPorts) {
            if (isPortAvailable(port)) {
                return port
            }
        }

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
            8888
        }
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
                // 处理根路径或空路径请求，指向index.html
                val requestedPath = if (uri == "/" || uri.isEmpty()) {
                    "/index.html"
                } else {
                    uri
                }

                val sdkOverrideFile: File? = try {
                    val sdkPath = sdkManager.getSdkPath()
                    if (sdkPath.isNotBlank()) {
                        val sdkFile = File(sdkPath)
                        val requestedName = requestedPath.substringAfterLast('/')
                        val sdkName = sdkFile.name

                        fun String.baseName(): String =
                            this.substringAfterLast('/').substringBeforeLast('.')

                        val requestedBase = requestedName.baseName()
                        val sdkBase = sdkName.baseName()

                        if (sdkFile.exists() &&
                            (requestedName == sdkName || requestedBase.equals(sdkBase, ignoreCase = true))
                        ) {
                            sdkFile
                        } else {
                            null
                        }
                    } else {
                        null
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "解析 SDK 覆盖文件时出错", e)
                    null
                }

                // 解析请求的文件路径；若有 SDK 覆盖文件则优先使用
                val file = sdkOverrideFile ?: File(rootDir, requestedPath)

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

                // 处理范围请求 - 对大文件很重要
                val rangeHeader = session.headers["range"]
                if (rangeHeader != null) {
                    return createRangeResponse(file, mimeType, rangeHeader)
                }

                // 标准响应
                val fis = FileInputStream(file)
                val response = newFixedLengthResponse(
                    Response.Status.OK,
                    mimeType,
                    fis,
                    file.length()
                )

                // 添加所有安全头和WebGL支持头
                securityHeaders.forEach { (key, value) ->
                    response.addHeader(key, value)
                }

                // 添加范围请求支持 - 非常重要
                response.addHeader("Accept-Ranges", "bytes")

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
         * 处理范围请求 - 对于加载大型3D资源至关重要
         */
        private fun createRangeResponse(file: File, mimeType: String, rangeHeader: String): Response {
            try {
                val fileLength = file.length()

                // 解析范围请求头
                val range = rangeHeader.substringAfter("bytes=")
                val rangeParts = range.split("-")

                val start = rangeParts[0].toLongOrNull() ?: 0L
                var end = rangeParts[1].toLongOrNull() ?: (fileLength - 1)

                // 验证范围
                if (start >= fileLength || start > end || end >= fileLength) {
                    val response = newFixedLengthResponse(
                        Response.Status.RANGE_NOT_SATISFIABLE,
                        MIME_PLAINTEXT,
                        "请求范围无效"
                    )
                    response.addHeader("Content-Range", "bytes */$fileLength")
                    return response
                }

                // 创建范围响应
                val contentLength = end - start + 1
                val fis = FileInputStream(file)
                fis.skip(start)

                val response = newFixedLengthResponse(
                    Response.Status.PARTIAL_CONTENT,
                    mimeType,
                    fis,
                    contentLength
                )

                // 添加范围头
                response.addHeader("Content-Range", "bytes $start-$end/$fileLength")
                response.addHeader("Accept-Ranges", "bytes")

                // 添加所有安全头
                securityHeaders.forEach { (key, value) ->
                    response.addHeader(key, value)
                }

                return response
            } catch (e: Exception) {
                Log.e(TAG, "处理范围请求失败", e)
                return newFixedLengthResponse(
                    Response.Status.INTERNAL_ERROR,
                    MIME_PLAINTEXT,
                    "500 处理范围请求失败: ${e.message}"
                )
            }
        }

        /**
         * 获取文件的MIME类型
         */
        private fun getCustomMimeType(fileName: String): String {
            val extension = "." + fileName.substringAfterLast('.', "").lowercase()
            return mimeTypeMap[extension] ?: "application/octet-stream"
        }
    }
}
