import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, RoomInfo } from '@rikka/shared';

interface GameStore {
  socket: Socket | null;
  isConnected: boolean;
  gameState: GameState | null;
  rooms: RoomInfo[]; // List of active rooms
  playerId: string | null;
  roomId: string | null;
  playerName: string;
  
  // Actions
  connect: (playerName: string) => void;
  fetchRooms: () => void;
  createRoom: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  drawCard: () => void;
  discardCard: (cardId: string) => void;
  flipCard: (cardId: string) => void;
  declareRiichi: () => void;
  declareRon: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  isConnected: false,
  rooms: [],
  gameState: null,
  playerId: null,
  roomId: null,
  playerName: '',

  connect: (playerName: string) => {
    const socket = io('http://localhost:4000', {
       autoConnect: true,
       transports: ['websocket'] // Force websocket for stability
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Connected to server with ID:', socket.id);
      // Auto fetch rooms on connect
      socket.emit('get_rooms'); 
    });

    socket.on('room_list_update', (rooms: RoomInfo[]) => {
        set({ rooms });
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

  fetchRooms: () => {
      const { socket } = get();
      if (socket) socket.emit('get_rooms');
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
  },

  declareRiichi: () => {
      const { socket, roomId, playerId } = get();
      if (!socket || !roomId || !playerId) return;
      socket.emit('declare_riichi', { roomId, playerId });
  },

  declareRon: () => {
      const { socket, roomId, playerId } = get();
      if (!socket || !roomId || !playerId) return;
      socket.emit('claim_ron', { roomId, playerId });
  }
}));
