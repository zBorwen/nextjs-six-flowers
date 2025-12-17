"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Board } from "@/components/Board";
import { MOCK_GAME_STATE } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { User, Users, Info, Plus, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isConnected, playerName, roomId, playerId, gameState, connect, createRoom, joinRoom, drawCard, flipCard, discardCard, resetGame } = useGameStore();
  const [showRules, setShowRules] = useState(false);
  
  // Login State
  if (!isConnected) {
     return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-900 p-4">
            <div className="w-full max-w-sm flex flex-col gap-4">
                <h1 className="text-4xl font-bold text-center text-stone-800 dark:text-stone-100">六华 Rikka</h1>
                <input 
                   className="p-4 rounded-xl border border-stone-200 shadow-sm bg-white dark:bg-stone-800"
                   placeholder="Enter Nickname"
                   onKeyDown={(e) => {
                       if (e.key === 'Enter') connect(e.currentTarget.value || "Guest");
                   }}
                />
                <button 
                    onClick={() => connect("Guest")}
                    className="p-4 rounded-xl bg-stone-900 text-white font-bold shadow-lg active:scale-95 transition-transform"
                >
                    Start Game
                </button>
            </div>
        </div>
     );
  }

  // Game Room State
  if (roomId && gameState) {
      return (
          <Board
            gameState={gameState}
            playerId={playerId || "player-1"}
            onDraw={() => drawCard()}
            onDiscard={discardCard}
            onFlip={flipCard}
            onRestart={resetGame}
          />
      );
  }

  // Lobby State
  return (
    <div className="h-screen w-full bg-stone-50 text-stone-900 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="p-4 bg-white shadow-sm z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                    <User className="size-6 text-stone-500" />
                </div>
                <div>
                    <h2 className="font-bold text-lg leading-none">{playerName}</h2>
                    <span className="text-xs text-stone-500 font-mono">1280 pts</span>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                    <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                    ONLINE
                </div>
            </div>
        </header>

        {/* Room List */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Open Rooms</h3>
            {/* Mock Rooms */}
            {[1, 2, 3].map((i) => (
                <motion.div 
                    key={i}
                    layoutId={`room-${i}`}
                    className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 active:scale-[0.98] transition-transform"
                    onClick={() => joinRoom(`room-${i}`)}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-stone-700">Room #{1000 + i}</span>
                        <span className={cn("px-2 py-1 rounded text-xs font-bold", i === 2 ? "bg-stone-100 text-stone-400" : "bg-green-100 text-green-800")}>
                            {i === 2 ? "FULL" : "OPEN"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500 text-xs">
                        <Users className="size-3" />
                        <span>{i === 2 ? "4/4" : `${i}/4`} Players</span>
                    </div>
                </motion.div>
            ))}
        </main>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12">
            <div className="flex gap-4 items-center">
                <button className="p-3 bg-white rounded-full shadow-md border hover:bg-stone-50">
                    <Info className="size-6 text-stone-600" />
                </button>
                <button 
                    onClick={() => createRoom()}
                    className="flex-1 p-4 bg-stone-900 text-white rounded-full shadow-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Plus className="size-6" />
                    Create Room
                </button>
                <button className="p-3 bg-white rounded-full shadow-md border hover:bg-stone-50">
                    <Settings className="size-6 text-stone-600" />
                </button>
            </div>
        </div>
    </div>
  );
}
