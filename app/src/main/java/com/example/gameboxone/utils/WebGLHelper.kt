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
    fun configureWebViewForWebGL(webView: WebView) {
        Log.d(TAG, "配置WebView以支持WebGL")
        fun configureWebViewForWebGL(webView: WebView) {
            webView.evaluateJavascript(
                """
            (function() {
                try {
                    // 防止重复执行
                    if (window.__webglFixed) return "已应用WebGL修复";
                    window.__webglFixed = true;
                    
                    // 重写 getContext 方法以注入安全的 getParameter
                    const getContext = HTMLCanvasElement.prototype.getContext;
                    HTMLCanvasElement.prototype.getContext = function(type, attrs) {
                        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
                            const gl = getContext.call(this, type, {
                                alpha: true,
                                antialias: true,
                                depth: true,
                                failIfMajorPerformanceCaveat: false,
                                powerPreference: 'high-performance',
                                premultipliedAlpha: false,
                                preserveDrawingBuffer: true,
                                stencil: true,
                                ...attrs
                            });
                            
                            if (gl && !gl.__parameterFixed) {
                                const originalGetParameter = gl.getParameter;
                                gl.getParameter = function(pname) {
                                    try {
                                        const value = originalGetParameter.call(this, pname);
                                        return value;
                                    } catch(e) {
                                        // 返回安全的默认值
                                        switch(pname) {
                                            case gl.MAX_TEXTURE_SIZE: return 4096;
                                            case gl.MAX_VERTEX_ATTRIBS: return 16;
                                            case gl.MAX_VERTEX_UNIFORM_VECTORS: return 256;
                                            case gl.MAX_VARYING_VECTORS: return 8;
                                            case gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS: return 8;
                                            case gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS: return 8;
                                            case gl.MAX_TEXTURE_IMAGE_UNITS: return 8;
                                            case gl.MAX_FRAGMENT_UNIFORM_VECTORS: return 256;
                                            case gl.MAX_CUBE_MAP_TEXTURE_SIZE: return 4096;
                                            case gl.MAX_RENDERBUFFER_SIZE: return 4096;
                                            case gl.MAX_VIEWPORT_DIMS: return [4096, 4096];
                                            default: return null;
                                        }
                                    }
                                };
                                gl.__parameterFixed = true;
                            }
                            return gl;
                        }
                        return getContext.call(this, type, attrs);
                    };
                    
                    return "WebGL修复已应用";
                } catch(e) {
                    console.error("WebGL修复失败:", e);
                    return "WebGL修复失败: " + e.message;
                }
            })();
        """.trimIndent()
            ) { result ->
                Log.d(TAG, "WebGL配置结果: $result")
            }
        }
//        try {
//            // 设置DOM存储配置
//            val dataDir = webView.context.getDir("webview", Context.MODE_PRIVATE)
//            if (!dataDir.exists()) {
//                dataDir.mkdirs()
//            }
//
//            // 创建缓存文件结构
//            createWebGLCacheDirectories(webView.context)
//
//            // 设置CPU和GPU的首选项
//            val webglPrefs = """
//                WebGLPreference=true
//                WebGLMultithreading=true
//                WebGLDraft=true
//                WebGLPowerPreference=high-performance
//                WebGLCPURasterization=false
//                WebGLANGLEDeveloperTools=false
//                WebGLDeveloperExtensions=true
//            """.trimIndent()
//
//            // 将设置写入到文件中
//            val prefsFile = File(dataDir, "webgl_prefs.txt")
//            prefsFile.writeText(webglPrefs)
//
//            Log.d(TAG, "WebGL配置完成：首选项文件已创建")
//        } catch (e: Exception) {
//            Log.e(TAG, "配置WebGL时出错", e)
//        }
    }
    
    /**
     * 创建WebGL需要的缓存目录结构
     */
    private fun createWebGLCacheDirectories(context: Context) {
        try {
            val dirs = listOf(
                File(context.cacheDir, "WebView/Default/GPUCache"),
                File(context.cacheDir, "WebView/Default/Code Cache/wasm"),
                File(context.cacheDir, "WebView/Default/Code Cache/js"),
                File(context.cacheDir, "WebView/Default/File System/Origins")
            )
            
            dirs.forEach { dir ->
                if (!dir.exists()) {
                    val created = dir.mkdirs()
                    Log.d(TAG, "创建目录: ${dir.absolutePath}, 结果: $created")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "创建WebGL缓存目录失败", e)
        }
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
    
    /**
     * 向页面注入WebGL修复脚本
     */
    fun injectWebGLFixes(webView: WebView) {
        webView.evaluateJavascript(getWebGLFixScript()) { result ->
            Log.d(TAG, "WebGL修复脚本注入结果: $result")
        }
    }

    /**
     * 注入针对 getParameter 的修复，避免 GL_INVALID_ENUM 错误
     */
    fun injectGetIntegervFix(webView: WebView) {
        webView.evaluateJavascript("""
            (function() {
                if(window.__getParameterFixed) return "修复已应用";
                window.__getParameterFixed = true;
                
                function patchContext(glContext) {
                    if(!glContext) return;
                    var originalGetParameter = glContext.getParameter;
                    glContext.getParameter = function(pname) {
                        try {
                            return originalGetParameter.call(this, pname);
                        } catch (e) {
                            console.warn("getParameter 拦截异常，参数:", pname);
                            // 对常见枚举返回安全默认值
                            if(pname === this.VERSION) return "WebGL 1.0 (Safe)";
                            if(pname === this.SHADING_LANGUAGE_VERSION) return "WebGL GLSL ES 1.0";
                            if(pname === this.VENDOR) return "Unknown Vendor";
                            if(pname === this.RENDERER) return "Unknown Renderer";
                            return null;
                        }
                    }
                }
                
                // patch 当前页面所有 canvas 获取到的 WebGL 上下文
                var canvases = document.getElementsByTagName("canvas");
                for(var i=0;i<canvases.length;i++){
                    var canvas = canvases[i];
                    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") || canvas.getContext("webgl2");
                    patchContext(gl);
                }
                
                return "GetIntegerv修复已应用";
            })();
         """.trimIndent()) { result ->
            Log.d(TAG, "injectGetIntegervFix: $result")
        }
    }

}
