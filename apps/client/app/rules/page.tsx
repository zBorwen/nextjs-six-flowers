import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col">
        {/* Header */}
        <header className="p-4 bg-white dark:bg-stone-800 shadow-sm sticky top-0 z-10 flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors">
                <ArrowLeft className="size-6" />
            </Link>
            <h1 className="font-bold text-xl">Game Rules</h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-8 pb-32">
            
            <section className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                <h2 className="font-bold text-2xl mb-4 text-rikka-purple space-x-2">
                    <span>🌸</span> <span>Objective</span>
                </h2>
                <p className="leading-relaxed text-stone-600 dark:text-stone-300">
                    Build a winning hand of <strong>6 cards</strong>. Combine your dealt hand (5 cards) with a drawn card (1 card) to form a complete pattern. <br/><br/>
                    Standard wins consist of two groups of 3 cards:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                        <strong className="block mb-2 text-lg">Set (Koutsu)</strong>
                        <p className="text-sm text-stone-500">3 cards of same color & same value.</p>
                        {/* Visual example using emojis/text blocks is simplified here */}
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                        <strong className="block mb-2 text-lg">Run (Shuntsu)</strong>
                        <p className="text-sm text-stone-500">3 cards of same color & sequential values (e.g., 1-2-3).</p>
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                <h2 className="font-bold text-2xl mb-4 text-rikka-purple space-x-2">
                    <span>🔄</span> <span>The Rikka Twist</span>
                </h2>
                <p className="leading-relaxed text-stone-600 dark:text-stone-300 mb-4">
                    Each card has <strong>Top</strong> and <strong>Bottom</strong> values. Importantly, <strong>Only the BOTTOM value is active.</strong>
                </p>
                <div className="bg-gradient-to-br from-rikka-purple/10 to-transparent p-4 rounded-xl border border-rikka-purple/20">
                    <h3 className="font-bold mb-2">Flash (Flip) Action</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                        On your turn, you can <strong>Flash (Flip)</strong> a card to rotate it 180°. This swaps the values, potentially transforming a useless card into a key piece of your winning hand.
                    </p>
                </div>
            </section>

            <section className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                <h2 className="font-bold text-2xl mb-4 text-rikka-purple space-x-2">
                    <span>⚔️</span> <span>Actions</span>
                </h2>
                <ul className="space-y-4">
                    <li className="flex gap-4">
                        <span className="font-bold text-stone-800 bg-stone-200 px-2 py-1 rounded text-sm h-fit min-w-[3rem] text-center">DRAW</span>
                        <span className="text-stone-600 dark:text-stone-300">Start your turn by drawing 1 card.</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="font-bold text-stone-800 bg-stone-200 px-2 py-1 rounded text-sm h-fit min-w-[3rem] text-center">FLIP</span>
                        <span className="text-stone-600 dark:text-stone-300">Optional: Flip one card to change its configuration.</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="font-bold text-stone-800 bg-stone-200 px-2 py-1 rounded text-sm h-fit min-w-[3rem] text-center">DISCARD</span>
                        <span className="text-stone-600 dark:text-stone-300">End your turn by discarding 1 card.</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="font-bold text-white bg-rikka-red px-2 py-1 rounded text-sm h-fit min-w-[3rem] text-center">RIICHI</span>
                        <span className="text-stone-600 dark:text-stone-300">Declare ready (Tenpai). You lock your hand but gain scoring bonuses. If you draw a non-winning card, you must discard it immediately.</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="font-bold text-white bg-rikka-red px-2 py-1 rounded text-sm h-fit min-w-[3rem] text-center">RON</span>
                        <span className="text-stone-600 dark:text-stone-300">Claim victory on an opponent's discard.</span>
                    </li>
                </ul>
            </section>

            <section className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                <h2 className="font-bold text-2xl mb-4 text-rikka-purple space-x-2">
                    <span>✨</span> <span>Special Yaku</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                        <strong className="block text-rikka-red">Isshiki (1 pt)</strong>
                        <span className="text-stone-500">Hand of a single color.</span>
                    </div>
                    <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                        <strong className="block text-rikka-red">Sanren (3 pts)</strong>
                        <span className="text-stone-500">Two sets of 3 consecutive numbers (runs).</span>
                    </div>
                    <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                        <strong className="block text-rikka-red">Sanshiki (3 pts)</strong>
                        <span className="text-stone-500">3 distinct colors (only for Ron/Pass).</span>
                    </div>
                    <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                        <strong className="block text-rikka-red">Three Pairs (5 pts)</strong>
                        <span className="text-stone-500">3 pairs of identical cards.</span>
                    </div>
                   <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                        <strong className="block text-rikka-red">All Sparkles (5 pts)</strong>
                        <span className="text-stone-500">All 6 cards are 7s (Sparkle cards).</span>
                    </div>
                    <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                         <strong className="block text-rikka-red">Rikka (6 pts)</strong>
                         <span className="text-stone-500">Specific high-difficulty single-color pattern.</span>
                    </div>
                    <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                         <strong className="block text-rikka-red">Musou (9 pts)</strong>
                         <span className="text-stone-500">6 cards of distinct colors.</span>
                    </div>
                </div>
            </section>

        </main>
    </div>
  );
}
