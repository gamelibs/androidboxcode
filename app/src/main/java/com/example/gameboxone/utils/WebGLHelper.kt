package com.example.gameboxone.utils

import android.content.Context
import android.util.Log
import android.webkit.WebView
import java.io.File

/**
 * WebGL辅助工具类
 * 提供WebGL相关的配置、修复和优化
 */
object WebGLHelper {
    private const val TAG = "WebGLHelper"

    /**
     * 配置WebView以支持WebGL
     * @param webView 要配置的WebView
     */
    fun configureWebViewForWebGL() {
        Log.d(TAG, "配置WebView以支持WebGL")

    }

    
    /**
     * 获取修复WebGL GetIntegerv错误的JavaScript代码
     * @return JavaScript代码字符串
     */
    fun getWebGLFixScript(): String {
        return """
            (function() {
                // 检测并修复WebGL GetIntegerv问题
                function fixWebGLGetIntegervErrors() {
                    if (!window.WebGLRenderingContext) return false;
                    
                    const originalGetContext = HTMLCanvasElement.prototype.getContext;
                    HTMLCanvasElement.prototype.getContext = function() {
                        const context = originalGetContext.apply(this, arguments);
                        if (context && (arguments[0] === 'webgl' || arguments[0] === 'webgl2' ||
                                       arguments[0] === 'experimental-webgl')) {
                            // 应用补丁
                            patchWebGLContext(context);
                        }
                        return context;
                    };
                    
                    return true;
                }
                
                // 为WebGL上下文应用补丁
                function patchWebGLContext(gl) {
                    if (!gl || gl.__patched) return;
                    gl.__patched = true;
                    
                    // 保存原始方法
                    const originalGetParameter = gl.getParameter;
                    
                    // 替换为安全版本
                    gl.getParameter = function(pname) {
                        try {
                            return originalGetParameter.call(this, pname);
                        } catch(e) {
                            // 如果是GetIntegerv的INVALID_ENUM错误，返回一个合适的默认值
                            console.warn('拦截到GetParameter错误，参数:', pname);
                            
                            // 根据参数类型返回合适的默认值
                            if (pname === gl.RENDERER) return 'WebGL Renderer';
                            if (pname === gl.VENDOR) return 'WebGL Vendor';
                            if (pname === gl.VERSION) return 'WebGL 1.0';
                            
                            // 对于数值参数，返回保守的默认值
                            return 0;
                        }
                    };
                    
                    console.log('已应用WebGL GetIntegerv修复');
                }
                
                // 应用修复
                return fixWebGLGetIntegervErrors();
            })();
        """.trimIndent()
    }

}
