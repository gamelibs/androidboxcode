# GameBoxOne 后端历练系统 API 对齐说明

> **文档版本**：v2.0.0  
> **更新日期**：2026-03-21  
> **适用范围**：`GameBoxOne` App 当前 P1 联调、后台接口对齐、进入 P2 最终测试前的统一说明。  
> **核心原则**：后端只提供**全局配置、发布、回滚、历史与保底配置**；玩家等级、任务进度、奖励领取、升级判断均由 **App 本地**保存与计算。

---

## 0. 当前同步结论（2026-03-21）

### 0.1 结论一句话

**运营后台相关接口已经基本完成，当前版本的主要剩余工作已经转移到 App 侧完整消费接口、联调回归与验收，不再是继续新增后台能力。**

### 0.2 已对齐的后端能力范围

基于当前后端文档、既有联调记录以及现有 App DTO，对齐后的接口能力如下：

#### A. App 历练配置接口
- `GET /api/v1/site/adventure/version`
- `GET /api/v1/site/adventure/config`
- `GET /api/v1/site/adventure/home`
- `GET /api/v1/site/adventure/chapter/{chapterId}`
- `GET /api/v1/site/adventure/reward-packages`
- `GET /api/v1/site/adventure/fallback`

#### B. 游戏列表 / SDK 支撑接口
- `POST /api/v1/player/login`
- `GET /api/v1/player/me`
- `GET /api/v1/player/published-games`
- `GET /api/v1/player/sdk`
- `GET /api/v1/site/sitedata/platform/1003`
- `GET /api/v1/sdk/templates/AndroidminCp/AndroidminCp.js`

#### C. 运营后台接口
- `GET /api/v1/ops/adventure/1003/config`
- `POST /api/v1/ops/adventure/1003/publish`
- `POST /api/v1/ops/adventure/1003/rollback`
- `PUT /api/v1/ops/adventure/1003/chapter/{id}/task/{slot}`
- `POST /api/v1/ops/adventure/1003/batch-bind`
- `GET /api/v1/ops/adventure/1003/history`

### 0.3 当前阶段判断

| 判断项 | 结论 |
|---|---|
| 后台是否还缺“任务配置接口” | **否**，当前已基本齐全 |
| 后台是否还缺“运营发布能力” | **否**，当前已有 config / publish / rollback / history |
| 当前 P1 是否还需要新增“玩家云端进度”接口 | **否** |
| 当前 P1 是否还需要新增“云端领奖”接口 | **否** |
| 当前 P1 主工作是否已转向 App 消费与联调 | **是** |

### 0.4 本次文档更新目的

本次更新用于替换旧表述中的以下误判：

- 旧表述：后台尚未建设完成、仍缺任务系统接口
- 新表述：**后台接口能力已基本完成，当前只差 App 侧完整消费、联调调试和验收闭环**

---

## 1. P1 当前范围与阶段目标

### 1.1 P1 的真实目标

当前 P1 不是继续发散新功能，而是完成以下闭环：

1. App 完整消费现有历练接口
2. App 完整消费奖励包接口
3. App 完整验证 fallback / 离线回退链路
4. App 与后台完成 publish / rollback / history 联调验收
5. 完成回归测试，进入 **P2 最终测试阶段**

### 1.2 P1 明确保留项

| 项目 | 是否属于当前 P1 |
|---|---|
| 首页消费 `home/config/chapter/version` | 是 |
| 奖励包消费 `reward-packages` | 是 |
| fallback 断网回退演练 | 是 |
| 配置版本更新 / 缓存回归 | 是 |
| 运营发布 / 回滚 / 历史记录联调 | 是 |
| 章节任务槽位绑定校验 | 是 |

### 1.3 P1 明确排除项

以下内容**不属于当前 P1**，文档、接口、任务拆解中都不要再继续发散：

- 玩家云端进度
- 云端领奖 / 服务端逐玩家发奖
- 云端章节状态
- 多账号 / 账号体系扩展
- 云同步
- 排行榜对外开放
- 支付 / Google Play Billing
- 社交关系、好友、复杂活动系统

> 当前版本严格遵循离线优先：**后端只下发配置，App 本地保存玩家数据。**

---

## 2. App 侧必须消费的正式接口

以下接口是当前 App P1 联调的正式接口集合。

### 2.1 通用返回包装

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

- `code = 0`：成功
- `code != 0`：失败
- App 在失败时走本地缓存或 `assets` 保底

### 2.2 `GET /api/v1/site/adventure/version`

**用途**：检查配置版本是否变化。  
**App 对应 DTO**：`AdventureVersionResponse`

| 字段 | 类型 | 说明 |
|---|---|---|
| `configVersion` | int | 配置版本号，自增 |
| `version` | string | 语义化版本号 |
| `publishedAt` | string | 发布时间 |
| `minAppVersion` | string | 最低可兼容 App 版本 |

