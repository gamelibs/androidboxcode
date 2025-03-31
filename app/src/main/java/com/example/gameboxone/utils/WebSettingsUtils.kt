package com.example.gameboxone.utils

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.webkit.WebSettings
import android.webkit.WebView

object WebSettingsUtils {
    @SuppressLint("SetJavaScriptEnabled")
    fun setSettings(context: Context, webView: WebView) {
        val settings = webView.settings

        // 基础设置
        settings.apply {
            // 启用JavaScript
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true

            // WebGL支持
            javaScriptCanOpenWindowsAutomatically = true
            allowFileAccess = true
            allowContentAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true

            // 缓存配置
//            setAppCacheEnabled(false)  // 使用新的缓存API
            cacheMode = WebSettings.LOAD_DEFAULT

            // 编码
            defaultTextEncodingName = "UTF-8"

            // 其他优化
            loadsImagesAutomatically = true
            setSupportMultipleWindows(false)
            loadWithOverviewMode = true
            useWideViewPort = true

            // 性能优化
            setRenderPriority(WebSettings.RenderPriority.HIGH)
            setEnableSmoothTransition(true)
            
            // 媒体播放支持
            mediaPlaybackRequiresUserGesture = false
            
            // 设置存储路径
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }
        }

        // 调试模式
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true)
        }
    }
}