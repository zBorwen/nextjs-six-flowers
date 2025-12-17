import { Card, CardColor } from './types';
export type { Card };

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];

export function generateDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const color of COLORS) {
    for (let i = 1; i <= 7; i++) {
      deck.push({
        id: `${color}-${i}`, // Simple deterministic ID for now, can be UUID later
        color,
        topValue: i,
        bottomValue: (i % 7) + 1, // 1->2, ..., 6->7, 7->1
        isFlipped: false,
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

function getActiveValue(card: Card): number {
  return card.isFlipped ? card.bottomValue : card.topValue;
}

function isActiveSet(cards: Card[]): boolean {
  if (cards.length !== 3) return false;
  // All same color
  if (cards[0].color !== cards[1].color || cards[1].color !== cards[2].color) return false;
  
  // All same active value
  const v0 = getActiveValue(cards[0]);
  const v1 = getActiveValue(cards[1]);
  const v2 = getActiveValue(cards[2]);
  
  return v0 === v1 && v1 === v2;
}

function isActiveRun(cards: Card[]): boolean {
  if (cards.length !== 3) return false;
  // All same color
  if (cards[0].color !== cards[1].color || cards[1].color !== cards[2].color) return false;
  
  const values = [
    getActiveValue(cards[0]),
    getActiveValue(cards[1]),
    getActiveValue(cards[2]),
  ].sort((a, b) => a - b);
  
  return values[0] + 1 === values[1] && values[1] + 1 === values[2];
}

function isValidGroup(cards: Card[]): boolean {
  return isActiveSet(cards) || isActiveRun(cards);
}

// Check if 6 cards form 2 valid groups (Sets or Runs)
export function checkWin(cards: Card[]): boolean {
  if (cards.length !== 6) return false;

  // We need to efficiently check if the 6 cards can be split into two groups of 3
  // where each group is a valid Set or Run.
  // We can fix the first card (cards[0]) and try to pair it with any 2 other cards.
  // logic: 
  // 1. Pick indices for the first group involving card[0]: [0, i, j] where 0 < i < j < 6
  // 2. The remaining 3 cards form the second group.
  // 3. Check if both groups are valid.
  
  const indices = [0, 1, 2, 3, 4, 5];
  
  // Try to form the first group with card[0] and two others
  for (let i = 1; i < 5; i++) {
    for (let j = i + 1; j < 6; j++) {
      const group1Indices = [0, i, j];
      const group2Indices = indices.filter(idx => group1Indices.indexOf(idx) === -1);
      
      const group1 = group1Indices.map(idx => cards[idx]);
      const group2 = group2Indices.map(idx => cards[idx]);
      
      if (isValidGroup(group1) && isValidGroup(group2)) {
        return true;
      }
    }
  }
  
  return false;
}
