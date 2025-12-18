import { Card as CardType } from "@rikka/shared";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { Star } from "lucide-react";

interface CardProps {
    card: CardType;
    isHidden?: boolean;
    onClick?: () => void;
    className?: string;
    isInteractable?: boolean;
}

// Reusable Petal Path
const Petal = ({ rotation, color }: { rotation: number, color: string }) => (
    <path 
        d="M50 50 Q65 15 50 5 Q35 15 50 50" 
        fill="currentColor" 
        transform={`rotate(${rotation} 50 50)`} 
        className={color}
    />
);

const SymbolSVG = ({ value, color }: { value: number, color: string }) => {
    // 1 is a special circle/dot usually
    if (value === 1) {
        return (
             <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="35" fill="currentColor" className={color} />
                <circle cx="50" cy="50" r="5" fill="black" opacity="0.2" />
            </svg>
        );
    }

    // 2-6 are flowers with N petals
    const rotations = Array.from({ length: value }, (_, i) => (360 / value) * i);
    
    // For 2, maybe better to align vertically or horizontally? 
    // Standard Rikka 2 is often "Bone" shape (vertical). 
    // Let's stick to radial symmetry for "Flowers" theme unless it looks bad.
    // 2 petals at 0 and 180 looks like a propeller.
    
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <g>
                {rotations.map(r => (
                    <Petal key={r} rotation={r} color={color} />
                ))}
                <circle cx="50" cy="50" r="6" fill="currentColor" className="text-black/80" />
            </g>
        </svg>
    );
};

// Map values to colors
const getColor = (value: number) => {
    switch(value) {
        case 1: return "text-red-500";
        case 2: return "text-orange-500";
        case 3: return "text-yellow-500";
        case 4: return "text-lime-500";
        case 5: return "text-cyan-500";
        case 6: return "text-fuchsia-500";
        default: return "text-stone-900";
    }
};

export function Card({ card, isHidden = false, onClick, className, isInteractable = false }: CardProps) {
    const variants: Variants = {
        faceDown: { 
            rotateY: 180,
            transition: { duration: 0.4, ease: "easeInOut" }
        },
        faceUp: { 
            rotateY: 0,
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    };

    const topColor = getColor(card.topValue);
    const bottomColor = getColor(card.bottomValue);

    return (
        <motion.div 
            layoutId={`card-${card.id}`}
            onClick={isInteractable ? onClick : undefined}
            whileHover={isInteractable ? { y: -15, scale: 1.05, zIndex: 50 } : undefined}
            whileTap={isInteractable ? { scale: 0.95 } : undefined}
            className={cn(
                "relative w-24 h-36 [perspective:1000px] cursor-pointer select-none",
                !isInteractable && "cursor-default",
                className
            )}
            initial={false}
            animate={isHidden ? "faceDown" : "faceUp"}
            variants={variants}
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* Front Face */}
            <div 
                className={cn(
                    "absolute inset-0 w-full h-full backface-hidden rounded-xl bg-white shadow-xl border border-stone-200 overflow-hidden flex flex-col items-center justify-between py-3",
                    card.isSparkle && "ring-2 ring-yellow-400 ring-offset-2"
                )}
                style={{ backfaceVisibility: "hidden" }}
            >
                {/* Top Symbol */}
                <div className="flex-1 w-full flex items-center justify-center">
                    <div className="w-14 h-14">
                        <SymbolSVG value={card.topValue} color={topColor} />
                    </div>
                </div>

                {/* Center Mark */}
                <div className="flex items-center justify-center p-1">
                    {card.isSparkle ? (
                        <Star className="w-5 h-5 text-black fill-black animate-pulse" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                    )}
                </div>

                {/* Bottom Symbol */}
                <div className="flex-1 w-full flex items-center justify-center">
                    <div className="w-14 h-14 rotate-180">
                         <SymbolSVG value={card.bottomValue} color={bottomColor} />
                    </div>
                </div>
                
                 {/* Sparkle Overlay */}
                 {card.isSparkle && (
                     <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-yellow-300/10 to-transparent mix-blend-plus-lighter"></div>
                 )}
            </div>

            {/* Back Face */}
            <div 
                className="absolute inset-0 w-full h-full backface-hidden rounded-xl bg-stone-800 border-2 border-stone-600 shadow-md flex items-center justify-center overflow-hidden"
                style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)" 
                }}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p64-2x2.png')] opacity-30"></div>
                <div className="w-12 h-12 rounded-full border-4 border-stone-600/50 relative z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-stone-500/50"></div>
                </div>
            </div>
        </motion.div>
    );
}
