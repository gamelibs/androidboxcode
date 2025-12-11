package com.example.gameboxone.manager

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.data.model.UserLevelConfig
import com.example.gameboxone.data.model.UserProfile
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 本地用户管理器
 * - 首次启动时生成一个本地 userId，并持久化到 SharedPreferences
 * - 维护用户经验值 exp，后续任务系统可以通过 addExp/updateExp 接口进行更新
 * - 当前仅用于在顶部栏展示等级信息（LvX 称号）
 */
@Singleton
class UserManager @Inject constructor(
    @ApplicationContext private val context: Context
) {

    companion object {
        private const val TAG = "UserManager"
        private const val PREF_NAME = "user_profile"
        private const val KEY_ID = "id"
        private const val KEY_EXP = "exp"
    }

    private val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    private fun loadProfile(): UserProfile {
        val existingId = prefs.getString(KEY_ID, null)
        val id = existingId ?: UUID.randomUUID().toString().also {
            prefs.edit().putString(KEY_ID, it).apply()
            Log.d(TAG, "生成新的本地用户ID: $it")
        }
        val exp = prefs.getLong(KEY_EXP, 0L)
        return UserProfile(id = id, exp = exp)
    }

    private val _profile = MutableStateFlow(loadProfile())
    val profile: StateFlow<UserProfile> = _profile.asStateFlow()

    /**
     * 仅供后续任务系统调用：直接设置经验值
     */
    fun updateExp(newExp: Long) {
        val safeExp = newExp.coerceAtLeast(0)
        val current = _profile.value
        if (current.exp == safeExp) return

        val updated = current.copy(exp = safeExp)
        _profile.value = updated
        prefs.edit().putLong(KEY_EXP, safeExp).apply()
        val level = UserLevelConfig.levelForExp(safeExp)
        Log.d(TAG, "更新经验值: exp=$safeExp, 当前等级=Lv${level.level} ${level.title}")
    }

    /**
     * 仅供后续任务系统调用：增加经验值
     */
    fun addExp(delta: Long) {
        if (delta == 0L) return
        val currentExp = _profile.value.exp
        updateExp(currentExp + delta)
    }
}

