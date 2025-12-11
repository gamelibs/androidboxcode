package com.example.gameboxone.data.model

/**
 * 本地用户档案
 * - id: 首次启动生成的本地用户ID（后续可与服务端账号做映射）
 * - exp: 当前累计经验值，用于计算等级
 */
data class UserProfile(
    val id: String,
    val exp: Long
)

