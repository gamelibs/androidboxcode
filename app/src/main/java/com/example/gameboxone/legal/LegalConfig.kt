package com.example.gameboxone.legal

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.net.Uri
import androidx.annotation.StringRes
import com.example.gameboxone.R

object LegalConfig {
    const val SITE_SLUG = "gameboxone"
    const val BASE_LEGAL_URL = "https://ovokit.xyz/$SITE_SLUG"
    const val PRIVACY_POLICY_URL = "$BASE_LEGAL_URL/privacy-policy.html"
    const val USER_AGREEMENT_URL = "$BASE_LEGAL_URL/user-agreement.html"

    const val PREFS_NAME = "game_preferences"
    const val KEY_LEGAL_ACCEPTANCE_VERSION = "legal_acceptance_version"
    const val REQUIRED_LEGAL_ACCEPTANCE_VERSION = 1

    enum class LegalDocumentType(
        val pathSegment: String,
        @StringRes val titleRes: Int,
        val remoteUrl: String,
        val assetFileName: String
    ) {
        PRIVACY_POLICY(
            pathSegment = "privacy-policy",
            titleRes = R.string.legal_privacy_policy,
            remoteUrl = PRIVACY_POLICY_URL,
            assetFileName = "privacy-policy.html"
        ),
        USER_AGREEMENT(
            pathSegment = "user-agreement",
            titleRes = R.string.legal_user_agreement,
            remoteUrl = USER_AGREEMENT_URL,
            assetFileName = "user-agreement.html"
        );

        companion object {
            fun fromPathSegment(value: String?): LegalDocumentType =
                entries.firstOrNull { it.pathSegment == value } ?: PRIVACY_POLICY
        }
    }

    fun hasAcceptedRequiredAgreements(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getInt(KEY_LEGAL_ACCEPTANCE_VERSION, 0) >= REQUIRED_LEGAL_ACCEPTANCE_VERSION
    }

    fun markAcceptedRequiredAgreements(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putInt(KEY_LEGAL_ACCEPTANCE_VERSION, REQUIRED_LEGAL_ACCEPTANCE_VERSION).apply()
    }
}

fun Context.openLegalDocument(documentType: LegalConfig.LegalDocumentType) {
    startActivity(LegalDocumentActivity.createIntent(this, documentType))
}

fun Context.openExternalUrl(url: String): Boolean {
    return try {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(intent)
        true
    } catch (_: Exception) {
        false
    }
}

fun Context.findActivity(): Activity? = when (this) {
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}