**P1 要点**：
- 冷启动时检查版本
- `configVersion` 变更后重新拉取 `config`
- 网络失败时不得阻塞本地运行

### 2.3 `GET /api/v1/site/adventure/config`

**用途**：拉取完整历练配置。  
**App 对应 DTO**：`AdventureFullConfig`

| 字段 | 类型 | 说明 |
|---|---|---|
| `version` | string | 配置语义版本 |
| `configVersion` | int | 当前生效配置版本 |
| `publishedAt` | string | 发布时间 |
| `minAppVersion` | string | 最低兼容版本 |
| `levels` | `List<AdventureLevelSpec>` | 等级配置 |
| `chapters` | `List<AdventureChapterSpec>` | 章节与任务配置 |
| `rewardPackages` | `List<AdventureRewardPackageSpec>` | 奖励包配置 |
| `homeRecommend` | `AdventureHomeRecommendSpec?` | 首页推荐策略 |

**P1 要点**：
- 已有接口，不再视为待开发项
- App 需保证 `远端 config -> Room/app_config -> assets fallback` 可稳定工作
- `rewardPackages` 虽可由独立接口获取，但本接口中的同类数据仍需兼容读取

### 2.4 `GET /api/v1/site/adventure/home`

**用途**：提供首页聚合所需的全局配置。  
**App 对应 DTO**：`AdventureHomeResponse`

| 字段 | 类型 | 说明 |
|---|---|---|
| `currentChapter` | `AdventureChapterSpec?` | 当前推荐章节配置 |
| `recommendedTaskIds` | `List<String>` | 推荐任务 ID 列表 |
| `nextLevelPreview` | `AdventureLevelSpec?` | 下一等级预告 |
| `configVersion` | int | 本次首页聚合配置版本 |

**P1 要点**：
- 首页必须按 `currentChapter + recommendedTaskIds + nextLevelPreview` 消费
- 推荐任务的“进行中 / 已达成待领取 / 已完成”状态由 App 本地进度计算
- 后端不返回逐玩家任务进度

### 2.5 `GET /api/v1/site/adventure/chapter/{chapterId}`

**用途**：拉取单章节完整任务列表。  
**App 对应 DTO**：`AdventureChapterSpec`

| 字段 | 类型 | 说明 |
|---|---|---|
| `chapterId` | string | 章节 ID |
| `level` | int | 所属等级 |
| `chapterTitle` | string | 章节标题 |
| `chapterSubtitle` | string | 副标题 |
| `description` | string | 描述 |
| `requiredTaskCount` | int | 升级所需完成数 |
| `styleKey` | string | 视觉风格 key |
| `tasks` | `List<AdventureTaskSpec>` | 该章节任务列表 |

**P1 要点**：
- 首页“本章任务全览”和历练页以本接口为准
- `gameId` 必须与游戏列表数据真实可关联
- 联调重点是任务槽位与实际游戏绑定是否正确

### 2.6 `GET /api/v1/site/adventure/reward-packages`

**用途**：拉取奖励包配置列表。  
**App 对应 DTO**：`List<AdventureRewardPackageSpec>`

| 字段 | 类型 | 说明 |
|---|---|---|
| `rewardPackageId` | string | 奖励包 ID |
| `rewardType` | string | `task / chapter / level` |
| `exp` | int | EXP 奖励 |
| `gold` | int | 金币奖励 |
| `titleReward` | string? | 称号奖励 |
| `badgeReward` | string? | 徽章奖励 |
| `frameReward` | string? | 头像框奖励 |
| `popupText` | string | 奖励弹窗文案 |

**P1 要点**：
- 当前接口已存在，P1 剩余工作是 App 接入到**真实奖励展示 / 本地发放 / 本地记录**链路
- 不引入云端领奖接口
- 不引入服务端逐玩家奖励状态

### 2.7 `GET /api/v1/site/adventure/fallback`

**用途**：提供最小可运行配置，供异常场景回退。  
**App 对应 DTO**：`AdventureFullConfig`

**P1 要点**：
- 当前接口已存在，P1 剩余工作是断网 / 首装 / 无缓存 / 版本异常下的真实演练
- fallback 只承担“保证可运行”，不承担玩家进度同步
- 必须与 `assets/adventure_config.json` 的兜底策略协同工作

---

## 3. 游戏列表与 SDK 支撑接口

这些接口不是历练任务接口本身，但它们是任务可玩的基础前提。

### 3.1 当前链路

1. `POST /api/v1/player/login`
2. `GET /api/v1/player/me`
3. `GET /api/v1/player/published-games`
4. `GET /api/v1/player/sdk`
5. `GET /api/v1/site/sitedata/platform/1003`
6. `GET /api/v1/sdk/templates/AndroidminCp/AndroidminCp.js`

### 3.2 当前约束

