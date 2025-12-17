import { GameState, generateDeck } from "@rikka/shared";

const fullDeck = generateDeck();

export const MOCK_GAME_STATE: GameState = {
  roomId: "demo-room-1",
  status: "playing",
  turnStartTime: Date.now(),
  currentPlayerId: "player-1",
  winnerId: null,
  deck: fullDeck.slice(20), // Reduced deck
  discardPile: [
    { ...fullDeck[0], isFlipped: false },
    { ...fullDeck[1], isFlipped: true },
    { ...fullDeck[2], isFlipped: false },
    { ...fullDeck[3], isFlipped: false },
    { ...fullDeck[4], isFlipped: false },
  ],
  players: {
    "player-1": {
      id: "player-1",
      name: "Hero Player",
      isConnected: true,
      score: 25000,
      isRiichi: false,
      hand: fullDeck.slice(5, 11).map(c => ({ ...c, isFlipped: false })), // 6 cards
    },
    "player-2": {
      id: "player-2",
      name: "Opponent",
      isConnected: true,
      score: 24000,
      isRiichi: true, // Visual test: Riichi indicator
      hand: fullDeck.slice(11, 16).map(c => ({ ...c, isFlipped: true })), // 5 cards (opponent usually hidden but mock needs data)
    }
  }
};
