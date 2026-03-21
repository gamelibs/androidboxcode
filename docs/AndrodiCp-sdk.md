# AndoridminCp.js / AndroidCp.js 实现说明与使用方式

> 说明：本文主要描述当前桥接 SDK 的实现结构与使用方式。后台对外下发的运行时文件名已规划从 `AndroidCp.js` 迁移为 `AndoridminCp.js`；若无特殊说明，下文提到的 `AndroidCp.js` 可理解为同一套 SDK 的历史文件名。

本文针对 `storage/sdk/templates/AndroidCp/AndroidCp.js` 的实现结构进行说明。

## 快速概览

### SDK 接入流程图

```
┌─────────────────────────────────────────────────────────────────┐
│ 平台/预览系统：游戏页面嵌入                                         │
│  ├─ 选择 SDK 版本（.js 或 .min.js）                              │
│  ├─ 传入 query 参数（gameid、pubid、vb、dev 等）                 │
│  ├─ 可选：预先注入 window.ads_list                               │
│  └─ 加载 AndroidCp.js / AndroidCp.min.js                        │
└──────────┬──────────────────────────────────────────────────────┘
           │ <script src="AndroidCp.js"></script>
           ↓
┌─────────────────────────────────────────────────────────────────┐
│ SDK 启动（自动，无需游戏显式 init）                                │
│  ├─ 识别当前运行环境（Android / iframe / 普通 Web）               │
│  ├─ 注册原生回调 window.CpsenseAppEventCallBack                  │
│  ├─ 初始化广告候选链（adsense / ima / gpt / android）            │
│  ├─ 建立事件总线 _eventAds                                       │
│  ├─ 接管 window.__acp 与 __acpEventQueue                         │
│  └─ 回放占位阶段缓存的游戏事件                                    │
└──────────┬──────────────────────────────────────────────────────┘
           │ 游戏调用 showAd / emit 游戏状态事件
           ↓
┌─────────────────────────────────────────────────────────────────┐
│ SDK 运行期                                                        │
│  ├─ showAd('interstitial'|'rewarded')                           │
│  ├─ 向原生层发送消息（CpsenseAppEvent.events）                   │
│  ├─ 接收原生层回调并转换为 beforeAd / afterAd 等事件             │
│  ├─ Web 广告失败时自动切换候选链中的下一个渠道                   │
│  └─ 按推送间隔合并并发送 game_start / game_over 等消息           │
└─────────────────────────────────────────────────────────────────┘
```

### 三个关键概念

| 概念 | 定义 | 何时触发 |
|------|-----|--------|
| **Auto Boot** | AndroidCp 脚本加载后自动初始化环境、广告链路与桥接能力 | 脚本执行完成时 |
| **Ad Bridge** | SDK 在 Android 原生广告与 Web 广告之间自动选择 / 切换 | 广告请求与原生回调阶段 |
| **Event Relay** | 游戏通过 `__acp._eventAds.emit(...)` 把状态上报给 SDK，再由 SDK 汇总转发 | 游戏运行期间持续发生 |

### 版本选择速查

| 条件 | 使用版本 | 特点 |
|------|--------|------|
| 调试 / 开发环境 | `AndroidCp.js` | 原始可读版本，便于排查日志与逻辑 |
| Release / 生产环境 | `AndroidCp.min.js` | 压缩单文件，适合正式投放 |
| URL 带 `vb=beta` | 仍可加载原版或测试配置 | 主要影响广告测试环境判定 |

---

## 1. 文件定位与角色

- 文件角色：单文件广告桥接 SDK
- 全局输出：`window.AndroidCp`
- 兼容全局桥接：`window.__acp`
- 核心职责：
  - 识别 Android 原生环境、iframe 环境与普通 Web 环境
  - 管理多广告渠道（Android / AdSense / GPT / IMA）
  - 建立游戏状态事件总线并向原生层上报
  - 接收原生层广告状态回调并转为统一事件

## 2. 启动流程（Boot Pipeline）

AndroidCp 的启动不是 `init()` 驱动，而是脚本加载即自动运行：

1. 读取全局 `window.ads_list`，准备网页广告候选链
2. 从 URL 解析：`gameid`、`pubid`、`ret`、`vb`、`dev`
3. 判断运行环境：
   - `isFramed`：页面是否在 iframe 中
   - `isAndroid`：是否存在 `window.CpsenseAppEvent.events`
4. 初始化内部事件总线 `_eventAds`
5. 注册原生回调 `window.CpsenseAppEventCallBack`
6. 根据环境启动：
   - Android：优先切到原生广告
   - Web：按 `ads_list.web-cp` 建立广告候选链