- App 默认环境为 `beta`
- 默认 beta 地址：`http://192.168.1.54:13200`
- 在线链路只使用新接口，不再依赖旧远端回退接口
- 网络失败时回退到本地 DB / 本地缓存 / APK `assets`

### 3.3 SDK 兼容要求

- SDK 文件名按当前约定使用 `AndroidminCp.js`
- `/api/v1/player/sdk` 返回的 URL 末尾建议直接为 `AndroidminCp.js`
- `published-games.params.gameSdkName` 也应保持 `AndroidminCp.js`

---

## 4. 运营后台接口现状

### 4.1 当前判断

**运营后台接口已基本完成，足以支撑当前版本配置、发布、回滚与历史查询。**

### 4.2 已对齐接口

| 接口 | 方法 | 用途 | 当前阶段定位 |
|---|---|---|---|
| `/api/v1/ops/adventure/1003/config` | GET | 读取当前平台配置 | 已具备 |
| `/api/v1/ops/adventure/1003/publish` | POST | 发布配置 | 已具备 |
| `/api/v1/ops/adventure/1003/rollback` | POST | 回滚配置 | 已具备 |
| `/api/v1/ops/adventure/1003/chapter/{id}/task/{slot}` | PUT | 编辑章节槽位任务 | 已具备 |
| `/api/v1/ops/adventure/1003/batch-bind` | POST | 批量绑定任务与游戏 | 已具备 |
| `/api/v1/ops/adventure/1003/history` | GET | 查询发布历史 | 已具备 |

### 4.3 当前不是后台开发缺项，而是联调验收项

当前联调重点不再是“后台有没有接口”，而是：

1. 发布后的 `version/config/home/chapter` 是否按预期更新
2. 回滚后 App 是否能正确识别旧版本并恢复
3. `history` 是否足够支撑测试追溯
4. `batch-bind` 与章节槽位配置是否能稳定映射真实 `gameId`

---

## 5. App 侧消费规则与职责边界

### 5.1 后端职责

后端负责：
- 下发全局等级 / 章节 / 任务 / 奖励配置
- 下发首页推荐策略和章节聚合配置
- 提供 fallback 数据
- 提供发布 / 回滚 / 历史能力

### 5.2 App 职责

App 负责：
- 创建本地玩家档案
- 保存本地等级与章节状态
- 保存本地任务进度
- 保存本地奖励领取记录
- 根据本地进度计算任务状态
- 根据本地进度判断是否升级
- 组合 `recommendedTaskIds` 与本地任务状态，渲染首页推荐卡

### 5.3 明确不做的事

后端当前**不负责**：
- 存储逐玩家任务进度
- 存储逐玩家章节状态
- 云端发奖
- 云端领奖记录
- 云端等级计算

---

## 6. P1 联调任务清单

### 6.1 App 侧 P1 待完成项

| 任务 | 说明 | 优先级 |
|---|---|---|
| 首页完整消费 `home` | 首页按 `currentChapter + recommendedTaskIds + nextLevelPreview` 出图与刷新 | P1 |
| 章节完整消费 `chapter/{id}` | 本章任务全览、任务列表、任务状态映射完成 | P1 |
| 奖励包完整消费 `reward-packages` | 接入真实奖励展示 / 本地发放 / 本地领取记录 | P1 |
| fallback 演练 | 冷启动无网、接口失败、无缓存、缓存命中场景验收 | P1 |
| 版本缓存回归 | `version -> config` 更新流程、旧缓存可用性验证 | P1 |
| 游戏绑定回归 | `task.gameId` 与游戏列表真实匹配验证 | P1 |

### 6.2 联合验收项

| 联合项 | 验收目标 |
|---|---|
| publish 联调 | 发布后 App 能识别新版本并更新配置 |
| rollback 联调 | 回滚后 App 能恢复旧配置并正常展示 |
| history 验证 | 测试能追踪版本发布时间与回滚记录 |
| batch-bind 验证 | 批量绑定后章节任务能正确关联游戏 |

---

## 7. 进入 P2 最终测试的条件

满足以下条件后，即可认为已完成“全部调试阶段”，进入 P2：

- [ ] `version/config/home/chapter/reward-packages/fallback` 全部完成 App 真实消费
- [ ] 首页、章节页、奖励展示链路已按当前接口稳定运行
- [ ] fallback 在断网 / 无缓存 / 冷启动场景验证通过
- [ ] publish / rollback / history 已完成联调验收
- [ ] 章节任务与真实 `gameId` 绑定验证通过
- [ ] 不再引入玩家云端进度、云端领奖等无关改动

---

## 8. 一句话对齐口径

**当前后台与运营接口能力已基本完成，P1 不再新增无关功能；现阶段只差 App 对现有接口的完整消费、联调验收与回归测试，完成后即可进入 P2 最终测试。**
