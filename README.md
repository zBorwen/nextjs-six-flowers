# 🀄 Rikka (Six Flowers) - Mobile Web Edition

> **Source of Truth**: Based on the official PDF rules (including Additional Rules).
> **Product Goal**: A mobile-first board game with extreme tactile feedback.
> **Architecture**: Monorepo (Turborepo) + Next.js 15 (Client) + Fastify (Server).

## 📱 1. Project Overview

This project is a digital implementation of the board game "Rikka". The core experience focuses on **"Tactile Physicality"**—simulating the real sensation of handling tiles on a phone screen through fluid animations, haptic feedback, and optimistic UI updates.

### Tech Stack
* **Manager**: `pnpm` + `Turborepo`
* **Frontend**: `apps/client`
    * Next.js 15 (App Router)
    * Tailwind CSS (Styling)
    * Framer Motion (Complex interactions/animations)
    * Zustand + Immer (State Management)
    * `navigator.vibrate` (Haptics)
* **Backend**: `apps/server`
    * Fastify (High-performance HTTP)
    * Socket.io (Real-time bidirectional comms)
    * Zod (Runtime validation)
* **Shared**: `packages/shared` (Pure TS logic, types, constants)

### Development Standards
1.  **Zero `any` Tolerance**: Strict TypeScript. All I/O must be validated via Zod Schemas.
2.  **Mobile First**: Designed strictly for Portrait mode. Touch targets > 44px.
3.  **Atomic Files**: Max **350 lines** per file. Complex logic must be split into helpers/hooks.
4.  **Atomic Commits**: Generate a commit after completing EACH item in the Task List.

---

## 📜 2. Official Game Rules (Complete)

### 2.1 Components
* **Tiles**: 42 Total. Each tile has two values (Top/Bottom) and a specific suit/pattern.
* **Sparkle**: Some tiles have a "Star" icon, providing bonus points upon winning.
* **Field**: Center area containing the face-down **Draw Deck** and face-up **Discard Pile**.

### 2.2 Turn Sequence (The Loop)
Play proceeds clockwise. On a player's turn:

1.  **Draw (Mandatory)**:
    * Must draw 1 tile from the **Draw Deck**.
    * *Crucial Rule*: You CANNOT "eat/take" a discarded tile to build a set (unless declaring a Win/Ron).
    * *Edge Case*: If the Deck is empty, the Discard Pile is reshuffled to form a new Deck.
2.  **Action**:
    * **Flip**: Freely rotate any tile in hand (180°) to swap Top/Bottom values.
    * **Riichi (Rikka) [Additional Rule]**:
        * *Condition*: Can be declared if 1 tile away from winning (Tenpai).
        * *Effect*: +1 Bonus Point if won.
        * *Cost*: Hand is locked. Any drawn tile that doesn't win must be immediately discarded.
3.  **Discard**:
    * Place 1 tile face-up into the Discard Pile.

### 2.3 Winning Conditions (Yaku)
The 6 tiles (5 held + 1 drawn) must form a valid pattern based on their **BOTTOM (Active) Values**:

#### Basic Yaku
* **Isshiki (One Suit)** [1 pt]: All 6 tiles share the same bottom pattern/color.
* **Sanren (Three Sequential)** [3 pts]: Two sets of 3 sequential numbers (e.g., `1-2-3` + `4-5-6`).
* **Rikka (Six Flowers)** [6 pts]: High-level flush (Specific pattern, defined as same-color for MVP).

#### Special Yaku
* **Three Pairs (Três x Santsui)** [5 pts]: 3 pairs of identical tiles.
* **Musou** [9 pts]: Specific non-symmetrical structure (Defined by specific ID combinations).
* **Sanshiki (Three Colors)** [3 pts]: Contains 3 different colors. *(Constraint: Pass Completion only, no Tsumo)*.
* **All Sparkles (Terumitsu Kikou)** [5 pts]: All 6 tiles have Sparkle icons. *(Constraint: Does not stack with single sparkle bonuses)*.

#### Bonuses
* **Sparkle**: +1 pt per sparkle icon (for Basic Yaku).
* **Riichi**: +1 pt.

### 2.4 Multiplayer Interactions
* **Ron (Direct Hit)**: If *any* opponent discards a winning tile, you can claim it immediately. Points are paid fully by the discarder.
* **Pass Completion**: If a revealed face-up tile on the field completes your hand, you can win off it (without physically taking it).
* **Priority**: If multiple players Ron, the player closest to the discarder (clockwise) wins.

---

## 🖥️ 3. UI Architecture & Page Requirements

