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

        // 基本设置
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
//        settings.setAppCacheEnabled(true)

        // WebGL必要设置
        settings.javaScriptCanOpenWindowsAutomatically = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.allowFileAccessFromFileURLs = true
        settings.allowUniversalAccessFromFileURLs = true

        // 禁用地理位置API需要权限的提示
        settings.setGeolocationEnabled(false)

        // 硬件加速和渲染质量设置
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH)

        // 混合内容处理
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // 特定于WebGL的优化
        settings.mediaPlaybackRequiresUserGesture = false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        // User Agent设置 - 可选，但有助于兼容性
        val originalUserAgent = settings.userAgentString
        settings.userAgentString = originalUserAgent + " AndroidWebView/WebGL"

        // 缓存设置 - 设为默认而不是NO_CACHE
        settings.cacheMode = WebSettings.LOAD_DEFAULT
    }
}