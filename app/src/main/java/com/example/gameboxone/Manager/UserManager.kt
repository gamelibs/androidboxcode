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
import com.example.gameboxone.data.model.PlayerLoginResponse
import com.example.gameboxone.data.model.PlayerMeResponse
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow

/**
 * 本地用户管理器
 * - 首次启动时生成一个本地 userId，并持久化到 SharedPreferences
 * - 维护用户经验值 exp，后续任务系统可以通过 addExp/updateExp 接口进行更新
 * - 当前仅用于在顶部栏展示等级信息（LvX 称号）
 */
@Singleton
class UserManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val netManager: NetManager
) {

    companion object {
        private const val TAG = "UserManager"
        private const val PREF_NAME = "user_profile"
        private const val KEY_ID = "id"
        private const val KEY_EXP = "exp"
        private const val KEY_PLAYER_ID = "player_id"
        private const val KEY_GROUP_ID = "group_id"
        private const val KEY_NICKNAME = "nickname"
        private const val KEY_LEVEL = "level"
        private const val KEY_EXP_PERCENT = "exp_percent"
        private const val KEY_COINS = "coins"
        private const val KEY_CREATED_AT = "created_at"
        private const val KEY_TOKEN = "token"
        private const val KEY_TOKEN_EXPIRES_AT = "token_expires_at"
        private const val KEY_DEVICE_ID = "device_id"

        // 业务侧 groupId（当前为固定值；后续可从配置/渠道注入）
        private const val DEFAULT_GROUP_ID = "1767001583696932"
    }

    private val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    enum class AuthState {
        UNKNOWN,
        LOGGING_IN,
        LOGGED_IN,
        GUEST,
        TOKEN_INVALID,
        ERROR
    }

    private val _authState = MutableStateFlow(AuthState.UNKNOWN)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _events = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val events: SharedFlow<String> = _events

    private fun loadProfile(): UserProfile {
        val existingId = prefs.getString(KEY_ID, null)
        val id = existingId ?: UUID.randomUUID().toString().also {
            prefs.edit().putString(KEY_ID, it).apply()
            Log.d(TAG, "生成新的本地用户ID: $it")
        }
        val exp = prefs.getLong(KEY_EXP, 0L)
        val playerId = prefs.getString(KEY_PLAYER_ID, null)
        val groupId = prefs.getString(KEY_GROUP_ID, null)
        val nickname = prefs.getString(KEY_NICKNAME, null)
        val level = prefs.getInt(KEY_LEVEL, 0).takeIf { it > 0 }
        val expPercent = prefs.getInt(KEY_EXP_PERCENT, -1).takeIf { it >= 0 }
        val coins = prefs.getInt(KEY_COINS, -1).takeIf { it >= 0 }
        val createdAt = prefs.getString(KEY_CREATED_AT, null)
        val token = prefs.getString(KEY_TOKEN, null)
        val tokenExpiresAt = prefs.getString(KEY_TOKEN_EXPIRES_AT, null)
        val deviceId = prefs.getString(KEY_DEVICE_ID, null)

        _authState.value = if (!playerId.isNullOrBlank() && !token.isNullOrBlank()) {
            AuthState.LOGGED_IN
        } else {
            AuthState.GUEST
        }

        return UserProfile(
            id = id,
            exp = exp,
            playerId = playerId,
            groupId = groupId,
            nickname = nickname,
            level = level,
            expPercent = expPercent,
            coins = coins,
            createdAt = createdAt,
            token = token,
            tokenExpiresAt = tokenExpiresAt
        )
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

    /**
     * 应用启动后调用：如果本地没有服务端玩家信息，则注册一个玩家并保存 token。
     * 注意：当前接口等价于“匿名注册/登录”，后续可扩展为 token 续期或真正账号体系。
     */
    suspend fun ensurePlayerRegistered(
        groupId: String = DEFAULT_GROUP_ID,
        nickname: String? = null
    ): Result<UserProfile> {
        // 兼容旧方法名：现在统一走 login 接口（可重复调用）
        val current = _profile.value

        val effectiveNickname = nickname?.trim().takeUnless { it.isNullOrBlank() }
            ?: current.nickname?.trim().takeUnless { it.isNullOrBlank() }
            ?: ("player_" + current.id.takeLast(6))

        val deviceId = ensureDeviceId()
        _authState.value = AuthState.LOGGING_IN
        val result = netManager.loginPlayer(groupId = groupId, deviceId = deviceId, nickname = effectiveNickname)
        return result.map { resp ->
            persistPlayer(resp)
            val updated = _profile.value.copy(
                playerId = resp.id,
                groupId = resp.groupId,
                nickname = resp.nickname,
                level = resp.level,
                expPercent = resp.expPercent,
                coins = resp.coins,
                createdAt = resp.createdAt,
                token = resp.token,
                tokenExpiresAt = resp.tokenExpiresAt
            )
            _profile.value = updated
            _authState.value = AuthState.LOGGED_IN
            Log.d(TAG, "玩家登录成功: playerId=${resp.id}, nickname=${resp.nickname}, level=${resp.level}, coins=${resp.coins}, deviceId=$deviceId")
            updated
        }.onFailure {
            _authState.value = AuthState.ERROR
        }
    }

    /**
     * 自动登录：
     * - 若本地已有 token：调用 GET /api/v1/player/me 校验并拉取玩家信息
     * - 若 401：提示 token 失效，并清理本地 token（后续可触发重新注册）
     * - 若无 token：保持游客状态（可由调用方决定是否立即注册）
     */
    suspend fun ensurePlayerSession(
        groupId: String = DEFAULT_GROUP_ID,
        nickname: String? = null,
        autoReRegisterOn401: Boolean = true
    ): Result<UserProfile> {
        val current = _profile.value
        val token = current.token?.trim().orEmpty()
        if (token.isBlank()) {
            _authState.value = AuthState.GUEST
            // 没有 token：直接走 login 获取（避免“注册只能一次”的问题）
            return ensurePlayerRegistered(groupId = groupId, nickname = nickname)
        }

        _authState.value = AuthState.LOGGING_IN
        val meResult = netManager.getPlayerMe(token)
        return meResult.fold(
            onSuccess = { me ->
                applyMe(me, token)
                _authState.value = AuthState.LOGGED_IN
                Result.success(_profile.value)
            },
            onFailure = { e ->
                val is401 = (e as? NetManager.HttpStatusException)?.code == 401 || e.message?.contains("HTTP 401") == true
                if (is401) {
                    _authState.value = AuthState.TOKEN_INVALID
                    _events.tryEmit("登录已失效，请重新登录")
                    clearPlayerSession()
                    if (autoReRegisterOn401) {
                        _events.tryEmit("正在重新获取 token…")
                        return@fold ensurePlayerRegistered(groupId = groupId, nickname = nickname)
                    }
                } else {
                    _authState.value = AuthState.ERROR
                }
                Result.failure(e)
            }
        )
    }

    fun clearPlayerSession() {
        prefs.edit()
            .remove(KEY_PLAYER_ID)
            .remove(KEY_GROUP_ID)
            .remove(KEY_NICKNAME)
            .remove(KEY_LEVEL)
            .remove(KEY_EXP_PERCENT)
            .remove(KEY_COINS)
            .remove(KEY_CREATED_AT)
            .remove(KEY_TOKEN)
            .remove(KEY_TOKEN_EXPIRES_AT)
            .apply()
        val current = _profile.value
        _profile.value = current.copy(
            playerId = null,
            groupId = null,
            nickname = null,
            level = null,
            expPercent = null,
            coins = null,
            createdAt = null,
            token = null,
            tokenExpiresAt = null
        )
        _authState.value = AuthState.GUEST
    }

    private fun ensureDeviceId(): String {
        val existing = prefs.getString(KEY_DEVICE_ID, null)?.trim()
        if (!existing.isNullOrBlank()) return existing

        val newId = UUID.randomUUID().toString()
        prefs.edit().putString(KEY_DEVICE_ID, newId).apply()
        Log.d(TAG, "生成 deviceId: $newId")
        return newId
    }

    private fun applyMe(me: PlayerMeResponse, token: String) {
        // /me 可能不返回 token，使用本地 token 继续保留
        prefs.edit()
            .putString(KEY_PLAYER_ID, me.id)
            .putString(KEY_GROUP_ID, me.groupId)
            .putString(KEY_NICKNAME, me.nickname)
            .putInt(KEY_LEVEL, me.level)
            .putInt(KEY_EXP_PERCENT, me.expPercent)
            .putInt(KEY_COINS, me.coins)
            .putString(KEY_CREATED_AT, me.createdAt)
            .putString(KEY_TOKEN, me.token ?: token)
            .putString(KEY_TOKEN_EXPIRES_AT, me.tokenExpiresAt ?: prefs.getString(KEY_TOKEN_EXPIRES_AT, null))
            .apply()

        _profile.value = _profile.value.copy(
            playerId = me.id,
            groupId = me.groupId,
            nickname = me.nickname,
            level = me.level,
            expPercent = me.expPercent,
            coins = me.coins,
            createdAt = me.createdAt,
            token = me.token ?: token,
            tokenExpiresAt = me.tokenExpiresAt ?: _profile.value.tokenExpiresAt
        )
    }

    private fun persistPlayer(resp: PlayerLoginResponse) {
        prefs.edit()
            .putString(KEY_PLAYER_ID, resp.id)
            .putString(KEY_GROUP_ID, resp.groupId)
            .putString(KEY_NICKNAME, resp.nickname)
            .putInt(KEY_LEVEL, resp.level)
            .putInt(KEY_EXP_PERCENT, resp.expPercent)
            .putInt(KEY_COINS, resp.coins)
            .putString(KEY_CREATED_AT, resp.createdAt)
            .putString(KEY_TOKEN, resp.token)
            .putString(KEY_TOKEN_EXPIRES_AT, resp.tokenExpiresAt)
            .apply()
    }
}
