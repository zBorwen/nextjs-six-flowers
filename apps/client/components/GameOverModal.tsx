"use client";

import { motion } from "framer-motion";

import { ScoreResult } from "@rikka/shared";

interface GameOverModalProps {
  isWinner: boolean;
  result?: ScoreResult;
  onRestart: () => void;
}

export function GameOverModal({ isWinner, result, onRestart }: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4 text-center"
      >
        <div className="space-y-2">
            <h2 className={`text-4xl font-bold ${isWinner ? "text-rikka-red" : "text-stone-500"}`}>
                {isWinner ? "YOU WIN!" : "You Lose"}
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
                {isWinner ? "The flowers have bloomed for you." : "Better luck next time."}
            </p>
            
            {result && (
                <div className="bg-stone-100 dark:bg-stone-700/50 p-4 rounded-xl w-full text-left space-y-2">
                    <div className="flex justify-between font-bold border-b border-stone-200 dark:border-stone-600 pb-1">
                        <span>Total Status</span>
                        <span>{result.total} pts</span>
                    </div>
                    {result.yaku.map((y, i) => (
                        <div key={i} className="flex justify-between text-sm text-stone-600 dark:text-stone-300">
                            <span className="capitalize">{y.name.replace('_', ' ')}</span>
                            <span>{y.points}</span>
                        </div>
                    ))}
                    {result.bonuses > 0 && (
                        <div className="flex justify-between text-sm text-stone-600 dark:text-stone-300">
                            <span>Bonuses</span>
                            <span>{result.bonuses}</span>
                        </div>
                    )}
                </div>
            )}
        </div>

        <button 
            onClick={onRestart}
            className="bg-stone-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all"
        >
            Back to Lobby
        </button>
      </motion.div>
    </div>
  );
}
