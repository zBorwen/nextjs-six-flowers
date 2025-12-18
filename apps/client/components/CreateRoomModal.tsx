"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateRoomModalProps {
  onClose: () => void;
}

export function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const { createRoom, playerName } = useGameStore();
  const [roomName, setRoomName] = useState(`${playerName}'s Room`);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
      if (!roomName.trim()) return;
      setIsLoading(true);
      const result = await createRoom(roomName, maxPlayers);
      if (result.success) {
          onClose();
      } else {
          // Toast not imported here, but console error for now or add toast
          console.error("Failed to create room:", result.error);
      }
      setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-stone-800 w-full max-w-sm flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-900/50">
            <h2 className="font-bold text-lg text-stone-800 dark:text-stone-100">Create Room</h2>
            <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
                <X className="size-5 text-stone-500" />
            </button>
        </div>

        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input 
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter room name"
                    className="font-bold"
                />
            </div>

            <div className="space-y-3">
                <Label>Max Players</Label>
                <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((num) => (
                        <button 
                            key={num}
                            onClick={() => setMaxPlayers(num)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all relative ${maxPlayers === num ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}
                        >
                            <span className="text-xl font-black">{num}</span>
                            <span className="text-[10px] text-stone-500 font-bold uppercase overflow-hidden text-ellipsis w-full text-center">
                                {num === 2 ? 'Duel' : 'Party'}
                            </span>
                            {maxPlayers === num && <div className="absolute top-1 right-1 text-stone-900"><Check className="size-3" /></div>}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-stone-200 flex justify-end">
            <Button 
                onClick={handleCreate} 
                disabled={isLoading || !roomName.trim()}
                className="w-full font-bold h-12 text-md"
            >
                {isLoading ? "Creating..." : "Create Room"}
            </Button>
        </div>
      </motion.div>
    </div>
  );
}
