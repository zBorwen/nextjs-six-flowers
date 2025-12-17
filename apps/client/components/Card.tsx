"use client";

import { motion } from "framer-motion";
import { Card as CardType } from "@rikka/shared";
import { cn } from "../lib/utils";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isInteractable?: boolean;
  className?: string;
  drag?: boolean;
  onDragEnd?: (event: any, info: any) => void;
  onDragStart?: (event: any, info: any) => void;
  dragSnapToOrigin?: boolean;
}

export function Card({ 
  card, 
  onClick, 
  isInteractable = false, 
  className,
  drag,
  onDragEnd,
  onDragStart,
  dragSnapToOrigin
}: CardProps) {
  
  const colorMap: Record<string, string> = {
      red: "bg-red-50 text-red-600",
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      yellow: "bg-yellow-50 text-yellow-600",
      purple: "bg-purple-50 text-purple-600",
      black: "bg-stone-200 text-stone-700",
  };

  const getIcon = (val: number) => {
      return val; 
  };

  return (
    <motion.div
      className={cn(
        "relative w-[60px] h-[90px] preserve-3d cursor-pointer select-none touch-none",
        className
      )}
      onClick={onClick}
      drag={drag}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      dragSnapToOrigin={dragSnapToOrigin}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1, zIndex: 100, rotate: 5 }}
      whileTap={isInteractable ? { scale: 0.95 } : undefined}
      animate={{ rotate: card.isFlipped ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Card Body */}
      <div className={cn(
          "absolute inset-0 rounded-lg flex flex-col items-center justify-between p-2 shadow-[0_4px_0_#d6d3d1,0_8px_16px_rgba(0,0,0,0.1)] border-2 border-stone-100",
          colorMap[card.color] || "bg-white",
       )}>
          {/* Top Value (Rendered upside down so it becomes upright when card is flipped 180) */}
          <div className="rotate-180 text-xl font-bold opacity-40">
              {card.topValue}
          </div>

          {/* Sparkle */}
          {card.isSparkle && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 animate-pulse">✨</div>}

          {/* Bottom Value (Rendered upright) */}
          {/* When card flips 180, this moves to top and becomes upside down. Perfect (it becomes inactive/greyish). */}
          <div className="text-3xl font-black drop-shadow-sm">
              {card.bottomValue}
          </div>
      </div>
    </motion.div>
  );
}
