export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'black';

export interface Card {
  id: string;
  topValue: number;
  bottomValue: number;
  color: CardColor;
  isFlipped: boolean;
  isSparkle?: boolean; // New: Sparkle bonus
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isConnected: boolean;
  socketId?: string;
  // New fields
  score: number;
  isRiichi: boolean;
  avatarUrl?: string;
  title?: string;
  dbUserId?: string;
  isHost?: boolean;
}

export interface RoomInfo {
  roomId: string;
  name: string; // "Room #1234"
  playerCount: number;
  maxPlayers: number;
  status: GameStatus;
}

export type GameStatus = 'waiting' | 'playing' | 'ended' | 'destroyed';

export type YakuType = 
  | 'isshiki' 
  | 'sanren' 
  | 'rikka' 
  | 'three_pairs' 
  | 'musou' 
  | 'sanshiki' 
  | 'all_sparkles';

export interface YakuResult {
  name: YakuType;
  points: number;
}

export interface ScoreResult {
  total: number;
  yaku: YakuResult[];
  bonuses: number; // Sparkle, Riichi
}

export interface GameState {
  roomId: string;
  status: GameStatus;
  deck: Card[];
  discardPile: Card[];
  players: Record<string, Player>;
  currentPlayerId: string | null;
  winnerId: string | null;
  scoreResult?: ScoreResult;
  turnStartTime: number;
  // New fields
  interruption?: {
    type: 'ron';
    discardCardId: string;
    discardPlayerId: string;
    // Map of players who can claim Ron -> their timeout/decision status
    claimants: Record<string, 'pending' | 'claimed' | 'passed'>;
    expiresAt: number;
  }; 
}
