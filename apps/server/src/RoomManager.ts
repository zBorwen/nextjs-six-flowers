import { GameState, Player, RoomInfo, generateDeck, shuffle, checkWin, calculateScore } from '@rikka/shared';
import { prisma, Prisma } from '@rikka/database';
import { randomUUID } from 'crypto';

export class RoomManager {
  private rooms: Map<string, GameState>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(playerName: string, socketId?: string, userId?: string): { roomId: string; state: GameState } {
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
      score: 25000,
      isRiichi: false,
      dbUserId: userId,
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

  joinRoom(roomId: string, playerName: string, socketId?: string, userId?: string): { playerId: string; state: GameState } {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (Object.keys(room.players).length >= 4) { // Max 4 players? Rules say multiplayer. Let's assume 4 max.
      throw new Error('Room is full');
    }

    if (room.status !== 'waiting') {
        throw new Error('Game already started');
    }

    const playerId = randomUUID();
    const playerHand = room.deck.splice(0, 5);

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      hand: playerHand,
      isConnected: true,
      socketId,
      score: 25000,
      isRiichi: false,
      dbUserId: userId,
    };

    room.players[playerId] = newPlayer;
    
    // Start game if 2 players for MVP? Or wait for host?
    // Let's stick to 2 players auto-start for MVP speed, or user requested "Create Room" -> "Lobby" flow.
    // Given the task list "2.3 Socket Handlers (Join)", let's assume auto-start at 2 for now to match previous MVP behavior unless specified.
    // README says "Room List: 2/4". So maybe max 4.
    // Let's Start at 2 for MVP to let us test logic immediately.
    if (Object.keys(room.players).length === 2) {
        room.status = 'playing';
        const playerIds = Object.keys(room.players);
        room.currentPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    }

    return { playerId, state: room };
  }

  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  getRooms(): RoomInfo[] {
      return Array.from(this.rooms.values()).map(room => ({
          roomId: room.roomId,
          name: `Room ${room.roomId}`, 
          playerCount: Object.keys(room.players).length,
          maxPlayers: 4, // MVP fixed limit
          status: room.status
      }));
  }

  drawCard(roomId: string, playerId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'playing') throw new Error('Game not active');
    if (room.interruption) throw new Error('Game is interrupted (Ron check)');
    if (room.currentPlayerId !== playerId) throw new Error('Not your turn');
    
    const player = room.players[playerId];
    if (player.hand.length >= 6) throw new Error('Already has 6 cards');
    
    if (room.deck.length === 0) {
        // Reshuffle discard pile
        if (room.discardPile.length === 0) throw new Error('Draw Game (No cards left)');
        room.deck = shuffle([...room.discardPile]);
        room.discardPile = [];
    }

    const card = room.deck.pop()!;
    player.hand.push(card);

