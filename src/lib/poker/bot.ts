// Bot decision logic. Uses a fast hand-strength heuristic: Chen-style preflop
// scoring, and post-flop made-hand category scaled to [0,1]. Each bot has
// aggression & tightness so they don't all play identically. Returns the action
// the bot wants to take; the caller applies it (after a thinking delay).

import { getConstraints } from "./engine";
import { evaluate7, HandRank } from "./hand-evaluator";
import type { BotProfile, Card, GameState, PlayerAction } from "./types";
import { RAISE_INCREMENT } from "./engine";

// Chen formula preflop hand strength, roughly 0..20 -> normalized to ~0..1.
function chenScore(hole: Card[]): number {
  const [a, b] = hole;
  const hi = Math.max(a.rank, b.rank);
  const lo = Math.min(a.rank, b.rank);
  const pointFor = (r: number): number => {
    if (r === 14) return 10;
    if (r === 13) return 8;
    if (r === 12) return 7;
    if (r === 11) return 6;
    return r / 2;
  };
  let score = pointFor(hi);
  if (hi === lo) {
    // pair
    score = Math.max(5, pointFor(hi) * 2);
  }
  const suited = a.suit === b.suit;
  if (suited) score += 2;
  const gap = hi - lo - 1;
  if (hi !== lo) {
    if (gap === 1) score -= 1;
    else if (gap === 2) score -= 2;
    else if (gap === 3) score -= 4;
    else if (gap >= 4) score -= 5;
    // straight bonus for low connectors
    if (gap <= 1 && hi < 12) score += 1;
  }
  return Math.max(0, Math.min(1, score / 20));
}

// Post-flop strength based on made-hand category (0..1).
function madeStrength(hole: Card[], board: Card[]): number {
  const ev = evaluate7([...hole, ...board]);
  // Map category to a base; add a little for high tiebreaker.
  const base: Record<number, number> = {
    [HandRank.HighCard]: 0.12,
    [HandRank.Pair]: 0.32,
    [HandRank.TwoPair]: 0.5,
    [HandRank.ThreeOfAKind]: 0.62,
    [HandRank.Straight]: 0.74,
    [HandRank.Flush]: 0.82,
    [HandRank.FullHouse]: 0.9,
    [HandRank.FourOfAKind]: 0.97,
    [HandRank.StraightFlush]: 0.99,
    [HandRank.RoyalFlush]: 1,
  };
  let s = base[ev.rank] ?? 0.12;
  // nudge by top tiebreaker (e.g. high pair beats low pair)
  s += ((ev.tiebreakers[0] ?? 0) / 14) * 0.06;
  return Math.min(1, s);
}

function handStrength(state: GameState, seat: number): number {
  const p = state.players[seat];
  if (state.community.length === 0) return chenScore(p.holeCards);
  return madeStrength(p.holeCards, state.community);
}

// Decide the bot's action.
export function decideBotAction(state: GameState, seat: number): PlayerAction {
  const p = state.players[seat];
  const profile: BotProfile = p.bot ?? { aggression: 0.5, tightness: 0.5 };
  const c = getConstraints(state, seat);

  const strength = handStrength(state, seat);
  const potOdds = (() => {
    const callable = c.callAmount;
    if (callable <= 0) return 0;
    const pot = state.pot + state.players.reduce((s, pl) => s + pl.committed, 0);
    return callable / (pot + callable);
  })();

  // Tighter bots require more strength to continue; aggressive bots raise more.
  const callThreshold = 0.18 + profile.tightness * 0.22; // ~0.18..0.40
  const raiseThreshold = 0.5 + (1 - profile.aggression) * 0.28; // ~0.5..0.78

  const rand = Math.random();
  // Occasional small bluff when checked to (no bet to call).
  const bluffing = c.canCheck && rand < 0.08 * profile.aggression && c.canRaise;

  const wantsRaise = strength >= raiseThreshold || bluffing;
  const wantsContinue =
    strength >= callThreshold + potOdds * 0.5 || (c.canCheck && strength >= 0.05);

  if (wantsRaise && c.canRaise) {
    // size the raise relative to the pot and strength
    const pot = Math.max(state.bigBlind, state.pot + state.players.reduce((s, pl) => s + pl.committed, 0));
    const baseFactor = 0.45 + profile.aggression * 0.55 + (bluffing ? 0 : strength * 0.3);
    let target = state.currentBet + Math.round((pot * baseFactor) / RAISE_INCREMENT) * RAISE_INCREMENT;
    target = Math.max(c.minRaiseTo, Math.min(target, c.maxRaiseTo));
    // Shove with monster hands sometimes.
    if (strength > 0.92 && rand < 0.5) target = c.maxRaiseTo;
    if (target >= c.maxRaiseTo) return { type: "allin" };
    return { type: "raise", amount: target };
  }

  if (c.canCheck) {
    return { type: "check" };
  }

  if (wantsContinue) {
    // If a call would commit our whole stack, that's an all-in call.
    if (c.callAmount >= p.stack) return { type: "allin" };
    return { type: "call" };
  }

  return { type: "fold" };
}

// Randomized "thinking" delay in ms (0.8s..1.2s).
export function botThinkDelay(): number {
  return 800 + Math.random() * 400;
}
