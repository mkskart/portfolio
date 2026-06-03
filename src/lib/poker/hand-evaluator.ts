import { Card, HandEvaluation, HandRank, Rank, Suit } from './types';
import { rankToValue } from './deck';

// Returns all combinations of k items from arr
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function cardValue(card: Card): number {
  return rankToValue(card.rank);
}

function sortDesc(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => cardValue(b) - cardValue(a));
}

function groupByRank(cards: Card[]): Map<number, Card[]> {
  const map = new Map<number, Card[]>();
  for (const card of cards) {
    const v = cardValue(card);
    if (!map.has(v)) map.set(v, []);
    map.get(v)!.push(card);
  }
  return map;
}

function groupBySuit(cards: Card[]): Map<Suit, Card[]> {
  const map = new Map<Suit, Card[]>();
  for (const card of cards) {
    if (!map.has(card.suit)) map.set(card.suit, []);
    map.get(card.suit)!.push(card);
  }
  return map;
}

function isFlush(cards: Card[]): Card[] | null {
  const bySuit = groupBySuit(cards);
  for (const [, suited] of bySuit) {
    if (suited.length >= 5) return sortDesc(suited).slice(0, 5);
  }
  return null;
}

function isStraight(cards: Card[]): Card[] | null {
  const sorted = sortDesc(cards);
  const values = [...new Set(sorted.map(cardValue))];
  // Add low ace (value=1) if Ace present
  if (values.includes(14)) values.push(1);

  for (let i = 0; i <= values.length - 5; i++) {
    const top = values[i];
    const run = [top, top - 1, top - 2, top - 3, top - 4];
    if (run.every(v => values.includes(v))) {
      // Find best cards for this straight
      const best: Card[] = [];
      for (const v of run) {
        const realV = v === 1 ? 14 : v;
        const card = sorted.find(c => cardValue(c) === realV && !best.includes(c));
        if (card) best.push(card);
      }
      return best;
    }
  }
  return null;
}

function isStraightFlush(cards: Card[]): Card[] | null {
  const bySuit = groupBySuit(cards);
  for (const [, suited] of bySuit) {
    if (suited.length >= 5) {
      const sf = isStraight(suited);
      if (sf) return sf;
    }
  }
  return null;
}

const RANK_INDEX: Record<HandRank, number> = {
  'Royal Flush': 9,
  'Straight Flush': 8,
  'Four of a Kind': 7,
  'Full House': 6,
  'Flush': 5,
  'Straight': 4,
  'Three of a Kind': 3,
  'Two Pair': 2,
  'One Pair': 1,
  'High Card': 0,
};

