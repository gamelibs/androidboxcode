package com.example.gameboxone.utils

import java.net.URI

enum class WebNavigationDecision {
    ALLOW_IN_WEBVIEW,
    OPEN_EXTERNALLY,
    BLOCK
}

object WebViewUrlPolicy {
    fun decide(url: String?, localServerUrl: String?): WebNavigationDecision {
        if (url.isNullOrBlank()) return WebNavigationDecision.BLOCK
        val uri = parse(url) ?: return WebNavigationDecision.BLOCK
        val scheme = uri.scheme?.lowercase().orEmpty()

        if (scheme in setOf("about", "data", "blob", "javascript")) {
            return WebNavigationDecision.ALLOW_IN_WEBVIEW
        }

        if (scheme !in setOf("http", "https")) {
            return WebNavigationDecision.BLOCK
        }

        val host = uri.host?.lowercase().orEmpty()
        if (host.isBlank()) return WebNavigationDecision.BLOCK

        val localHost = parse(localServerUrl)?.host?.lowercase()
        val allowedHosts = buildSet {
            add("localhost")
            add("127.0.0.1")
            add("::1")
            localHost?.let { add(it) }
        }

        return if (host in allowedHosts) {
            WebNavigationDecision.ALLOW_IN_WEBVIEW
        } else {
            WebNavigationDecision.OPEN_EXTERNALLY
        }
    }

    private fun parse(value: String?): URI? =
        runCatching { value?.let { URI(it) } }.getOrNull()
}

