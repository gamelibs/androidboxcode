# GameBoxOne / Play Console 上线清单

> 生成时间：2026-03-20
> 建议商店路径：`https://ovokit.xyz/gameboxone/`

---

## 1. 应用基础信息

在 Google Play Console 中准备并确认：

- 应用名称：`GameBoxOne`
- 默认语言：简体中文（如需要可补英文）
- 应用图标：`512 x 512 PNG`
- Feature Graphic：`1024 x 500`
- 手机截图：建议至少 4~8 张
- 隐私政策链接：
  - `https://ovokit.xyz/gameboxone/privacy-policy.html`
- 用户协议链接（可放在商店描述中）：
  - `https://ovokit.xyz/gameboxone/user-agreement.html`
- 开发者联系邮箱：**请替换为真实邮箱**

---

## 2. App Content（应用内容）必须填写

### 2.1 Privacy Policy
- 填写公开可访问的隐私政策 URL
- 建议使用：
  - `https://ovokit.xyz/gameboxone/privacy-policy.html`

### 2.2 Ads（广告声明）
- 该应用如启用 AdMob，需要选择：
  - `Yes, my app contains ads`

### 2.3 Target audience / 年龄受众
建议根据当前产品形态选择：
- 不作为儿童专属应用
- 避免误选 Families / 儿童应用路线
- 若主要面向普通玩家，可选择青少年及以上常规年龄段

### 2.4 Content rating（内容分级）
需要如实回答：
- 是否含广告：是
- 是否含在线互动：按实际情况填写
- 是否有暴力/赌博/成人内容：按接入游戏实际情况审查
- 如果你无法完全控制第三方 H5 游戏内容，需保守评估

### 2.5 Data safety（数据安全）
需结合项目当前能力填写。当前代码层面通常涉及：

可能处理的数据：
- 设备信息
- 匿名玩家标识 / token（如后端登录启用）
- 应用交互数据
- 广告 ID / 广告同意状态
- 崩溃与诊断信息（后续接入后）
- 本地进度 / 下载记录 / 任务状态

你需要逐项确认：
- 是否收集
- 是否共享给第三方
- 是否用于广告
- 是否用于分析
- 是否为必需功能
- 是否通过加密传输
- 是否支持删除请求

---

## 3. Store Listing（商店详情）

至少准备：
- 短描述
- 完整描述
- 图标
- Feature Graphic
- 截图
- 隐私政策链接

建议文案方向：
- 首页成长驱动
- 历练挑战
- 任务推进
- WebView 小游戏盒子
- 本地成长闭环

---

## 4. Release（发版）

你需要确认：
- 使用 `AAB` 上传
- release 签名已配置
- `versionCode` 递增
- `versionName` 合理命名
- release 环境已关闭开发态广告假同意逻辑
- release 环境已接正式 UMP
- release 环境已验证广告拒绝同意时 App 仍可运行

---

## 5. 广告合规检查

上线前至少确认：
- 设置页可打开隐私政策
- 设置页可打开用户协议
- 设置页可进入广告隐私选项
- 首次进入应用会先看到应用协议确认页
- 用户拒绝广告同意时主流程不崩溃
- 广告失败不阻塞首页 / 游戏 / 任务主链路

---

## 6. 需要你最终手工替换的内容

以下内容已在项目中生成了模板，但上线前请务必替换：

- 法务页面中的联系邮箱
- 商店中的开发者邮箱
- 商店中的公司 / 团队信息
- 如有正式主体名称，请同步到隐私政策与协议文本

---

## 7. 当前项目已生成的法务页面文件

仓库中已生成：
- `docs/legal/gameboxone/privacy-policy.html`
- `docs/legal/gameboxone/user-agreement.html`
- `docs/legal/gameboxone/app-icon.svg`
- `docs/legal/gameboxone/feature-graphic.svg`

部署后对应 URL 建议为：
- `https://ovokit.xyz/gameboxone/privacy-policy.html`
- `https://ovokit.xyz/gameboxone/user-agreement.html`

---

## 8. 建议上线顺序

1. 部署隐私政策与用户协议页面
2. 替换页面中的真实联系邮箱
3. 准备 PNG 图标与商店素材
4. 在 Play Console 填写 Privacy Policy / Ads / Data safety / Content rating
5. 上传内部测试包
6. 验证首启协议、UMP、设置页链接、广告降级流程
7. 再进入封闭测试或正式发布

