export interface Rank {
  title: string;
  minScore: number;
}

export const RANKS: Rank[] = [
  { title: 'Novice', minScore: 0 },
  { title: 'Apprentice', minScore: 1000 },
  { title: 'Adept', minScore: 5000 },
  { title: 'Expert', minScore: 10000 },
  { title: 'Master', minScore: 25000 },
  { title: 'Grandmaster', minScore: 50000 },
];

export function getRank(score: number): Rank {
  // Ranks are sorted by minScore ascending
  // We reverse to find the highest matching rank
  const rank = [...RANKS].reverse().find(r => score >= r.minScore);
  return rank || RANKS[0];
}
