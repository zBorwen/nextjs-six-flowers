"use client";

import { motion } from "framer-motion";

interface GameOverModalProps {
  isWinner: boolean;
  onRestart: () => void;
}

export function GameOverModal({ isWinner, onRestart }: GameOverModalProps) {
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
