// ──────────────────────────────────────────────
// Core poker types for Texas Hold'em
// ──────────────────────────────────────────────

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string; // e.g. "A♠"
}

export type Phase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBetThisHand: number;
  status: PlayerStatus;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  hasActedThisRound: boolean;
  isConnected: boolean;
}

export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface LedgerEntry {
  handNumber: number;
  playerId: string;
  playerName: string;
  buyIn: number;
  rebuy: number;
  potWon: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatarColor: string;
  text: string;
  timestamp: number;
  isEmoji?: boolean;
}

export interface EmojiReaction {
  id: string;
  playerId: string;
  emoji: string;
  timestamp: number;
}

export interface HandResult {
  handNumber: number;
  winners: { playerId: string; playerName: string; amount: number; handDescription: string }[];
}

export interface RunItVote {
  times: number; // 2 or 3
  votes: Record<string, boolean>; // playerId -> voted yes
  threshold: number; // how many yes votes needed
}

export interface GameState {
  phase: Phase;
  players: Player[];
  deck: Card[];
  communityCards: Card[];
  pot: number;
  sidePots: SidePot[];
  currentBet: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  handNumber: number;
  smallBlind: number;
  bigBlind: number;
  startingStack: number;
  ledger: LedgerEntry[];
  lastHandResult: HandResult | null;
  runItVote: RunItVote | null;
  chatMessages: ChatMessage[];
  emojiReactions: EmojiReaction[];
  minRaise: number;
  lastRaiseAmount: number;
  actionsThisRound: number;
}

// ──────────────────────────────────────────────
// Hand evaluation types
// ──────────────────────────────────────────────

export type HandRank =
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'One Pair'
  | 'High Card';

export interface HandEvaluation {
  rank: HandRank;
  rankIndex: number; // 9 (royal flush) → 0 (high card)
  bestCards: Card[];
  description: string;
  tiebreakers: number[]; // for comparing equal ranks
}

// ──────────────────────────────────────────────
// Network message types (PartyKit)
// ──────────────────────────────────────────────

export type ClientMessage =
  | { type: 'join'; name: string; avatarColor: string }
  | { type: 'start'; startingStack: number; smallBlind: number; bigBlind: number }
  | { type: 'action'; action: 'fold' | 'check' | 'call' | 'raise' | 'all-in'; amount?: number }
  | { type: 'rebuy'; amount: number }
  | { type: 'vote_run'; times: number }
  | { type: 'chat'; text: string }
  | { type: 'emoji'; emoji: string };

export type ServerMessage =
  | { type: 'state'; state: GameState }
  | { type: 'error'; message: string }
  | { type: 'room_info'; roomCode: string; hostId: string };

export interface RoomInfo {
  roomCode: string;
  hostId: string;
}
