# 🀄 六华 (Rikka) - 移动端网页版

> 基于 Next.js 15, Fastify 和 WebSocket 构建的极简主义实时桌游。**移动端优先设计**。

## 📱 项目概述

这是一个**移动端优先 (Mobile-First)** 的《六华》网页版实现。UI 交互专门针对触摸屏设计（点击翻转卡牌、拖拽出牌）。项目采用 Turborepo 管理的 Monorepo 架构。

## 🛠 技术栈与架构

### **Monorepo 结构 (Turborepo)**

| 路径 | 包名 | 技术栈 | 描述 |
| :--- | :--- | :--- | :--- |
| `apps/client` | Next.js 15 | React, Tailwind, Framer Motion, Zustand | 移动端优先的前端应用 (PWA Ready)。 |
| `apps/server` | Fastify | Node.js, Socket.io, Zod | 高性能 WebSocket 服务端。 |
| `packages/shared`| TypeScript | Zod, Pure Functions | 前后端共用的类型定义、验证 Schema 和 纯游戏逻辑。 |

### **开发规范**
1.  **移动端优先**: 针对竖屏 (Portrait) 设计。触摸热区 > 44px。禁用 Hover 效果（使用 Active 状态代替）。
2.  **严格类型 (Strict Typing)**: **严禁使用 `any` 类型。** 必须使用 Zod 进行验证，尽量使用泛型 (Generics)。
3.  **文件行数限制**: **单文件最大 350 行。** 如果文件超过此限制，必须立即进行重构和拆分。
4.  **UI 风格**: 代码结构参考 Shadcn (Radix primitives + Tailwind)，但在视觉上追求**“实体桌游感”**（使用阴影、圆角、微纹理），避免过于扁平的企业级 UI。
5.  **提交策略**: 完成任务清单中的**每一项 (Item)** 后，必须生成一次 Git Commit。

---

## 📜 游戏规则 (核心逻辑)

**目标**: 凑齐 2 组牌（每组 3 张）即可获胜。

### 游戏配件
* **牌库**: 共 42 张牌。
* **卡牌结构**: 每张牌包含 `上方数值` (Top Value), `下方数值` (Bottom Value), `花色` (Color), 以及 `翻转状态` (isFlipped)。

### 回合流程
1.  **摸牌 (Draw)**: 玩家摸 1 张牌（手牌数：5 -> 6）。
2.  **行动 (Action)**:
    * **翻转 (Flip)**: 玩家可以点击手牌中的任意牌，将其旋转 180°，交换其生效数值。
    * **胡牌判定 (Win Check)**: 如果此时 6 张牌能组成 2 组有效牌型，可宣布胜利（自摸）。
3.  **打牌 (Discard)**: 如果未胡牌，需拖拽一张牌到弃牌区（手牌数：6 -> 5）。

### 获胜牌型 (Yaku)
* **刻子 (Set)**: 3 张**同花色**且**同生效数值**的牌 (例如: `红 5-5-5`)。
* **顺子 (Run)**: 3 张**同花色**且**生效数值连续**的牌 (例如: `蓝 1-2-3`)。
* **胡牌条件**: 手牌必须严格等于 `(刻子 或 顺子) + (刻子 或 顺子)`。

---

## ✅ 开发任务清单 (Task List)

> **给 AI 的指令**: 请严格按顺序执行。每完成列表中的**一项**，请停止并生成一条 Commit Message，然后再进行下一项。

### 第一阶段：Monorepo 与 共享逻辑 (地基)
- [ ] **1.1 初始化 Monorepo**: 配置 Turborepo，包含 `apps/client`, `apps/server`, `packages/shared`。配置 ESLint/Prettier 以禁用 `any`。
- [ ] **1.2 共享类型定义**: 在 `packages/shared` 中定义 `Card`, `Player`, `GameState` 接口。添加 Socket 消息体的 Zod Schemas。
- [ ] **1.3 核心算法**: 在 `packages/shared` 中实现 `generateDeck()` (生成牌库), `shuffle()` (洗牌), 和 `checkWin(cards)` (胡牌判定)。*约束：checkWin 必须是纯函数且类型严格。*

### 第二阶段：Fastify 服务端 (大脑)
- [ ] **2.1 服务端初始化**: 初始化 Fastify，安装 `fastify-socket.io` 和 `zod`。配置 CORS 以允许客户端连接。
- [ ] **2.2 房间管理器**: 创建 `RoomManager` 类（单例或依赖注入），用于维护 `Map<RoomId, GameState>`。
- [ ] **2.3 Socket 处理器 (加入)**: 实现 `join_room` 和 `create_room` 事件。使用 Zod 验证输入数据。
- [ ] **2.4 Socket 处理器 (游戏循环)**: 实现 `draw_card` (摸牌), `discard_card` (打牌), `flip_card` (翻转) 事件。确保严格的状态变更校验。
- [ ] **2.5 状态广播**: 实现 `broadcastState(roomId)` 辅助函数，在每次操作后将清洗过的状态发送给客户端。

### 第三阶段：Next.js 客户端 (移动端 UI)
- [ ] **3.1 移动端视口配置**: 配置 `viewport` meta 标签（禁止缩放），安装 Tailwind, Shadcn (手动或 CLI), 和 Framer Motion。
- [ ] **3.2 共享状态**: 设置 `useGameStore` (Zustand) 以同步服务端状态。
- [ ] **3.3 组件：卡牌 (Card)**: 创建 `<Card />`。**交互**: 点击翻转 (旋转动画)。**样式**: 拟物化设计（带阴影和厚度感）。
- [ ] **3.4 组件：手牌区 (Hand)**: 创建 `<Hand />`。**布局**: 固定在屏幕底部。支持横向滚动（虽然 6 张牌通常能放下）。
- [ ] **3.5 组件：牌桌 (Board)**: 创建 `<Board />`。**布局**: 垂直堆叠 -> 对手区 (顶部) | 牌堆/弃牌区 (中部) | 玩家区 (底部)。
- [ ] **3.6 拖拽交互**: 使用 `@dnd-kit` 或 Framer Motion drag gestures 实现“拖拽出牌”功能，追求原生 App 的手感。

### 第四阶段：整合与打磨
- [ ] **4.1 Socket 联调**: 将客户端 `useGameStore` 连接到 Fastify 服务端。处理断线重连逻辑。
- [ ] **4.2 完整流程**: 实现全流程：输入昵称 -> 加入房间 -> 对战 -> 结算画面。
- [ ] **4.3 视觉打磨**: 添加音效（可选），当前回合指示器，并确保在手机软键盘弹出时布局不崩坏。

---

## 📂 目录结构

```text
.
├── apps
│   ├── client          # Next.js 15 (移动端网页)
│   └── server          # Fastify + Socket.io
└── packages
    ├── shared          # 共享类型 & 逻辑 (大脑)
    ├── config          # ESLint, TSConfig
    └── ui              # (可选) 共享 UI 组件