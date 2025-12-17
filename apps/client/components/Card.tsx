import { Card as CardType } from "@rikka/shared";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

interface CardProps {
    card: CardType;
    isHidden?: boolean;
    onClick?: () => void;
    className?: string;
    isInteractable?: boolean;
}

export function Card({ card, isHidden = false, onClick, className, isInteractable = false }: CardProps) {
    const isRed = card.color === 'red';

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
                    "absolute inset-0 w-full h-full backface-hidden rounded-xl bg-white shadow-xl border border-stone-200 overflow-hidden flex flex-col",
                    card.isSparkle && "ring-2 ring-yellow-400 ring-offset-2"
                )}
                style={{ backfaceVisibility: "hidden" }}
            >
                {/* Top Value */}
                <div className="flex-1 flex items-start justify-center pt-2">
                    <span className={cn("text-4xl font-black font-serif", isRed ? "text-red-600" : "text-stone-900")}>
                        {card.topValue}
                    </span>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-stone-200 my-1 mx-4"></div>

                {/* Bottom Value */}
                <div className="flex-1 flex items-end justify-center pb-2">
                    <span className={cn("text-4xl font-black font-serif rotate-180", isRed ? "text-red-600" : "text-stone-900")}>
                        {card.bottomValue}
                    </span>
                </div>
                
                 {/* Sparkle Effect */}
                 {card.isSparkle && (
                     <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-yellow-300/20 to-transparent mix-blend-overlay"></div>
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
                <div className="w-12 h-12 rounded-full border-4 border-stone-600/50 relative z-10"></div>
            </div>
        </motion.div>
    );
}
