package com.example.gameboxone.data.model

/**
 * 用户等级配置：本地静态表
 * 后续如果需要接入服务端，可在此基础上做远端覆盖。
 */
data class UserLevel(
    val level: Int,
    val title: String,
    val requiredExp: Long
)

object UserLevelConfig {
    private val levels = listOf(
        UserLevel(1, "探索者", 0),
        UserLevel(2, "小旅者", 100),
        UserLevel(3, "冒险者", 300),
        UserLevel(4, "勇敢者", 600),
        UserLevel(5, "先行者", 1000),
        UserLevel(6, "探险大师", 1600),
        UserLevel(7, "终极探险家", 2300)
    )

    /**
     * 根据经验值计算当前等级
     */
    fun levelForExp(exp: Long): UserLevel {
        val nonNegative = exp.coerceAtLeast(0)
        return levels.lastOrNull { nonNegative >= it.requiredExp } ?: levels.first()
    }

    /**
     * 获取当前等级的下一等级（若已是最高等级，则返回自身）
     */
    fun nextLevel(current: UserLevel): UserLevel {
        val idx = levels.indexOfFirst { it.level == current.level }
        return if (idx in 0 until levels.lastIndex) levels[idx + 1] else levels.last()
    }
}
