package com.example.gameboxone.callback

object AndroidEventCallBackHolder {
    private var cb: AndroidEventCallBack? = null
    fun setCallback(c: AndroidEventCallBack?) { cb = c }
    fun callback(): AndroidEventCallBack? = cb
}
