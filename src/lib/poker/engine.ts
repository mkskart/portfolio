// Pure, UI-agnostic Texas Hold'em engine. State is serializable. The UI decides
// which seat is the human. All functions return NEW state (no external mutation)
// except where they intentionally splice the deck within a freshly-cloned state.

import { createDeck, deal, shuffle } from "./deck";
import { compareHands, evaluate7 } from "./hand-evaluator";
import { BOT_IDENTITIES, HUMAN_COLOR, HUMAN_NAME } from "./names";
import type {
  GamePhase,
  GameState,
  Player,
  PlayerAction,
  Pot,
  ShowdownResult,
} from "./types";

export const STARTING_STACK = 1000;
export const SMALL_BLIND = 5;
export const BIG_BLIND = 10;
export const RAISE_INCREMENT = 25;

// Build the 8-player table: human at seat 0 + 7 bots with random profiles.
export function createPlayers(): Player[] {
  const players: Player[] = [];
  players.push({
    seat: 0,
    name: HUMAN_NAME,
    color: HUMAN_COLOR,
    isBot: false,
    stack: STARTING_STACK,
    buyIn: STARTING_STACK,
    holeCards: [],
    committed: 0,
    totalCommitted: 0,
    folded: false,
    allIn: false,
    busted: false,
    hasActedThisRound: false,
  });
  BOT_IDENTITIES.forEach((id, i) => {
    players.push({
      seat: i + 1,
      name: id.name,
      color: id.color,
      isBot: true,
      stack: STARTING_STACK,
      buyIn: STARTING_STACK,
      holeCards: [],
      committed: 0,
      totalCommitted: 0,
      folded: false,
      allIn: false,
      busted: false,
      hasActedThisRound: false,
      bot: {
        aggression: 0.25 + Math.random() * 0.6,
        tightness: 0.2 + Math.random() * 0.6,
      },
    });
  });
  return players;
}

// Ledger rows for all players.
export function ledgerRows(state: GameState) {
  return state.players.map((p) => ({
    seat: p.seat,
    name: p.name,
    color: p.color,
    buyIn: p.buyIn,
    stack: p.stack,
    net: p.stack - p.buyIn,
    busted: p.busted,
    isBot: p.isBot,
  }));
}

// Rebuy for the human: restore stack and re-seat.
export function rebuyHuman(prev: GameState): GameState {
  const state = clone(prev);
  const human = state.players.find((p) => !p.isBot);
  if (human) {
    human.stack = STARTING_STACK;
    human.buyIn += STARTING_STACK;
    human.busted = false;
    human.folded = false;
  }
  return state;
}

function clone(state: GameState): GameState {
  // Structured-ish deep clone sufficient for our plain data.
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      holeCards: p.holeCards.slice(),
      bot: p.bot ? { ...p.bot } : undefined,
    })),
    deck: state.deck.slice(),
    community: state.community.slice(),
    pots: state.pots.map((pt) => ({ amount: pt.amount, eligible: pt.eligible.slice() })),
    log: state.log.slice(),
  };
}

// Seats that are still "in" the game (not busted).
function liveSeats(state: GameState): number[] {
  return state.players.filter((p) => !p.busted).map((p) => p.seat);
}

// Seats still contesting the current hand (not folded, not busted).
function contesting(state: GameState): number[] {
  return state.players
    .filter((p) => !p.busted && !p.folded)
    .map((p) => p.seat);
}

// Seats that can still take a voluntary action (not folded, not all-in).
function actableSeats(state: GameState): number[] {
  return state.players
    .filter((p) => !p.busted && !p.folded && !p.allIn)
    .map((p) => p.seat);
}

function nextSeat(state: GameState, from: number, predicate: (p: Player) => boolean): number {
  const n = state.players.length;
  for (let i = 1; i <= n; i++) {
    const seat = (from + i) % n;
    if (predicate(state.players[seat])) return seat;
  }
  return -1;
}

function pushLog(state: GameState, msg: string) {
  state.log.push(msg);
  if (state.log.length > 30) state.log.shift();
}

// ---- Hand lifecycle ------------------------------------------------------

export function createInitialState(players: Player[]): GameState {
  return {
    players,
    deck: [],
    community: [],
    phase: "idle",
    dealer: 0,
    smallBlind: SMALL_BLIND,
    bigBlind: BIG_BLIND,
    pots: [],
    pot: 0,
    currentBet: 0,
    minRaise: BIG_BLIND,
    toAct: -1,
    lastAggressor: -1,
    handNumber: 0,
    log: [],
    showdown: null,
    winningSeats: [],
  };
}

