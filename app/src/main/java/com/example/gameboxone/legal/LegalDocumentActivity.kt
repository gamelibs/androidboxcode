package com.example.gameboxone.legal

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.ui.theme.GameboxoneTheme
import com.example.gameboxone.ui.theme.ThemeManager

private const val TAG = "LegalDocumentActivity"

class LegalDocumentActivity : ComponentActivity() {

    companion object {
        private const val EXTRA_DOCUMENT_TYPE = "extra_document_type"

        fun createIntent(context: Context, documentType: LegalConfig.LegalDocumentType): Intent {
            return Intent(context, LegalDocumentActivity::class.java).apply {
                putExtra(EXTRA_DOCUMENT_TYPE, documentType.pathSegment)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        WindowCompat.setDecorFitsSystemWindows(window, false)
        hideSystemBars()

        val pathSegment = intent.getStringExtra(EXTRA_DOCUMENT_TYPE)
        val documentType = LegalConfig.LegalDocumentType.fromPathSegment(pathSegment)

        setContent {
            val isDark by ThemeManager.isDarkTheme.collectAsState()
            GameboxoneTheme(darkTheme = isDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    LegalDocumentScreen(
                        documentType = documentType,
                        onBack = { finish() }
                    )
                }
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemBars()
    }

    private fun hideSystemBars() {
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LegalDocumentScreen(
    documentType: LegalConfig.LegalDocumentType,
    onBack: () -> Unit
) {
    var currentUrl by remember { mutableStateOf(documentType.remoteUrl) }
    var hasFallenBackToAsset by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = stringResource(id = documentType.titleRes)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { context ->
                    WebView(context).apply {
                        settings.javaScriptEnabled = false
                        settings.domStorageEnabled = false
                        settings.allowFileAccess = true
                        settings.allowContentAccess = false
                        settings.loadsImagesAutomatically = true
                        webViewClient = object : WebViewClient() {
                            override fun onReceivedError(
                                view: WebView?,
                                request: WebResourceRequest?,
                                error: WebResourceError?
                            ) {
                                super.onReceivedError(view, request, error)
                                if (request?.isForMainFrame == true && !hasFallenBackToAsset) {
                                    val fallback = "file:///android_asset/legal/${documentType.assetFileName}"
                                    hasFallenBackToAsset = true
                                    currentUrl = fallback
                                    Log.w(TAG, "远端法务页加载失败，回退本地资源: ${documentType.remoteUrl}")
                                    view?.loadUrl(fallback)
                                }
                            }
                        }
                        loadUrl(currentUrl)
                    }
                },
                update = { webView ->
                    if (webView.url != currentUrl) {
                        webView.loadUrl(currentUrl)
                    }
                }
            )
        }
    }
}



