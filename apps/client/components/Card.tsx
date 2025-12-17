"use client";

import { motion, PanInfo } from "framer-motion";
import { Card as CardType } from "../types";
import { cn } from "../lib/utils";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isInteractable?: boolean;
  className?: string;
  // Drag props
  drag?: boolean;
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  dragSnapToOrigin?: boolean;
}

export function Card({ 
  card, 
  onClick, 
  isInteractable = false, 
  className,
  drag,
  onDragEnd,
  dragSnapToOrigin
}: CardProps) {
  const isHidden = card.id === 'hidden';
  
  // Map color to tailwind classes
  const colorMap: Record<string, string> = {
    red: "bg-rikka-red text-white",
    blue: "bg-rikka-blue text-white",
    green: "bg-rikka-green text-white",
    yellow: "bg-rikka-yellow text-black",
    purple: "bg-rikka-purple text-white",
    black: "bg-rikka-black text-white",
  };

  const bgColor = colorMap[card.color] || "bg-gray-500 text-white";

  return (
    <motion.div
      layout
      initial={false}
      animate={{ 
        rotate: card.isFlipped ? 180 : 0,
        scale: 1,
      }}
      whileTap={isInteractable ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={isInteractable ? onClick : undefined}
      
      drag={drag}
      onDragEnd={onDragEnd}
      dragSnapToOrigin={dragSnapToOrigin}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1, zIndex: 100 }}
      
      className={cn(
        "relative w-16 h-24 rounded-lg shadow-md flex items-center justify-center cursor-pointer select-none",
        "border-b-4 border-black/20", // Physical depth
        isHidden ? "bg-stone-800" : bgColor,
        className
      )}
    >
      {/* Content Container - rotates with card but keeps text upright if needed, 
          but for 180 flip we want text upside down? 
          Rikka rules: Flip changes value. 
          Usually in card games, a 180 rotation means the text is now upside down relative to viewer.
          BUT if "Flip" swaps Top/Bottom values logically, maybe we should visually swap them?
          
          Let's stick to simple rotation first. If card rotates 180, the bottom becomes top physically.
      */}
      
      {isHidden ? (
        // Card Back Pattern
        <div className="w-full h-full rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#ffffff10_5px,#ffffff10_10px)]" />
      ) : (
        <div className="flex flex-col items-center justify-between w-full h-full py-2 font-bold text-lg leading-none">
          {/* Top Value */}
          <span className="rotate-180">{card.topValue}</span> {/* Actually if we rotate div 180, this becomes bottom? Let's verify visual logic. */}
          
          {/* Center Decoration */}
          <div className="w-2 h-2 rounded-full bg-white/40" />
          
          {/* Bottom Value */}
          <span>{card.bottomValue}</span>
        </div>
      )}
    </motion.div>
  );
}
