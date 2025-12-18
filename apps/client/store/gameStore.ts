import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, RoomInfo } from '@rikka/shared';

interface SocketResponse {
    status: string;
    message?: string;
    code?: string;
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
  exitReason: string | null;
  
  // Actions
  clearExitReason: () => void;
  connect: (playerName: string, userId?: string) => void;
  fetchRooms: () => void;
  createRoom: (roomName?: string, maxPlayers?: number) => Promise<{ success: boolean; error?: string; code?: string }>;
  joinRoom: (roomId: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  leaveRoom: () => Promise<{ success: boolean; error?: string; code?: string }>;
  drawCard: () => void;
  discardCard: (cardId: string) => void;
  flipCard: (cardId: string) => void;
  declareRiichi: () => void;
  declareRon: () => void;
  resetGame: () => void;
  setPlayerName: (name: string) => void;
  updateProfile: (name: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  startGame: () => Promise<{ success: boolean; error?: string; code?: string }>;
  hostRestart: () => Promise<{ success: boolean; error?: string; code?: string }>;
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
  exitReason: null, // Track why we left/were kicked

  connect: (playerName: string, userId?: string) => {
    // Don't create duplicate sockets
    const existingSocket = get().socket;
    if (existingSocket?.connected) {
        console.log('[connect] Socket already connected, skipping');
        set({ playerName, userId: userId || null });
        return;
    }
    
    console.log('[connect] Creating new socket connection');
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
        // Ignore rejoin if user has intentionally left
        const { exitReason } = get();
        if (exitReason) {
            console.log('[rejoin_success] Ignoring due to exitReason:', exitReason);
            return;
        }
        console.log('Rejoined room:', data.roomId);
        set({ 
            roomId: data.roomId, 
            playerId: data.playerId, 
            gameState: data.state 
        });
    });

    // Handle room_closed event
    socket.on('room_closed', (data: { message: string }) => {
        console.log('Room closed:', data.message);
        set({ roomId: null, playerId: null, gameState: null, exitReason: data.message });
    });

    set({ socket, playerName, userId: userId || null });
  },

  clearExitReason: () => set({ exitReason: null }),

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

  createRoom: async (roomName?: string, maxPlayers: number = 2) => {
    const { socket, playerName } = get();
    if (!socket) {
        console.error("Socket not connected");
        return { success: false, error: "Socket not connected" };
    }
    if (!playerName) {
        console.error("Player name not set");
        return { success: false, error: "Player name not set" };
    }

    return new Promise((resolve) => {
      const { userId } = get();
      socket.emit('create_room', { playerName, userId, roomName, maxPlayers }, (response: SocketResponse) => {
        if (response.status === 'ok') {
          set({ roomId: response.roomId as string, playerId: response.playerId as string, gameState: response.state as GameState });
          resolve({ success: true });
        } else {
          console.error('Create room failed:', response);
          resolve({ success: false, error: response.message, code: response.code });
        }
      });
    });
  },

  leaveRoom: async () => {
      const { socket, roomId, playerId } = get();
      console.log('[leaveRoom] Attempting to leave. roomId:', roomId, 'playerId:', playerId, 'socket:', !!socket);
      if (!socket || !roomId || !playerId) {
          console.error('[leaveRoom] Missing required state. socket:', !!socket, 'roomId:', roomId, 'playerId:', playerId);
          return { success: false, error: "Not in room" };
      }

      return new Promise((resolve) => {
          socket.emit('leave_room', { roomId, playerId }, (response: SocketResponse) => {
              console.log('[leaveRoom] Server response:', response);
              if (response.status === 'ok') {
                  // Disconnect socket to prevent rejoin_success events
                  console.log('[leaveRoom] Disconnecting socket to prevent auto-rejoin');
                  socket.disconnect();
                  set({ roomId: null, playerId: null, gameState: null, exitReason: "Manual Exit", socket: null, isConnected: false });
                  resolve({ success: true });
              } else {
                  console.error('Leave room failed:', response);
                  resolve({ success: false, error: response.message, code: response.code });
              }
          });
      });
  },

  joinRoom: async (roomId: string) => {
    const { socket, playerName } = get();
    if (!socket) return { success: false, error: "Socket not connected" };

    return new Promise((resolve) => {
      const { userId } = get();
      socket.emit('join_room', { roomId, playerName, userId: userId || undefined }, (response: SocketResponse) => {
        if (response.status === 'ok') {
            set({ roomId: response.roomId as string, playerId: response.playerId as string, gameState: response.state as GameState });
            resolve({ success: true });
        } else {
            // console.error('Join room failed:', response);
            resolve({ success: false, error: response.message, code: response.code });
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
          return { success: false, error: "Missing socket or userId" };
      }

      set({ playerName: name }); // Optimistic update

      return new Promise((resolve) => {
          socket.emit('update_profile', { userId, name }, (response: SocketResponse) => {
              console.log("[GameStore] update_profile response:", response);
              if (response.status === 'ok') {
                  resolve({ success: true });
              } else {
                  console.error('Update profile failed:', response);
                  // Revert? simpler to just error.
                  resolve({ success: false, error: response.message, code: response.code });
              }
          });
      });
  },

  startGame: async () => {
      const { socket, roomId, playerId } = get();
      if (!socket || !roomId || !playerId) return { success: false, error: "Not in room" };

      return new Promise((resolve) => {
          socket.emit('start_game', { roomId, playerId }, (response: SocketResponse) => {
              if (response.status === 'ok') {
                  set({ gameState: response.state as GameState });
                  resolve({ success: true });
              } else {
                  console.error('Start game failed:', response);
                  resolve({ success: false, error: response.message, code: response.code });
              }
          });
      });
  },

  hostRestart: async () => {
      const { socket, roomId, playerId } = get();
      if (!socket || !roomId || !playerId) return { success: false, error: "Not in room" };

      return new Promise((resolve) => {
          socket.emit('host_restart', { roomId, playerId }, (response: SocketResponse) => {
              if (response.status === 'ok') {
                  set({ gameState: response.state as GameState });
                  resolve({ success: true });
              } else {
                  console.error('Restart game failed:', response);
                  resolve({ success: false, error: response.message, code: response.code });
              }
          });
      });
  }
}));
