import { useRef, useEffect, useState } from "react";
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
  onStartGame: () => void;
}

export function Board({ gameState, playerId, onDraw, onDiscard, onFlip, onDeclareRiichi, onDeclareRon, onRestart, onExit, onStartGame }: BoardProps) {
  const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
  const opponent = opponentId ? gameState.players[opponentId] : null;
  const player = gameState.players[playerId];
  
  const discardRef = useRef<HTMLDivElement>(null);
  const [showStartAnim, setShowStartAnim] = useState(false);

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
  
  // Game Start Animation Trigger
  useEffect(() => {
     if (gameState.status === 'playing' && gameState.turnStartTime > Date.now() - 2000) { 
         const t = setTimeout(() => {
             setShowStartAnim(true);
             setTimeout(() => setShowStartAnim(false), 2000);
         }, 0);
         return () => clearTimeout(t);
     }
  }, [gameState.status, gameState.turnStartTime]);

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
  const isHost = player?.isHost;
  const isWaiting = gameState.status === 'waiting';

  if (isWaiting) {
      return (
          <div className="flex flex-col h-screen w-full bg-[#1a472a] relative overflow-hidden font-sans select-none items-center justify-center">
                {/* Table Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-60 mix-blend-multiply"></div>
                <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-white/5 to-black/40"></div>

                <div className="relative z-10 bg-black/40 backdrop-blur-md p-10 rounded-3xl border border-white/10 text-center space-y-6 shadow-2xl max-w-md w-full">
                     <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Lobby</h1>
                     
                     <div className="flex items-center justify-center gap-4 text-white/80">
                         <div className="flex flex-col items-center">
                             <div className="w-16 h-16 rounded-full bg-stone-200 border-4 border-white overflow-hidden shadow-lg">
                                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${player.name}`} className="w-full h-full object-cover" />
                             </div>
                             <span className="font-bold mt-2">{player.name}</span>
                             {isHost && <span className="text-xs bg-yellow-500 text-black px-2 rounded-full font-bold">HOST</span>}
                         </div>
                         
                         <div className="text-2xl font-black text-white/20">VS</div>
                         
                         {opponent ? (
                             <div className="flex flex-col items-center animate-in fade-in zoom-in">
                                 <div className="w-16 h-16 rounded-full bg-stone-200 border-4 border-stone-400 overflow-hidden shadow-lg">
                                     <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${opponent.name}`} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="font-bold mt-2">{opponent.name}</span>
                             </div>
                         ) : (
                             <div className="flex flex-col items-center opacity-50">
                                 <div className="w-16 h-16 rounded-full bg-white/10 border-4 border-dashed border-white/20 flex items-center justify-center animate-pulse">
                                     <span className="text-2xl">?</span>
                                 </div>
                                 <span className="font-bold mt-2 text-sm italic">Waiting...</span>
                             </div>
                         )}
                     </div>

                     <div className="h-px bg-white/10 w-full my-4" />

                     {isHost ? (
                         <div className="space-y-3">
                             <button 
                                onClick={onStartGame}
                                disabled={!opponent}
                                className="w-full py-4 bg-rikka-red hover:bg-red-600 disabled:bg-stone-600 disabled:cursor-not-allowed text-white font-black text-xl tracking-widest rounded-xl shadow-lg transition-all active:scale-95"
                             >
                                 START GAME
                             </button>
                             {!opponent && <p className="text-xs text-white/40 animate-pulse">Waiting for players to join...</p>}
                         </div>
                     ) : (
                         <div className="text-center py-4">
                             <p className="text-lg font-bold text-white mb-1">Waiting for Host</p>
                             <p className="text-sm text-white/50">The game will start soon...</p>
                         </div>
                     )}
                     
                     <button onClick={onExit} className="mt-4 text-white/40 hover:text-white text-sm font-bold flex items-center justify-center gap-2 w-full transition-colors">
                         <LogOut className="size-4" /> Leave Room
                     </button>
                </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#1a472a] relative overflow-hidden font-sans select-none">
      {/* Game Start Animation */}
      {showStartAnim && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-out fade-out duration-500 delay-[1500ms] pointer-events-none">
              <div className="text-center animate-in zoom-in duration-500">
                  <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-500 to-purple-600 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-150 tracking-tighter">
                      GAME START
                  </h1>
              </div>
          </div>
      )}

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
