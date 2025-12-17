import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types';

interface GameStore {
  socket: Socket | null;
  isConnected: boolean;
  gameState: GameState | null;
  playerId: string | null;
  roomId: string | null;
  playerName: string;
  
  // Actions
  connect: (playerName: string) => void;
  createRoom: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  drawCard: () => void;
  discardCard: (cardId: string) => void;
  flipCard: (cardId: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  isConnected: false,
  gameState: null,
  playerId: null,
  roomId: null,
  playerName: '',

  connect: (playerName: string) => {
    const socket = io('http://localhost:4000', {
       autoConnect: true,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Connected to server with ID:', socket.id);
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      set({ isConnected: false });
    });

    socket.on('game_state_update', (gameState: GameState) => {
      console.log('Game State Update:', gameState);
      set({ gameState });
    });

    set({ socket, playerName });
  },

  resetGame: () => {
      set({ 
          roomId: null, 
          playerId: null, 
          gameState: null 
      });
  },

  createRoom: async () => {
    const { socket, playerName } = get();
    if (!socket) return;

    return new Promise((resolve, reject) => {
      socket.emit('create_room', { playerName }, (response: any) => {
        if (response.status === 'ok') {
          set({ roomId: response.roomId, playerId: response.playerId, gameState: response.state });
          resolve();
        } else {
          console.error('Create room failed:', response);
          reject(response.message);
        }
      });
    });
  },

  joinRoom: async (roomId: string) => {
    const { socket, playerName } = get();
    if (!socket) return;

    return new Promise((resolve, reject) => {
      socket.emit('join_room', { roomId, playerName }, (response: any) => {
        if (response.status === 'ok') {
            set({ roomId: response.roomId, playerId: response.playerId, gameState: response.state });
            resolve();
        } else {
            console.error('Join room failed:', response);
            reject(response.message);
        }
      });
    });
  },

  drawCard: () => {
    const { socket, roomId, playerId } = get();
    if (!socket || !roomId || !playerId) return;
    socket.emit('draw_card', { roomId, playerId });
  },

  discardCard: (cardId: string) => {
    const { socket, roomId, playerId } = get();
    if (!socket || !roomId || !playerId) return;
    socket.emit('discard_card', { roomId, playerId, cardId });
  },

  flipCard: (cardId: string) => {
      const { socket, roomId, playerId } = get();
      if (!socket || !roomId || !playerId) return;
      socket.emit('flip_card', { roomId, playerId, cardId });
  }
}));