function evaluate5(cards: Card[]): HandEvaluation {
  const sorted = sortDesc(cards);
  const values = sorted.map(cardValue);
  const byRank = groupByRank(cards);

  const groups = [...byRank.entries()].sort((a, b) => b[1].length - a[1].length || b[0] - a[0]);

  const sfCards = isStraightFlush(cards);
  if (sfCards) {
    const top = cardValue(sfCards[0]);
    const isRoyal = top === 14 && cardValue(sfCards[4]) === 10;
    const rank: HandRank = isRoyal ? 'Royal Flush' : 'Straight Flush';
    return {
      rank,
      rankIndex: RANK_INDEX[rank],
      bestCards: sfCards,
      description: isRoyal ? 'Royal Flush' : `Straight Flush, ${sfCards[0].rank} high`,
      tiebreakers: [cardValue(sfCards[0])],
    };
  }

  // Four of a kind
  if (groups[0][1].length === 4) {
    const quad = groups[0][1];
    const kicker = sorted.find(c => !quad.includes(c))!;
    return {
      rank: 'Four of a Kind',
      rankIndex: RANK_INDEX['Four of a Kind'],
      bestCards: [...quad, kicker],
      description: `Four of a Kind, ${quad[0].rank}s`,
      tiebreakers: [groups[0][0], cardValue(kicker)],
    };
  }

  // Full house
  if (groups[0][1].length === 3 && groups[1]?.[1].length >= 2) {
    const trips = groups[0][1];
    const pair = groups[1][1].slice(0, 2);
    return {
      rank: 'Full House',
      rankIndex: RANK_INDEX['Full House'],
      bestCards: [...trips, ...pair],
      description: `Full House, ${trips[0].rank}s full of ${pair[0].rank}s`,
      tiebreakers: [groups[0][0], groups[1][0]],
    };
  }

  // Flush
  const flushCards = isFlush(cards);
  if (flushCards) {
    return {
      rank: 'Flush',
      rankIndex: RANK_INDEX['Flush'],
      bestCards: flushCards,
      description: `Flush, ${flushCards[0].rank} high`,
      tiebreakers: flushCards.map(cardValue),
    };
  }

  // Straight
  const straightCards = isStraight(cards);
  if (straightCards) {
    return {
      rank: 'Straight',
      rankIndex: RANK_INDEX['Straight'],
      bestCards: straightCards,
      description: `Straight, ${straightCards[0].rank} high`,
      tiebreakers: [cardValue(straightCards[0])],
    };
  }

  // Three of a kind
  if (groups[0][1].length === 3) {
    const trips = groups[0][1];
    const kickers = sorted.filter(c => !trips.includes(c)).slice(0, 2);
    return {
      rank: 'Three of a Kind',
      rankIndex: RANK_INDEX['Three of a Kind'],
      bestCards: [...trips, ...kickers],
      description: `Three of a Kind, ${trips[0].rank}s`,
      tiebreakers: [groups[0][0], ...kickers.map(cardValue)],
    };
  }

  // Two pair
  if (groups[0][1].length === 2 && groups[1]?.[1].length === 2) {
    const pair1 = groups[0][1];
    const pair2 = groups[1][1];
    const kicker = sorted.find(c => !pair1.includes(c) && !pair2.includes(c))!;
    return {
      rank: 'Two Pair',
      rankIndex: RANK_INDEX['Two Pair'],
      bestCards: [...pair1, ...pair2, kicker],
      description: `Two Pair, ${pair1[0].rank}s and ${pair2[0].rank}s`,
      tiebreakers: [groups[0][0], groups[1][0], cardValue(kicker)],
    };
  }

  // One pair
  if (groups[0][1].length === 2) {
    const pair = groups[0][1];
    const kickers = sorted.filter(c => !pair.includes(c)).slice(0, 3);
    return {
      rank: 'One Pair',
      rankIndex: RANK_INDEX['One Pair'],
      bestCards: [...pair, ...kickers],
      description: `One Pair, ${pair[0].rank}s`,
      tiebreakers: [groups[0][0], ...kickers.map(cardValue)],
    };
  }

  // High card
  return {
    rank: 'High Card',
    rankIndex: RANK_INDEX['High Card'],
    bestCards: sorted.slice(0, 5),
    description: `${sorted[0].rank} high`,
    tiebreakers: sorted.slice(0, 5).map(cardValue),
  };
}

export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length < 2) {
    return evaluate5(allCards.length === 0 ? [] : allCards);
  }

  const numCards = allCards.length;
  if (numCards <= 5) return evaluate5(allCards);

  // Best of all C(n,5) combinations
  const combos = combinations(allCards, 5);
  let best: HandEvaluation | null = null;
  for (const combo of combos) {
    const ev = evaluate5(combo);
    if (!best || compareHands(ev, best) > 0) best = ev;
  }
  return best!;
}

/** Returns positive if a > b, 0 if tie, negative if a < b */
export function compareHands(a: HandEvaluation, b: HandEvaluation): number {
  if (a.rankIndex !== b.rankIndex) return a.rankIndex - b.rankIndex;
  for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
    const av = a.tiebreakers[i] ?? 0;
    const bv = b.tiebreakers[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

/** Evaluate hole cards only (preflop / partial board) — used for hand strength indicator */
export function evaluateHoleCards(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  return evaluateHand(holeCards, communityCards);
}
