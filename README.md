# 🀄 Rikka (六华) - Mobile Web Edition

> A minimalist, mobile-first real-time board game implementation using Next.js, Fastify, and WebSocket.

## 📱 Project Overview

This is a **mobile-first** web implementation of the board game "Rikka". The UI is designed specifically for touch interactions (tap to flip, drag to discard) on small screens. The project follows a strict Monorepo structure using Turborepo.

## 🛠 Tech Stack & Architecture

### **Monorepo Structure (Turborepo)**

| Path | Package | Tech Stack | Description |
| :--- | :--- | :--- | :--- |
| `apps/client` | Next.js 15 | React, Tailwind, Framer Motion, Zustand | Mobile-first frontend (PWA ready). |
| `apps/server` | Fastify | Node.js, Socket.io, Zod | High-performance WebSocket server. |
| `packages/shared`| TypeScript | Zod, Pure Functions | Shared types, validation schemas, and game logic. |

### **Development Standards**
1.  **Mobile First**: Design for Portrait mode. Touch targets > 44px. No hover effects (use active states).
2.  **Strict Typing**: **NO `any` types allowed.** Use Zod for validation and TS Generics.
3.  **File Size Limit**: **Max 350 lines per file.** If a file exceeds this, refactor and split it immediately.
4.  **UI Style**: Shadcn-like code structure (Radix primitives + Tailwind) but with a **"Tactile Board Game" aesthetic** (depth, shadows, rounded corners, subtle textures) rather than flat corporate UI.
5.  **Commit Policy**: A git commit must be generated after completing **each single item** in the Task List.

---

## 📜 Game Rules (The Source of Truth)

**Goal**: Form 2 sets of 3 cards to win (Run or Set).

### Components
* **Deck**: 42 Cards total.
* **Card Anatomy**: Each card has a `Top Value`, `Bottom Value`, `Color`, and `isFlipped` state.

### Turn Sequence
1.  **Draw**: Player draws 1 card (Hand size: 5 -> 6).
2.  **Action**:
    * **Flip**: Player can tap any card in hand to rotate it 180°, swapping its active value.
    * **Win Check**: If the 6 cards form 2 valid sets, declare victory (Tsumo).
3.  **Discard**: If not winning, drag a card to the discard zone (Hand size: 6 -> 5).

### Winning Hands (Yaku)
* **Set (刻子)**: 3 cards of same color & same active number (e.g., `Red 5-5-5`).
* **Run (顺子)**: 3 cards of same color & sequential active numbers (e.g., `Blue 1-2-3`).
* **Win Condition**: Hand must be exactly `(Set OR Run) + (Set OR Run)`.

---

## ✅ Development Task List

> **Instruction for AI**: Execute these tasks sequentially. **STOP** after completing one item to generate a commit message, then proceed to the next.

### Phase 1: Monorepo & Shared Logic (The Foundation)
- [ ] **1.1 Init Monorepo**: Setup Turborepo with `apps/client`, `apps/server`, and `packages/shared`. Configure ESLint/Prettier to ban `any`.
- [ ] **1.2 Shared Types**: Define `Card`, `Player`, `GameState` interfaces in `packages/shared`. Add Zod schemas for socket payloads.
- [ ] **1.3 Core Logic**: Implement `generateDeck()`, `shuffle()`, and `checkWin(cards)` in `packages/shared`. *Constraint: checkWin must be pure and strictly typed.*

### Phase 2: Fastify Server (The Brain)
- [ ] **2.1 Server Setup**: Initialize Fastify with `fastify-socket.io` and `zod`. Setup CORS for the client.
- [ ] **2.2 Room Manager**: Create `RoomManager` class (Singleton or Dependency Injection) to handle `Map<RoomId, GameState>`.
- [ ] **2.3 Socket Handlers (Join)**: Implement `join_room` and `create_room` events. Validate inputs with Zod.
- [ ] **2.4 Socket Handlers (Game Loop)**: Implement `draw_card`, `discard_card`, `flip_card` events. Ensure strict state mutation rules.
- [ ] **2.5 State Broadcast**: Implement `broadcastState(roomId)` helper to send sanitized state to clients after every action.

### Phase 3: Next.js Client (The Mobile UI)
- [ ] **3.1 Mobile Viewport Setup**: Configure `viewport` meta tags (prevent zoom), install Tailwind, Shadcn (manual or CLI), and Framer Motion.
- [ ] **3.2 Shared Stores**: Setup `useGameStore` (Zustand) to sync with Server State.
- [ ] **3.3 Component: Card**: Create `<Card />`. **Interaction**: Tap to flip (animate rotation). **Style**: Look like a physical tile (shadows).
- [ ] **3.4 Component: Hand (Mobile)**: Create `<Hand />`. **Layout**: Fixed at bottom of screen. Horizontal scroll if needed (though 6 cards should fit).
- [ ] **3.5 Component: Board**: Create `<Board />`. **Layout**: Vertical stack -> Opponent (Top) | Deck/Discard (Center) | Player (Bottom).
- [ ] **3.6 Drag & Drop**: Implement "Drag to Discard" using `@dnd-kit` or Framer Motion drag gestures (more native feel).

### Phase 4: Integration & Polish
- [ ] **4.1 Socket Integration**: Connect Client `useGameStore` to Fastify Server. Handle reconnection logic.
- [ ] **4.2 Game Flow**: Implement the full loop: Enter Name -> Join Room -> Play -> Win/Lose Screen.
- [ ] **4.3 Visual Polish**: Add sound effects (optional), turn indicators, and ensure no layout shift on mobile keyboards.

---

## 📂 Directory Structure

```text
.
├── apps
│   ├── client          # Next.js 15 (Mobile Web)
│   └── server          # Fastify + Socket.io
└── packages
    ├── shared          # Shared Types & Logic (The Brain)
    ├── config          # ESLint, TSConfig
    └── ui              # (Optional) Shared UI components