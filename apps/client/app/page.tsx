"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/utils";
import { Info, Plus, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { SettingsModal } from "@/components/SettingsModal";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { ProfileCard } from "@/components/ProfileCard";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session } = useSession();
  const { isConnected, playerName, roomId, rooms, fetchRooms, connect, joinRoom } = useGameStore();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  
  // Initialize Connection
  useEffect(() => {
      if (session?.user?.name) {
          // Pass userId to connect
          connect(session.user.name, session.user.id);
      }
  }, [session, connect]);

  // Fetch rooms periodically or on mount
  useEffect(() => {
      if (isConnected) {
          fetchRooms();
          const interval = setInterval(fetchRooms, 5000); 
          return () => clearInterval(interval);
      }
  }, [isConnected, fetchRooms]);

  // Navigate to room if joined (but not if we intentionally left)
  const { exitReason, clearExitReason, resetGame } = useGameStore();
  useEffect(() => {
      // If we intentionally left, clear everything and don't auto-navigate
      if (exitReason) {
          console.log('[Home] Clearing exitReason and resetting game state');
          clearExitReason();
          resetGame(); // Clear roomId, playerId, gameState to break the loop
          return;
      }
      if (roomId) {
          router.push(`/room/${roomId}`);
      }
  }, [roomId, router, exitReason, clearExitReason, resetGame]);

  const handleCreateRoom = () => {
      setShowCreateRoom(true);
  };

  const handleJoinRoom = async (id: string) => {
      const result = await joinRoom(id);
      if (!result.success) {
        //   toast.error("Join failed", { description: result.error });
      }
  };

  return (
    <div className="h-screen w-full bg-stone-50 text-stone-900 flex flex-col relative overflow-hidden">
        {/* Top Profile Area */}
        <div className="p-4 z-10 pb-0">
            <ProfileCard 
                name={session?.user?.name || playerName || "访客"} 
                id={session?.user?.id}
                score={session?.user?.score ?? 0} 
            />
        </div>

        {/* Room List Section */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
            <div className="flex items-center justify-between px-1">
                 <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">大厅 ({rooms.reduce((acc, r) => acc + r.playerCount, 0)} 在线)</h3>
                 <Settings onClick={() => setShowSettings(true)} className="size-4 text-stone-400 cursor-pointer hover:text-stone-600 transition-colors" />
            </div>
            
            {rooms.length === 0 && (
                <div className="text-center py-10 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                    <p>暂无房间</p> 
                    <p className="text-xs mt-1">成为第一个创建房间的人！</p>
                </div>
            )}

            {rooms.map((room) => {
                const isFull = room.playerCount >= room.maxPlayers;
                return (
                    <motion.div 
                        key={room.roomId}
                        layoutId={`room-${room.roomId}`}
                        className="p-4 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        {/* Left Info */}
                        <div className="flex items-center gap-3 text-stone-700">
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center font-mono font-bold text-stone-500">
                                {room.roomId.slice(0, 2)}
                            </div>
                            <div>
                                <div className="font-bold leading-tight">{room.name}</div>
                                <div className="text-xs text-stone-400 flex items-center gap-1">
                                    <span className={isFull ? "text-red-500" : "text-green-500"}>●</span> 
                                    {room.status === 'playing' ? '游戏中' : isFull ? '已满' : '等待中'}
                                    <span className="mx-1">•</span>
                                    {room.playerCount}/{room.maxPlayers} 人
                                </div>
                            </div>
                        </div>

                        {/* Right Action */}
                        <Button
                            size="sm"
                            onClick={() => !isFull && handleJoinRoom(room.roomId)}
                            disabled={isFull || room.status !== 'waiting'}
                            variant={isFull ? "secondary" : "default"}
                            className={cn(isFull && "opacity-50")}
                        >
                           {isFull ? "已满" : "加入"}
                        </Button>
                    </motion.div>
                );
            })}
        </main>

        {/* Bottom Actions FAB */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-50 via-stone-50/90 to-transparent pt-12 flex justify-center pointer-events-none">
            <div className="flex gap-4 items-center pointer-events-auto shadow-2xl rounded-full p-1.5 bg-white border border-stone-100">
                <Link 
                    href="/rules"
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                >
                    <Info className="size-6 text-stone-600" />
                </Link>
                
                <button 
                    onClick={handleCreateRoom}
                    className="h-12 px-6 bg-stone-900 text-white rounded-full font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg active:scale-95"
                >
                    <Plus className="size-5" />
                    <span>创建房间</span>
                </button>

                <div className="w-12 h-12" /> {/* Spacer to balance layout if needed, or maybe ranking/history icon */}
            </div>
        </div>

        {/* Modals */}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showCreateRoom && <CreateRoomModal onClose={() => setShowCreateRoom(false)} />}
    </div>
  );
}
