# GameBoxOne / Google Play Data Safety 填表草稿

> 生成时间：2026-03-20  
> 说明：这是基于当前仓库代码实现的**保守草稿**，用于你在 Play Console 填写 Data Safety 时参考。  
> 最终提交前，请结合你实际上线版本中的 SDK、后端、日志系统和广告策略再次确认。

---

## 1. 当前代码层面可确认的数据处理范围

根据当前项目实现，应用存在以下数据处理路径：

### A. 本地持久化数据
来源：`SharedPreferences`、`Room`、本地缓存目录

当前可见内容包括：
- 匿名用户 ID / deviceId
- 本地成长经验、等级、任务进度、奖励状态
- 服务端 playerId / token / tokenExpiresAt（如登录成功）
- 下载的游戏资源、SDK 资源、配置缓存
- 广告开关、深色模式、环境设置、下载偏好

### B. 网络请求 / 服务端交互
当前代码会与后端交互：
- 匿名登录 / 获取 token
- 拉取游戏列表
- 拉取 SDK 配置与版本
- 可能读取玩家信息 `/me`

### C. 广告与同意管理
当前接入：
- Google AdMob
- Google UMP（User Messaging Platform）

相关数据可能包括：
- 广告同意状态
- 广告 ID / 设备标识符（由 Google SDK 处理）
- 广告展示 / 点击 / 奖励事件

### D. WebView 游戏数据
当前通过 WebView 与 H5 游戏通信，可能处理：
- 分数
- 关卡
- 通关状态
- 游戏时长
- 游戏开始/结束相关事件（部分已接、部分在继续补齐）

这些数据当前主要用于：
- 本地任务系统推进
- 历练成长反馈
- 本地结算与奖励

---

## 2. Play Console 里建议保守勾选的数据类别

> 以下是“建议披露”，不是法律结论；目的是尽量避免漏报。

### 2.1 Personal info（个人信息）
#### User IDs
**建议：勾选收集**

理由：
- 项目中存在本地匿名 ID
- 也存在服务端 `playerId`
- 存在 token 对应的玩家身份上下文

用途建议：
- App functionality
- Account management（如果你保留 player/token 登录链路）
- Fraud prevention / security（如适用）

是否共享：
- **通常填 No / not shared**，除非你确认第三方会接收此 ID

---

### 2.2 App activity（应用活动）
#### App interactions
**建议：勾选收集**

理由：
- 任务进度、游戏启动、奖励领取、历练成长、游戏下载等都属于应用交互行为
- 若广告 / 统计 SDK 上报交互，也建议保守披露

用途建议：
- App functionality
- Analytics（如果你后续接统计）
- Personalization（如你未来做推荐）

---

### 2.3 Device or other IDs（设备或其他标识符）
**建议：勾选收集**

理由：
- 当前代码中存在 `deviceId`
- 广告 SDK 可能使用设备标识符 / Advertising ID

用途建议：
- App functionality
- Fraud prevention / security
- Advertising or marketing（广告侧）

共享：
- 若启用 AdMob，通常需要按 Google 广告链路保守理解为**可能与服务提供方共享**

---

### 2.4 Diagnostics（诊断信息）
**当前建议：视实际上线内容决定**

如果你正式版还没有接：
- Firebase Crashlytics
- Sentry
- 统计诊断 SDK

则可以：
- 暂不勾选“收集诊断数据”

但如果上线前你接了崩溃或性能 SDK，就需要补充为：
- 崩溃日志
- 性能数据
- 诊断信息

---

### 2.5 Location（位置）
**当前强烈建议：不要在最终版本保留无必要定位权限**

你当前 `AndroidManifest.xml` 中存在：
- `ACCESS_COARSE_LOCATION`
- `ACCESS_FINE_LOCATION`

如果这些权限不是上线必需，请尽快删除。  
否则在 Data Safety 和权限说明里会变复杂。

当前代码上下文里，我没有看到明显必须依赖位置的主业务逻辑。  
所以我的建议是：
- **上线前评估并尽量移除位置权限**

如果保留，就需要在 Play Console 中如实评估位置相关处理。

---