// Begin a new hand: rotate dealer, reset per-hand fields, shuffle, deal, post blinds.
export function startHand(prev: GameState): GameState {
  const state = clone(prev);
  state.showdown = null;
  state.winningSeats = [];
  state.community = [];
  state.pots = [];
  state.pot = 0;
  state.currentBet = 0;
  state.minRaise = state.bigBlind;
  state.handNumber = prev.handNumber + 1;

  for (const p of state.players) {
    p.holeCards = [];
    p.committed = 0;
    p.totalCommitted = 0;
    p.folded = p.busted; // busted players are treated as out
    p.allIn = false;
    p.hasActedThisRound = false;
  }

  const live = liveSeats(state);
  if (live.length < 2) {
    state.phase = "handover";
    return state;
  }

  // Move dealer button to next live seat.
  if (state.handNumber === 1) {
    state.dealer = live.includes(0) ? 0 : live[0];
  } else {
    state.dealer = nextSeat(state, state.dealer, (p) => !p.busted);
  }

  // Shuffle & deal two cards to each live player.
  state.deck = shuffle(createDeck());
  // Deal one card at a time, starting left of dealer, two passes (standard).
  for (let pass = 0; pass < 2; pass++) {
    let seat = state.dealer;
    for (let i = 0; i < live.length; i++) {
      seat = nextSeat(state, seat, (p) => !p.busted);
      state.players[seat].holeCards.push(deal(state.deck, 1)[0]);
    }
  }

  // Post blinds.
  const sbSeat = live.length === 2
    ? state.dealer // heads-up: dealer posts SB
    : nextSeat(state, state.dealer, (p) => !p.busted);
  const bbSeat = nextSeat(state, sbSeat, (p) => !p.busted);

  postBlind(state, sbSeat, state.smallBlind);
  postBlind(state, bbSeat, state.bigBlind);
  state.currentBet = state.bigBlind;
  state.minRaise = state.bigBlind;
  state.lastAggressor = bbSeat;

  state.phase = "preflop";
  // First to act is left of BB (UTG); heads-up it's the dealer/SB.
  state.toAct = nextSeat(state, bbSeat, (p) => !p.busted && !p.folded && !p.allIn);

  pushLog(state, `Hand #${state.handNumber} dealt. Blinds ${state.smallBlind}/${state.bigBlind}.`);
  return state;
}

function postBlind(state: GameState, seat: number, amount: number) {
  const p = state.players[seat];
  const pay = Math.min(amount, p.stack);
  p.stack -= pay;
  p.committed += pay;
  p.totalCommitted += pay;
  if (p.stack === 0) p.allIn = true;
}

// ---- Betting -------------------------------------------------------------

export interface ActionConstraints {
  canCheck: boolean;
  callAmount: number; // chips needed to call
  minRaiseTo: number; // minimum total bet a raise must reach
  maxRaiseTo: number; // all-in total
  canRaise: boolean;
}

export function getConstraints(state: GameState, seat: number): ActionConstraints {
  const p = state.players[seat];
  const toCall = Math.max(0, state.currentBet - p.committed);
  const callAmount = Math.min(toCall, p.stack);
  const maxRaiseTo = p.committed + p.stack;
  let minRaiseTo = state.currentBet + state.minRaise;
  // A raise must move the bet up; cap to the player's max.
  if (minRaiseTo > maxRaiseTo) minRaiseTo = maxRaiseTo;
  const canRaise = maxRaiseTo > state.currentBet;
  return {
    canCheck: toCall === 0,
    callAmount,
    minRaiseTo,
    maxRaiseTo,
    canRaise,
  };
}

