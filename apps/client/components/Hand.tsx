"use client";

import { motion, PanInfo } from "framer-motion"; // Ensure PanInfo is imported if used, but 'any' is safe for quick fix if types conflict. 
// Actually I used 'any' in Card, but here I can use explicit types if possible.
// Let's restore original imports first.
import { Card } from "./Card";
import { Card as CardType } from "@rikka/shared"; // Updated import source
import { cn } from "../lib/utils";
import { vibrate, HapticPatterns } from "../lib/haptics";
import { playSound } from "../lib/sound";

interface HandProps {
  cards: CardType[];
  onCardClick: (cardId: string) => void;
  onCardDrop?: (cardId: string, point: { x: number, y: number }) => void;
  className?: string;
}

export function Hand({ cards, onCardClick, onCardDrop, className }: HandProps) {
  return (
    <div className={cn("fixed bottom-0 left-0 right-0 p-4 pb-8 flex justify-center items-end pointer-events-none z-50", className)}>
      <motion.div 
        layout 
        className="flex gap-2 items-end pointer-events-auto bg-black/10 dark:bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-black/5 dark:border-white/10 shadow-xl"
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isInteractable={true}
            onClick={() => {
                vibrate(HapticPatterns.soft);
                playSound('click');
                onCardClick(card.id);
            }}
            drag={!!onCardDrop}
            dragSnapToOrigin={true}
            onDragStart={() => vibrate(HapticPatterns.soft)}
            onDragEnd={onCardDrop ? (_, info) => onCardDrop(card.id, info.point) : undefined}
            className="hover:-translate-y-4 transition-transform duration-200"
          />
        ))}
      </motion.div>
    </div>
  );
}
