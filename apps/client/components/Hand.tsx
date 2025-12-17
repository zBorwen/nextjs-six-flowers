import { Card } from "./Card";
import { Card as CardType } from "@rikka/shared";
import { motion, Reorder } from "framer-motion"; // Use Reorder for rearranging if possible, but simplest is just layout.
import { useState } from "react";

interface HandProps {
    cards: CardType[];
    onCardClick: (cardId: string) => void;
    onCardDrop: (cardId: string, point: { x: number, y: number }) => void;
}

export function Hand({ cards, onCardClick, onCardDrop }: HandProps) {
    return (
        <div className="flex justify-center items-end gap-[-1rem] h-full pb-4 px-4 overflow-visible [perspective:1000px]">
            {cards.map((card, index) => (
                <motion.div
                    key={card.id}
                    layoutId={`hand-card-${card.id}`}
                    style={{ zIndex: index, marginLeft: index === 0 ? 0 : -40 }} // Overlap
                    drag
                    dragSnapToOrigin
                    dragConstraints={{ top: -300, bottom: 0, left: 0, right: 0 }} // Limit drag range mostly to "up"
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                        const point = info.point;
                        onCardDrop(card.id, point);
                    }}
                    whileDrag={{ 
                        scale: 1.2, 
                        zIndex: 100,
                        rotate: 0,
                        boxShadow: "0px 20px 50px rgba(0,0,0,0.5)"
                    }}
                    whileHover={{ y: -20, scale: 1.1, zIndex: 50 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative"
                >
                    <Card 
                        card={card} 
                        isInteractable 
                        onClick={() => onCardClick(card.id)}
                    />
                    
                    {/* Discard Intent Indicator (Visual Only) - Could be dynamic based on y */}
                    {/* Implementation note: tracking dragY per card is expensive for React render cycle unless using useMotionValue. 
                        For now just simple scaled drag is enough feedback. */}
                </motion.div>
            ))}
        </div>
    );
}
