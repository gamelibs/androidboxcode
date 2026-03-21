package com.example.gameboxone.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import com.example.gameboxone.legal.LegalConfig
import com.example.gameboxone.legal.openLegalDocument

@Composable
fun LaunchConsentScreen(
    onAccepted: () -> Unit,
    onExit: () -> Unit,
    onOpenFailed: (String) -> Unit = {}
) {
    val context = LocalContext.current
    var checked by remember { mutableStateOf(false) }
    val scrollState = rememberScrollState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(scrollState)
                    .padding(24.dp)
            ) {
                Text(
                    text = "欢迎来到 GameBoxOne",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "为保障你的知情权与选择权，在继续使用前，请先阅读并确认《隐私政策》与《用户协议》。\n\n如果你同意，我们会按政策说明处理设备信息、广告同意状态、游戏下载与本地缓存等必要数据；若你不同意，可退出应用。",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(18.dp))

                LegalLinkRow(
                    label = "查看《隐私政策》",
                    url = LegalConfig.PRIVACY_POLICY_URL,
                    onOpen = {
                        try {
                            context.openLegalDocument(LegalConfig.LegalDocumentType.PRIVACY_POLICY)
                        } catch (_: Exception) {
                            onOpenFailed("无法打开隐私政策")
                        }
                    },
                    onOpenFailed = onOpenFailed
                )
                Spacer(modifier = Modifier.height(10.dp))
                LegalLinkRow(
                    label = "查看《用户协议》",
                    url = LegalConfig.USER_AGREEMENT_URL,
                    onOpen = {
                        try {
                            context.openLegalDocument(LegalConfig.LegalDocumentType.USER_AGREEMENT)
                        } catch (_: Exception) {
                            onOpenFailed("无法打开用户协议")
                        }
                    },
                    onOpenFailed = onOpenFailed
                )

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Top
                ) {
                    Checkbox(
                        checked = checked,
                        onCheckedChange = { checked = it }
                    )
                    Text(
                        text = "我已阅读并同意《隐私政策》与《用户协议》，并同意在必要范围内处理相关数据。",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(top = 12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = onAccepted,
                        enabled = checked,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("同意并继续")
                    }
                    OutlinedButton(
                        onClick = onExit,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("暂不同意，退出应用")
                    }
                }
            }
        }
    }
}

@Composable
private fun LegalLinkRow(
    label: String,
    url: String,
    onOpen: () -> Unit,
    onOpenFailed: (String) -> Unit
) {
    val text = buildAnnotatedString {
        pushStyle(
            SpanStyle(
                color = MaterialTheme.colorScheme.primary,
                textDecoration = TextDecoration.Underline,
                fontWeight = FontWeight.SemiBold
            )
        )
        append(label)
        pop()
    }

    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        modifier = Modifier.clickable {
            try {
                onOpen()
            } catch (_: Exception) {
                onOpenFailed("无法打开链接")
            }
        }
    )
}


