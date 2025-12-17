import { Card } from "./Card";
import { Card as CardType } from "@rikka/shared";

interface DeckProps {
    count: number;
}

export function Deck({ count }: DeckProps) {
    return (
        <div className="relative w-24 h-36">
            {count === 0 ? (
                <div className="w-full h-full rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                    <span className="text-white/20 font-bold">Empty</span>
                </div>
            ) : (
                <>
                     {/* Stack Effect */}
                     {count > 2 && (
                        <div className="absolute top-1 left-1 w-full h-full bg-stone-800 rounded-xl border-2 border-stone-600 shadow-sm transform rotate-2">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p64-2x2.png')] opacity-30"></div>
                        </div>
                     )}
                     {count > 1 && (
                        <div className="absolute top-0.5 left-0.5 w-full h-full bg-stone-800 rounded-xl border-2 border-stone-600 shadow-sm transform rotate-1">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p64-2x2.png')] opacity-30"></div>
                        </div>
                     )}
                     
                     {/* Top Card */}
                     <Card 
                        card={{ id: 'deck', topValue: 0, bottomValue: 0, color: 'black' as any, isFlipped: false } as any} 
                        isHidden 
                        className="absolute inset-0 z-10"
                    />
                     
                     <div className="absolute -bottom-6 w-full text-center">
                         <span className="bg-black/50 text-white px-2 py-0.5 rounded-full text-xs font-mono">{count}</span>
                     </div>
                </>
            )}
        </div>
    );
}
