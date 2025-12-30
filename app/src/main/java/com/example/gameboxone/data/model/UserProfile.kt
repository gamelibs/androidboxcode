package com.example.gameboxone.data.model

/**
 * 本地用户档案
 * - id: 首次启动生成的本地用户ID（后续可与服务端账号做映射）
 * - exp: 当前累计经验值，用于计算等级
 */
data class UserProfile(
    val id: String,
    val exp: Long,
    // 服务端玩家信息（可选，应用启动后注册/登录成功会填充）
    val playerId: String? = null,
    val groupId: String? = null,
    val nickname: String? = null,
    val level: Int? = null,
    val expPercent: Int? = null,
    val coins: Int? = null,
    val createdAt: String? = null,
    val token: String? = null,
    val tokenExpiresAt: String? = null
)