### 3.1 Lobby Page (`/`)
* **Header**: User Avatar, Nickname, Score.
* **Room List**:
    * Scrollable area of Room Cards (Name, Player Count).
    * **Badges**: `OPEN` (Green, Clickable), `FULL` (Gray, Disabled), `PLAYING` (Red).
* **Actions**: Fixed bottom bar with "Create Room" (Primary) and "Rules" (Dialog).

### 3.2 Game Room (`/room/[id]`) - Portrait Sandwich Layout
* **Top (Opponent Area)**:
    * Horizontal list of opponents.
    * Info: Avatar, Score, **Remaining Cards (Card back icons)**.
    * **Feedback**: Active turn halo, Riichi tag, Disconnected/Thinking status.
* **Center (Game Field)**:
    * **Background**: Dark green felt texture.
    * **Deck**: 3D stacked look showing remaining count.
    * **Discard Pile**: Scattered layout, ensuring the latest discard is highlighted.
    * **Toast Area**: Center screen notifications ("Waiting...", "Your Turn").
* **Bottom (Player Area)**:
    * **Hand**: 
        * Render 6 tiles.
        * **Visuals**: Bottom value enlarged/highlighted. Top value grayed out/inverted.
        * **Interaction**: Tap to Flip (Animation), Drag Up to Discard.
    * **Action Bar**:
        * Context-aware buttons: `Riichi` (When Tenpai), `Ron` (When winning), `Tsumo`, `Sort`.

---

## 🛠️ 4. Engineering & Optimization Guidelines

1.  **Optimistic UI**:
    * On Flip/Drag: Update local state and run animation **immediately**. Do not await Server response. Revert only on error.
2.  **Haptics**:
    * Drag Start: Light vibration (5ms).
    * Discard/Flip Success: Medium vibration (15ms).
    * Turn Start/Win: Heavy/Pattern vibration.
3.  **Reconnection**:
    * UI shows "Connecting..." on socket disconnect. Upon reconnect, auto-emit `SYNC_STATE` to restore board, avoiding a kick-to-lobby.

---

## ✅ 5. Development Task List

> **Instruction for AI**: Execute strictly in order. **STOP** and Commit after completing **each single item**.

### Phase 1: Shared Logic (Foundation)
- [ ] **1.1 Types**: Define `Card`, `Player`, `RoomInfo`, `Yaku`, `GameState`.
- [ ] **1.2 Algorithm**: Implement `checkWin(cards)`.
    -   Support recursive checks for `Sanren`, `Isshiki`.
    -   Support Special Yaku (`Three Pairs`, `Musou`, `Sanshiki`, `All Sparkles`).
    -   **Crucial**: Logic must account for `isFlipped` state.
- [ ] **1.3 Scoring**: Implement `calculateScore` including base points + bonuses.

### Phase 2: Server Implementation (Fastify)
- [ ] **2.1 Room Manager**: Class to manage `deck`, `discardPile`, `players`.
- [ ] **2.2 Game Loop**: Handle `DRAW`, `DISCARD`, `FLIP` events.
- [ ] **2.3 Special Actions**: Handle `RIICHI` (State locking) and `RESHUFFLE` (Empty deck logic).
- [ ] **2.4 Interruption (Ron)**:
    -   On `DISCARD`, pause the turn loop.
    -   Broadcast `CHECK_RON`. Resolve if claim received; else timeout and proceed.

### Phase 3: Client Basis (Next.js)
- [ ] **3.1 Mock Data**: Create comprehensive Mock State for UI dev.
- [ ] **3.2 Lobby UI**: Implement Room List, Create Action, Rules Dialog.
- [ ] **3.3 Game Layout**: Implement the Opponent/Field/Player 3-section skeleton.

### Phase 4: Client Interaction & Polish
- [ ] **4.1 Card Component**:
    -   Skeuomorphic style (Shadows, Rounded corners).
    -   Framer Motion `layout` animations (Sorting).
    -   3D Flip animation (Optimistic).
- [ ] **4.2 Interaction Wiring**:
    -   Implement Drag-to-Discard (`@dnd-kit` or Motion drag).
    -   Implement Action Bar logic (`Riichi`, `Ron` visibility).
- [ ] **4.3 Integration**: Connect real Socket.io events, replace Mock data.
- [ ] **4.4 UX Enhancements**: Add Haptics and Sound FX.

---

## 🚀 Getting Started

1.  **Install**: `pnpm install`
2.  **Dev**: `pnpm dev` (Client: 3000, Server: 4000)
3.  **Verify**: Ensure `apps/client` and `apps/server` tsconfig correctly reference `packages/shared`.