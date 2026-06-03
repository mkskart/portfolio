import type { Card } from "./types";
import { RANK_LABELS } from "./deck";

// Hand category ranking, higher is better.
export enum HandRank {
  HighCard = 1,
  Pair = 2,
  TwoPair = 3,
  ThreeOfAKind = 4,
  Straight = 5,
  Flush = 6,
  FullHouse = 7,
  FourOfAKind = 8,
  StraightFlush = 9,
  RoyalFlush = 10,
}

export interface EvaluatedHand {
  rank: HandRank;
  name: string;
  // tiebreakers: an ordered array of numbers compared lexicographically (desc).
  // Encodes the category-relevant ranks then kickers.
  tiebreakers: number[];
  best5: Card[];
}

const RANK_NAMES_SINGULAR: Record<number, string> = {
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  11: "Jack",
  12: "Queen",
  13: "King",
  14: "Ace",
};

const RANK_NAMES_PLURAL: Record<number, string> = {
  2: "Twos",
  3: "Threes",
  4: "Fours",
  5: "Fives",
  6: "Sixes",
  7: "Sevens",
  8: "Eights",
  9: "Nines",
  10: "Tens",
  11: "Jacks",
  12: "Queens",
  13: "Kings",
  14: "Aces",
};

// Generate all 5-card combinations of indices from 7 cards (21 combos).
function combinations5(n: number): number[][] {
  const res: number[][] = [];
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++) res.push([a, b, c, d, e]);
  return res;
}

const COMBOS_7 = combinations5(7);

// Evaluate exactly 5 cards into a category + tiebreakers.
function evaluate5(cards: Card[]): { rank: HandRank; tiebreakers: number[] } {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Count occurrences of each rank
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);

  // Straight detection (handle wheel A-2-3-4-5)
  const uniq = Array.from(new Set(ranks)).sort((a, b) => b - a);
  let straightHigh = 0;
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) straightHigh = uniq[0];
    else if (
      uniq[0] === 14 &&
      uniq[1] === 5 &&
      uniq[2] === 4 &&
      uniq[3] === 3 &&
      uniq[4] === 2
    )
      straightHigh = 5; // wheel: 5-high
  }
  const isStraight = straightHigh > 0;

  if (isStraight && isFlush) {
    if (straightHigh === 14)
      return { rank: HandRank.RoyalFlush, tiebreakers: [14] };
    return { rank: HandRank.StraightFlush, tiebreakers: [straightHigh] };
  }

  // Sort ranks by (count desc, rank desc) for grouped tiebreakers
  const groups = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });
  const countShape = groups.map((g) => g[1]);

  if (countShape[0] === 4) {
    const quad = groups[0][0];
    const kicker = groups[1][0];
    return { rank: HandRank.FourOfAKind, tiebreakers: [quad, kicker] };
  }
  if (countShape[0] === 3 && countShape[1] === 2) {
    return {
      rank: HandRank.FullHouse,
      tiebreakers: [groups[0][0], groups[1][0]],
    };
  }
  if (isFlush) {
    return { rank: HandRank.Flush, tiebreakers: ranks.slice() };
  }
  if (isStraight) {
    return { rank: HandRank.Straight, tiebreakers: [straightHigh] };
  }
  if (countShape[0] === 3) {
    const trip = groups[0][0];
    const kickers = groups
      .slice(1)
      .map((g) => g[0])
      .sort((a, b) => b - a);
    return { rank: HandRank.ThreeOfAKind, tiebreakers: [trip, ...kickers] };
  }
  if (countShape[0] === 2 && countShape[1] === 2) {
    const highPair = Math.max(groups[0][0], groups[1][0]);
    const lowPair = Math.min(groups[0][0], groups[1][0]);
    const kicker = groups[2][0];
    return { rank: HandRank.TwoPair, tiebreakers: [highPair, lowPair, kicker] };
  }
  if (countShape[0] === 2) {
    const pair = groups[0][0];
    const kickers = groups
      .slice(1)
      .map((g) => g[0])
      .sort((a, b) => b - a);
    return { rank: HandRank.Pair, tiebreakers: [pair, ...kickers] };
  }
  return { rank: HandRank.HighCard, tiebreakers: ranks.slice() };
}

function compareTiebreakers(a: number[], b: number[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function handName(rank: HandRank, tb: number[]): string {
  switch (rank) {
    case HandRank.RoyalFlush:
      return "Royal Flush";
    case HandRank.StraightFlush:
      return `Straight Flush, ${RANK_NAMES_SINGULAR[tb[0]]}-high`;
    case HandRank.FourOfAKind:
      return `Four of a Kind, ${RANK_NAMES_PLURAL[tb[0]]}`;
    case HandRank.FullHouse:
      return `Full House, ${RANK_NAMES_PLURAL[tb[0]]} over ${RANK_NAMES_PLURAL[tb[1]]}`;
    case HandRank.Flush:
      return `Flush, ${RANK_NAMES_SINGULAR[tb[0]]}-high`;
    case HandRank.Straight:
      return `Straight, ${RANK_NAMES_SINGULAR[tb[0]]}-high`;
    case HandRank.ThreeOfAKind:
      return `Three of a Kind, ${RANK_NAMES_PLURAL[tb[0]]}`;
    case HandRank.TwoPair:
      return `Two Pair, ${RANK_NAMES_PLURAL[tb[0]]} and ${RANK_NAMES_PLURAL[tb[1]]}`;
    case HandRank.Pair:
      return `Pair of ${RANK_NAMES_PLURAL[tb[0]]}`;
    default:
      return `${RANK_NAMES_SINGULAR[tb[0]]}-high`;
  }
}

// Evaluate the best 5-card hand out of up to 7 cards.
export function evaluate7(cards: Card[]): EvaluatedHand {
  if (cards.length < 5) {
    throw new Error("evaluate7 requires at least 5 cards");
  }
  let best: { rank: HandRank; tiebreakers: number[]; idx: number[] } | null =
    null;
  const combos = cards.length === 7 ? COMBOS_7 : combinations5(cards.length);
  for (const combo of combos) {
    const five = combo.map((i) => cards[i]);
    const ev = evaluate5(five);
    if (
      best === null ||
      ev.rank > best.rank ||
      (ev.rank === best.rank &&
        compareTiebreakers(ev.tiebreakers, best.tiebreakers) > 0)
    ) {
      best = { rank: ev.rank, tiebreakers: ev.tiebreakers, idx: combo };
    }
  }
  const b = best!;
  return {
    rank: b.rank,
    name: handName(b.rank, b.tiebreakers),
    tiebreakers: b.tiebreakers,
    best5: b.idx.map((i) => cards[i]),
  };
}

// Returns >0 if a beats b, <0 if b beats a, 0 if tie.
export function compareHands(a: EvaluatedHand, b: EvaluatedHand): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  return compareTiebreakers(a.tiebreakers, b.tiebreakers);
}

// Tiny sanity checks (not run automatically; documentation):
// evaluate7([As,Ks,Qs,Js,Ts,2c,3d]) -> RoyalFlush
// evaluate7([2s,2h,2d,2c,Kh,Kd,3c]) -> FourOfAKind quads of 2s, kicker K
// Wheel: evaluate7([Ah,2c,3d,4s,5h,9c,Kd]) -> Straight, Five-high
export { RANK_LABELS };
