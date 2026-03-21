package com.line.game.view

import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout

/**
 * 兼容旧布局引用的轻量标题栏占位实现。
 *
 * 当前项目中 `view_base_activity.xml` 仍引用了历史包名 `com.line.game.view.BaseTitleBar`，
 * 但仓库里已没有原始实现。为避免 lint 的 MissingClass 阻塞，同时不改变现有布局结构，
 * 这里提供一个最小可用的兼容 View。
 */
class BaseTitleBar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr)

