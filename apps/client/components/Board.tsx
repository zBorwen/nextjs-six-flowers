import { useRef, useEffect } from "react";
import { vibrate, HapticPatterns } from "../lib/haptics";
import { playSound } from "../lib/sound";
import { Hand } from "./Hand";
import { OpponentHand } from "./OpponentHand";
import { Deck } from "./Deck";
import { DiscardPile } from "./DiscardPile";
import { GameOverModal } from "./GameOverModal";
import { GameState } from "@rikka/shared";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface BoardProps {
  gameState: GameState;
  playerId: string;
  onDraw: () => void;
  onDiscard: (cardId: string) => void;
  onFlip: (cardId: string) => void;
  onDeclareRiichi: () => void;
  onDeclareRon: () => void;
  onRestart: () => void;
}

export function Board({ gameState, playerId, onDraw, onDiscard, onFlip, onDeclareRiichi, onDeclareRon, onRestart }: BoardProps) {
  const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
  const opponent = opponentId ? gameState.players[opponentId] : null;
  const player = gameState.players[playerId];
  
  const discardRef = useRef<HTMLDivElement>(null);

  // Notifications
  useEffect(() => {
    if (gameState.currentPlayerId === playerId) {
      vibrate(HapticPatterns.turnStart);
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

  const canRiichi = player && !player.isRiichi && gameState.currentPlayerId === playerId && gameState.deck.length > 0;
  const canRon = gameState.interruption?.type === 'ron' && gameState.interruption.claimants[playerId] === 'pending';

  return (
    <div className="flex flex-col h-screen w-full bg-[#1a472a] relative overflow-hidden font-sans select-none">
      {/* ... (existing zones) ... */}

      {/* Low Zone: Player Hand + Actions */}
      <div className="flex-none min-h-[30%] relative z-20 flex flex-col justify-end pb-8">
        {/* Actions Bar */}
        <div className="flex justify-center gap-4 mb-4">
             <button 
                onClick={onDeclareRiichi}
                className="px-6 py-2 bg-stone-800/80 backdrop-blur text-white font-bold rounded-full shadow-lg border border-white/10 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all" 
                disabled={!canRiichi}
             >
                 Riichi
             </button>
             <button 
                onClick={onDeclareRon}
                className="px-6 py-2 bg-red-600/90 backdrop-blur text-white font-bold rounded-full shadow-lg border border-white/10 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all" 
                disabled={!canRon}
             >
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
      
      {/* ... (Game Over Modal) ... */}
    </div>
  );
}
