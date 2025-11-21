package com.example.gameboxone.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.ump.ConsentDebugSettings
import com.google.android.ump.ConsentForm
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.FormError
import com.google.android.ump.UserMessagingPlatform
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ConsentManager @Inject constructor() {
    private val TAG = "ConsentManager"
    
    private var consentInformation: ConsentInformation? = null
    private var consentForm: ConsentForm? = null
    
    /**
     * 初始化并请求用户同意信息
     * 应在应用启动时调用，在初始化广告SDK之前
     */
    fun initializeConsent(
        context: Context,
        isDebug: Boolean = false,
        testDeviceHashedId: String? = null,
        onConsentGathered: (canRequestAds: Boolean) -> Unit
    ) {
        // 构建调试设置（仅在测试时使用）
        val debugSettings = if (isDebug && testDeviceHashedId != null) {
            ConsentDebugSettings.Builder(context)
                .setDebugGeography(ConsentDebugSettings.DebugGeography.DEBUG_GEOGRAPHY_EEA)
                .addTestDeviceHashedId(testDeviceHashedId)
                .build()
        } else null
        
        // 构建同意请求参数
        val params = ConsentRequestParameters.Builder().apply {
            debugSettings?.let { setConsentDebugSettings(it) }
            // 注意：UMP SDK会自动处理隐私政策链接，无需手动设置
            setTagForUnderAgeOfConsent(false)
        }.build()
        
        consentInformation = UserMessagingPlatform.getConsentInformation(context)
        
        Log.d(TAG, "开始请求同意信息更新")
        consentInformation?.requestConsentInfoUpdate(
            context as Activity,
            params,
            {
                Log.d(TAG, "同意信息更新成功")
                // 信息更新成功，检查是否需要显示同意表单
                if (consentInformation?.isConsentFormAvailable == true) {
                    Log.d(TAG, "同意表单可用，准备加载")
                    loadConsentForm(context, onConsentGathered)
                } else {
                    Log.d(TAG, "同意表单不可用，检查是否可以请求广告")
                    // 没有表单可用，检查是否可以请求广告
                    val canRequestAds = consentInformation?.canRequestAds() ?: false
                    Log.d(TAG, "可以请求广告: $canRequestAds")
                    onConsentGathered(canRequestAds)
                }
            },
            { formError ->
                Log.e(TAG, "同意信息更新失败: ${formError.message}")
                // 发生错误，但不阻止应用运行，按照默认行为处理
                onConsentGathered(false)
            }
        )
    }
    
    /**
     * 加载同意表单
     */
    private fun loadConsentForm(
        context: Context,
        onConsentGathered: (canRequestAds: Boolean) -> Unit
    ) {
        UserMessagingPlatform.loadConsentForm(
            context,
            { form ->
                Log.d(TAG, "同意表单加载成功")
                consentForm = form
                
                // 检查同意状态
                when (consentInformation?.consentStatus) {
                    ConsentInformation.ConsentStatus.REQUIRED -> {
                        Log.d(TAG, "需要用户同意，显示表单")
                        showConsentForm(context as Activity, onConsentGathered)
                    }
                    ConsentInformation.ConsentStatus.NOT_REQUIRED -> {
                        Log.d(TAG, "不需要用户同意")
                        onConsentGathered(true)
                    }
                    ConsentInformation.ConsentStatus.OBTAINED -> {
                        Log.d(TAG, "已获得用户同意")
                        val canRequestAds = consentInformation?.canRequestAds() ?: false
                        onConsentGathered(canRequestAds)
                    }
                    else -> {
                        Log.d(TAG, "同意状态未知")
                        onConsentGathered(false)
                    }
                }
            },
            { formError ->
                Log.e(TAG, "同意表单加载失败: ${formError.message}")
                onConsentGathered(false)
            }
        )
    }
    
    /**
     * 显示同意表单
     */
    private fun showConsentForm(
        activity: Activity,
        onConsentGathered: (canRequestAds: Boolean) -> Unit
    ) {
        consentForm?.show(activity) { formError ->
            if (formError != null) {
                Log.e(TAG, "同意表单显示失败: ${formError.message}")
            } else {
                Log.d(TAG, "同意表单已完成")
            }
            
            // 表单完成后，重新检查同意状态
            val canRequestAds = consentInformation?.canRequestAds() ?: false
            Log.d(TAG, "表单完成后可以请求广告: $canRequestAds")
            onConsentGathered(canRequestAds)
            
            // 表单使用完毕后重新加载，以备下次使用
            loadConsentForm(activity, {})
        }
    }
    
    /**
     * 显示隐私选项表单（用于设置页面）
     * 仅在 requiresPrivacyOptionsForm() 返回 true 时调用
     */
    fun showPrivacyOptionsForm(activity: Activity, onFormDismissed: () -> Unit = {}) {
        UserMessagingPlatform.showPrivacyOptionsForm(activity) { formError ->
            if (formError != null) {
                Log.e(TAG, "隐私选项表单显示失败: ${formError.message}")
            } else {
                Log.d(TAG, "隐私选项表单已完成")
            }
            onFormDismissed()
        }
    }
    
    /**
     * 检查是否需要显示隐私选项
     */
    fun requiresPrivacyOptionsForm(): Boolean {
        return consentInformation?.privacyOptionsRequirementStatus == 
               ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED
    }
    
    /**
     * 检查是否可以请求广告
     */
    fun canRequestAds(): Boolean {
        return consentInformation?.canRequestAds() ?: false
    }
    
    /**
     * 获取当前同意状态
     */
    fun getConsentStatus(): Int? {
        return consentInformation?.consentStatus
    }
    
    /**
     * 重置同意信息（仅用于测试）
     */
    fun resetConsentInformation() {
        consentInformation?.reset()
        Log.d(TAG, "同意信息已重置")
    }
}
