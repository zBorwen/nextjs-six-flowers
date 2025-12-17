import { io, Socket } from 'socket.io-client';
import assert from 'node:assert';
import { describe, it, before, after } from 'node:test';

describe('Broadcast Sanitization', () => {
  let client1: Socket;
  let client2: Socket;
  let roomId: string;
  let player1Id: string;
  let player2Id: string;

  before(async () => {
    client1 = io('http://localhost:4000');
    client2 = io('http://localhost:4000');
    
    await new Promise<void>((resolve) => {
        let connected = 0;
        const check = () => { if (++connected === 2) resolve(); };
        client1.on('connect', check);
        client2.on('connect', check);
    });
  });

  after(() => {
    client1.close();
    client2.close();
  });

  it('should mask opponent hand in game_state_update', async () => {
    // 1. Setup Room
    await new Promise<void>((resolve) => {
        client1.emit('create_room', { playerName: 'A' }, (res: any) => {
            roomId = res.roomId;
            player1Id = res.playerId;
            resolve();
        });
    });

    await new Promise<void>((resolve) => {
        client2.emit('join_room', { roomId, playerName: 'B' }, (res: any) => {
            player2Id = res.playerId;
            resolve();
        });
    });

    // 2. Listen for update on Client 1 (should see P1 hand, mask P2 hand)
    // We trigger an action (e.g. Draw) to force an update broadcast
    // Need to find whose turn it is
    // But broadcast happens on Join too.
    // Let's just listen to the NEXT update triggered by an action.
    
    // We'll use a promise to capture the event from both clients concurrently
    const p1Promise = new Promise<any>(resolve => client1.once('game_state_update', resolve));
    const p2Promise = new Promise<any>(resolve => client2.once('game_state_update', resolve));

    // Force an update? The join itself triggered one. But we might have missed it if we didn't attach listeners early.
    // Let's trigger a Draw (if turn allows) or just Flip (can always flip on turn? Logic says "Not your turn" check exists).
    // Let's just create a NEW room to be sure we catch the initial broadcast or trigger something.
    // Actually, joinRoom emits broadcast. We awaited the ACK of joinRoom.
    // It's likely the broadcast event arrived around same time.
    // Let's trigger a draw. First check turn.
    // But we don't know whose turn it is without state.
    
    // HACK: Re-fetch room state via ... wait, we don't have get_room event.
    // Let's just loop: try Draw for P1. If error "not turn", try Draw for P2.
    // One will succeed and trigger broadcast.
    
    // Better: Just use a new room and attach listeners BEFORE joining.
    const socket3 = io('http://localhost:4000');
    const socket4 = io('http://localhost:4000');
    
    await new Promise<void>(resolve => {
        let c = 0;
        const check = () => { if (++c === 2) resolve(); };
        socket3.on('connect', check);
        socket4.on('connect', check);
    });

    let rId: string = '';
    let p3Id: string = '';
    let p4Id: string = '';

    await new Promise<void>(resolve => {
        socket3.emit('create_room', { playerName: 'C' }, (res: any) => {
            if (res.status === 'ok') {
                rId = res.roomId;
                p3Id = res.playerId;
            }
            resolve();
        });
    });

    if (!rId) throw new Error('Failed to create room');

    // Helper to wait for state with 2 players
    const waitForTwoPlayers = (socket: Socket) => {
        return new Promise<any>((resolve, reject) => {
            const listener = (state: any) => {
                if (Object.keys(state.players).length === 2) {
                    socket.off('game_state_update', listener);
                    resolve(state);
                }
            };
            socket.on('game_state_update', listener);
            // Timeout safety?
            setTimeout(() => {
                socket.off('game_state_update', listener);
                reject(new Error('Timeout waiting for 2 players'));
            }, 2000);
        });
    };

    // Setup listeners NOW
    const s3Update = waitForTwoPlayers(socket3);
    const s4Update = waitForTwoPlayers(socket4);

    // Join with P4
    await new Promise<void>(resolve => {
        socket4.emit('join_room', { roomId: rId, playerName: 'D' }, (res: any) => {
            if (res.status === 'ok') {
                p4Id = res.playerId;
            }
            resolve();
        });
    });

    try {
        const [state3, state4] = await Promise.all([s3Update, s4Update]);

        // Verify P3 view
        const p3self = state3.players[p3Id];
        const p3opponent = state3.players[p4Id];
        
        // Self: Values visible
        assert.strictEqual(typeof p3self.hand[0].topValue, 'number');
        assert.notStrictEqual(p3self.hand[0].topValue, 0);

        // Opponent: Values masked (0)
        assert.strictEqual(p3opponent.hand[0].topValue, 0);
        assert.strictEqual(p3opponent.hand[0].color, 'black');
        assert.strictEqual(p3opponent.hand[0].id, 'hidden');

        // Verify P4 view
        const p4self = state4.players[p4Id];
        const p4opponent = state4.players[p3Id];

        // Self: Values visible
        assert.notStrictEqual(p4self.hand[0].topValue, 0);

        // Opponent: Values masked
        assert.strictEqual(p4opponent.hand[0].topValue, 0);
        assert.strictEqual(p4opponent.hand[0].id, 'hidden');
    } catch (e) {
        console.error('Test Failed:', e);
        throw e;
    } finally {
        socket3.close();
        socket4.close();
    }
  });
});
