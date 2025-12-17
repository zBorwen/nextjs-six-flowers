"use client";

import { motion, PanInfo } from "framer-motion";
import { Card } from "./Card";
import { Card as CardType } from "../types";
import { cn } from "../lib/utils";

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
            onClick={() => onCardClick(card.id)}
            drag={!!onCardDrop}
            dragSnapToOrigin={true}
            onDragEnd={onCardDrop ? (_, info) => onCardDrop(card.id, info.point) : undefined}
            className="hover:-translate-y-4 transition-transform duration-200"
          />
        ))}
      </motion.div>
    </div>
  );
}
