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
    <div className="flex flex-col h-screen w-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
      {/* Top Zone: Opponent */}
      <div className="flex-none h-1/4 p-4 flex justify-center items-start">
         {opponent && (
             <div className="flex flex-col items-center gap-2">
                 <OpponentHand cards={opponent.hand} />
                 <span className="text-xs text-stone-500">{opponent.name || "Opponent"}</span>
             </div>
         )}
      </div>

      {/* Middle Zone: Field */}
      <div className="flex-1 flex items-center justify-center gap-8 relative">
          {/* Deck */}
          <div className="flex flex-col items-center gap-2">
             <Deck 
                count={gameState.deck.length} 
                onClick={onDraw} 
             />
             <span className="text-xs font-bold text-stone-400">DECK</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2" ref={discardRef}>
              <DiscardPile cards={gameState.discardPile} />
              <span className="text-xs font-bold text-stone-400">DISCARD</span>
          </div>
          
           {/* Turn Indicator */}
           <div className={cn(
             "absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-300",
             gameState.currentPlayerId === playerId 
                ? "bg-rikka-purple text-white shadow-rikka-purple/50 scale-105" 
                : "bg-stone-200 dark:bg-stone-800 text-stone-500"
           )}>
              {gameState.currentPlayerId === playerId ? "✨ YOUR TURN" : "⏳ Opponent's Turn"}
           </div>
      </div>

      {/* Bottom Zone: Player Hand (Overlay) */}
      {player && (
        <Hand 
            cards={player.hand} 
            onCardClick={onFlip}
            onCardDrop={handleCardDrop}
        />
      )}

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
