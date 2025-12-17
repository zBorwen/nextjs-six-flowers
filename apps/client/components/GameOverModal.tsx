import { ScoreResult } from "@rikka/shared";
import { Button } from "./ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Trophy, Frown } from "lucide-react";

interface GameOverModalProps {
    isWinner: boolean;
    result?: ScoreResult;
    onRestart: () => void;
}



export function GameOverModal({ isWinner, result, onRestart }: GameOverModalProps) {
    // For MVP using simple fixed overlay if Dialog is complex to set up due to context.
    // But let's try a nice overlay.
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 flex flex-col items-center text-center border-4 border-stone-100">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isWinner ? 'bg-yellow-100 text-yellow-600' : 'bg-stone-100 text-stone-500'}`}>
                     {isWinner ? <Trophy className="size-10" /> : <Frown className="size-10" />}
                 </div>
                 
                 <h2 className="text-3xl font-black text-stone-900 mb-2">
                     {isWinner ? "Victory!" : "Defeat"}
                 </h2>
                 
                 <div className="space-y-4 my-6 w-full">
                     <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                         <div className="text-sm text-stone-500 uppercase font-bold tracking-wider mb-1">Total Score</div>
                         <div className={`text-4xl font-black ${isWinner ? 'text-green-600' : 'text-red-500'}`}>
                             {result?.total ? (result.total * 1000) : 1000} pts
                         </div>
                     </div>
                     
                     {/* Yaku details if available */}
                     {result?.yaku && result.yaku.length > 0 && (
                         <div className="text-left text-sm text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100">
                             <ul className="list-disc list-inside">
                                 {result.yaku.map((y, i) => (
                                     <li key={i} className="flex justify-between font-medium">
                                         <span>{y.name}</span>
                                         <span>+{y.points}</span>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     )}
                 </div>

                 <Button size="lg" className="w-full font-bold text-lg rounded-xl h-12" onClick={onRestart}>
                     Return to Lobby
                 </Button>
             </div>
        </div>
    );
}
