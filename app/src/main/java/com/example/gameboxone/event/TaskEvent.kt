package com.example.gameboxone.event

/**
 * 任务相关事件
 * - TaskAchieved: 游戏内首次达成任务目标时由 GameTaskEventHandler 发出，用于在 WebView 上弹出提示
 * - TaskClaimed:  结算页点击"确认领取"后由 WebViewActivity 发出，用于通知 HomeViewModel 刷新
 */
sealed class TaskEvent {
    /**
     * 任务首次达成目标（状态 → ACHIEVED）。
     * 由 [com.example.gameboxone.manager.GameTaskEventHandler] 在任务状态由非 ACHIEVED 首次跃迁为 ACHIEVED 时发出。
     */
    data class TaskAchieved(
        val taskId: String,
        val gameId: String,
        val taskTitle: String,
        val taskDescription: String,
        val rewardExp: Int,
        val rewardCoins: Int
    ) : TaskEvent()

    /**
     * 任务奖励已领取（状态 → CLAIMED）。
     * 由 [com.example.gameboxone.WebViewActivity] 结算页"确认领取"按钮点击后发出。
     */
    data class TaskClaimed(
        val taskId: String
    ) : TaskEvent()
}

