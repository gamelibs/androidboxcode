package com.example.gameboxone.utils

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.ApplicationInfo
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature

object WebSettingsUtils {
    @SuppressLint("SetJavaScriptEnabled")
    @Suppress("DEPRECATION")
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
            allowFileAccess = false
            allowContentAccess = false
            allowFileAccessFromFileURLs = false
            allowUniversalAccessFromFileURLs = false

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
            
            // 媒体播放支持
            mediaPlaybackRequiresUserGesture = false

            mixedContentMode = if ((context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
                WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            } else {
                WebSettings.MIXED_CONTENT_NEVER_ALLOW
            }

            if (WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) {
                WebSettingsCompat.setSafeBrowsingEnabled(this, true)
            }
        }

        // 调试模式：仅在可调试构建中开启
        val isDebuggable = (context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        WebView.setWebContentsDebuggingEnabled(isDebuggable)
    }
}