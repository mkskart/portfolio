// Core domain types for the solo Texas Hold'em engine.
// Kept UI-agnostic and serializable so multiplayer could layer on later.

export type Suit = "s" | "h" | "d" | "c";

// Ranks 2..14 where 11=J,12=Q,13=K,14=A
export type Rank = number;

export interface Card {
  rank: Rank; // 2..14
  suit: Suit;
}

export type GamePhase =
  | "idle"
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "showdown"
  | "handover";

export type ActionType = "fold" | "check" | "call" | "raise" | "allin";

export interface PlayerAction {
  type: ActionType;
  amount?: number; // for raise: the TOTAL bet the player is raising TO this street
}

export interface BotProfile {
  aggression: number; // 0..1
  tightness: number; // 0..1
}

export interface Player {
  seat: number; // 0..7
  name: string;
  color: string; // avatar accent
  isBot: boolean;
  stack: number;
  buyIn: number; // total chips bought in (for ledger P&L)
  // round/hand bookkeeping
  holeCards: Card[];
  committed: number; // chips put into pot THIS street
  totalCommitted: number; // chips put into pot THIS hand (for side pots)
  folded: boolean;
  allIn: boolean;
  busted: boolean;
  hasActedThisRound: boolean;
  bot?: BotProfile;
}

export interface Pot {
  amount: number;
  // seats eligible to win this pot
  eligible: number[];
}

// Result of a showdown for animation/labeling
export interface ShowdownResult {
  // winners per pot: parallel to pots, each entry a list of winning seats
  potWinners: { potIndex: number; seats: number[]; amount: number; handName: string }[];
  // best hand name per contesting seat for reveal labels
  handNames: Record<number, string>;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  community: Card[];
  phase: GamePhase;
  dealer: number; // seat index of dealer button
  smallBlind: number;
  bigBlind: number;
  pots: Pot[]; // side pots (built from committed chips)
  pot: number; // total of all pots (convenience for display)
  // betting state for current street
  currentBet: number; // highest committed amount this street
  minRaise: number; // minimum raise increment currently
  toAct: number; // seat index whose turn it is (-1 if none)
  lastAggressor: number; // seat who made the last aggressive action (-1 none)
  handNumber: number;
  log: string[];
  showdown: ShowdownResult | null;
  winningSeats: number[]; // for highlight
}

export interface LedgerRow {
  seat: number;
  name: string;
  color: string;
  buyIn: number;
  stack: number;
  net: number;
  busted: boolean;
  isBot: boolean;
}