7. 接管 `window.__acp` 和 `window.__acpEventQueue`
8. 回放占位阶段缓存的游戏事件

## 3. 环境识别与配置来源

### 3.1 Query 参数

AndroidCp 直接从当前页面 URL 读取参数：

- `gameid`：游戏 ID
- `pubid`：发布渠道 / 广告配置维度
- `ret`：返回信息
- `vb=beta`：广告测试环境标记
- `dev`：开发标识

### 3.2 广告配置来源

网页广告配置来自全局对象：

```javascript
window.ads_list = {
  'web-cp': [
    { android: 'on' },
    { adsense: 'data-ad-client=ca-pub-0000000000000000' },
    { gpt: '/22639388115/rewarded_web_example' },
    { ima: 'ca-app-pub-0000000000000000/4076351230' }
  ]
}
```

说明：

- `web-cp` 数组的顺序就是 Web 广告候选链顺序
- Android 环境下，如果首项 `android` 为开启状态，优先走原生广告
- Web 环境下，SDK 会从 `adsense -> ima -> gpt` 中选择当前可用渠道

## 4. 核心机制

## 4.1 广告候选链

AndroidCp 内部维护网页广告候选链：

- `adsense`
- `ima`
- `gpt`

请求广告时会先选择当前广告类型：

- 当前类型可用：直接请求
- 当前类型失败：标记失败并自动切到候选链中的下一个类型
- 若为 Android 原生广告：不参与 Web 候选链重试

## 4.2 原生桥接

### 上行：SDK -> Android 原生

通过以下接口推送消息：

```javascript
window.CpsenseAppEvent.events(JSON.stringify(payload))
```

SDK 会把这些游戏与广告消息放入 `adsdklayer` 队列，再按 `pushtime` 周期合并发送：

- `interstitial`
- `reward`
- `game_start`
- `game_score`
- `game_distance`
- `game_level`
- `level_start`
- `level_end`
- `game_over`
- `load_update`
- `load_complete`
- `ad_error`

### 下行：Android 原生 -> SDK

原生层通过：

```javascript
window.CpsenseAppEventCallBack(message)
```

把广告状态回传给 SDK。SDK 识别并转为统一事件：

- `beforeAd`
- `adViewed`
- `adDismissed`
- `ad_error`

## 4.3 游戏事件总线

AndroidCp 内部事件总线是 `this._eventAds`，支持：

- `on(eventName, callback)`
- `emit(eventName, payload)`
- `off(eventName, callback)`

SDK 加载完成后，会把 `window.__acp = api`，因此游戏可通过：

```javascript
window.__acp._eventAds.emit('game_start', { level: 1 })
```

把游戏状态转给 SDK。

## 4.4 占位队列兼容

AndroidCp 支持在 SDK 真正加载前先缓存事件：

- 缓存位置：`window.__acpEventQueue`
- 接管位置：`window.__acp`

加载完成后，SDK 会自动回放占位期间的缓存事件，避免因脚本时序导致游戏事件丢失。

## 5. 对外能力

AndroidCp 暴露的主要能力：

- `window.AndroidCp.showAd(type)`
- `window.AndroidCp.create(cfg)`
- `window.AndroidCp.version`
- `window.AndroidCp.destroy()`

其中最核心的是：

### 5.1 展示广告

```javascript
window.AndroidCp.showAd('interstitial')
window.AndroidCp.showAd('rewarded')
```

说明：

- `interstitial`：插页广告
- `rewarded`：激励广告
- 同一次请求内部允许自动切换候选广告渠道
- 频控错误不会触发后补广告重试

### 5.2 上报游戏状态

```javascript
window.__acp._eventAds.emit('game_start', { level: 1 })
window.__acp._eventAds.emit('game_score', { score: 1200 })
window.__acp._eventAds.emit('game_over', { reason: 'dead' })
window.__acp._eventAds.emit('load_update', { progress: 35 })
window.__acp._eventAds.emit('load_complete', { done: true })
```

## 6. 使用方式

### 核心接入原理

AndroidCp 的标准接入流程是：

1. 平台侧注入 URL 参数和 SDK 脚本
2. 页面加载前可选注入 `window.ads_list`
3. SDK 自动启动并接管 `window.__acp`
4. 游戏通过 `showAd()` 请求广告
5. 游戏通过 `__acp._eventAds.emit(...)` 上报运行状态

### 6.1 最小接入方式

```html
<script>
  window.ads_list = {
    'web-cp': [
      { android: 'on' },
      { adsense: 'data-ad-client=ca-pub-0000000000000000' },
      { gpt: '/22639388115/rewarded_web_example' },
      { ima: 'ca-app-pub-0000000000000000/4076351230' }
    ]
  };
</script>
<script src="./AndroidCp.js"></script>
```

