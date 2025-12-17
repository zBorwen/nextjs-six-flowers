import { useRef, useEffect } from "react";
import { vibrate, HapticPatterns } from "../lib/haptics";
// import { playSound } from "../lib/sound";
import { Hand } from "./Hand";
import { OpponentHand } from "./OpponentHand";
import { Deck } from "./Deck";
import { DiscardPile } from "./DiscardPile";
import { GameOverModal } from "./GameOverModal";
import { GameState } from "@rikka/shared";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { LogOut, User } from "lucide-react";

interface BoardProps {
  gameState: GameState;
  playerId: string;
  onDraw: () => void;
  onDiscard: (cardId: string) => void;
  onFlip: (cardId: string) => void;
  onDeclareRiichi: () => void;
  onDeclareRon: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function Board({ gameState, playerId, onDraw, onDiscard, onFlip, onDeclareRiichi, onDeclareRon, onRestart, onExit }: BoardProps) {
  const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
  const opponent = opponentId ? gameState.players[opponentId] : null;
  const player = gameState.players[playerId];
  
  const discardRef = useRef<HTMLDivElement>(null);

  // Turn Notification
  useEffect(() => {
    if (gameState.currentPlayerId === playerId) {
      vibrate(HapticPatterns.turnStart);
      toast("Your Turn", {
        position: "top-center",
        className: "bg-rikka-purple/20 text-white font-bold border-none"
      });
    }
  }, [gameState.currentPlayerId, playerId]);

  const handleCardDrop = (cardId: string, point: { x: number, y: number }) => {
      if (discardRef.current) {
          const rect = discardRef.current.getBoundingClientRect();
          // Expanding the drop zone slightly for better UX
          const padding = 50; 
          if (
              point.x >= rect.left - padding && 
              point.x <= rect.right + padding && 
              point.y >= rect.top - padding && 
              point.y <= rect.bottom + padding
          ) {
              onDiscard(cardId);
          }
      }
  };

  const isMyTurn = gameState.currentPlayerId === playerId;
  const canRiichi = player && !player.isRiichi && isMyTurn && gameState.deck.length > 0;
  const canRon = gameState.interruption?.type === 'ron' && gameState.interruption.claimants[playerId] === 'pending';
  const waitingForRon = gameState.interruption?.type === 'ron';

  return (
    <div className="flex flex-col h-screen w-full bg-[#1a472a] relative overflow-hidden font-sans select-none">
      {/* Table Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-60 mix-blend-multiply"></div>
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-white/5 to-black/40"></div>

      {/* Top Zone: Opponent */}
      <div className="flex-none h-1/4 relative z-10 flex justify-center pt-8">
        {opponent ? (
             <div className="flex flex-col items-center gap-2">
                 <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full text-white/90 shadow-lg border border-white/10 backdrop-blur-md transition-all", 
                     gameState.currentPlayerId === opponent.id ? "bg-yellow-500/20 ring-2 ring-yellow-400/50" : "bg-black/30")}>
                      <User className="size-4" />
                      <span className="font-bold">{opponent.name}</span>
                      <span className="text-xs opacity-70 border-l border-white/20 pl-2 ml-1">{opponent.score}</span>
                      {opponent.isRiichi && <span className="text-red-400 font-black text-xs ml-2">RIICHI</span>}
                 </div>
                 <OpponentHand player={opponent} />
             </div>
        ) : (
             <div className="text-white/30 font-bold bg-black/10 px-4 py-2 rounded-full mt-4">Waiting for opponent...</div>
        )}
      </div>

      {/* Middle Zone: Deck & Discard */}
      <div className="flex-1 relative z-10 flex items-center justify-center gap-16 px-8">
           {/* Deck */}
           <div className="flex flex-col items-center gap-2">
               <div 
                  onClick={isMyTurn && !waitingForRon ? onDraw : undefined} 
                  className={cn(
                      "transition-all duration-300 relative", 
                      (isMyTurn && !waitingForRon) ? "cursor-pointer hover:scale-105 brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "opacity-90 grayscale-[0.2]"
                   )}
               >
                  <Deck count={gameState.deck.length} />
                  {isMyTurn && !waitingForRon && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
                          DRAW
                      </div>
                  )}
               </div>
           </div>

           {/* Discard Pile */}
           <div ref={discardRef} className="w-80 h-64 relative bg-black/10 rounded-[3rem] border-4 border-dashed border-white/5">
                <DiscardPile cards={gameState.discardPile} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     {waitingForRon && <div className="text-red-500 font-black text-4xl animate-pulse drop-shadow-lg">RON CHECK</div>}
                </div>
           </div>
           
           {/* Game Info / Wind */}
           <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-white/50 text-xs font-mono items-end">
               <div>ROOM: {gameState.roomId}</div>
               <div>TURN: {gameState.deck.length}</div>
               
               <button 
                  onClick={onExit}
                  className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors border border-white/5"
               >
                  <LogOut className="size-4" />
                  <span>EXIT</span>
               </button>
           </div>
      </div>

      {/* Low Zone: Player Hand + Actions */}
      <div className={cn("flex-none min-h-[35%] relative z-20 flex flex-col justify-end pb-6 transition-all", isMyTurn && "bg-gradient-to-t from-black/40 to-transparent")}>
        
        {/* Actions Bar */}
        <div className="flex justify-center gap-4 mb-6 z-30">
             <button 
                onClick={onDeclareRiichi}
                className="px-8 py-3 bg-stone-900/80 backdrop-blur text-white font-black tracking-widest rounded-full shadow-2xl border border-stone-600 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:grayscale transition-all hover:bg-stone-800" 
                disabled={!canRiichi}
             >
                 RIICHI
             </button>
             <button 
                onClick={onDeclareRon}
                className={cn(
                    "px-10 py-3 font-black tracking-widest rounded-full shadow-2xl border active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:grayscale transition-all",
                    canRon ? "bg-red-600 text-white border-red-400 animate-pulse hover:bg-red-500" : "bg-stone-900/80 text-white border-stone-600 backdrop-blur"
                )}
                disabled={!canRon}
             >
                 RON!
             </button>
        </div>

        {player && (
            <div className="relative">
                 {/* Player Info */}
                 <div className="absolute -top-12 left-8 flex items-center gap-3">
                      <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-lg border border-white/10 backdrop-blur-md transition-all", 
                           isMyTurn ? "bg-rikka-purple ring-2 ring-white/50 scale-105" : "bg-stone-900/60")}>
                           <User className="size-5" />
                           <span className="font-bold text-lg">{player.name} (You)</span>
                           <div className="h-4 w-[1px] bg-white/30 mx-1"></div>
                           <span className="font-mono">{player.score}</span>
                           {player.isRiichi && <span className="text-red-400 font-black ml-2 bg-black/30 px-2 rounded">RIICHI</span>}
                      </div>
                 </div>

                <Hand 
                    cards={player.hand} 
                    onCardClick={onFlip}
                    onCardDrop={handleCardDrop}
                />
            </div>
        )}
      </div>
      
      {gameState.status === 'ended' && (
          <GameOverModal 
            isWinner={gameState.winnerId === playerId} 
            result={gameState.scoreResult}
            onRestart={onRestart} 
          />
      )}
    </div>
  );
}
