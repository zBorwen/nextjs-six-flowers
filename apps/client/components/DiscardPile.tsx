"use client";

import { motion } from "framer-motion";
import { Card } from "./Card";
import { Card as CardType } from "../types";
import { cn } from "../lib/utils";

interface DiscardPileProps {
  cards: CardType[];
  className?: string;
}

export function DiscardPile({ cards, className }: DiscardPileProps) {
  const topCard = cards[cards.length - 1];

  if (!topCard) {
    return (
        <div className={cn("w-16 h-24 rounded-lg border-2 border-dashed border-gray-400/50 flex items-center justify-center", className)}>
             <span className="text-xs text-gray-400">Discard</span>
        </div>
    );
  }

  return (
    <div className={cn("relative w-16 h-24", className)}>
      {cards.length > 1 && (
           /* Previous card hint */
          <div className="absolute top-0 left-0 w-full h-full rotate-[-5deg]">
               <Card card={cards[cards.length - 2]} />
          </div>
      )}
       <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={topCard.id} // Re-animate on new card
       >
        <Card card={topCard} />
       </motion.div>
    </div>
  );
}
