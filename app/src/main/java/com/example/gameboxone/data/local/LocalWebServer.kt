package com.example.gameboxone.data.local

import android.content.Context
import com.example.gameboxone.AppLog as Log
import fi.iki.elonen.NanoHTTPD
import java.io.IOException
import java.io.InputStream

/**
 * 本地Web服务器
 * 用于托管和提供游戏资源文件
 *
 * @param context Android上下文，用于访问assets目录
 * @param port 服务器端口号
 */
class LocalWebServer(private val context: Context, private val port: Int) : NanoHTTPD(port) {
    private val TAG = "LocalWebServer"

    /**
     * 处理HTTP请求并返回响应
     * 从assets目录中读取请求的文件并返回
     *
     * @param session HTTP会话信息
     * @return HTTP响应
     */
    override fun serve(session: IHTTPSession): Response {
        val uri = session.uri
        Log.d(TAG, "serve, uri = $uri")

        // 处理URI，移除开头的斜杠以匹配assets目录结构
        val assetPath = if (uri.startsWith("/")) uri.substring(1) else uri
        Log.d(TAG, "serve, assetPath = $assetPath")

        return try {
            // 从assets目录读取文件
            val inputStream: InputStream = context.assets.open(assetPath)
            val mimeType = getMimeType(assetPath)
            Log.d(TAG, "serve, mimeType = $mimeType")

            // 返回分块响应，适用于大文件
            newChunkedResponse(Response.Status.OK, mimeType, inputStream)
        } catch (e: IOException) {
            // 文件不存在或读取失败时返回404
            Log.e(TAG, "Error loading asset: $assetPath", e)
            newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Not Found")
        }
    }

    /**
     * 根据文件扩展名确定MIME类型
     *
     * @param url 请求的文件URL
     * @return 对应的MIME类型
     */
    private fun getMimeType(url: String): String {
        return when {
            url.endsWith(".html") -> "text/html"         // HTML文件
            url.endsWith(".js") -> "text/javascript"     // JavaScript文件
            url.endsWith(".css") -> "text/css"          // CSS样式表
            url.endsWith(".png") -> "image/png"         // PNG图片
            url.endsWith(".jpg") ||
                    url.endsWith(".jpeg") -> "image/jpeg"       // JPEG图片
            url.endsWith(".gif") -> "image/gif"         // GIF图片
            else -> "application/octet-stream"          // 其他二进制文件
        }
    }
}