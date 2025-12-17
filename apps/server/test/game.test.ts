import { io, Socket } from 'socket.io-client';
import assert from 'node:assert';
import { describe, it, before, after } from 'node:test';

describe('Socket Handlers - Game Loop', () => {
  let clientSocket1: Socket;
  let clientSocket2: Socket;
  let roomId: string;
  let player1Id: string;
  let player2Id: string;
  let initialGameState: any;

  before(async () => {
    clientSocket1 = io('http://localhost:4000');
    clientSocket2 = io('http://localhost:4000');
    
    await new Promise<void>((resolve) => {
        let connected = 0;
        const check = () => { if (++connected === 2) resolve(); };
        clientSocket1.on('connect', check);
        clientSocket2.on('connect', check);
    });
  });

  after(() => {
    clientSocket1.close();
    clientSocket2.close();
  });

  it('should verify game start state', async () => {
    // 1. Create
    await new Promise<void>((resolve, reject) => {
        clientSocket1.emit('create_room', { playerName: 'P1' }, (res: any) => {
            if (res.status !== 'ok') return reject(res.message);
            roomId = res.roomId;
            player1Id = res.playerId;
            resolve();
        });
    });

    // 2. Join
    await new Promise<void>((resolve, reject) => {
        clientSocket2.emit('join_room', { roomId, playerName: 'P2' }, (res: any) => {
            if (res.status !== 'ok') return reject(res.message);
            player2Id = res.playerId;
            initialGameState = res.state;
            resolve();
        });
    });

    assert.strictEqual(initialGameState.status, 'playing');
    assert.strictEqual(Object.keys(initialGameState.players).length, 2);
    // Both should have 5 cards (since we removed auto-deal 6th card)
    assert.strictEqual(initialGameState.players[player1Id].hand.length, 5);
    assert.strictEqual(initialGameState.players[player2Id].hand.length, 5);
    assert.ok(initialGameState.currentPlayerId);
  });

  it('should allow current player to draw card', async () => {
      const activePlayerId = initialGameState.currentPlayerId;
      const socket = activePlayerId === player1Id ? clientSocket1 : clientSocket2;
      
      await new Promise<void>((resolve, reject) => {
          socket.emit('draw_card', { roomId, playerId: activePlayerId }, (res: any) => {
              if (res.status !== 'ok') return reject(new Error(res.message));
              assert.strictEqual(res.state.players[activePlayerId].hand.length, 6);
              resolve();
          });
      });
  });

  it('should prevent opponent from drawing', async () => {
      // After previous test, active player has 6 cards. They haven't discarded yet. 
      // So turn is SAME. Opponent still shouldn't be able to draw (not their turn).
      const activePlayerId = initialGameState.currentPlayerId;
      const opponentId = activePlayerId === player1Id ? player2Id : player1Id;
      const socket = activePlayerId === player1Id ? clientSocket2 : clientSocket1;

      await new Promise<void>((resolve, reject) => {
         socket.emit('draw_card', { roomId, playerId: opponentId }, (res: any) => {
             // Should fail
             assert.strictEqual(res.status, 'error');
             assert.ok(res.message.includes('Not your turn') || res.message.includes('Game not active')); // or custom message
             resolve();
         });
      });
  });
});
