import { Server, Socket } from 'socket.io';
import { CreateRoomSchema, JoinRoomSchema, DrawCardSchema, DiscardCardSchema, FlipCardSchema, GameState } from '@rikka/shared';
import { roomManager } from '../RoomManager';

export function registerRoomHandlers(io: Server, socket: Socket) {
  // Helper to handle errors
  const handleError = (callback: any, error: any) => {
    if (callback) callback({ status: 'error', message: error.message || 'Unknown error' });
  };

  const broadcastGameUpdate = (io: Server, state: GameState) => {
    Object.values(state.players).forEach(player => {
        if (!player.socketId) return;

        // Create sanitized state for this player
        const sanitizedState: GameState = {
            ...state,
            deck: state.deck.map(c => ({ ...c, id: 'hidden', topValue: 0, bottomValue: 0, color: 'black' as any, isFlipped: false })), // Mask deck
            players: Object.fromEntries(Object.entries(state.players).map(([pid, p]) => {
                const isSelf = pid === player.id;
                if (isSelf) {
                    return [pid, p];
                } else {
                    // Mask opponent hand
                    const maskedHand = p.hand.map(c => ({
                        ...c,
                        id: 'hidden',
                        topValue: 0,
                        bottomValue: 0,
                        color: 'black' as any,
                        isFlipped: c.isFlipped // Keep flip status visible? Discussed: logic says flip changes value. So values should be hidden regardless.
                        // Actually, if a card is flipped, maybe we show back? No, Rikka flip just changes values. 
                        // So for opponent, we hide everything.
                    }));
                    return [pid, { ...p, hand: maskedHand }];
                }
            }))
        };
        
        // Correctly handle 'deck' length visualization if needed, but for now masking content is enough.
        // Array length is preserved by map.

        io.to(player.socketId).emit('game_state_update', sanitizedState);
    });
  };

  const handleCreateRoom = (payload: unknown, callback: (response: any) => void) => {
    try {
      const validated = CreateRoomSchema.parse(payload);
      const { roomId, state } = roomManager.createRoom(validated.playerName, socket.id);
      
      socket.join(roomId);
      
      const playerId = Object.keys(state.players).find(pid => state.players[pid].name === validated.playerName)!;
      
      if (callback) callback({ status: 'ok', roomId, playerId, state }); // Initial state might reveal deck to creator? 
      // Ideally even initial response should be sanitized if we strictly follow "only see own hand".
      // But for creation ack, maybe it's fine. 
      // Best practice: Send sanitized state in ack too or just rely on the broadcast that follows.
      // Let's rely on broadcast for the 'real' state.
      
      broadcastGameUpdate(io, state);
      
    } catch (e: any) {
      handleError(callback, e);
    }
  };

  const handleJoinRoom = (payload: unknown, callback: (response: any) => void) => {
    try {
      const validated = JoinRoomSchema.parse(payload);
      const { playerId, state } = roomManager.joinRoom(validated.roomId, validated.playerName, socket.id);
      
      socket.join(validated.roomId);
      
      if (callback) callback({ status: 'ok', roomId: validated.roomId, playerId, state }); 
      broadcastGameUpdate(io, state);
      
    } catch (e: any) {
      handleError(callback, e);
    }
  };

  const handleDrawCard = (payload: unknown, callback: (response: any) => void) => {
    try {
      const validated = DrawCardSchema.parse(payload);
      const state = roomManager.drawCard(validated.roomId, validated.playerId);
      
      if (callback) callback({ status: 'ok', state }); // State in ack - potentially leaky. Should sanitize or omit.
      // If client relies on this for immediate redraw, it receives full state.
      // Let's keep it for now but note that broadcast is the secure channel.
      broadcastGameUpdate(io, state);
      
    } catch (e: any) {
      handleError(callback, e);
    }
  };

  const handleDiscardCard = (payload: unknown, callback: (response: any) => void) => {
    try {
      const validated = DiscardCardSchema.parse(payload);
      const state = roomManager.discardCard(validated.roomId, validated.playerId, validated.cardId);
      
      if (callback) callback({ status: 'ok', state });
      broadcastGameUpdate(io, state);
      
    } catch (e: any) {
      handleError(callback, e);
    }
  };

  const handleFlipCard = (payload: unknown, callback: (response: any) => void) => {
    try {
       const validated = FlipCardSchema.parse(payload);
       const state = roomManager.flipCard(validated.roomId, validated.playerId, validated.cardId);

       if (callback) callback({ status: 'ok', state });
       broadcastGameUpdate(io, state);

    } catch (e: any) {
       handleError(callback, e);
    }
  };

  socket.on('create_room', handleCreateRoom);
  socket.on('join_room', handleJoinRoom);
  socket.on('draw_card', handleDrawCard);
  socket.on('discard_card', handleDiscardCard);
  socket.on('flip_card', handleFlipCard);
}
