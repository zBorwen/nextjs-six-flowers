# 🀄 六华 (Rikka) - 移动端网页版

> **核心规则基准 (Source of Truth)**: 基于官方 PDF 规则文档（含附加规则）。
> **产品定位**: 极致拟物化体验的竖屏移动端桌游 + 积分成长体系。
> **技术架构**: Monorepo (Turborepo) + Next.js 15 (客户端) + Fastify (服务端) + PostgreSQL。

## 📱 1. 项目概述 (Project Overview)

本项目是桌游《六华》(Rikka) 的数字化实现。核心体验专注于**“指尖的物理感”**——通过细腻的动画、触觉反馈 (Haptics) 和乐观 UI 更新，在手机屏幕上还原真实的搓牌体验。

### 技术栈 (Tech Stack)
* **管理**: `pnpm` + `Turborepo`
* **前端**: `apps/client`
    * Next.js 15 (App Router)
    * Tailwind CSS (Styling)
    * Framer Motion (复杂交互动画)
    * Zustand + Immer (状态管理)
    * `svg-captcha` (图形验证码防刷)
* **后端**: `apps/server`
    * Fastify (高性能 HTTP 服务)
    * Socket.io (实时双向通信)
* **数据库**: `packages/database`
    * **PostgreSQL** (核心数据存储)
    * **Prisma ORM** (类型安全的数据库操作)
* **认证**: Auth.js (NextAuth v5) - Credentials Provider (手机号 + 密码)
* **共享**: `packages/shared` (纯 TypeScript 逻辑、类型、常量)

### 开发铁律 (Development Standards)
1.  **零 `any` 容忍**: 严禁使用 `any`。所有数据交互必须经过 Zod Schema 校验。
2.  **移动端优先**: 仅针对竖屏 (Portrait) 设计。触摸热区 > 44px。
3.  **文件原子化**: 单个文件限制最大 **350 行**。组件逻辑过于复杂必须拆分。
4.  **原子提交**: 每完成 Task List 中的一个小项，必须生成一次 Git Commit。

---

## 🎨 2. UI 设计体系与原型 (Design System)

### 2.1 视觉风格指南
* **整体氛围**: 沉浸式拟物风格 (Skeuomorphism)，拒绝扁平化。
* **配色方案**:
    * **牌桌背景**: 深绿色毛毡色 (`#1a472a`) + 噪点纹理。
    * **牌面背景**: 米白色 (`#fdfbf7`)，避免纯白刺眼。
    * **高亮色**: 金色 (`#fbbf24`) 用于胡牌；鲜红 (`#ef4444`) 用于重要提示。
* **动画**: 使用 Framer Motion `layoutId` 实现平滑物理移动（发牌/理牌）。

### 2.2 界面原型 (Wireframes)

#### A. 注册/登录页 (Auth)
* **输入框**: 手机号、密码。
* **验证码**: 右侧显示图形验证码图片 (`svg-captcha`)，点击刷新。
* **操作**: "注册" / "登录" 切换 tab。

#### B. 首页大厅 (Lobby)
* **头部**: 头像（带称号徽章）、昵称、当前积分。
* **列表**: 房间卡片显示状态 (OPEN/FULL/PLAYING)。
* **底部**: "创建房间" (大按钮)，"规则" (弹窗)。

#### C. 游戏房间 (Game Room)
* **布局**: 三段式 (对手 - 牌桌 - 玩家)。
* **结算**: 游戏结束后弹出积分变动。
* **重开**: 房主底部显示 "再来一局 (Play Again)" 按钮；其他玩家显示 "等待房主..."。

---

## 📜 3. 官方游戏规则 (完整版)

### 3.1 核心流程
游戏按顺时针进行。
1.  **摸牌 (Draw)**: 强制从牌库摸 1 张。**严禁**吃/碰弃牌（除非是为了 Ron）。
2.  **行动 (Action)**:
    * **翻转 (Flip)**: 自由旋转手牌 (180°)。
    * **立直 (Riichi)**: 听牌时可宣告。胡牌 +1 分。代价是手牌锁定。
3.  **打牌 (Discard)**: 打出 1 张牌。

### 3.2 获胜条件 (役种 Yaku)
手牌 6 张（5+1）根据**下方 (Active) 数值**组成：
* **基础**: 一色 (1分), 三连 (3分), 六华 (6分).
* **特殊**: 三对 (5分), 无双 (9分), 三色 (3分, 仅过路胡), 辉光纪行 (5分).
* **奖励**: 闪光 (+1/个), 立直 (+1).

### 3.3 互动机制
* **直击 (Ron)**: 抢别人的弃牌胡牌。
* **过路胡**: 用桌面明牌胡牌。

---

## 💾 4. 数据存储与认证 (Database & Auth)

### 4.1 数据库模型 (Postgres + Prisma)
需在 `packages/database` 中定义：
* **User**:
    * `id`: PK (CUID)
    * `phone`: String (Unique)
    * `password`: String (Bcrypt Hash)
    * `name`: String
    * `score`: Int (Default 1000) -> 用于计算称号
* **Match**: 记录对局元数据 (开始时间、结束时间)。
* **MatchPlayer**: 记录玩家在该局的输赢分、役种记录。

### 4.2 称号系统 (基于 score 动态计算)
* **萌新** (<1000)
* **牌桌老手** (1200+)
* **六华雀神** (5000+) -> 显示炫酷头像框。

### 4.3 认证流程
1.  **注册**: 提交 `phone` + `password` + `captcha`。后端校验验证码 -> Hash 密码 -> 存入 Postgres。
2.  **登录**: NextAuth Credentials Provider。
3.  **Socket**: 连接握手时携带 JWT Token，Fastify 校验并绑定 `userId`。


## 🔄 核心机制补充：房间生命周期与重连 (Room Lifecycle & Reconnection)

### 1. 房间创建 (Create Room)
* **参数**: `name` (房间名), `maxPlayers` (人数 2-4)。
* **逻辑**: 创建者自动成为 `host` (房主)。

### 2. 主动退出 (Explicit Leave)
* **UI**: 游戏房间左上角提供 "退出 (Exit)" 按钮。
* **事件**: `client.emit('LEAVE_ROOM')`。
* **服务端处理**:
    * **房主退出**: 房间状态设为 `DESTROYED`，从内存/数据库移除房间，广播 `ROOM_CLOSED` 给其余玩家，强制他们退回大厅。
    * **玩家退出**: 从 `players` 列表移除，广播更新后的游戏状态。

### 3. 断线重连 (Reconnection System)
为了防止刷新页面导致掉线，服务端必须实现**“优雅断开”**：
1.  **Disconnect**:
    * 当 Socket 断开时，不要立即移除玩家。
    * 标记玩家状态为 `ONLINE: FALSE`。
    * 启动 `60秒` 清理倒计时。
2.  **Reconnect**:
    * 新 Socket 连接时，通过 Auth Token 识别 `userId`。
    * 检查该 `userId` 是否在活跃房间中。
    * **若存在**: 取消清理倒计时，更新 Socket ID，发送 `SYNC_STATE` 恢复全部盘面（包括手牌、翻牌状态）。
    * **若不存在**: 视为新用户，停留在 Lobby。
---
