# 项目文档 (Project Documentation)

## 1. 项目概览 (Project Overview)
本项目 `GameBoxOne` 是一个基于 Android 平台的混合开发应用，集成了原生 UI (Jetpack Compose) 和 WebView 容器。项目采用现代化的 Android 开发架构 (MVVM + Clean Architecture)，并集成了本地服务器、广告 SDK 以及依赖注入等高级特性。

## 2. 技术栈 (Tech Stack)
- **语言**: Kotlin
- **UI 框架**: Jetpack Compose (Material3)
- **架构模式**: MVVM (Model-View-ViewModel)
- **依赖注入**: Hilt (Dagger)
- **网络请求**: Retrofit + Gson
- **数据库**: Room (使用 KSP)
- **图片加载**: Coil
- **导航**: Navigation Compose
- **WebView**: AndroidX WebKit
- **本地服务器**: NanoHTTPD (用于本地资源服务)
- **广告**: Google Mobile Ads SDK (AdMob) + UMP
- **构建工具**: Gradle (Kotlin DSL) + Version Catalogs

## 3. 项目结构 (Project Structure)

### 根目录结构
```
/Users/vidar/works/AndroidCode
├── app/                        # 主应用模块
│   ├── src/main/java/com/example/gameboxone/  # 源码目录
│   ├── build.gradle.kts        # 模块构建脚本
│   └── ...
├── gradle/                     # Gradle 配置
│   └── libs.versions.toml      # 版本目录 (Version Catalog)
├── build.gradle.kts            # 项目构建脚本
└── settings.gradle.kts         # 项目设置
```

### 源码目录结构 (`com.example.gameboxone`)
```
com.example.gameboxone
├── ads/                        # 广告相关逻辑 (AdMob, UMP)
├── base/                       # 基础类 (BaseActivity, BaseViewModel 等)
├── callback/                   # 接口回调定义
├── data/                       # 数据层 (Repository, DataSource, Entity)
├── di/                         # 依赖注入模块 (Hilt Modules)
├── event/                      # 事件总线或事件定义
├── game/                       # 游戏业务逻辑
├── manager/                    # 全局管理器
├── navigation/                 # 导航配置 (NavHost, Routes)
├── service/                    # 后台服务
├── ui/                         # UI 界面 (Screens, Components, Theme)
├── utils/                      # 工具类
├── webview/                    # WebView 封装与交互
├── App.kt                      # Application 入口类
├── AppLog.kt                   # 日志工具
├── MainActivity.kt             # 主界面 Activity
├── WebViewActivity.kt          # 网页容器 Activity
└── WebViewBridgeRegistrar.kt   # JS Bridge 注册器
```

## 4. 模块说明 (Module Description)

- **`ads/`**: 负责 Google AdMob 广告的加载与展示，以及 UMP (User Messaging Platform) 的隐私合意管理。
- **`data/`**: 包含 Room 数据库定义、Retrofit 网络接口以及 Repository 实现，负责数据的获取与持久化。
- **`di/`**: Hilt 模块定义，提供全局单例（如 Database, NetworkClient）和 ViewModel 的依赖注入。
- **`ui/`**: 存放所有 Jetpack Compose 的 UI 代码，包括各个屏幕 (`Screen`) 和可复用组件 (`Component`)。
- **`webview/`**: 包含 WebView 的配置、WebChromeClient/WebViewClient 的自定义实现，以及与原生代码交互的 JS Bridge。
- **`game/`**: 处理特定于游戏业务的逻辑，可能包含游戏配置解析或状态管理。
- **`service/`**: 包含后台服务，可能用于长时间运行的任务或本地服务器的保活。
- **`utils/`**: 通用工具类，如文件操作、网络检测、扩展函数等。

## 5. 关键特性 (Key Features)

1.  **混合开发 (Hybrid Development)**:
    - 使用 `WebViewActivity` 加载网页内容。
    - 通过 `WebViewBridgeRegistrar` 实现 JavaScript 与 Kotlin 的双向通信。
    - 集成 `NanoHTTPD`，支持在本地启动 HTTP 服务器，加速本地 H5 游戏或资源的加载。

2.  **现代化 UI**:
    - 全面使用 Jetpack Compose 构建原生界面。
    - 支持 Material3 设计规范。

3.  **数据驱动**:
    - 使用 Room 进行本地数据缓存。
    - 使用 Retrofit 进行远程配置获取。

4.  **商业化**:
    - 集成 Google AdMob 进行广告变现。
