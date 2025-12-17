import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RoomManager } from '../src/RoomManager';

describe('RoomManager', () => {
  const manager = new RoomManager();
  let createdRoomId: string;

  it('should create a room with host', () => {
    const { roomId, state } = manager.createRoom('Host');
    assert.ok(roomId);
    assert.strictEqual(state.players[Object.keys(state.players)[0]].name, 'Host');
    assert.strictEqual(state.deck.length, 42 - 5); // 5 cards dealt
    createdRoomId = roomId;
  });

  it('should allow second player to join', () => {
    const { state } = manager.joinRoom(createdRoomId, 'Joiner');
    assert.strictEqual(Object.keys(state.players).length, 2);
    assert.strictEqual(state.status, 'playing');
    // Check Deck: 42 - 5(host) - 5(joiner) - 1(turn card) = 31
    assert.strictEqual(state.deck.length, 31);
  });

  it('should fail when 3rd player joins', () => {
    try {
      manager.joinRoom(createdRoomId, 'Intruder');
      assert.fail('Should have thrown error');
    } catch (e: any) {
      assert.strictEqual(e.message, 'Room is full');
    }
  });
});
