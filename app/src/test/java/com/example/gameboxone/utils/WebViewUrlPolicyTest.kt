package com.example.gameboxone.utils

import org.junit.Assert.assertEquals
import org.junit.Test

class WebViewUrlPolicyTest {
    @Test
    fun local_server_urls_are_allowed_in_webview() {
        val decision = WebViewUrlPolicy.decide(
            url = "http://localhost:8080/game/index.html",
            localServerUrl = "http://localhost:8080/game/index.html"
        )

        assertEquals(WebNavigationDecision.ALLOW_IN_WEBVIEW, decision)
    }

    @Test
    fun external_http_urls_open_outside_webview() {
        val decision = WebViewUrlPolicy.decide(
            url = "https://example.com/play",
            localServerUrl = "http://localhost:8080/game/index.html"
        )

        assertEquals(WebNavigationDecision.OPEN_EXTERNALLY, decision)
    }

    @Test
    fun custom_schemes_are_blocked() {
        val decision = WebViewUrlPolicy.decide(
            url = "intent://scan/#Intent;scheme=zxing;package=com.example;end",
            localServerUrl = "http://localhost:8080/game/index.html"
        )

        assertEquals(WebNavigationDecision.BLOCK, decision)
    }
}