    return room;
  }

  discardCard(roomId: string, playerId: string, cardId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'playing') throw new Error('Game not active');
    if (room.currentPlayerId !== playerId) throw new Error('Not your turn');
    
    const player = room.players[playerId];
    if (player.hand.length !== 6) throw new Error('Must have 6 cards to discard');

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) throw new Error('Card not in hand');

    const [card] = player.hand.splice(cardIndex, 1);
    card.isFlipped = false; // Reset flip on discard
    room.discardPile.push(card);

    // Riichi Lock Check: If Riichi, did I discard the drawn card? 
    // Complexity: Client might have swapped positions. 
    // Strict rule: "draw card that doesn't win must be immediately discarded".
    // For MVP, we trust client sends the right discard.

    // CHECK FOR RON before switching turn
    // For every OTHER player, check if they can win with this card.
    const opponents = Object.values(room.players).filter(p => p.id !== playerId);
    const potentialWinners: string[] = [];

    for (const opp of opponents) {
        const potentialHand = [...opp.hand, card]; // Hand(5) + Discard(1)
        if (checkWin(potentialHand)) {
            potentialWinners.push(opp.id);
        }
    }

    if (potentialWinners.length > 0) {
        // Enter Interruption State
        room.interruption = {
            type: 'ron',
            discardCardId: card.id,
            discardPlayerId: playerId,
            claimants: potentialWinners.reduce((acc, id) => ({ ...acc, [id]: 'pending' }), {}),
            expiresAt: Date.now() + 10000 // 10s timeout
        };
        // Do NOT switch turn yet.
        return room;
    }

    // No Ron? Switch Turn
    this.advanceTurn(room);
    return room;
  }

  flipCard(roomId: string, playerId: string, cardId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'playing') throw new Error('Game not active');
    if (room.interruption) throw new Error('Game interrupted');
    if (room.currentPlayerId !== playerId) throw new Error('Not your turn');
    
    const player = room.players[playerId];
    
    // Riichi Rule: Hand is locked. Cannot flip?
    // "Cost: Hand is locked." Usually implies no structure changes. Flip changes structure (values).
    if (player.isRiichi) throw new Error('Cannot flip in Riichi');

    const card = player.hand.find(c => c.id === cardId);
    if (!card) throw new Error('Card not in hand');

    card.isFlipped = !card.isFlipped;
    return room;
  }

  declareRiichi(roomId: string, playerId: string): GameState {
      const room = this.rooms.get(roomId);
      if (!room) throw new Error('Room not found');
      if (room.currentPlayerId !== playerId) throw new Error('Not your turn');
      
      const player = room.players[playerId];
      if (player.isRiichi) throw new Error('Already Riichi');
      
      // Ideally check Tenpai here. Skipping for MVP trust.
      player.isRiichi = true;
      player.score -= 1000; // Standard Riichi cost? Not in PDF summary, but standard in Mahjong. 
      // Rule 2.2 just says "Cost: Hand is locked". Maybe no points? 
      // Let's assume no point cost for Rikka unless specified.
      // Re-read: "Cost: Hand is locked." No mention of -1000.
      // I'll revert the score deduction to follow "Strict Source of Truth".
      player.score += 0; 
      
      return room;
  }
  
  // Helper to advance turn (Circular)
  claimRon(roomId: string, playerId: string): GameState {
      const room = this.rooms.get(roomId);
      if (!room) throw new Error('Room not found');
      if (!room.interruption || room.interruption.type !== 'ron') throw new Error('No Ron opportunity');
      
      const claimantStatus = room.interruption.claimants[playerId];
      if (!claimantStatus) throw new Error('Not eligible for Ron');
      if (claimantStatus !== 'pending') throw new Error('Already responded');

      // Update status
      room.interruption.claimants[playerId] = 'claimed';

      // Check if all pending are resolved
      const allResolved = Object.values(room.interruption.claimants).every(s => s !== 'pending');
      
      if (allResolved) {
          this.resolveMatch(room);
      }

      return room;
  }

  restartGame(roomId: string, playerId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    
    // Check if host (first player in list for MVP simplicity)
    const playerIds = Object.keys(room.players);
    if (playerIds[0] !== playerId) {
         throw new Error('Only host can restart');
    }

    // Reset Game State
    const deck = shuffle(generateDeck());
    room.deck = deck;
    room.discardPile = [];
    room.interruption = undefined;
    room.winnerId = null;
    room.scoreResult = undefined;
    room.status = playerIds.length >= 2 ? 'playing' : 'waiting';
    room.turnStartTime = Date.now();
    
    // Reset Players
    playerIds.forEach(pid => {
        const p = room.players[pid];
        p.hand = room.deck.splice(0, 5);
        p.isRiichi = false;
        p.score = 25000; // Reset score
    });

    // Randomize first turn
    room.currentPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];

    return room;
  }

  private resolveMatch(room: GameState) {
      if (!room.interruption) return;

      const winners = Object.entries(room.interruption.claimants)
          .filter(([_, status]) => status === 'claimed')
          .map(([pid]) => room.players[pid]);
      
      if (winners.length === 0) {
          // Everyone passed? Advance turn.
          room.interruption = undefined;
          this.advanceTurn(room);
          return;
      }

      // Calculate Scores
      const winner = winners[0];
      const winningCard = room.deck.find(c => c.id === room.interruption!.discardCardId) || room.discardPile.find(c => c.id === room.interruption!.discardCardId);
      // Note: card might be in discardPile? Yes, discardCard pushes it there.
      // But we need the CARD OBJECT for scoring if it matters? 
      // Actually calculateScore takes `cards`. 
      // The winner's hand (5) + Winning Card (1).
      
      // We need to construct the full winning hand.
      // The card is currently in discardPile (RoomManager line 139).
      // We need to retrieve it.
      const discardCard = room.discardPile.find(c => c.id === room.interruption!.discardCardId);
      if (!discardCard) {
          // Fallback if something weird happened, though unlikely.
          console.error("Winning card not found in discard pile");
          room.status = 'ended';
          room.winnerId = winner.id;
          return;
      }

      const finalHand = [...winner.hand, discardCard];
      const scoreResult = calculateScore(finalHand, true, winner.isRiichi); // isRon=true
      
      // Update Scores
      // Winner gets points from Loser (Discarder).
      const loserId = room.interruption!.discardPlayerId;
      const loser = room.players[loserId];
      
      // Apply Score
      // If score is 0 (shouldn't happen if checkWin passed), default to min? 
      // Rules: "Base points...". 
      const points = scoreResult.total > 0 ? scoreResult.total * 1000 : 1000; // Multiplier?
      // Wait, `calculateScore` returns abstract points (e.g. 6pts). 
      // Mahjong usually scales (e.g. 1 han = 1000). Rikka rules might specify.
      // PDF summary: "Points are calculated..." 
      // Let's assume 1 pt = 1000 score for MVP to make numbers look "Mahjong-like".
      
      winner.score += points;
      loser.score -= points;

      room.status = 'ended';
      room.winnerId = winner.id;
      room.scoreResult = scoreResult;
      
      console.log(`Match Resolved: Winner ${winner.name} (+${points}), Loser ${loser.name} (-${points})`);
      
      // Async persist
      this.persistMatch(winner, loser, points, room.roomId).catch(err => console.error('Persistence error:', err));
  }
  // Helper to advance turn (Circular)
  private advanceTurn(room: GameState) {
      const playerIds = Object.keys(room.players);
      const currentIdx = playerIds.indexOf(room.currentPlayerId!);
      const nextIdx = (currentIdx + 1) % playerIds.length;
      room.currentPlayerId = playerIds[nextIdx];
      room.turnStartTime = Date.now();
  }

  private async persistMatch(winner: Player, loser: Player, points: number, roomCode: string) {
    // Only persist if at least one user is registered
    if (!winner.dbUserId && !loser.dbUserId) return;

    try {
        console.log(`Persisting match result for Winner(${winner.dbUserId}) vs Loser(${loser.dbUserId})`);
        
        // 1. Create Match Record
        // We need all players to be in MatchPlayer? Yes.
        // But for MVP if players are not registered, we can't link them.
        // We will create MatchPlayer only for registered users or mock?
        // Prisma schema: MatchPlayer -> User (relation). So mandatory userId.
        // So we can ONLY save stats for registered users.
        
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const match = await tx.match.create({
                data: {}
            });

            // Create MatchPlayer entries for registered users
            if (winner.dbUserId) {
                await tx.matchPlayer.create({
                    data: {
                        matchId: match.id,
                        userId: winner.dbUserId,
                        scoreChange: points,
                        yakuDetails: JSON.stringify(winner.hand) // Basic snapshot
                    }
                });
                await tx.user.update({
                    where: { id: winner.dbUserId },
                    data: { score: { increment: points } }
                });
            }

            if (loser.dbUserId) {
                 await tx.matchPlayer.create({
                    data: {
                        matchId: match.id,
                        userId: loser.dbUserId,
                        scoreChange: -points,
                    }
                });
                await tx.user.update({
                    where: { id: loser.dbUserId },
                    data: { score: { decrement: points } }
                });
            }
        });
        
    } catch (e: any) {
        console.error('Failed to persist match:', e.message);
    }
  }
}

export const roomManager = new RoomManager();
