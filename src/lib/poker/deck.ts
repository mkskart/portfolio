import type { Card, Suit } from "./types";

export const SUITS: Suit[] = ["s", "h", "d", "c"];
export const RANKS: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

// Fisher-Yates shuffle (non-mutating: returns a new shuffled array)
export function shuffle<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Deal n cards from the top of the deck, mutating the deck array.
export function deal(deck: Card[], n: number): Card[] {
  return deck.splice(0, n);
}

export const RANK_LABELS: Record<number, string> = {
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  s: "♠", // ♠
  h: "♥", // ♥
  d: "♦", // ♦
  c: "♣", // ♣
};

export const SUIT_COLORS: Record<Suit, string> = {
  s: "#1e293b",
  h: "#dc2626",
  d: "#0ea5e9",
  c: "#059669",
};

export function cardToString(c: Card): string {
  return `${RANK_LABELS[c.rank]}${SUIT_SYMBOLS[c.suit]}`;
}
