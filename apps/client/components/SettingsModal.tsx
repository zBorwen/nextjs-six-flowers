"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, User, Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { toggleMute, isMuted as getIsMuted } from "@/lib/sound";
import { cn } from "@/lib/utils";

import { updateProfile as updateProfileAction } from "@/app/actions";
import { useSession } from "next-auth/react";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { update } = useSession();
  const { playerName, updateProfile: syncProfileSocket } = useGameStore();
  const [name, setName] = useState(playerName);
  const [isMuted, setIsMuted] = useState(getIsMuted());
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
      if (name.trim()) {
          setLoading(true);
          try {
              // 1. Update DB via Server Action
              // We need userId. Assuming it's in store or session?
              // gameStore has userId too.
              const userId = useGameStore.getState().userId; 
              if (userId) {
                await updateProfileAction(userId, name);
              }

              // 2. Update Session (Client Side)
              await update({ name });

              // 3. Sync to Socket (Active Room)
              await syncProfileSocket(name);
              
              localStorage.setItem('rikka_player_name', name);
              onClose();
          } catch (error) {
              console.error("Failed to update profile", error);
          } finally {
              setLoading(false);
          }
      }
  };

  const handleToggleMute = () => {
      const newMuted = toggleMute();
      setIsMuted(newMuted);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-stone-800 w-full max-w-sm flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-900/50">
            <h2 className="font-bold text-lg text-stone-800 dark:text-stone-100">设置</h2>
            <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
                <X className="size-5 text-stone-500" />
            </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Profile */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">个人资料</label>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center">
                        <User className="size-8 text-stone-400" />
                    </div>
                    <div className="flex-1">
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-stone-50 focus:ring-2 focus:ring-stone-900 outline-none font-bold"
                            placeholder="输入名字"
                        />
                    </div>
                </div>
            </div>

            {/* Audio */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">偏好设置</label>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                    <div className="flex items-center gap-2">
                        {isMuted ? <VolumeX className="size-5 text-stone-400" /> : <Volume2 className="size-5 text-green-600" />}
                        <span className="font-medium text-sm">音效</span>
                    </div>
                    <button 
                        onClick={handleToggleMute}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold transition-colors",
                            isMuted ? "bg-stone-200 text-stone-500" : "bg-green-100 text-green-700"
                        )}
                    >
                        {isMuted ? "关" : "开"}
                    </button>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-stone-200 flex justify-end">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-stone-900 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                   <>
                       <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       保存中...
                   </>
                ) : (
                    <>
                        <Save className="size-4" />
                        保存修改
                    </>
                )}
            </button>
        </div>
      </motion.div>
    </div>
  );
}