页面 URL 可带：

```text
?gameid=10001&pubid=web-cp&dev=test&vb=beta
```

### 6.2 推荐接入方式：带占位队列

为了避免 SDK 还没加载时游戏事件丢失，建议先放一个占位对象：

```html
<script>
  window.__acpEventQueue = window.__acpEventQueue || [];
  window.__acp = window.__acp || {
    _eventAds: {
      emit(eventName, payload) {
        window.__acpEventQueue.push({ eventName, payload });
      }
    }
  };
</script>
<script src="./AndroidCp.js"></script>
```

这样即使游戏先发了事件，AndroidCp 加载后也会自动回放。

### 6.3 游戏内调用示例

```javascript
// 1. 请求插页广告
//处理游戏暂停，声音暂停
try{

  window.AndroidCp.showAd('interstitial')
  .then(()=>{
    //处理游戏恢复，声音暂停
  })
  .catch((err) => {
      //处理游戏恢复，声音暂停
    })
}catch(e){
  //处理游戏恢复，声音暂停
}
// 2. 请求激励广告
//处理游戏暂停，声音暂停
try{
window.AndroidCp.showAd('rewarded')
  .then(() => {
    //处理游戏恢复，声音暂停
    //处理原游戏奖励
    console.log('reward success')
  })
  .catch((err) => {
    console.log('reward fail', err)
    //处理游戏恢复，声音暂停
  })
}catch(e){
  //处理游戏恢复，声音暂停
}

// 3. 游戏开始
try{
  // 兼容三方脚本上报
  try { wsdk.gameDot('game_start'); } catch(_e) {}
  window.__acp._eventAds.emit('game_start', { level: 1 })
}catch(e){}

// 4. 分数变化
try{
  
  window.__acp._eventAds.emit('game_score', { score: 3200 })
}catch(e){}

// 5. 关卡结束
try{
  
  window.__acp._eventAds.emit('level_end', { level: 1, level_name:"level:" + 1 })
}catch(e){}

// 6. 游戏结束
try{
  
  window.__acp._eventAds.emit('game_over', { reason: 'dead' })
}catch(e){}

// 7. 加载进度
try{
  
  window.__acp._eventAds.emit('load_update', { progress: 80 })
}catch(e){}
// 8.加载完成
try{
  
  window.__acp._eventAds.emit('load_complete', { done: true })
  //有闪屏遮罩
  try{ eventSplash.emit("complete") }catch(_e){}
}catch(e){}
```

### 6.4 平台 / 预览系统的版本选择

```javascript
function getAndroidCpScriptUrl(isBeta) {
  const base = '/storage/sdk/templates/AndroidCp/'
  return isBeta ? `${base}AndroidCp.js` : `${base}AndroidCp.min.js`
}
```

建议：

- 开发 / 调试：`AndroidCp.js`
- 生产 / 发布：`AndroidCp.min.js`

## 7. 注意事项

- AndroidCp 不是 `init()` 驱动型 SDK，脚本一加载就会自动启动。
- 若游戏直接依赖 `window.__acp._eventAds.emit(...)`，建议始终加占位队列。
- `showAd('rewarded')` 与 `showAd('interstitial')` 都受频控和超时规则约束。
- Android 原生回调依赖 `window.CpsenseAppEventCallBack`，不要被业务侧覆盖。
- 若运行在纯 Web 环境，必须先准备 `window.ads_list`，否则 Web 广告链不会初始化。

## 8. 排查建议

### 8.1 广告不出

- 检查 `window.ads_list` 是否正确注入
- 检查 `showAd('interstitial')` / `showAd('rewarded')` 的参数是否正确
- 检查控制台日志中当前 `adType` 是否已选中

### 8.2 Android 回调不生效

- 检查 `window.CpsenseAppEvent.events` 是否存在
- 检查原生层是否调用了 `window.CpsenseAppEventCallBack(...)`
- 检查是否被 iframe 包裹导致 `isAndroid` 判定不成立

### 8.3 游戏事件不上报

- 检查是否通过 `window.__acp._eventAds.emit(...)` 发出
- 检查 SDK 加载前是否准备了 `window.__acpEventQueue`
- 检查 `pushtime` 是否被上层改得过大，导致消息发送延迟

### 8.4 生产版本说明

- `AndroidCp.min.js` 用于 release 环境
- 压缩版适合正式环境，但调试日志不如原版直观
- 若要定位广告链路问题，优先切回 `AndroidCp.js`