### 2.6 Files and docs / Photos and videos
**通常不建议勾“收集”**，除非你真的把用户文件上传到服务端。

当前项目更像是：
- 本地游戏下载
- 本地缓存
- 本地资源存储

这更偏向设备本地处理，而不是“收集并上传用户文件”。

---

## 3. 是否“收集”与“共享”的建议口径

### 本地存储 ≠ 一定属于向外部“共享”
很多数据目前仅保存在本地：
- 任务进度
- 本地成长数据
- 已下载游戏记录
- 主题与设置项

这些一般不应直接算作“共享给第三方”。

### 广告 SDK 场景建议保守
如果启用了 AdMob：
- 与广告相关的设备标识符 / 广告请求上下文
- 通常应按照 Google Play 的要求保守填写

你的最终选择建议依据：
- Google 官方 AdMob / UMP 的 Data Safety 指引

---

## 4. “用于什么目的”建议

你大概率会用到的目的选项：

- **App functionality**
  - 登录、拉取游戏配置、任务系统、本地成长、资源下载

- **Advertising or marketing**
  - 广告展示、奖励广告、开屏 / 插屏 / 横幅广告

- **Analytics**
  - 如果你正式上线接入分析 / 埋点 / 崩溃统计，则应勾选

- **Fraud prevention, security, and compliance**
  - token 校验、异常请求控制、服务安全（如你需要）

- **Account management**
  - 如果你保留玩家登录 / token / `/me` 逻辑，建议勾选

---

## 5. 关于“是否加密传输”

从当前项目看，网络请求是通过 HTTP 客户端走服务端接口。  
**正式上线建议必须使用 HTTPS**。

如果你线上域名：
- `ovokit.xyz`
- API 域名
- SDK / 配置 / 法务页面域名

都走 HTTPS，那么 Play Console 中一般可以填写：
- **Data is encrypted in transit: Yes**

但请注意：
- 你的 `AndroidManifest.xml` 当前有 `android:usesCleartextTraffic="true"`
- 这意味着应用仍允许明文流量

### 强建议
上线前评估并尽量改为：
- 仅 HTTPS
- 如无必要，关闭 cleartext

---

## 6. 关于“用户能否请求删除数据”

当前版本如果主要是：
- 匿名本地数据
- 本地缓存
- token 与玩家信息

则可从两个层面处理：

### 至少可做到
- 用户清除应用数据
- 删除本地缓存
- 清理本地 token / 玩家会话

### 如果服务端保留玩家数据
你还应准备：
- 用户联系你删除账号 / 删除数据的通道
- 隐私政策中说明处理方式

如果 Play Console 询问“是否支持删除请求”，你需要结合服务端真实能力作答。

---

## 7. 当前版本建议你优先补的合规点

### 必补
- [ ] 检查并尽量移除无必要定位权限
- [ ] 评估是否需要保留 `usesCleartextTraffic=true`
- [ ] 确认所有正式环境接口与法务页面使用 HTTPS
- [ ] 用真实联系邮箱替换法务页面中的占位内容
- [ ] 如正式接入崩溃/统计 SDK，再更新 Data Safety 草稿

---

## 8. 建议的保守填表结论（简版）

如果你现在就要先填一版，建议保守按下面思路：

### 收集的数据
- User IDs：Yes
- App interactions：Yes
- Device or other IDs：Yes
- Diagnostics：No（除非你接了相关 SDK）
- Location：No / 待移除权限后确认

### 是否共享
- 广告相关标识与广告请求上下文：按 AdMob 官方要求保守填写
- 本地成长进度 / 本地缓存：通常不作为“共享”

### 用途
- App functionality
- Advertising or marketing（启用广告时）
- Account management（保留 token/playerId 时）
- Analytics（仅当实际上线）

---

## 9. 你接下来最值得先做的技术动作

我建议你下一步优先让我继续做这 2 件事：

1. **审查并移除不必要权限**
   - 特别是定位权限
   - 同时检查 cleartext 设置

2. **补一份更精确的 AdMob / UMP Data Safety 对照表**
   - 按 Google 官方广告 SDK 要求进一步细化

这样你在 Play Console 提交时会更稳。

