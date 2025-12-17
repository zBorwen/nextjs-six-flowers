"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { Board } from "@/components/Board";
import { toast } from "sonner";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const { 
    isConnected, 
    playerId, 
    gameState, 
    joinRoom, 
    drawCard, 
    discardCard, 
    flipCard, 
    resetGame,
    declareRiichi,
    declareRon
  } = useGameStore();

  // Redirect if not connected or no name
  useEffect(() => {
     if (!isConnected) {
         router.replace("/");
     }
  }, [isConnected, router]);

  // Join room on mount if not already in it
  useEffect(() => {
     if (isConnected && (!gameState || gameState.roomId !== roomId)) {
         joinRoom(roomId).catch(err => {
             toast.error("Failed to join room", { description: err });
             router.replace("/");
         });
     }
  }, [isConnected, roomId, gameState, joinRoom, router]);

  if (!gameState || !playerId) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-stone-900 text-stone-100">
              <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin text-4xl">🌸</div>
                  <p>Joining Room {roomId}...</p>
              </div>
          </div>
      );
  }

  return (
      <Board 
        gameState={gameState} 
        playerId={playerId}
        onDraw={drawCard}
        onDiscard={discardCard}
        onFlip={flipCard}
        onDeclareRiichi={declareRiichi}
        onDeclareRon={declareRon}
        onRestart={() => {
            resetGame();
            router.push("/");
        }}
      />
  );
}
