import { Card } from "./Card";
import { Card as CardType } from "@rikka/shared";
import { forwardRef } from "react";
import { motion } from "framer-motion";

interface DiscardPileProps {
    cards: CardType[];
}

export const DiscardPile = forwardRef<HTMLDivElement, DiscardPileProps>(({ cards }, ref) => {
    return (
        <div 
            ref={ref}
            className="w-full h-full rounded-3xl border-4 border-dashed border-white/10 flex items-center justify-center relative bg-black/5"
        >
             {cards.length === 0 && (
                 <span className="text-white/20 font-bold uppercase tracking-widest text-sm pointer-events-none select-none">Discard Zone</span>
             )}
             
             {cards.map((card, index) => {
                 // Random rotation for scatter effect based on index/id deterministic
                 const rotation = (card.id.charCodeAt(0) % 30) - 15; 
                 // Or deterministic pseudo-random from index
                 const rot = (index % 5 - 2) * 10;
                 return (
                     <motion.div
                        key={card.id}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, rotate: rot }}
                        className="absolute"
                        style={{ zIndex: index }}
                     >
                         <Card card={card} />
                     </motion.div>
                 );
             })}
        </div>
    );
});

DiscardPile.displayName = "DiscardPile";
