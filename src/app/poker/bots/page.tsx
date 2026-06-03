"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BarChart2, RefreshCw, MessageSquare } from "lucide-react";

import { GameState, Player, BotDifficulty, EmojiReaction } from "@/lib/poker/types";
import { createInitialState, dealNewHand, applyAction, applyRebuy, isPlayerTurn, settleHand } from "@/lib/poker/game-engine";
import { getBotAction, getBotDelay } from "@/lib/poker/bot";
import { evaluateHoleCards } from "@/lib/poker/hand-evaluator";

import { PokerTable } from "@/components/poker/PokerTable";
import { ActionPanel } from "@/components/poker/ActionPanel";
import { Ledger } from "@/components/poker/Ledger";
import { RebuyModal } from "@/components/poker/RebuyModal";
import { ChipCount } from "@/components/poker/ChipCount";

import { playDealSound, playFoldSound, playChipSound, playWinSound } from "@/lib/poker/sounds";

const AVATAR_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#e91e63"];
const BOT_NAMES = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn"];
const BOT_DIFFICULTIES: BotDifficulty[] = ["easy", "medium", "hard", "medium", "easy", "hard", "medium", "easy"];

function createBotPlayer(index: number, startingStack: number): Player {
  return {
    id: `bot-${index}`,
    name: BOT_NAMES[index % BOT_NAMES.length],
    avatarColor: AVATAR_COLORS[(index + 1) % AVATAR_COLORS.length],
    chips: startingStack,
    holeCards: [],
    currentBet: 0,
    totalBetThisHand: 0,
    status: "active",
    isBot: true,
    botDifficulty: BOT_DIFFICULTIES[index % BOT_DIFFICULTIES.length],
    hasActedThisRound: false,
    isConnected: true,
  };
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${Math.random() * 100}vw`, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: Math.random() * 720 - 360, opacity: 0 }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: "linear" }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
        />
      ))}
    </div>
  );
}

function BotGameInner() {
  const searchParams = useSearchParams();
  const heroName = searchParams.get("name") || "You";
  const heroColor = searchParams.get("color") || "#e74c3c";

  const [numBots, setNumBots] = useState(3);
  const [difficulty, setDifficulty] = useState<BotDifficulty>("medium");
  const [startingStack] = useState(1000);
  const [smallBlind] = useState(5);
  const [bigBlind] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [rebuyOpen, setRebuyOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [latestReactions] = useState<EmojiReaction[]>([]);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroId = "hero";

  const logAction = useCallback((msg: string) => {
    setActionLog(prev => [msg, ...prev].slice(0, 20));
  }, []);

  const startGame = useCallback(() => {
    const heroPlayer: Player = {
      id: heroId,
      name: heroName,
      avatarColor: heroColor,
      chips: startingStack,
      holeCards: [],
      currentBet: 0,
      totalBetThisHand: 0,
      status: "active",
      isBot: false,
      hasActedThisRound: false,
      isConnected: true,
    };

    const bots = Array.from({ length: numBots }, (_, i) => {
      const bot = createBotPlayer(i, startingStack);
      bot.botDifficulty = difficulty;
      return bot;
    });

    const players = [heroPlayer, ...bots];

    // Add buy-in ledger entries
    const initial = createInitialState(players, smallBlind, bigBlind, startingStack);
    const withBuyIns = {
      ...initial,
      ledger: players.map(p => ({
        handNumber: 0,
        playerId: p.id,
        playerName: p.name,
        buyIn: startingStack,
        rebuy: 0,
        potWon: 0,
      })),
    };

    const dealtState = dealNewHand(withBuyIns);
    setGameState(dealtState);
    setGameStarted(true);
    playDealSound();
  }, [heroName, heroColor, numBots, difficulty, startingStack, smallBlind, bigBlind]);

  // Bot turn logic
  useEffect(() => {
    if (!gameState || gameState.phase === "waiting" || gameState.phase === "showdown") return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer || !currentPlayer.isBot) return;

    if (botTimerRef.current) clearTimeout(botTimerRef.current);

    botTimerRef.current = setTimeout(() => {
      setGameState(prev => {
        if (!prev) return prev;
        const bot = prev.players[prev.currentPlayerIndex];
        if (!bot || !bot.isBot) return prev;

        const action = getBotAction(prev, bot);
        logAction(`${bot.name} ${action.type}${action.type === "raise" ? ` to $${action.amount}` : ""}`);

        if (action.type === "fold") playFoldSound();
        else if (action.type === "raise" || action.type === "all-in") playChipSound();

        return applyAction(prev, bot.id, action);
      });
    }, getBotDelay());

    return () => { if (botTimerRef.current) clearTimeout(botTimerRef.current); };
  }, [gameState?.currentPlayerIndex, gameState?.phase, logAction]);

  // Auto-deal next hand after showdown
  useEffect(() => {
    if (!gameState || gameState.phase !== "showdown") return;

    const winner = gameState.lastHandResult?.winners[0];
    if (winner?.playerId === heroId) {
      setShowConfetti(true);
      playWinSound();
      setTimeout(() => setShowConfetti(false), 3000);
    }

    const timer = setTimeout(() => {
      setGameState(prev => {
        if (!prev) return prev;
        // Check if hero is busted
        const hero = prev.players.find(p => p.id === heroId);
        if (hero && hero.chips === 0) {
          setRebuyOpen(true);
          return prev;
        }
        return dealNewHand(prev);
      });
      playDealSound();
    }, 3500);

    return () => clearTimeout(timer);
  }, [gameState?.phase, gameState?.handNumber]);

  const handleAction = useCallback((action: { type: string; amount?: number }) => {
    setGameState(prev => {
      if (!prev) return prev;
      const result = applyAction(prev, heroId, { type: action.type as any, amount: action.amount });
      if (action.type === "fold") playFoldSound();
      else if (action.type === "raise" || action.type === "all-in") playChipSound();
      logAction(`You ${action.type}${action.type === "raise" ? ` to $${action.amount}` : ""}`);
      return result;
    });
  }, [logAction]);

  const handleRebuy = useCallback((amount: number) => {
    setGameState(prev => {
      if (!prev) return prev;
      const s = applyRebuy(prev, heroId, amount);
      return dealNewHand(s);
    });
    playDealSound();
  }, []);

  const heroInGame = gameState?.players.find(p => p.id === heroId);
  const heroHandEval = (gameState && heroInGame?.holeCards.length === 2)
    ? evaluateHoleCards(heroInGame.holeCards, gameState.communityCards)
    : null;

  const isHeroTurn = gameState ? isPlayerTurn(gameState, heroId) : false;

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "#0a0a0a" }}>
        <Link href="/poker" className="absolute top-4 left-4 flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🤖</div>
            <h1 className="text-3xl font-black text-zinc-100 mb-2">vs Bots</h1>
            <p className="text-zinc-500 text-sm">Single-player Texas Hold'em</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 mb-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Number of Bots</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6, 7].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumBots(n)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all
                      ${numBots === n ? "bg-amber-600 border-amber-400 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Bot Difficulty</label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as BotDifficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all capitalize
                      ${difficulty === d ? "bg-amber-600 border-amber-400 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-zinc-500 pt-1 border-t border-zinc-800">
              <div>Stack: <span className="text-zinc-300 font-mono">${startingStack}</span></div>
              <div>Blinds: <span className="text-zinc-300 font-mono">{smallBlind}/{bigBlind}</span></div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-xl font-black text-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-lg"
          >
            Deal Cards
          </button>
        </motion.div>
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a" }}>
      {showConfetti && <Confetti />}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-sm">
        <Link href="/poker" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={15} /> Lobby
        </Link>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>Hand #{gameState.handNumber}</span>
          <span className="uppercase text-amber-400/60">{gameState.phase}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRebuyOpen(true)}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <RefreshCw size={12} /> Rebuy
          </button>
          <button
            onClick={() => setLedgerOpen(true)}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <BarChart2 size={12} /> Ledger
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col gap-2 p-2 md:p-4 max-w-4xl w-full mx-auto">
        <PokerTable state={gameState} heroId={heroId} latestReactions={latestReactions} />

        {/* Last hand result */}
        <AnimatePresence>
          {gameState.phase === "showdown" && gameState.lastHandResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-2"
            >
              {gameState.lastHandResult.winners.map(w => (
                <div key={w.playerId} className="text-sm">
                  <span className="text-amber-400 font-bold">{w.playerName}</span>
                  <span className="text-zinc-400"> wins </span>
                  <span className="text-amber-300 font-mono font-bold">${w.amount}</span>
                  {w.handDescription !== "Last player standing" && (
                    <span className="text-zinc-500"> — {w.handDescription}</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hand strength indicator */}
        {heroHandEval && gameState.phase !== "showdown" && gameState.phase !== "waiting" && (
          <div className="text-center text-xs text-zinc-500">
            Your hand: <span className="text-amber-400 font-medium">{heroHandEval.description}</span>
          </div>
        )}

        {/* Action panel */}
        {isHeroTurn && gameState.phase !== "showdown" && (
          <ActionPanel
            state={gameState}
            heroId={heroId}
            onAction={handleAction}
          />
        )}

        {!isHeroTurn && gameState.phase !== "showdown" && gameState.phase !== "waiting" && (
          <div className="text-center text-sm text-zinc-600 py-2">
            Waiting for {gameState.players[gameState.currentPlayerIndex]?.name}...
          </div>
        )}

        {/* Action log */}
        {actionLog.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 max-h-24 overflow-y-auto">
            {actionLog.map((msg, i) => (
              <div key={i} className={`text-xs ${i === 0 ? "text-zinc-400" : "text-zinc-600"}`}>
                {msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Ledger entries={gameState.ledger} open={ledgerOpen} onClose={() => setLedgerOpen(false)} />
      <RebuyModal
        open={rebuyOpen}
        startingStack={startingStack}
        onRebuy={handleRebuy}
        onClose={() => setRebuyOpen(false)}
      />
    </div>
  );
}

export default function BotGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-4xl animate-pulse">🃏</div>
      </div>
    }>
      <BotGameInner />
    </Suspense>
  );
}
