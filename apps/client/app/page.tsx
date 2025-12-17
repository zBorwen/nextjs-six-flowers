"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/utils";
import { User, Users, Info, Plus, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { SettingsModal } from "@/components/SettingsModal";

export default function Home() {
  const { isConnected, playerName, roomId, rooms, fetchRooms, connect, createRoom, joinRoom } = useGameStore();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  
  // Initialize Connection
  useEffect(() => {
      const storedName = localStorage.getItem('rikka_player_name');
      const name = storedName || `Player ${Math.floor(Math.random() * 10000)}`;
      if (!storedName) {
          localStorage.setItem('rikka_player_name', name);
      }
      connect(name);
  }, []);

  // Fetch rooms periodically or on mount
  useEffect(() => {
      if (isConnected) {
          fetchRooms();
          const interval = setInterval(fetchRooms, 5000); 
          return () => clearInterval(interval);
      }
  }, [isConnected]);

  // Navigate to room if joined
  useEffect(() => {
      if (roomId) {
          router.push(`/room/${roomId}`);
      }
  }, [roomId, router]);

  const handleCreateRoom = async () => {
      try {
        await createRoom();
        // Effect will handle navigation
      } catch (e) {
          console.error("Create failed", e);
      }
  };

  const handleJoinRoom = async (id: string) => {
      try {
          await joinRoom(id);
          // Effect will handle navigation
      } catch (e) {
          console.error("Join failed", e);
      }
  };

  return (
    <div className="h-screen w-full bg-stone-50 text-stone-900 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="p-4 bg-white shadow-sm z-10 flex justify-between items-center">
            {/* ... header content ... */}
            <div className="flex items-center gap-3">
                <div onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center cursor-pointer hover:bg-stone-300 transition-colors">
                    <User className="size-6 text-stone-500" />
                </div>
                <div>
                    <h2 className="font-bold text-lg leading-none">{playerName}</h2>
                    <span className="text-xs text-stone-500 font-mono">1280 pts</span>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-bold flex items-center gap-1">
                    <Users className="size-3" />
                    {rooms.reduce((acc, r) => acc + r.playerCount, 0)} Online
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

            {rooms.map((room) => {
                const isFull = room.playerCount >= room.maxPlayers;
                return (
                    <motion.div 
                        key={room.roomId}
                        layoutId={`room-${room.roomId}`}
                        className="p-4 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-between"
                    >
                        {/* Left Info */}
                        <div className="flex items-center gap-2 text-stone-700">
                            <span className="font-mono text-xs text-stone-400">#{room.roomId.slice(0, 4)}</span>
                            <span className="font-bold">{room.name}</span>
                            <span className="text-xs text-stone-500">({room.playerCount}/{room.maxPlayers})</span>
                        </div>

                        {/* Right Action */}
                        <button
                            onClick={() => !isFull && handleJoinRoom(room.roomId)}
                            disabled={isFull}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                                isFull 
                                    ? "bg-stone-100 text-stone-400 cursor-not-allowed" 
                                    : "bg-green-100 text-green-700 hover:bg-green-200 active:scale-95"
                            )}
                        >
                            {isFull ? (
                                <><span>⚪</span> Full</>
                            ) : (
                                <><span>🟢</span> Join</>
                            )}
                        </button>
                    </motion.div>
                );
            })}
        </main>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12">
            <div className="flex gap-4 items-center">
                <Link 
                    href="/rules"
                    className="p-3 bg-white rounded-full shadow-md border hover:bg-stone-50 active:scale-95 transition-transform"
                >
                    <Info className="size-6 text-stone-600" />
                </Link>
                <button 
                    onClick={handleCreateRoom}
                    className="flex-1 p-4 bg-stone-900 text-white rounded-full shadow-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Plus className="size-6" />
                    Create Room
                </button>
                <button 
                    onClick={() => setShowSettings(true)}
                    className="p-3 bg-white rounded-full shadow-md border hover:bg-stone-50 active:scale-95 transition-transform"
                >
                    <Settings className="size-6 text-stone-600" />
                </button>
            </div>
        </div>
        {/* Modals */}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
