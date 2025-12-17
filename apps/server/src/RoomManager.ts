import { GameState, Player, generateDeck, shuffle, checkWin } from '@rikka/shared';
import { randomUUID } from 'crypto';

export class RoomManager {
  private rooms: Map<string, GameState>;

  constructor() {
    this.rooms = new Map();
  }

  // ... (createRoom and joinRoom methods remain the same, simplified for diff contextual match if tool allows partial, but I will replace whole file content for safety or ideally specific blocks if I can rely on context. Given the significant additions, I'll try to append methods.)
  // Actually, replace_file_content with chunks is safer.

  createRoom(playerName: string, socketId?: string): { roomId: string; state: GameState } {
    const roomId = randomUUID().substring(0, 6).toUpperCase();
    const deck = shuffle(generateDeck());
    
    const playerHand = deck.splice(0, 5);
    const playerId = randomUUID();

    const hostPlayer: Player = {
      id: playerId,
      name: playerName,
      hand: playerHand,
      isConnected: true,
      socketId,
    };

    const state: GameState = {
      roomId,
      status: 'waiting',
      deck,
      discardPile: [],
      players: {
        [playerId]: hostPlayer,
      },
      currentPlayerId: null,
      winnerId: null,
      turnStartTime: Date.now(),
    };

    this.rooms.set(roomId, state);
    return { roomId, state };
  }

  joinRoom(roomId: string, playerName: string, socketId?: string): { playerId: string; state: GameState } {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (Object.keys(room.players).length >= 2) {
      throw new Error('Room is full');
    }

    const playerId = randomUUID();
    const playerHand = room.deck.splice(0, 5);

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      hand: playerHand,
      isConnected: true,
      socketId,
    };

    room.players[playerId] = newPlayer;
    
    if (Object.keys(room.players).length === 2) {
        room.status = 'playing';
        const playerIds = Object.keys(room.players);
        room.currentPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
        // Starting player does NOT draw automatically here in typical Mahjong-like flows if we want strict phases, 
        // but README says "Draw 1 card (5->6)". 
        // So let's keep the manual draw phase or auto-draw?
        // README: "1. Draw: Player draws 1 card". So it's an action.
        // My previous Join implementation auto-dealt 6th card. I should REVERT that if I want strict Draw event.
        // Let's stick to: Join -> 5 cards each. CurrentPlayer needs to call 'draw_card'.
        // Wait, previous implementation: "Give starting player 6th card". 
        // If I want to verify "Draw" event, I should let them draw it.
        // I will remove the auto-draw 6th card logic from joinRoom to match the "Draw 1 card" phase explicitly.
    }

    return { playerId, state: room };
  }

  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  drawCard(roomId: string, playerId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'playing') throw new Error('Game not active');
    if (room.currentPlayerId !== playerId) throw new Error('Not your turn');
    
    const player = room.players[playerId];
    if (player.hand.length >= 6) throw new Error('Already has 6 cards');
    if (room.deck.length === 0) throw new Error('Deck empty'); // Draw game?

    const card = room.deck.pop()!;
    player.hand.push(card);

    // Check Win immediately after draw (Tsumo)
    if (checkWin(player.hand)) {
        room.status = 'ended';
        room.winnerId = playerId;
    }

    return room;
  }

  discardCard(roomId: string, playerId: string, cardId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'playing') throw new Error('Game not active');
    if (room.currentPlayerId !== playerId) throw new Error('Not your turn');
    
    const player = room.players[playerId];
    if (player.hand.length !== 6) throw new Error('Must have 6 cards to discard'); // Must be after draw

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) throw new Error('Card not in hand');

    const [card] = player.hand.splice(cardIndex, 1);
    // Reset flip state on discard? Usually yes for public info, but let's keep it simple.
    card.isFlipped = false; 
    room.discardPile.push(card);

    // Switch turn
    const playerIds = Object.keys(room.players);
    const opponentId = playerIds.find(id => id !== playerId);
    if (opponentId) {
        room.currentPlayerId = opponentId;
        room.turnStartTime = Date.now();
    }

    return room;
  }

  flipCard(roomId: string, playerId: string, cardId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'playing') throw new Error('Game not active');
    if (room.currentPlayerId !== playerId) throw new Error('Not your turn (can only flip on turn)');
    // Rule check: Can I flip anytime? "Action: Flip: Player can tap any card... swapping its active value."
    // Usually implies during their main phase (after draw, before discard).
    
    const player = room.players[playerId];
    const card = player.hand.find(c => c.id === cardId);
    if (!card) throw new Error('Card not in hand');

    card.isFlipped = !card.isFlipped;

    // Check Win after flip
    if (player.hand.length === 6 && checkWin(player.hand)) {
        room.status = 'ended';
        room.winnerId = playerId;
    }

    return room;
  }
}

export const roomManager = new RoomManager();
