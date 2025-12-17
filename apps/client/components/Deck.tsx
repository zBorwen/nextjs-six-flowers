"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface DeckProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function Deck({ count, onClick, className }: DeckProps) {
  if (count === 0) {
    return (
        <div className={cn("w-16 h-24 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center opacity-50", className)}>
            <span className="text-xs">Empty</span>
        </div>
    );
  }

  return (
    <motion.div 
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn("relative w-16 h-24 cursor-pointer", className)}
    >
      {/* Stack effect */}
      {count > 1 && (
          <div className="absolute top-1 left-0.5 w-full h-full rounded-lg bg-stone-700 shadow-sm border border-stone-600" />
      )}
      {count > 2 && (
          <div className="absolute top-2 left-1 w-full h-full rounded-lg bg-stone-700 shadow-sm border border-stone-600" />
      )}
      
      {/* Top Card */}
      <div className="absolute top-3 left-1.5 w-full h-full rounded-lg bg-stone-800 shadow-md border-b-4 border-stone-900 flex items-center justify-center">
          <div className="w-full h-full rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#ffffff10_5px,#ffffff10_10px)]" />
          <span className="absolute text-white font-bold text-xs bg-black/50 px-1 rounded">{count}</span>
      </div>
    </motion.div>
  );
}
