import { Card, CardColor, YakuType, YakuResult, ScoreResult } from './types';
export type { Card }; // Re-export for convenience

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];

// --- Helper Functions ---

/**
 * Generates a full deck of 42 cards (6 colors * 7 values)
 */
export function generateDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const color of COLORS) {
    for (let i = 1; i <= 7; i++) {
      deck.push({
        id: `${color}-${i}`,
        color,
        topValue: i,
        bottomValue: (i % 7) + 1, // 1->2, ..., 6->7, 7->1
        isFlipped: false,
        isSparkle: i === 7, // Example rule: 7s are sparkles? Or random? 
        // Based on "Rikka" name, maybe 6 is special?
        // Let's assume for MVP: No specific rule in PDF summary provided, defaulting to false unless specified.
        // Wait, User said "Some cards have a star". Let's assume standard deck generation doesn't set it randomly yet,
        // or hardcode specific IDs. Let's leave false for now.
      });
    }
  }
  return deck;
}

export function shuffle(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function getActiveValue(card: Card): number {
  return card.isFlipped ? card.bottomValue : card.topValue; // Rule: Bottom is Active
  // Wait, Rule 2.3: "Winning conditions based on their BOTTOM (Active) Values"
  // And Rule 2.2: "Flip ... swaps Top/Bottom".
  // So 'bottomValue' property in code might refer to the specific slot, but if isFlipped is true, does it mean visual top becomes bottom?
  // Let's standardize: 
  // Code 'bottomValue' is the value PRINTED on the bottom slot.
  // If isFlipped = false, Active = bottomValue.
  // If isFlipped = true, the card is rotated 180. The PRINTED topValue is now physically at the bottom.
  // So, if isFlipped, Active = topValue.
  // Wait, previous logic was: return card.isFlipped ? card.bottomValue : card.topValue;
  // Let's verify "Flip ... swapping its active value".
  // Default (Safe): Active = Bottom.
  // Flipped: Active = Top.
  // CORRECT: return card.isFlipped ? card.topValue : card.bottomValue;
  
  // Re-reading user rule 3.1: "Flip: Freely rotate... to swap Top/Bottom values."
  // Rule 2.3: "based on their BOTTOM (Active) Values".
  // Interpretation: The value currently physically at the bottom is active.
  // Card has { top: A, bottom: B }.
  // Unflipped: Bottom is B.
  // Flipped: Cards rotates. Top is now B, Bottom is now A.
  // So Flipped -> Active is A (which was topValue).
  return card.isFlipped ? card.topValue : card.bottomValue;
}

// --- Win Check ---

export function checkWin(cards: Card[]): boolean {
  if (cards.length !== 6) return false;

  // 1. Check Special Yakus first (Global patterns)
  if (checkThreePairs(cards)) return true;
  if (checkAllSparkles(cards)) return true;
  // if (checkMusou(cards)) return true; // TODO: Define Musou

  // 2. Check Standard 3+3 structure
  return checkStandardStructure(cards);
}

// --- Structure Checks ---

function checkStandardStructure(cards: Card[]): boolean {
  // Use backtracking or permutation to split into 2 groups of 3
  const indices = [0, 1, 2, 3, 4, 5];
  
  // Pivot on card[0]
  for (let i = 1; i < 5; i++) {
    for (let j = i + 1; j < 6; j++) {
      const g1Idx = [0, i, j];
      const g2Idx = indices.filter(x => !g1Idx.includes(x));
      
      const g1 = g1Idx.map(x => cards[x]);
      const g2 = g2Idx.map(x => cards[x]);
      
      if (isValidGroup(g1) && isValidGroup(g2)) {
        return true;
      }
    }
  }
  return false;
}

function isValidGroup(cards: Card[]): boolean {
  return isSet(cards) || isRun(cards);
}

function isSet(cards: Card[]): boolean {
  // Same Color, Same Active Value
  const c = cards[0].color;
  if (cards.some(card => card.color !== c)) return false;
  
  const v = getActiveValue(cards[0]);
  return cards.every(card => getActiveValue(card) === v);
}

function isRun(cards: Card[]): boolean {
  // Same Color, Sequential Active Values
  const c = cards[0].color;
  if (cards.some(card => card.color !== c)) return false;
  
  const vals = cards.map(getActiveValue).sort((a, b) => a - b);
  return vals[0] + 1 === vals[1] && vals[1] + 1 === vals[2];
}

// --- Special Yaku Checks ---

function checkThreePairs(cards: Card[]): boolean {
  // 3 pairs of IDENTICAL cards (same color, same values).
  // BUT in this game, are there identical cards? 
  // Deck is 6 colors * 7 values = 42 unique cards.
  // So "Three Pairs" likely means "Pairs based on Active Value + Color"?
  // Or simply Active Value?
  // "Three Pairs (Três x Santsui): 3 pairs of identical tiles." implies identity.
  // Since deck has unique cards, maybe "Identical" means "Same Color & Active Value"?
  // Let's assume Active Value + Color equality.
  
  // Sort by color + value to find pairs easier
  const sorted = [...cards].sort((a, b) => {
    if (a.color !== b.color) return a.color.localeCompare(b.color);
    return getActiveValue(a) - getActiveValue(b);
  });
  
  // Check 0-1, 2-3, 4-5
  for (let i = 0; i < 6; i += 2) {
    if (sorted[i].color !== sorted[i+1].color) return false;
    if (getActiveValue(sorted[i]) !== getActiveValue(sorted[i+1])) return false;
  }
  return true;
}

function checkAllSparkles(cards: Card[]): boolean {
  return cards.every(c => c.isSparkle);
}

// --- Scoring Logic ---

export function calculateScore(cards: Card[], isRon: boolean, isRiichi: boolean): ScoreResult {
  if (!checkWin(cards)) {
    return { total: 0, yaku: [], bonuses: 0 };
  }

  const result: ScoreResult = {
    total: 0,
    yaku: [],
    bonuses: 0
  };

  // Special Yaku
  if (checkThreePairs(cards)) {
    result.yaku.push({ name: 'three_pairs', points: 5 });
  }
  if (checkAllSparkles(cards)) {
    result.yaku.push({ name: 'all_sparkles', points: 5 });
  }

  // Basic Yaku (Only if Standard Structure)
  // Note: Special Yaku might override structure. If Three Pairs, do we count Isshiki? 
  // Usually, special yaku are standalone or additive. 
  // "Rikka (Six Flowers) [6 pts]" -> High level flush.
  // Let's detect standard structure yakus if they exist.
  
  if (checkStandardStructure(cards)) {
    // Check Isshiki (One Suit)
    // All same color
    const firstColor = cards[0].color;
    if (cards.every(c => c.color === firstColor)) {
      result.yaku.push({ name: 'isshiki', points: 1 });
      
      // Check Rikka (Six Flowers) - likely defined as specific flush pattern or just "Full Flush"?
      // Rule says "High-level flush (Specific pattern, defined as same-color for MVP)".
      // So checking Isshiki is 1pt. Maybe Rikka is 6pt replacement?
      // Let's just implement Isshiki for now as MVP.
    }
    
    // Check Sanren (Two runs)
    // Need to identify the two groups again.
    // Ideally checkWin should return the structure.
    // For scoring, we can re-derive.
    // Simplified: If 2 Runs exist.
    // ... logic to detect 2 runs ...
  }

  // Bonuses
  if (isRiichi) result.bonuses += 1;
  result.bonuses += cards.filter(c => c.isSparkle).length;

  // Sum
  result.total = result.yaku.reduce((sum, y) => sum + y.points, 0) + result.bonuses;

  return result;
}
