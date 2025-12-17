import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, RoomInfo } from '@rikka/shared';

interface SocketResponse {
    status: string;
    message?: string;
    [key: string]: unknown;
}

interface GameStore {
  socket: Socket | null;
  isConnected: boolean;
  gameState: GameState | null;
  rooms: RoomInfo[]; // List of active rooms
  playerId: string | null;
  roomId: string | null;
  playerName: string;
  userId: string | null;
  
  // Actions
  connect: (playerName: string, userId?: string) => void;
  fetchRooms: () => void;
  createRoom: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  drawCard: () => void;
  discardCard: (cardId: string) => void;
  flipCard: (cardId: string) => void;
  declareRiichi: () => void;
  declareRon: () => void;
  resetGame: () => void;
  setPlayerName: (name: string) => void;
  updateProfile: (name: string) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  isConnected: false,
  rooms: [],
  gameState: null,
  playerId: null,
  roomId: null,
  playerName: '',
  userId: null,

  connect: (playerName: string, userId?: string) => {
    const socket = io('http://localhost:4000', {
       autoConnect: true,
       transports: ['websocket'], // Force websocket for stability
       auth: { userId }
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Connected to server with ID:', socket.id);
      // Auto fetch rooms on connect
      socket.emit('get_rooms', {}, (response: SocketResponse) => {
          if (response && response.status === 'ok') {
              set({ rooms: response.rooms as RoomInfo[] });
          }
      });
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

    socket.on('rejoin_success', (data: { roomId: string, playerId: string, state: GameState }) => {
        console.log('Rejoined room:', data.roomId);
        set({ 
            roomId: data.roomId, 
            playerId: data.playerId, 
            gameState: data.state 
        });
    });

    // Handle room_closed event
    socket.on('room_closed', () => {
        console.log('Room closed by host');
        set({ roomId: null, playerId: null, gameState: null });
        // Optional: Notify user via UI toast?
    });

    set({ socket, playerName, userId: userId || null });
  },

  fetchRooms: () => {
      const { socket } = get();
      if (socket) {
          socket.emit('get_rooms', {}, (response: SocketResponse) => {
              if (response && response.status === 'ok') {
                  set({ rooms: response.rooms as RoomInfo[] });
              }
          });
      }
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
    if (!socket) {
        console.error("Socket not connected");
        return;
    }
    if (!playerName) {
        console.error("Player name not set");
        return;
    }

    return new Promise<void>((resolve, reject) => {
      const { userId } = get();
      socket.emit('create_room', { playerName, userId }, (response: SocketResponse) => {
        if (response.status === 'ok') {
          set({ roomId: response.roomId as string, playerId: response.playerId as string, gameState: response.state as GameState });
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

    return new Promise<void>((resolve, reject) => {
      const { userId } = get();
      socket.emit('join_room', { roomId, playerName, userId }, (response: SocketResponse) => {
        if (response.status === 'ok') {
            set({ roomId: response.roomId as string, playerId: response.playerId as string, gameState: response.state as GameState });
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
  },

  setPlayerName: (name: string) => {
      set({ playerName: name });
  },

  updateProfile: async (name: string) => {
      const { socket, userId } = get();
      console.log(`[GameStore] updateProfile called. Name: ${name}, UserId: ${userId}, Socket: ${socket?.id}`);
      
      if (!socket || !userId) {
          console.error("[GameStore] Cannot update profile: Missing socket or userId");
          return;
      }

      set({ playerName: name }); // Optimistic update

      return new Promise<void>((resolve, reject) => {
          socket.emit('update_profile', { userId, name }, (response: SocketResponse) => {
              console.log("[GameStore] update_profile response:", response);
              if (response.status === 'ok') {
                  resolve();
              } else {
                  console.error('Update profile failed:', response);
                  reject(response.message);
              }
          });
      });
  }
}));
