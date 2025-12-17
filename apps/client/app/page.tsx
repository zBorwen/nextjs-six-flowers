"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { Board } from "@/components/Board";
import { MOCK_GAME_STATE } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { User, Users, Info, Plus, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isConnected, playerName, roomId, playerId, gameState, rooms, fetchRooms, connect, createRoom, joinRoom, drawCard, flipCard, discardCard, resetGame } = useGameStore();
  const [showRules, setShowRules] = useState(false);
  
  // Fetch rooms periodically or on mount
  useEffect(() => {
      if (isConnected) {
          fetchRooms();
          const interval = setInterval(fetchRooms, 5000); // Polling backup
          return () => clearInterval(interval);
      }
  }, [isConnected]);
  
  // Login State ... (omitted, no change needed)

  // Game Room State ... (omitted)

  // Lobby State
  return (
    <div className="h-screen w-full bg-stone-50 text-stone-900 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="p-4 bg-white shadow-sm z-10 flex justify-between items-center">
            {/* ... header content ... */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                    <User className="size-6 text-stone-500" />
                </div>
                <div>
                    <h2 className="font-bold text-lg leading-none">{playerName}</h2>
                    <span className="text-xs text-stone-500 font-mono">Online</span>
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
            
            {rooms.length === 0 && (
                <div className="text-center py-10 text-stone-400">
                    No active rooms found. <br/> Create one to start playing!
                </div>
            )}

            {rooms.map((room) => (
                <motion.div 
                    key={room.roomId}
                    layoutId={`room-${room.roomId}`}
                    className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 active:scale-[0.98] transition-transform"
                    onClick={() => joinRoom(room.roomId)}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-stone-700">{room.name}</span>
                        <span className={cn("px-2 py-1 rounded text-xs font-bold", room.playerCount >= room.maxPlayers ? "bg-stone-100 text-stone-400" : "bg-green-100 text-green-800")}>
                            {room.playerCount >= room.maxPlayers ? "FULL" : "OPEN"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500 text-xs">
                        <Users className="size-3" />
                         <span>{room.playerCount}/{room.maxPlayers} Players</span>
                        <span className="ml-2 uppercase text-[10px] bg-stone-100 px-1 rounded">{room.status}</span>
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
