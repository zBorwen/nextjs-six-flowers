export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'black';

export interface Card {
  id: string;
  topValue: number;
  bottomValue: number;
  color: CardColor;
  isFlipped: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isConnected: boolean;
  socketId?: string;
}

export type GameStatus = 'waiting' | 'playing' | 'ended';

export interface GameState {
  roomId: string;
  status: GameStatus;
  deck: Card[];
  discardPile: Card[];
  players: Record<string, Player>;
  currentPlayerId: string | null;
  winnerId: string | null;
  turnStartTime: number;
}
