"use client";

import { motion } from "framer-motion";
import { Card } from "./Card";
import { Card as CardType } from "@rikka/shared";
import { cn } from "../lib/utils";

interface OpponentHandProps {
  cards: CardType[];
  className?: string;
}

export function OpponentHand({ cards, className }: OpponentHandProps) {
  // We expect 'hidden' cards for opponents usually
  return (
    <div className={cn("flex justify-center -space-x-4", className)}>
      {cards.map((card, index) => (
        <motion.div
            key={index} // Use index if IDs are hidden/duplicate, but ideally IDs are unique even if masked? 
            // Server masks IDs as 'hidden'? If so, key needs to be index.
            // Wait, server broadcast masks ID to 'hidden'. So all cards have id='hidden'.
            // reacting uses index is risky if list changes, but for opponent hand which is just a count, it might be ok.
            // Better: use index as key for masked cards.
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card 
                card={card} 
                className="scale-75 shadow-none" // Smaller for opponent
            />
        </motion.div>
      ))}
    </div>
  );
}