export function applyAction(prev: GameState, seat: number, action: PlayerAction): GameState {
  const state = clone(prev);
  if (state.toAct !== seat) return state; // ignore out-of-turn
  const p = state.players[seat];
  const c = getConstraints(state, seat);

  switch (action.type) {
    case "fold": {
      p.folded = true;
      pushLog(state, `${p.name} folds.`);
      break;
    }
    case "check": {
      if (!c.canCheck) {
        // illegal -> treat as call
        return applyAction(prev, seat, { type: "call" });
      }
      pushLog(state, `${p.name} checks.`);
      break;
    }
    case "call": {
      const pay = c.callAmount;
      p.stack -= pay;
      p.committed += pay;
      p.totalCommitted += pay;
      if (p.stack === 0) p.allIn = true;
      pushLog(state, pay > 0 ? `${p.name} calls $${pay}.` : `${p.name} checks.`);
      break;
    }
    case "allin": {
      const pay = p.stack;
      const total = p.committed + pay;
      p.stack = 0;
      p.committed = total;
      p.totalCommitted += pay;
      p.allIn = true;
      if (total > state.currentBet) {
        const raiseSize = total - state.currentBet;
        if (raiseSize >= state.minRaise) state.minRaise = raiseSize;
        state.currentBet = total;
        state.lastAggressor = seat;
        resetActedExcept(state, seat);
      }
      pushLog(state, `${p.name} is all-in for $${pay}.`);
      break;
    }
    case "raise": {
      const target = action.amount ?? c.minRaiseTo;
      const raiseTo = Math.max(c.minRaiseTo, Math.min(target, c.maxRaiseTo));
      const pay = raiseTo - p.committed;
      p.stack -= pay;
      p.committed = raiseTo;
      p.totalCommitted += pay;
      if (p.stack === 0) p.allIn = true;
      const raiseSize = raiseTo - state.currentBet;
      if (raiseSize >= state.minRaise) state.minRaise = raiseSize;
      state.currentBet = raiseTo;
      state.lastAggressor = seat;
      resetActedExcept(state, seat);
      pushLog(state, `${p.name} raises to $${raiseTo}.`);
      break;
    }
  }

  p.hasActedThisRound = true;
  return advance(state);
}

// When someone raises, everyone else needs another chance to act.
function resetActedExcept(state: GameState, seat: number) {
  for (const pl of state.players) {
    if (pl.seat !== seat && !pl.folded && !pl.busted && !pl.allIn) {
      pl.hasActedThisRound = false;
    }
  }
}

// Determine whether the current betting round is complete.
function roundComplete(state: GameState): boolean {
  const actable = state.players.filter(
    (p) => !p.busted && !p.folded && !p.allIn,
  );
  if (actable.length === 0) return true;
  for (const p of actable) {
    if (!p.hasActedThisRound) return false;
    if (p.committed !== state.currentBet) return false;
  }
  return true;
}

// Advance turn pointer or street, possibly to showdown.
function advance(state: GameState): GameState {
  // If only one contesting player remains, hand is over immediately.
  if (contesting(state).length === 1) {
    return finishHand(state);
  }

  if (!roundComplete(state)) {
    const next = nextSeat(
      state,
      state.toAct,
      (p) => !p.busted && !p.folded && !p.allIn,
    );
    state.toAct = next;
    return state;
  }

  // Round complete -> collect bets into pots, then advance the street.
  collectBets(state);

  // If at most one player can still act, fast-forward remaining streets.
  return advanceStreet(state);
}

// Fold/collect the per-street committed chips into side pots.
function collectBets(state: GameState) {
  // Build side pots from totalCommitted across the hand.
  // We rebuild pots from scratch each time using totalCommitted snapshots.
  const contributors = state.players.filter((p) => p.totalCommitted > 0);
  if (contributors.length === 0) return;

  const pots: Pot[] = [];
  // distinct positive contribution levels, ascending
  const levels = Array.from(
    new Set(contributors.map((p) => p.totalCommitted)),
  ).sort((a, b) => a - b);

  let prevLevel = 0;
  for (const level of levels) {
    const layer = level - prevLevel;
    if (layer <= 0) {
      prevLevel = level;
      continue;
    }
    const participants = state.players.filter((p) => p.totalCommitted >= level);
    const amount = layer * participants.length;
    // Eligible to win = participants who have NOT folded.
    const eligible = participants
      .filter((p) => !p.folded)
      .map((p) => p.seat);
    // Merge with an existing pot that has the identical eligible set.
    const key = eligible.slice().sort((a, b) => a - b).join(",");
    const existing = pots.find(
      (pt) => pt.eligible.slice().sort((a, b) => a - b).join(",") === key,
    );
    if (existing) existing.amount += amount;
    else pots.push({ amount, eligible });
    prevLevel = level;
  }

  state.pots = pots;
  state.pot = pots.reduce((s, p) => s + p.amount, 0);
  // Reset per-street committed for next street.
  for (const p of state.players) p.committed = 0;
  state.currentBet = 0;
  state.minRaise = state.bigBlind;
  for (const p of state.players) p.hasActedThisRound = false;
}

