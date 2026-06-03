// ──────────────────────────────────────────────
// Texas Hold'em Game Engine — pure state machine
// ──────────────────────────────────────────────

import { GameState, Player, Phase, SidePot, LedgerEntry, HandResult, Card } from './types';
import { createShuffledDeck } from './deck';
import { evaluateHand, compareHands } from './hand-evaluator';

// ── Helpers ──────────────────────────────────────

function nextActiveIndex(players: Player[], from: number): number {
  const n = players.length;
  for (let i = 1; i < n; i++) {
    const idx = (from + i) % n;
    if (players[idx].status === 'active') return idx;
  }
  return -1; // no active players
}

function activePlayers(players: Player[]): Player[] {
  return players.filter(p => p.status === 'active' || p.status === 'all-in');
}

function eligiblePlayers(players: Player[]): Player[] {
  return players.filter(p => p.status !== 'folded' && p.status !== 'sitting-out');
}

export function buildSidePots(players: Player[]): SidePot[] {
  const contenders = eligiblePlayers(players).filter(p => p.totalBetThisHand > 0);
  if (contenders.length === 0) return [];

  const levels = [...new Set(contenders.map(p => p.totalBetThisHand))].sort((a, b) => a - b);
  const sidePots: SidePot[] = [];
  let covered = 0;

  for (const level of levels) {
    const contribution = level - covered;
    const eligible = contenders.filter(p => p.totalBetThisHand >= level);
    const amount = contribution * eligible.length;
    if (amount > 0) {
      sidePots.push({ amount, eligiblePlayerIds: eligible.map(p => p.id) });
    }
    covered = level;
  }

  return sidePots;
}

// ── Initial state ─────────────────────────────────

export function createInitialState(
  players: Player[],
  smallBlind: number,
  bigBlind: number,
  startingStack: number,
): GameState {
  return {
    phase: 'waiting',
    players,
    deck: [],
    communityCards: [],
    pot: 0,
    sidePots: [],
    currentBet: 0,
    currentPlayerIndex: 0,
    dealerIndex: 0,
    smallBlindIndex: 1,
    bigBlindIndex: 2,
    handNumber: 0,
    smallBlind,
    bigBlind,
    startingStack,
    ledger: [],
    lastHandResult: null,
    runItVote: null,
    chatMessages: [],
    emojiReactions: [],
    minRaise: bigBlind,
    lastRaiseAmount: bigBlind,
    actionsThisRound: 0,
  };
}

// ── Deal new hand ─────────────────────────────────

export function dealNewHand(state: GameState): GameState {
  const { players, dealerIndex, smallBlind, bigBlind, handNumber } = state;

  // Filter out busted players (chips = 0, not sitting-out for rebuy)
  const activePlayers = players.filter(p => p.chips > 0 || p.status === 'sitting-out');
  if (activePlayers.filter(p => p.chips > 0).length < 2) return state; // can't play

  const eligible = activePlayers.filter(p => p.chips > 0);
  const n = eligible.length;

  // Advance dealer button among eligible
  const prevDealerIdx = eligible.findIndex(p => p.id === players[dealerIndex]?.id);
  const newDealerIdx = (prevDealerIdx + 1) % n;
  const newSBIdx = (newDealerIdx + 1) % n;
  const newBBIdx = (newDealerIdx + 2) % n;

  // Reset players
  const deck = createShuffledDeck();
  const resetPlayers: Player[] = eligible.map(p => ({
    ...p,
    holeCards: [],
    currentBet: 0,
    totalBetThisHand: 0,
    status: 'active' as const,
    hasActedThisRound: false,
  }));

  // Deal 2 cards each
  for (let i = 0; i < 2; i++) {
    for (const p of resetPlayers) {
      p.holeCards.push(deck.shift()!);
    }
  }

  // Post blinds
  const sbPlayer = resetPlayers[newSBIdx];
  const bbPlayer = resetPlayers[newBBIdx];

  const sbAmount = Math.min(smallBlind, sbPlayer.chips);
  sbPlayer.chips -= sbAmount;
  sbPlayer.currentBet = sbAmount;
  sbPlayer.totalBetThisHand = sbAmount;
  if (sbPlayer.chips === 0) sbPlayer.status = 'all-in';

  const bbAmount = Math.min(bigBlind, bbPlayer.chips);
  bbPlayer.chips -= bbAmount;
  bbPlayer.currentBet = bbAmount;
  bbPlayer.totalBetThisHand = bbAmount;
  if (bbPlayer.chips === 0) bbPlayer.status = 'all-in';

  const pot = sbAmount + bbAmount;

  // Action starts left of BB
  const firstToActIdx = (newBBIdx + 1) % n;

  // Ledger entry for buy-ins if handNumber === 0 handled externally
  return {
    ...state,
    phase: 'preflop',
    players: resetPlayers,
    deck,
    communityCards: [],
    pot,
    sidePots: [],
    currentBet: bigBlind,
    currentPlayerIndex: firstToActIdx,
    dealerIndex: newDealerIdx,
    smallBlindIndex: newSBIdx,
    bigBlindIndex: newBBIdx,
    handNumber: handNumber + 1,
    lastHandResult: null,
    runItVote: null,
    minRaise: bigBlind,
    lastRaiseAmount: bigBlind,
    actionsThisRound: 0,
  };
}

