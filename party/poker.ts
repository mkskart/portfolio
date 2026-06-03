// ──────────────────────────────────────────────
// PartyKit Server — Texas Hold'em authoritative state
// ──────────────────────────────────────────────

import type * as Party from "partykit/server";
import {
  GameState,
  Player,
  ClientMessage,
  ServerMessage,
  ChatMessage,
  EmojiReaction,
  LedgerEntry,
} from "../src/lib/poker/types";
import {
  createInitialState,
  dealNewHand,
  applyAction,
  applyRebuy,
  settleHand,
} from "../src/lib/poker/game-engine";

const AVATAR_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#e91e63"];

export default class PokerRoom implements Party.Server {
  private state: GameState | null = null;
  private hostId: string | null = null;
  private nextHandTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Send current state if we have one
    if (this.state) {
      this.sendTo(conn, { type: "state", state: this.state });
    }
    this.sendTo(conn, { type: "room_info", roomCode: this.room.id.toUpperCase(), hostId: this.hostId || conn.id });
  }

  async onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case "join":
        this.handleJoin(sender, msg.name, msg.avatarColor);
        break;
      case "start":
        this.handleStart(sender, msg.startingStack, msg.smallBlind, msg.bigBlind);
        break;
      case "action":
        this.handleAction(sender, msg.action, msg.amount);
        break;
      case "rebuy":
        this.handleRebuy(sender, msg.amount);
        break;
      case "vote_run":
        this.handleVoteRun(sender, msg.times);
        break;
      case "chat":
        this.handleChat(sender, msg.text);
        break;
      case "emoji":
        this.handleEmoji(sender, msg.emoji);
        break;
    }
  }

  async onClose(conn: Party.Connection) {
    if (!this.state) return;
    const idx = this.state.players.findIndex(p => p.id === conn.id);
    if (idx === -1) return;

    // Mark disconnected but keep in game
    this.state = {
      ...this.state,
      players: this.state.players.map(p =>
        p.id === conn.id ? { ...p, isConnected: false } : p
      ),
    };

    // If it was their turn and they disconnected, auto-fold
    if (this.state.currentPlayerIndex === idx && this.state.phase !== "waiting" && this.state.phase !== "showdown") {
      this.state = applyAction(this.state, conn.id, { type: "fold" });
    }

    this.broadcast();
  }

  // ── Handlers ──────────────────────────────────────

  private handleJoin(conn: Party.Connection, name: string, avatarColor: string) {
    if (!this.hostId) this.hostId = conn.id;

    if (!this.state) {
      // Create a placeholder state with just this player
      const player: Player = {
        id: conn.id,
        name: name.substring(0, 20),
        avatarColor: avatarColor || AVATAR_COLORS[0],
        chips: 0,
        holeCards: [],
        currentBet: 0,
        totalBetThisHand: 0,
        status: "sitting-out",
        isBot: false,
        hasActedThisRound: false,
        isConnected: true,
      };

      this.state = createInitialState([player], 5, 10, 1000);
      this.broadcast();
      return;
    }

    // Check if player already exists (reconnect)
    const existing = this.state.players.find(p => p.id === conn.id || p.name === name);
    if (existing) {
      this.state = {
        ...this.state,
        players: this.state.players.map(p =>
          p.id === existing.id ? { ...p, id: conn.id, isConnected: true } : p
        ),
      };
      this.broadcast();
      return;
    }

    // New player joining
    if (this.state.players.length >= 8) {
      this.sendTo(conn, { type: "error", message: "Room is full (max 8 players)" });
      return;
    }

    const player: Player = {
      id: conn.id,
      name: name.substring(0, 20),
      avatarColor: avatarColor || AVATAR_COLORS[this.state.players.length % AVATAR_COLORS.length],
      chips: this.state.phase === "waiting" ? this.state.startingStack : 0,
      holeCards: [],
      currentBet: 0,
      totalBetThisHand: 0,
      status: this.state.phase === "waiting" ? "active" : "sitting-out",
      isBot: false,
      hasActedThisRound: false,
      isConnected: true,
    };

    this.state = {
      ...this.state,
      players: [...this.state.players, player],
    };

    // Add buy-in to ledger if game has started
    if (this.state.phase !== "waiting" && player.chips > 0) {
      const entry: LedgerEntry = {
        handNumber: this.state.handNumber,
        playerId: player.id,
        playerName: player.name,
        buyIn: player.chips,
        rebuy: 0,
        potWon: 0,
      };
      this.state = { ...this.state, ledger: [...this.state.ledger, entry] };
    }

    this.broadcast();
  }

  private handleStart(conn: Party.Connection, startingStack: number, smallBlind: number, bigBlind: number) {
    if (conn.id !== this.hostId) return;
    if (!this.state || this.state.players.length < 2) return;
    if (this.state.phase !== "waiting") return;

    // Set up all players with starting stacks
    const players: Player[] = this.state.players.map(p => ({
      ...p,
      chips: startingStack,
      status: "active" as const,
    }));

    const newState = createInitialState(players, smallBlind, bigBlind, startingStack);

    // Add buy-in ledger entries
    const ledger: LedgerEntry[] = players.map(p => ({
      handNumber: 0,
      playerId: p.id,
      playerName: p.name,
      buyIn: startingStack,
      rebuy: 0,
      potWon: 0,
    }));

    this.state = { ...dealNewHand(newState), ledger };
    this.broadcast();
  }

  private handleAction(conn: Party.Connection, action: string, amount?: number) {
    if (!this.state || this.state.phase === "waiting" || this.state.phase === "showdown") return;

    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id !== conn.id) return;

    this.state = applyAction(this.state, conn.id, { type: action as any, amount });
    this.broadcast();

    // Schedule next hand after showdown
    if (this.state.phase === "showdown") {
      this.scheduleNextHand();
    }
  }

  private handleRebuy(conn: Party.Connection, amount: number) {
    if (!this.state) return;
    this.state = applyRebuy(this.state, conn.id, amount);
    this.broadcast();
  }

  private handleVoteRun(conn: Party.Connection, times: number) {
    if (!this.state || !this.state.runItVote) return;

    const votes = { ...this.state.runItVote.votes, [conn.id]: true };
    const yesVotes = Object.values(votes).filter(Boolean).length;

    if (yesVotes >= this.state.runItVote.threshold) {
      // Majority reached — run it (simplified: just continue)
      this.state = { ...this.state, runItVote: { ...this.state.runItVote, votes } };
      this.scheduleNextHand();
    } else {
      this.state = { ...this.state, runItVote: { ...this.state.runItVote, votes } };
    }

    this.broadcast();
  }

  private handleChat(conn: Party.Connection, text: string) {
    if (!this.state) return;
    const player = this.state.players.find(p => p.id === conn.id);
    if (!player) return;

    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      playerId: conn.id,
      playerName: player.name,
      avatarColor: player.avatarColor,
      text: text.substring(0, 200),
      timestamp: Date.now(),
    };

    this.state = {
      ...this.state,
      chatMessages: [...this.state.chatMessages.slice(-99), msg],
    };
    this.broadcast();
  }

  private handleEmoji(conn: Party.Connection, emoji: string) {
    if (!this.state) return;

    const reaction: EmojiReaction = {
      id: `${Date.now()}-${conn.id}`,
      playerId: conn.id,
      emoji,
      timestamp: Date.now(),
    };

    // Keep only recent reactions
    const now = Date.now();
    const recent = this.state.emojiReactions.filter(r => now - r.timestamp < 5000);

    this.state = {
      ...this.state,
      emojiReactions: [...recent, reaction],
    };
    this.broadcast();
  }

  // ── Helpers ───────────────────────────────────────

  private scheduleNextHand() {
    if (this.nextHandTimer) clearTimeout(this.nextHandTimer);
    this.nextHandTimer = setTimeout(() => {
      if (!this.state) return;
      this.state = dealNewHand(this.state);
      this.broadcast();
    }, 4000);
  }

  private broadcast() {
    if (!this.state) return;
    const msg: ServerMessage = { type: "state", state: this.state };
    this.room.broadcast(JSON.stringify(msg));
  }

  private sendTo(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }
}

PokerRoom satisfies Party.Worker;
