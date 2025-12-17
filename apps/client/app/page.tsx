"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Board } from "@/components/Board";

export default function Home() {
  const { isConnected, playerName, roomId, playerId, gameState, connect, createRoom, joinRoom, drawCard, flipCard, discardCard, resetGame } = useGameStore();
  const [nameInput, setNameInput] = useState("");
  const [roomInput, setRoomInput] = useState("");

  const handleConnect = () => {
    if (nameInput) connect(nameInput);
  };

  return (
    <div className="p-4 grid gap-4 font-mono text-sm">
      <h1 className="text-xl font-bold">Rikka Debug UI</h1>
      
      <div className="flex gap-2 items-center">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-rikka-green' : 'bg-rikka-red'}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>

      {!isConnected && (
        <div className="flex gap-2">
            <input 
              className="border p-2 rounded text-black" 
              placeholder="Enter Name" 
              value={nameInput} 
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button onClick={handleConnect} className="bg-blue-500 text-white p-2 rounded">
                Connect
            </button>
        </div>
      )}

      {isConnected && !roomId && (
          <div className="flex flex-col gap-2">
              <p>Welcome, {playerName}</p>
              <button onClick={() => createRoom()} className="bg-green-500 text-white p-2 rounded w-fit">
                  Create Room
              </button>
              <div className="flex gap-2">
                  <input 
                    className="border p-2 rounded text-black" 
                    placeholder="Room ID" 
                    value={roomInput} 
                    onChange={(e) => setRoomInput(e.target.value)}
                  />
                  <button onClick={() => joinRoom(roomInput)} className="bg-yellow-500 text-white p-2 rounded">
                      Join Room
                  </button>
              </div>
          </div>
      )}

      {roomId && gameState && playerId ? (
          <Board 
            gameState={gameState}
            playerId={playerId}
            onDraw={drawCard}
            onDiscard={discardCard} // Not used yet visually, but passed
            onFlip={flipCard}
            onRestart={resetGame}
          />
      ) : null}

      {/* Debug Info Overlay (Toggleable later, keeping hidden for now or small) */}
      {/* Disconnected Overlay */}
      {!isConnected && roomId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center text-white">
            <div className="text-center p-8 bg-stone-900 rounded-xl border border-red-500 shadow-2xl">
                <h2 className="text-2xl font-bold mb-2 text-red-500">Disconnected</h2>
                <p>Connection to server lost.</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-stone-700 rounded hover:bg-stone-600">
                    Reload Page
                </button>
            </div>
        </div>
      )}
    </div>
  );
}