// ── Apply player action ───────────────────────────

export type PlayerAction =
  | { type: 'fold' }
  | { type: 'check' }
  | { type: 'call' }
  | { type: 'raise'; amount: number }
  | { type: 'all-in' };

export function applyAction(state: GameState, playerId: string, action: PlayerAction): GameState {
  const s = JSON.parse(JSON.stringify(state)) as GameState; // deep clone
  const playerIdx = s.players.findIndex(p => p.id === playerId);
  if (playerIdx === -1 || playerIdx !== s.currentPlayerIndex) return state;

  const player = s.players[playerIdx];
  if (player.status !== 'active') return state;

  switch (action.type) {
    case 'fold': {
      player.status = 'folded';
      player.hasActedThisRound = true;
      break;
    }
    case 'check': {
      if (s.currentBet > player.currentBet) return state; // can't check
      player.hasActedThisRound = true;
      break;
    }
    case 'call': {
      const toCall = Math.min(s.currentBet - player.currentBet, player.chips);
      player.chips -= toCall;
      player.currentBet += toCall;
      player.totalBetThisHand += toCall;
      if (player.chips === 0) player.status = 'all-in';
      player.hasActedThisRound = true;
      s.pot += toCall;
      break;
    }
    case 'raise': {
      const raiseTotal = action.amount; // total bet amount (not just extra)
      const extra = raiseTotal - player.currentBet;
      if (extra <= 0 || extra > player.chips) return state;
      const raiseAmount = raiseTotal - s.currentBet;
      player.chips -= extra;
      player.currentBet = raiseTotal;
      player.totalBetThisHand += extra;
      if (player.chips === 0) player.status = 'all-in';
      player.hasActedThisRound = true;
      s.pot += extra;
      s.currentBet = raiseTotal;
      s.lastRaiseAmount = raiseAmount;
      s.minRaise = raiseTotal + raiseAmount;
      // Re-open action for others
      s.players.forEach((p, i) => {
        if (i !== playerIdx && p.status === 'active') p.hasActedThisRound = false;
      });
      break;
    }
    case 'all-in': {
      const allIn = player.chips;
      player.chips = 0;
      player.currentBet += allIn;
      player.totalBetThisHand += allIn;
      player.status = 'all-in';
      player.hasActedThisRound = true;
      s.pot += allIn;
      if (player.currentBet > s.currentBet) {
        const raise = player.currentBet - s.currentBet;
        s.currentBet = player.currentBet;
        s.lastRaiseAmount = raise;
        s.minRaise = player.currentBet + raise;
        s.players.forEach((p, i) => {
          if (i !== playerIdx && p.status === 'active') p.hasActedThisRound = false;
        });
      }
      break;
    }
  }

  s.actionsThisRound++;
  return advanceGame(s);
}

// ── Advance game after action ─────────────────────

function advanceGame(state: GameState): GameState {
  const s = state;
  const active = s.players.filter(p => p.status === 'active');
  const notFolded = s.players.filter(p => p.status !== 'folded' && p.status !== 'sitting-out');

  // Only one player left — they win
  if (notFolded.length === 1) {
    return settleHand(s);
  }

  // Check if betting round is over
  const roundDone = isBettingRoundDone(s);

  if (roundDone) {
    return advancePhase(s);
  }

  // Find next active player to act
  const nextIdx = findNextToAct(s);
  if (nextIdx === -1) {
    return advancePhase(s);
  }

  return { ...s, currentPlayerIndex: nextIdx };
}

function isBettingRoundDone(state: GameState): boolean {
  const active = state.players.filter(p => p.status === 'active');
  if (active.length === 0) return true;

  // All active players must have acted and bets must be equal
  const allActed = active.every(p => p.hasActedThisRound);
  const betsEqual = active.every(p => p.currentBet === state.currentBet || p.chips === 0);
  return allActed && betsEqual;
}

function findNextToAct(state: GameState): number {
  const n = state.players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (state.currentPlayerIndex + i) % n;
    const p = state.players[idx];
    if (p.status === 'active' && (!p.hasActedThisRound || p.currentBet < state.currentBet)) {
      return idx;
    }
  }
  return -1;
}

