# GameBoxOne 观测与发布收口说明

> 更新时间：2026-03-26

## 1. 当前已落地内容

### 广告合规/安全态
- `release` 构建默认走 **fail-close**：若仍是 Google 测试广告位，则不初始化广告请求
- 调试广告逻辑仅允许在 `BuildConfig.ENABLE_AD_DEBUG=true` 下生效
- `AdManager` 已增加 `ad_show / ad_complete / ad_error` 事件回流

### 崩溃上报平台
- 新增 `CrashReporter` 抽象
- 默认实现为 `CompositeCrashReporter(Local + Sentry)`
- 会持久化最近一次崩溃快照到 `SharedPreferences(observability_prefs)`
- 崩溃页会展示 `crashId`
- 当 `SENTRY_DSN` 已配置时，会在 `release` 包内自动初始化 Sentry Android SDK

### 埋点管理器
- 新增 `AnalyticsManager`
- 已接入的核心事件：
  - `app_launch`
  - `app_first_open`
  - `legal_accepted`
  - `home_view`
  - `player_login_success`
  - `player_login_failed`
  - `game_detail_view`
  - `task_detail_view`
  - `game_launch_click`
  - `game_start`
  - `game_exit`
  - `game_play_time`
  - `task_achieved`
  - `task_reward_claimed`
  - `level_up`
  - `sdk_refresh_start / success / fail`
  - `data_refresh_start / complete / data_error`
  - `game_download_start / success / fail`
  - `ad_show / ad_complete / ad_error`

## 2. 当前实现边界

本轮为 **可直接启用的真实平台接入版**，但仍保留本地降级：
- 未配置 `SENTRY_DSN`：
  - 埋点：写 `GAMEBOX` 日志 + 本地 breadcrumb
  - 崩溃：写本地最近一次崩溃记录
- 已配置 `SENTRY_DSN`：
  - 崩溃：本地记录 + Sentry 上报
  - 埋点：继续本地日志，并将事件写入 Sentry breadcrumb

仍未接入的能力：
- Firebase Analytics / Firebase Crashlytics
- 独立产品分析平台（如 PostHog / Mixpanel）
- 自建事件上报网关

## 3. 替换到真实平台的接入点

### 埋点
直接替换：
- `app/src/main/java/com/example/gameboxone/observability/AnalyticsManager.kt`

建议：
- 保留当前事件名不变
- 在 `track()` 内增加第三方 SDK 调用
- 继续保留 `AppLog` 输出，便于联调

### Sentry 启用方式

在项目根目录 `gradle.properties` 或 CI 注入：

```properties
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=release
```

无需额外 `google-services.json`。

### 崩溃
默认实现：
- `app/src/main/java/com/example/gameboxone/observability/LocalCrashReporter.kt`
- `app/src/main/java/com/example/gameboxone/observability/SentryCrashReporter.kt`
- `app/src/main/java/com/example/gameboxone/observability/CompositeCrashReporter.kt`

绑定位置：
- `app/src/main/java/com/example/gameboxone/observability/ObservabilityModule.kt`

## 4. 发版前检查项

- [ ] `release` 包确认已替换正式广告位
- [ ] `BuildConfig.ENABLE_AD_DEBUG=false` 的包上验证广告不会误走测试逻辑
- [ ] 冷启动 -> 同意协议 -> 首页 -> 启动游戏 -> 任务达成 -> 领奖 -> 升级 全链路日志可见
- [ ] 人工制造一次非致命异常，确认 `CrashReporter` 记录正常
- [ ] 人工制造一次崩溃，确认崩溃页能显示 `crashId`
- [ ] 已配置 `SENTRY_DSN` 时，确认崩溃在 Sentry 控制台可见
- [ ] release 包下确认 WebView 仅允许本地游戏服务继续在内嵌页打开

