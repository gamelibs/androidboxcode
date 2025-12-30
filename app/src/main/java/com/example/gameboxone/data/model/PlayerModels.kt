package com.example.gameboxone.data.model

/**
 * 玩家登录请求/响应模型
 * 对接接口：POST /api/v1/player/login
 */
data class PlayerLoginRequest(
    val groupId: String,
    val deviceId: String,
    val nickname: String
)

data class PlayerLoginResponse(
    val id: String,
    val groupId: String,
    val nickname: String,
    val level: Int,
    val expPercent: Int,
    val coins: Int,
    val createdAt: String,
    val token: String,
    val tokenExpiresAt: String
)

/**
 * 玩家信息（自动登录 /me）
 * GET /api/v1/player/me
 * 注意：服务端可能不返回 token 字段，这里用 nullable 兼容。
 */
data class PlayerMeResponse(
    val id: String,
    val groupId: String,
    val nickname: String,
    val level: Int,
    val expPercent: Int,
    val coins: Int,
    val createdAt: String,
    val token: String? = null,
    val tokenExpiresAt: String? = null
)

/**
 * SDK 信息（需要用户 token）
 * GET /api/v1/player/sdk
 */
data class PlayerSdkResponse(
    val beta: String,
    val release: String,
    val sdkVersion: String
)
