// ──────────────────────────────────────────────
// Bot AI — three difficulty levels
// ──────────────────────────────────────────────

import { GameState, Player, BotDifficulty, Card } from './types';
import { evaluateHand } from './hand-evaluator';
import { rankToValue } from './deck';
import { PlayerAction, getCallAmount, canCheck } from './game-engine';

// ── Hand strength estimation ──────────────────────

function handStrengthScore(holeCards: Card[], communityCards: Card[]): number {
  if (holeCards.length === 0) return 0;
  const ev = evaluateHand(holeCards, communityCards);
  // Normalize rankIndex (0-9) to 0-1, plus small bonus for high cards in tiebreakers
  const base = ev.rankIndex / 9;
  const tiebreakerBonus = (ev.tiebreakers[0] ?? 0) / 14 * 0.05;
  return Math.min(1, base + tiebreakerBonus);
}

// Rough preflop hand strength (0-1)
function preflopStrength(holeCards: Card[]): number {
  if (holeCards.length < 2) return 0;
  const [c1, c2] = holeCards;
  const v1 = rankToValue(c1.rank);
  const v2 = rankToValue(c2.rank);
  const high = Math.max(v1, v2);
  const low = Math.min(v1, v2);
  const suited = c1.suit === c2.suit ? 0.05 : 0;
  const pair = v1 === v2;
  if (pair) return 0.4 + (high / 14) * 0.4;
  const gap = high - low;
  const base = (high / 14) * 0.3 + (low / 14) * 0.2;
  const gapPenalty = (gap / 12) * 0.1;
  return Math.min(1, base + suited - gapPenalty);
}

function getHandStrength(state: GameState, player: Player): number {
  if (state.communityCards.length === 0) {
    return preflopStrength(player.holeCards);
  }
  return handStrengthScore(player.holeCards, state.communityCards);
}

// ── Pot odds ──────────────────────────────────────

function getPotOdds(state: GameState, player: Player): number {
  const callAmount = getCallAmount(state, player.id);
  if (callAmount === 0) return 1;
  return state.pot / (state.pot + callAmount);
}

// ── Bot decision ──────────────────────────────────

export function getBotAction(state: GameState, player: Player): PlayerAction {
  const difficulty = player.botDifficulty ?? 'easy';
  const strength = getHandStrength(state, player);
  const potOdds = getPotOdds(state, player);
  const callAmount = getCallAmount(state, player.id);
  const isCheck = canCheck(state, player.id);
  const rand = Math.random();

  switch (difficulty) {
    case 'easy':
      return easyBot(strength, potOdds, callAmount, isCheck, player, state, rand);
    case 'medium':
      return mediumBot(strength, potOdds, callAmount, isCheck, player, state, rand);
    case 'hard':
      return hardBot(strength, potOdds, callAmount, isCheck, player, state, rand);
  }
}

function easyBot(
  strength: number,
  potOdds: number,
  callAmount: number,
  isCheck: boolean,
  player: Player,
  state: GameState,
  rand: number,
): PlayerAction {
  // Easy: calls too often, rarely raises, folds to big bets
  if (isCheck) {
    // Check or occasionally bet small
    if (rand < 0.15 && strength > 0.4) {
      const bet = Math.min(Math.floor(state.pot * 0.5), player.chips);
      return { type: 'raise', amount: player.currentBet + bet };
    }
    return { type: 'check' };
  }

  // Big bet — sometimes fold
  const relativeCallSize = callAmount / (state.pot + callAmount);
  if (relativeCallSize > 0.5 && strength < 0.25 && rand < 0.5) {
    return { type: 'fold' };
  }

  // Usually call
  if (rand < 0.75 || strength > 0.3) {
    if (callAmount >= player.chips) return { type: 'all-in' };
    return { type: 'call' };
  }

  return { type: 'fold' };
}

function mediumBot(
  strength: number,
  potOdds: number,
  callAmount: number,
  isCheck: boolean,
  player: Player,
  state: GameState,
  rand: number,
): PlayerAction {
  // Medium: considers pot odds, bets made hands, folds weak hands
  if (isCheck) {
    if (strength > 0.55 && rand < 0.7) {
      const bet = Math.floor(state.pot * 0.6);
      const total = player.currentBet + Math.min(bet, player.chips);
      return { type: 'raise', amount: total };
    }
    if (strength > 0.35 && rand < 0.3) {
      const bet = Math.floor(state.pot * 0.33);
      const total = player.currentBet + Math.min(bet, player.chips);
      return { type: 'raise', amount: total };
    }
    return { type: 'check' };
  }

  // Use pot odds
  if (strength > potOdds + 0.1) {
    // Raise if strong
    if (strength > 0.6 && rand < 0.5) {
      const raise = Math.floor(state.currentBet * 2.5);
      if (raise < player.chips) return { type: 'raise', amount: player.currentBet + (raise - state.currentBet) + (state.currentBet - player.currentBet) };
    }
    if (callAmount >= player.chips) return { type: 'all-in' };
    return { type: 'call' };
  }

  if (strength > potOdds - 0.05) {
    if (callAmount >= player.chips) return { type: 'all-in' };
    return { type: 'call' };
  }

  return { type: 'fold' };
}

function hardBot(
  strength: number,
  potOdds: number,
  callAmount: number,
  isCheck: boolean,
  player: Player,
  state: GameState,
  rand: number,
): PlayerAction {
  // Hard: GTO-ish, bluffs, 3-bets strong hands, position-aware
  const isBluff = rand < 0.12 && strength < 0.2;
  const isPositionAdvantage = rand < 0.3; // rough position heuristic

  if (isCheck) {
    // Value bet or bluff
    if (strength > 0.65 || (isBluff && rand < 0.3)) {
      const fraction = strength > 0.75 ? 0.75 : strength > 0.5 ? 0.5 : 0.33;
      const bet = Math.min(Math.floor(state.pot * fraction), player.chips);
      if (bet > 0) return { type: 'raise', amount: player.currentBet + bet };
    }
    if (strength > 0.4 && isPositionAdvantage && rand < 0.4) {
      const bet = Math.min(Math.floor(state.pot * 0.4), player.chips);
      if (bet > 0) return { type: 'raise', amount: player.currentBet + bet };
    }
    return { type: 'check' };
  }

  // 3-bet with strong hands
  if (strength > 0.7 && rand < 0.6) {
    const threeBet = Math.min(state.currentBet * 3, player.chips + player.currentBet);
    if (threeBet > player.currentBet + state.bigBlind) {
      return { type: 'raise', amount: threeBet };
    }
  }

  // Bluff raise
  if (isBluff && rand < 0.2) {
    const bluffRaise = Math.min(state.currentBet * 2.5, player.chips + player.currentBet);
    if (bluffRaise > player.currentBet + state.bigBlind) {
      return { type: 'raise', amount: Math.floor(bluffRaise) };
    }
  }

  // Call with pot odds
  if (strength > potOdds - 0.05 || (isBluff && callAmount < state.pot * 0.3)) {
    if (callAmount >= player.chips) return { type: 'all-in' };
    return { type: 'call' };
  }

  return { type: 'fold' };
}

// ── Bot delay ─────────────────────────────────────

export function getBotDelay(): number {
  return 800 + Math.floor(Math.random() * 700); // 800–1500ms
}
