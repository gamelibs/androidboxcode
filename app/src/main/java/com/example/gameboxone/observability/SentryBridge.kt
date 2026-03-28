package com.example.gameboxone.observability

import android.content.Context
import com.example.gameboxone.AppLog as Log

object SentryBridge {
    private const val TAG = "SentryBridge"
    private const val CLASS_SENTRY = "io.sentry.Sentry"
    private const val CLASS_SENTRY_ANDROID = "io.sentry.android.core.SentryAndroid"
    private const val CLASS_BREADCRUMB = "io.sentry.Breadcrumb"
    private const val CLASS_USER = "io.sentry.protocol.User"
    private const val CLASS_LEVEL = "io.sentry.SentryLevel"

    fun initialize(context: Context): Boolean {
        return runCatching {
            val sentryAndroid = Class.forName(CLASS_SENTRY_ANDROID)
            val initMethod = sentryAndroid.methods.firstOrNull {
                it.name == "init" && it.parameterTypes.size == 1 &&
                    Context::class.java.isAssignableFrom(it.parameterTypes[0])
            } ?: return false
            initMethod.invoke(null, context)
            true
        }.onFailure {
            Log.w(TAG, "Sentry 初始化失败或 SDK 不可用", it)
        }.getOrDefault(false)
    }

    fun addBreadcrumb(category: String, message: String, data: Map<String, String> = emptyMap()) {
        runCatching {
            val breadcrumbClass = Class.forName(CLASS_BREADCRUMB)
            val breadcrumb = breadcrumbClass.getDeclaredConstructor().newInstance()
            breadcrumbClass.getMethod("setCategory", String::class.java).invoke(breadcrumb, category)
            breadcrumbClass.getMethod("setMessage", String::class.java).invoke(breadcrumb, message)
            val levelClass = Class.forName(CLASS_LEVEL)
            val infoLevel = java.lang.Enum.valueOf(levelClass.asSubclass(Enum::class.java), "INFO")
            breadcrumbClass.getMethod("setLevel", levelClass).invoke(breadcrumb, infoLevel)
            val setData = breadcrumbClass.methods.firstOrNull {
                it.name == "setData" && it.parameterTypes.size == 2
            }
            data.forEach { (key, value) ->
                setData?.invoke(breadcrumb, key, value)
            }

            val sentryClass = Class.forName(CLASS_SENTRY)
            val addBreadcrumb = sentryClass.methods.firstOrNull {
                it.name == "addBreadcrumb" && it.parameterTypes.size == 1 &&
                    it.parameterTypes[0].name == CLASS_BREADCRUMB
            } ?: return
            addBreadcrumb.invoke(null, breadcrumb)
        }.onFailure {
            Log.w(TAG, "写入 Sentry breadcrumb 失败", it)
        }
    }

    fun setUser(id: String?, username: String?) {
        runCatching {
            val sentryClass = Class.forName(CLASS_SENTRY)
            val setUserMethod = sentryClass.methods.firstOrNull {
                it.name == "setUser" && it.parameterTypes.size == 1
            } ?: return

            if (id.isNullOrBlank() && username.isNullOrBlank()) {
                setUserMethod.invoke(null, arrayOfNulls<Any>(1))
                return
            }

            val userClass = Class.forName(CLASS_USER)
            val user = userClass.getDeclaredConstructor().newInstance()
            userClass.methods.firstOrNull { it.name == "setId" && it.parameterTypes.size == 1 }
                ?.invoke(user, id)
            userClass.methods.firstOrNull { it.name == "setUsername" && it.parameterTypes.size == 1 }
                ?.invoke(user, username)
            setUserMethod.invoke(null, user)
        }.onFailure {
            Log.w(TAG, "设置 Sentry 用户信息失败", it)
        }
    }

    fun captureException(throwable: Throwable, tags: Map<String, String> = emptyMap()) {
        runCatching {
            val sentryClass = Class.forName(CLASS_SENTRY)
            val pushScope = sentryClass.methods.firstOrNull { it.name == "pushScope" && it.parameterTypes.isEmpty() }
            val popScope = sentryClass.methods.firstOrNull { it.name == "popScope" && it.parameterTypes.isEmpty() }
            val setTag = sentryClass.methods.firstOrNull {
                it.name == "setTag" && it.parameterTypes.size == 2
            }
            val capture = sentryClass.methods.firstOrNull {
                it.name == "captureException" && it.parameterTypes.size == 1 &&
                    Throwable::class.java.isAssignableFrom(it.parameterTypes[0])
            } ?: return

            pushScope?.invoke(null)
            tags.forEach { (key, value) -> setTag?.invoke(null, key, value) }
            capture.invoke(null, throwable)
            popScope?.invoke(null)
        }.onFailure {
            Log.w(TAG, "上报 Sentry 异常失败", it)
        }
    }
}


