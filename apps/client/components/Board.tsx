import { useRef, useEffect } from "react";
import { Hand } from "./Hand";
import { OpponentHand } from "./OpponentHand";
import { Deck } from "./Deck";
import { DiscardPile } from "./DiscardPile";
import { GameOverModal } from "./GameOverModal";
import { GameState } from "../types";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface BoardProps {
  gameState: GameState;
  playerId: string;
  onDraw: () => void;
  onDiscard: (cardId: string) => void;
  onFlip: (cardId: string) => void;
  onRestart: () => void;
}

export function Board({ gameState, playerId, onDraw, onDiscard, onFlip, onRestart }: BoardProps) {
  const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
  const opponent = opponentId ? gameState.players[opponentId] : null;
  const player = gameState.players[playerId];
  
  const discardRef = useRef<HTMLDivElement>(null);

  // Notifications
  useEffect(() => {
    if (gameState.currentPlayerId === playerId) {
      toast("It's your turn!", {
        description: "Draw a card or play from hand.",
        duration: 2000,
        position: "top-center",
        className: "bg-rikka-purple/10 text-rikka-purple font-bold border-rikka-purple/20"
      });
    }
  }, [gameState.currentPlayerId, playerId]);

  const handleCardDrop = (cardId: string, point: { x: number, y: number }) => {
      if (discardRef.current) {
          const rect = discardRef.current.getBoundingClientRect();
          if (
              point.x >= rect.left && 
              point.x <= rect.right && 
              point.y >= rect.top && 
              point.y <= rect.bottom
          ) {
              // Valid drop on discard pile
              onDiscard(cardId);
          }
      }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#1a472a] relative overflow-hidden font-sans select-none">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Top Zone: Opponent */}
      <div className="flex-none h-[20%] p-4 flex justify-between items-start z-10">
         {/* Opponent Info */}
         {opponent ? (
             <div className="flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-full bg-stone-200 border-2 border-stone-400 flex items-center justify-center shadow-md">
                    <span className="text-xl">👤</span>
                 </div>
                 <div className="text-white text-xs font-bold drop-shadow-md flex flex-col items-center">
                    <span>{opponent.name}</span>
                    <span className="text-yellow-400 font-mono">24,000 pts</span>
                 </div>
             </div>
         ) : <div />}
         
         {/* Opponent Hand (Backs) */}
         {opponent && (
            <div className="flex-1 flex justify-center">
                <OpponentHand cards={opponent.hand} />
            </div>
         )}
      </div>

      {/* Middle Zone: Field */}
      <div className="flex-1 flex items-center justify-center gap-12 relative z-10 w-full max-w-md mx-auto">
          {/* Deck (3D Stack) */}
          <div className="flex flex-col items-center gap-2">
             <div className="relative">
                 {/* Visual stack effect */}
                 <div className="absolute top-[-4px] left-[-2px] w-[60px] h-[90px] bg-stone-100 rounded-lg border border-stone-300 shadow-sm" />
                 <div className="absolute top-[-2px] left-[-1px] w-[60px] h-[90px] bg-stone-100 rounded-lg border border-stone-300 shadow-sm" />
                 <Deck 
                    count={gameState.deck.length} 
                    onClick={onDraw} 
                 />
             </div>
             <span className="text-[10px] font-bold text-white/50 tracking-widest mt-2">{gameState.deck.length} LEFT</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2" ref={discardRef}>
              <DiscardPile cards={gameState.discardPile} />
          </div>
          
          {/* Turn Indicator */}
           <div className={cn(
             "absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold shadow-2xl transition-all duration-300 backdrop-blur-md border border-white/10",
             gameState.currentPlayerId === playerId 
                ? "bg-gradient-to-r from-rikka-purple to-pink-600 text-white scale-105 shadow-pink-500/20" 
                : "bg-black/20 text-white/50"
           )}>
              {gameState.currentPlayerId === playerId ? "YOUR TURN" : "WAITING..."}
           </div>
      </div>

      {/* Bottom Zone: Player Hand + Actions */}
      <div className="flex-none min-h-[30%] relative z-20 flex flex-col justify-end pb-8">
        {/* Actions Bar */}
        <div className="flex justify-center gap-4 mb-4">
             <button className="px-6 py-2 bg-stone-800/80 backdrop-blur text-white font-bold rounded-full shadow-lg border border-white/10 active:scale-95 disabled:opacity-50" disabled>
                 Riichi
             </button>
             <button className="px-6 py-2 bg-stone-800/80 backdrop-blur text-white font-bold rounded-full shadow-lg border border-white/10 active:scale-95 disabled:opacity-50" disabled>
                 Ron
             </button>
        </div>

        {player && (
            <Hand 
                cards={player.hand} 
                onCardClick={onFlip}
                onCardDrop={handleCardDrop}
            />
        )}
      </div>

      {/* Game Over Modal */}
      {gameState.status === 'ended' && gameState.winnerId && (
          <GameOverModal 
            isWinner={gameState.winnerId === playerId}
            onRestart={onRestart}
          />
      )}
    </div>
  );
}