const STREET_ORDER: GamePhase[] = ["preflop", "flop", "turn", "river", "showdown"];

export function advanceStreet(state: GameState): GameState {
  const idx = STREET_ORDER.indexOf(state.phase);
  const nextPhase = STREET_ORDER[idx + 1];

  // Deal community cards for the new street.
  if (nextPhase === "flop") state.community.push(...deal(state.deck, 3));
  else if (nextPhase === "turn") state.community.push(...deal(state.deck, 1));
  else if (nextPhase === "river") state.community.push(...deal(state.deck, 1));

  state.phase = nextPhase;

  if (nextPhase === "showdown") {
    return runShowdown(state);
  }

  // Decide first to act on the new street (left of dealer).
  const canAct = actableSeats(state);
  if (canAct.length <= 1) {
    // No more betting possible; fast-forward remaining streets to showdown.
    return advanceStreet(state);
  }
  state.toAct = nextSeat(
    state,
    state.dealer,
    (p) => !p.busted && !p.folded && !p.allIn,
  );
  return state;
}

// ---- Showdown ------------------------------------------------------------

function finishHand(state: GameState): GameState {
  // Everyone but one folded. Collect and award the whole pot.
  collectBets(state);
  const winnerSeat = contesting(state)[0];
  const total = state.pot;
  state.players[winnerSeat].stack += total;
  state.winningSeats = [winnerSeat];
  state.showdown = {
    potWinners: [
      { potIndex: 0, seats: [winnerSeat], amount: total, handName: "" },
    ],
    handNames: {},
  };
  state.phase = "handover";
  state.toAct = -1;
  pushLog(state, `${state.players[winnerSeat].name} wins $${total}.`);
  markBusted(state);
  return state;
}

export function runShowdown(state: GameState): GameState {
  // Ensure full board (in case we jumped here via all-in fast-forward before all
  // community cards were dealt).
  while (state.community.length < 5) {
    state.community.push(...deal(state.deck, 1));
  }

  const seats = contesting(state);
  const evals = new Map<number, ReturnType<typeof evaluate7>>();
  const handNames: Record<number, string> = {};
  for (const seat of seats) {
    const p = state.players[seat];
    const ev = evaluate7([...p.holeCards, ...state.community]);
    evals.set(seat, ev);
    handNames[seat] = ev.name;
  }

  const potWinners: ShowdownResult["potWinners"] = [];
  const winningSeats = new Set<number>();

  state.pots.forEach((pot, potIndex) => {
    const eligible = pot.eligible.filter((s) => seats.includes(s));
    if (eligible.length === 0) return;
    // Find best eligible hand(s).
    let best: number[] = [];
    for (const seat of eligible) {
      if (best.length === 0) {
        best = [seat];
        continue;
      }
      const cmp = compareHands(evals.get(seat)!, evals.get(best[0])!);
      if (cmp > 0) best = [seat];
      else if (cmp === 0) best.push(seat);
    }
    // Split pot among winners; remainder chips go to earliest seat(s).
    const share = Math.floor(pot.amount / best.length);
    let remainder = pot.amount - share * best.length;
    const ordered = best.slice().sort((a, b) => a - b);
    for (const seat of ordered) {
      let award = share;
      if (remainder > 0) {
        award += 1;
        remainder -= 1;
      }
      state.players[seat].stack += award;
      winningSeats.add(seat);
      potWinners.push({
        potIndex,
        seats: [seat],
        amount: award,
        handName: handNames[seat],
      });
    }
  });

  state.showdown = { potWinners, handNames };
  state.winningSeats = Array.from(winningSeats);
  state.phase = "handover";
  state.toAct = -1;
  for (const w of state.winningSeats) {
    pushLog(state, `${state.players[w].name} wins with ${handNames[w]}.`);
  }
  markBusted(state);
  return state;
}

function markBusted(state: GameState) {
  for (const p of state.players) {
    if (!p.busted && p.stack <= 0 && p.isBot) {
      p.busted = true;
      p.stack = 0;
      pushLog(state, `${p.name} busted out.`);
    } else if (!p.busted && p.stack <= 0 && !p.isBot) {
      // Human at 0 -> flagged busted; UI offers rebuy.
      p.busted = true;
      p.stack = 0;
    }
  }
}