function advancePhase(state: GameState): GameState {
  const s = { ...state };
  // Reset bets for new round
  s.players = s.players.map(p => ({ ...p, currentBet: 0, hasActedThisRound: false }));
  s.currentBet = 0;
  s.minRaise = s.bigBlind;
  s.lastRaiseAmount = s.bigBlind;
  s.actionsThisRound = 0;

  const notFolded = s.players.filter(p => p.status !== 'folded' && p.status !== 'sitting-out');
  const canAct = s.players.filter(p => p.status === 'active');

  // If everyone is all-in or only one can act, run out the board
  const shouldRunOut = canAct.length <= 1 && notFolded.length > 1;

  switch (s.phase) {
    case 'preflop': {
      // Deal flop
      s.deck.shift(); // burn
      s.communityCards = [s.deck.shift()!, s.deck.shift()!, s.deck.shift()!];
      s.phase = 'flop';
      break;
    }
    case 'flop': {
      s.deck.shift(); // burn
      s.communityCards = [...s.communityCards, s.deck.shift()!];
      s.phase = 'turn';
      break;
    }
    case 'turn': {
      s.deck.shift(); // burn
      s.communityCards = [...s.communityCards, s.deck.shift()!];
      s.phase = 'river';
      break;
    }
    case 'river': {
      return settleHand(s);
    }
    default:
      return s;
  }

  if (shouldRunOut) {
    // Auto-advance to next phase
    return advancePhase(s);
  }

  // First to act post-flop: first active player left of dealer
  const n = s.players.length;
  let firstIdx = -1;
  for (let i = 1; i <= n; i++) {
    const idx = (s.dealerIndex + i) % n;
    if (s.players[idx].status === 'active') {
      firstIdx = idx;
      break;
    }
  }
  s.currentPlayerIndex = firstIdx === -1 ? 0 : firstIdx;

  return s;
}

// ── Settle the hand ───────────────────────────────

export function settleHand(state: GameState): GameState {
  const s = { ...state, phase: 'showdown' as Phase };
  const notFolded = s.players.filter(p => p.status !== 'folded' && p.status !== 'sitting-out');

  // Build side pots
  const sidePots = buildSidePots({ ...s, players: s.players.map(p => ({ ...p, currentBet: p.totalBetThisHand })) }.players);
  s.sidePots = sidePots;

  const winners: HandResult['winners'] = [];

  if (notFolded.length === 1) {
    // Uncontested
    const winner = notFolded[0];
    const winnerIdx = s.players.findIndex(p => p.id === winner.id);
    s.players[winnerIdx].chips += s.pot;
    winners.push({ playerId: winner.id, playerName: winner.name, amount: s.pot, handDescription: 'Last player standing' });
  } else {
    // Evaluate hands
    const evaluations = notFolded.map(p => ({
      player: p,
      eval: evaluateHand(p.holeCards, s.communityCards),
    }));

    // Distribute each side pot
    for (const pot of sidePots) {
      const eligible = evaluations.filter(e => pot.eligiblePlayerIds.includes(e.player.id));
      if (eligible.length === 0) continue;

      // Sort by hand strength
      eligible.sort((a, b) => compareHands(b.eval, a.eval));
      const bestEval = eligible[0].eval;
      const potWinners = eligible.filter(e => compareHands(e.eval, bestEval) === 0);

      const share = Math.floor(pot.amount / potWinners.length);
      const remainder = pot.amount % potWinners.length;

      potWinners.forEach((w, i) => {
        const amount = share + (i === 0 ? remainder : 0);
        const idx = s.players.findIndex(p => p.id === w.player.id);
        s.players[idx].chips += amount;
        const existing = winners.find(win => win.playerId === w.player.id);
        if (existing) {
          existing.amount += amount;
        } else {
          winners.push({ playerId: w.player.id, playerName: w.player.name, amount, handDescription: w.eval.description });
        }
      });
    }
  }

  // Update ledger
  const newEntries: LedgerEntry[] = winners.map(w => ({
    handNumber: s.handNumber,
    playerId: w.playerId,
    playerName: w.playerName,
    buyIn: 0,
    rebuy: 0,
    potWon: w.amount,
  }));
  s.ledger = [...s.ledger, ...newEntries];

  s.lastHandResult = { handNumber: s.handNumber, winners };
  s.pot = 0;
  s.sidePots = [];

  return s;
}

// ── Rebuy ─────────────────────────────────────────

export function applyRebuy(state: GameState, playerId: string, amount: number): GameState {
  const s = JSON.parse(JSON.stringify(state)) as GameState;
  const idx = s.players.findIndex(p => p.id === playerId);
  if (idx === -1) return state;

  s.players[idx].chips += amount;
  if (s.players[idx].status === 'sitting-out') s.players[idx].status = 'active';

  const entry: LedgerEntry = {
    handNumber: s.handNumber,
    playerId,
    playerName: s.players[idx].name,
    buyIn: 0,
    rebuy: amount,
    potWon: 0,
  };
  s.ledger = [...s.ledger, entry];

  return s;
}

// ── Helper exports ────────────────────────────────

export function getCallAmount(state: GameState, playerId: string): number {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return 0;
  return Math.min(state.currentBet - player.currentBet, player.chips);
}

export function canCheck(state: GameState, playerId: string): boolean {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return false;
  return player.currentBet === state.currentBet;
}

export function isPlayerTurn(state: GameState, playerId: string): boolean {
  return state.players[state.currentPlayerIndex]?.id === playerId && state.phase !== 'showdown' && state.phase !== 'waiting';
}
