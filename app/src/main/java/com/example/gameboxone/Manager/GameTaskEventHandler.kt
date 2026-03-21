package com.example.gameboxone.manager

import android.content.Context
import com.example.gameboxone.AppLog as Log
import com.example.gameboxone.base.AppDatabase
import com.example.gameboxone.di.ApplicationScope
import com.example.gameboxone.event.TaskEvent
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 游戏任务事件处理器
 *
 * 职责：把 AndroidCp.js SDK 上报的原始游戏事件（分数/关卡/通关）
 * 转换为本地历练任务进度更新，驱动任务状态机流转。
 *
 * 设计原则：
 * - 只操作当前玩家当前章节内，gameId 匹配的任务
 * - 始终取最大值（maxOf），保证最好成绩不被覆盖
 * - 所有 DB 操作在 IO 线程执行，不阻塞主线程
 * - 已 CLAIMED / COMPLETED 的任务不再更新
 */
@Singleton
class GameTaskEventHandler @Inject constructor(
    @ApplicationContext private val context: Context,
    private val database: AppDatabase,
    private val eventManager: EventManager,
    @ApplicationScope private val scope: CoroutineScope
) {
    private val TAG = "GameTaskEventHandler"
    private val dao = database.localAdventureDao()

    // 任务类型常量
    private val TYPE_SCORE = "SCORE"
    private val TYPE_STAGE = "STAGE"
    private val TYPE_CLEAR = "CLEAR"
    private val TYPE_ELITE = "ELITE"
    private val TYPE_START = "START"
    private val TYPE_TIME = "TIME"
    private val TYPE_EXIT = "EXIT"

    fun onGameStart(gameId: String) {
        if (gameId.isBlank()) return
        scope.launch(Dispatchers.IO) {
            try {
                val profile = dao.getProfile() ?: return@launch
                val defs = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
                    .filter { it.gameId == gameId && it.taskType == TYPE_START }

                for (def in defs) {
                    val progress = dao.getProgressByTaskId(def.taskId) ?: continue
                    if (isTerminal(progress.status)) continue

                    val newStartCount = progress.startCount + 1
                    val achieved = newStartCount >= def.targetValue
                    val newStatus = if (achieved) "ACHIEVED" else "IN_PROGRESS"
                    dao.upsertSingleTaskProgress(
                        progress.copy(
                            startCount = newStartCount,
                            status = newStatus,
                            achievedAt = achievedAt(achieved, progress.achievedAt),
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                    Log.d(TAG, "[启动] taskId=${def.taskId} gameId=$gameId count=$newStartCount → $newStatus")
                    emitAchievedIfNew(progress.status, newStatus, def)
                }
            } catch (e: Exception) {
                Log.e(TAG, "onGameStart 失败: gameId=$gameId", e)
            }
        }
    }

    fun onGameTime(gameId: String, deltaSeconds: Int) {
        if (deltaSeconds <= 0 || gameId.isBlank()) return
        scope.launch(Dispatchers.IO) {
            try {
                val profile = dao.getProfile() ?: return@launch
                val defs = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
                    .filter { it.gameId == gameId && it.taskType == TYPE_TIME }

                for (def in defs) {
                    val progress = dao.getProgressByTaskId(def.taskId) ?: continue
                    if (isTerminal(progress.status)) continue

                    val newPlaySeconds = progress.totalPlaySeconds + deltaSeconds
                    val achieved = newPlaySeconds >= def.targetValue
                    val newStatus = if (achieved) "ACHIEVED" else "IN_PROGRESS"
                    dao.upsertSingleTaskProgress(
                        progress.copy(
                            totalPlaySeconds = newPlaySeconds,
                            status = newStatus,
                            achievedAt = achievedAt(achieved, progress.achievedAt),
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                    Log.d(TAG, "[时长] taskId=${def.taskId} gameId=$gameId seconds=$newPlaySeconds → $newStatus")
                    emitAchievedIfNew(progress.status, newStatus, def)
                }
            } catch (e: Exception) {
                Log.e(TAG, "onGameTime 失败: gameId=$gameId deltaSeconds=$deltaSeconds", e)
            }
        }
    }

    fun onGameExit(gameId: String) {
        if (gameId.isBlank()) return
        scope.launch(Dispatchers.IO) {
            try {
                val profile = dao.getProfile() ?: return@launch
                val defs = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
                    .filter { it.gameId == gameId && it.taskType == TYPE_EXIT }

                for (def in defs) {
                    val progress = dao.getProgressByTaskId(def.taskId) ?: continue
                    if (isTerminal(progress.status)) continue

                    val newExitCount = progress.exitCount + 1
                    val achieved = newExitCount >= def.targetValue
                    val newStatus = if (achieved) "ACHIEVED" else "IN_PROGRESS"
                    dao.upsertSingleTaskProgress(
                        progress.copy(
                            exitCount = newExitCount,
                            status = newStatus,
                            achievedAt = achievedAt(achieved, progress.achievedAt),
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                    Log.d(TAG, "[退出] taskId=${def.taskId} gameId=$gameId exit=$newExitCount → $newStatus")
                    emitAchievedIfNew(progress.status, newStatus, def)
                }
            } catch (e: Exception) {
                Log.e(TAG, "onGameExit 失败: gameId=$gameId", e)
            }
        }
    }

    /**
     * 游戏上报分数（来自 game_score 事件）
     *
     * 更新当前章节内该游戏的 SCORE 类型任务和 ELITE 类型任务（分支：分数满足）。
     * 取历史最高分，不回退。
     *
     * @param gameId 当前玩的游戏 ID（来自 WebViewActivity 传入的 intent gameId）
     * @param score  本次上报分数
     */
    fun onGameScore(gameId: String, score: Int) {
        if (score <= 0 || gameId.isBlank()) return
        scope.launch(Dispatchers.IO) {
            try {
                val profile = dao.getProfile() ?: return@launch
                val defs = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
                    .filter { it.gameId == gameId && it.taskType in listOf(TYPE_SCORE, TYPE_ELITE) }

                for (def in defs) {
                    val progress = dao.getProgressByTaskId(def.taskId) ?: continue
                    if (isTerminal(progress.status)) continue

                    val newScore = maxOf(progress.currentScore, score)
                    if (newScore == progress.currentScore) continue  // no change

                    val achieved = when (def.taskType) {
                        TYPE_SCORE -> newScore >= def.targetValue
                        TYPE_ELITE -> newScore >= def.targetValue || progress.clearCount >= 1
                        else -> false
                    }
                    val newStatus = when {
                        achieved -> "ACHIEVED"
                        newScore > 0 -> "IN_PROGRESS"
                        else -> progress.status
                    }
                    dao.upsertSingleTaskProgress(
                        progress.copy(
                            currentScore = newScore,
                            status = newStatus,
                            achievedAt = achievedAt(achieved, progress.achievedAt),
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                    Log.d(TAG, "[分数] taskId=${def.taskId} gameId=$gameId score=$newScore → $newStatus")
                    emitAchievedIfNew(progress.status, newStatus, def)
                }
            } catch (e: Exception) {
                Log.e(TAG, "onGameScore 失败: gameId=$gameId score=$score", e)
            }
        }
    }

    /**
     * 游戏上报到达了某关卡（来自 level_end 的 levelNum 字段，或 game_level 事件）
     *
     * 更新 STAGE 类型任务。取历史最高关卡，不回退。
     *
     * @param gameId   当前游戏 ID
     * @param levelNum 已到达的关卡编号（≥1）
     */
    fun onLevelReached(gameId: String, levelNum: Int) {
        if (levelNum <= 0 || gameId.isBlank()) return
        scope.launch(Dispatchers.IO) {
            try {
                val profile = dao.getProfile() ?: return@launch
                val defs = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
                    .filter { it.gameId == gameId && it.taskType == TYPE_STAGE }

                for (def in defs) {
                    val progress = dao.getProgressByTaskId(def.taskId) ?: continue
                    if (isTerminal(progress.status)) continue

                    val newStage = maxOf(progress.currentStage, levelNum)
                    if (newStage == progress.currentStage) continue

                    val achieved = newStage >= def.targetValue
                    val newStatus = when {
                        achieved -> "ACHIEVED"
                        newStage > 0 -> "IN_PROGRESS"
                        else -> progress.status
                    }
                    dao.upsertSingleTaskProgress(
                        progress.copy(
                            currentStage = newStage,
                            status = newStatus,
                            achievedAt = achievedAt(achieved, progress.achievedAt),
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                    Log.d(TAG, "[关卡] taskId=${def.taskId} gameId=$gameId stage=$newStage → $newStatus")
                    emitAchievedIfNew(progress.status, newStatus, def)
                }
            } catch (e: Exception) {
                Log.e(TAG, "onLevelReached 失败: gameId=$gameId level=$levelNum", e)
            }
        }
    }

    /**
     * 游戏完成一次通关（来自 level_end success=true）
     *
     * 更新 CLEAR 类型任务（通关次数+1）和 ELITE 类型任务（通关分支达成）。
     *
     * @param gameId 当前游戏 ID
     */
    fun onGameClear(gameId: String) {
        if (gameId.isBlank()) return
        scope.launch(Dispatchers.IO) {
            try {
                val profile = dao.getProfile() ?: return@launch
                val defs = dao.getTaskDefinitionsByChapter(profile.currentChapterId)
                    .filter { it.gameId == gameId && it.taskType in listOf(TYPE_CLEAR, TYPE_ELITE) }

                for (def in defs) {
                    val progress = dao.getProgressByTaskId(def.taskId) ?: continue
                    if (isTerminal(progress.status)) continue

                    val newClear = progress.clearCount + 1
                    val achieved = when (def.taskType) {
                        TYPE_CLEAR -> newClear >= def.targetValue
                        TYPE_ELITE -> newClear >= 1 || progress.currentScore >= def.targetValue
                        else -> false
                    }
                    val newStatus = if (achieved) "ACHIEVED" else "IN_PROGRESS"
                    dao.upsertSingleTaskProgress(
                        progress.copy(
                            clearCount = newClear,
                            status = newStatus,
                            achievedAt = achievedAt(achieved, progress.achievedAt),
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                    Log.d(TAG, "[通关] taskId=${def.taskId} gameId=$gameId clear=$newClear → $newStatus")
                    emitAchievedIfNew(progress.status, newStatus, def)
                }
            } catch (e: Exception) {
                Log.e(TAG, "onGameClear 失败: gameId=$gameId", e)
            }
        }
    }

    /**
     * 游戏结束时做一次最终分数快照（来自 game_over 事件，若携带 score 字段）
     * 行为与 onGameScore 相同，方便调用者区分语义。
     */
    fun onGameOver(gameId: String, finalScore: Int) {
        if (finalScore > 0) onGameScore(gameId, finalScore)
    }

    // ── 私有工具 ──────────────────────────────────────────────────────────────

    /** 已领奖或已完成的任务不再更新 */
    private fun isTerminal(status: String) =
        status == "CLAIMED" || status == "COMPLETED"

    /** 若刚刚达成且之前没有记录达成时间，则记录当前时间；否则保留旧时间 */
    private fun achievedAt(achieved: Boolean, existing: Long?): Long? =
        if (achieved && existing == null) System.currentTimeMillis() else existing

    /**
     * 如果当前更新是"首次达成"（old 非 ACHIEVED → new 是 ACHIEVED），
     * 向 EventManager 发布 TaskAchieved 事件，供 WebViewActivity 弹出提示。
     */
    private fun emitAchievedIfNew(
        oldStatus: String,
        newStatus: String,
        def: com.example.gameboxone.data.model.LocalAdventureTaskDefinitionEntity
    ) {
        if (newStatus == "ACHIEVED" && oldStatus != "ACHIEVED") {
            eventManager.emitTaskEventBlocking(
                TaskEvent.TaskAchieved(
                    taskId = def.taskId,
                    gameId = def.gameId,
                    taskTitle = def.taskTitle,
                    taskDescription = def.taskDescription,
                    rewardExp = def.rewardExp,
                    rewardCoins = def.rewardCoins
                )
            )
            Log.d(TAG, "任务首次达成，已发布 TaskAchieved: taskId=${def.taskId}")
        }
    }
}
