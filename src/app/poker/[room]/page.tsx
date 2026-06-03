"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BarChart2, Copy, Check, Send, RefreshCw, MessageSquare } from "lucide-react";
import PartySocket from "partysocket";

import { GameState, ClientMessage, ServerMessage, EmojiReaction, ChatMessage } from "@/lib/poker/types";
import { isPlayerTurn } from "@/lib/poker/game-engine";
import { evaluateHoleCards } from "@/lib/poker/hand-evaluator";

import { PokerTable } from "@/components/poker/PokerTable";
import { ActionPanel } from "@/components/poker/ActionPanel";
import { Ledger } from "@/components/poker/Ledger";
import { RebuyModal } from "@/components/poker/RebuyModal";
import { RunItVoteModal } from "@/components/poker/RunItVoteModal";
import { ChipCount } from "@/components/poker/ChipCount";

import { playDealSound, playFoldSound, playChipSound, playWinSound } from "@/lib/poker/sounds";

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";
const EMOJI_OPTIONS = ["👏", "🔥", "😱", "😂", "💀", "🎉"];

function Confetti() {
  const AVATAR_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"];
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

interface RoomPageProps {
  params: Promise<{ room: string }>;
}

function RoomPageInner({ params }: RoomPageProps) {
  const { room: roomCode } = use(params);
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Player";
  const avatarColor = searchParams.get("color") || "#e74c3c";
  const isHost = searchParams.get("host") === "1";
  const startingStack = Number(searchParams.get("stack") || 1000);
  const smallBlind = Number(searchParams.get("sb") || 5);
  const bigBlind = Number(searchParams.get("bb") || 10);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [heroId, setHeroId] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [rebuyOpen, setRebuyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [latestReactions, setLatestReactions] = useState<EmojiReaction[]>([]);
  const [prevPhase, setPrevPhase] = useState<string | null>(null);

  const socketRef = useRef<PartySocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(msg));
  }, []);

  useEffect(() => {
    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomCode.toLowerCase(),
    });
    socketRef.current = socket;

    // Get socket ID for hero identification
    const id = socket.id || `player-${Math.random().toString(36).slice(2, 8)}`;
    setHeroId(id);

    socket.addEventListener("open", () => {
      setConnected(true);
      socket.send(JSON.stringify({ type: "join", name, avatarColor } satisfies ClientMessage));
    });

    socket.addEventListener("message", (evt) => {
      try {
        const msg = JSON.parse(evt.data) as ServerMessage;
        if (msg.type === "state") {
          setGameState(msg.state);
        } else if (msg.type === "error") {
          setError(msg.message);
        } else if (msg.type === "room_info") {
          // room_info is handled via state
        }
      } catch {
        // ignore malformed messages
      }
    });

    socket.addEventListener("close", () => setConnected(false));
    socket.addEventListener("error", () => setError("Connection error"));

    return () => socket.close();
  }, [roomCode, name, avatarColor]);

  // Detect phase change for sounds
  useEffect(() => {
    if (!gameState) return;
    if (gameState.phase !== prevPhase) {
      if (gameState.phase === "preflop" && prevPhase !== "preflop") playDealSound();
      if (gameState.phase === "showdown") {
        const hero = gameState.players.find(p => p.id === heroId);
        const isWinner = gameState.lastHandResult?.winners.some(w => w.playerId === heroId);
        if (isWinner) { setShowConfetti(true); playWinSound(); setTimeout(() => setShowConfetti(false), 3000); }
      }
      setPrevPhase(gameState.phase);
    }
  }, [gameState?.phase, heroId, prevPhase]);

  // Update latest reactions
  useEffect(() => {
    if (!gameState) return;
    const now = Date.now();
    const recent = gameState.emojiReactions.filter(r => now - r.timestamp < 3000);
    setLatestReactions(recent);
  }, [gameState?.emojiReactions]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState?.chatMessages.length]);

  const handleAction = useCallback((action: { type: string; amount?: number }) => {
    send({ type: "action", action: action.type as any, amount: action.amount });
    if (action.type === "fold") playFoldSound();
    else if (action.type === "raise" || action.type === "all-in") playChipSound();
  }, [send]);

  const handleStart = useCallback(() => {
    send({ type: "start", startingStack, smallBlind, bigBlind });
  }, [send, startingStack, smallBlind, bigBlind]);

  const handleRebuy = useCallback((amount: number) => {
    send({ type: "rebuy", amount });
  }, [send]);

  const handleVote = useCallback((times: number) => {
    send({ type: "vote_run", times });
  }, [send]);

  const handleSendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    send({ type: "chat", text });
    setChatInput("");
  }, [chatInput, send]);

  const handleEmoji = useCallback((emoji: string) => {
    send({ type: "emoji", emoji });
  }, [send]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🃏</div>
          <p className="text-zinc-400 text-sm">Connecting to room {roomCode}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/poker" className="text-amber-400 hover:underline text-sm">← Back to lobby</Link>
        </div>
      </div>
    );
  }

  const hero = gameState?.players.find(p => p.id === heroId || p.name === name);
  const effectiveHeroId = hero?.id || heroId;
  const isHeroTurn = gameState ? isPlayerTurn(gameState, effectiveHeroId) : false;
  const heroHandEval = (gameState && hero?.holeCards?.length === 2)
    ? evaluateHoleCards(hero.holeCards, gameState.communityCards)
    : null;

  const chatMessages = gameState?.chatMessages || [];
  const isWaiting = !gameState || gameState.phase === "waiting";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a" }}>
      {showConfetti && <Confetti />}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-sm">
        <Link href="/poker" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={15} /> Lobby
        </Link>

        {/* Room code */}
        <button
          onClick={copyRoomCode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <span className="font-mono text-sm font-bold text-amber-400 tracking-wider">{roomCode}</span>
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-zinc-500 group-hover:text-zinc-400" />}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatOpen(s => !s)}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <MessageSquare size={12} /> Chat
          </button>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Main game area */}
        <div className="flex-1 flex flex-col gap-2 p-2 md:p-4 max-w-4xl mx-auto w-full">
          {/* Waiting lobby */}
          {isWaiting && (
            <div className="text-center py-8">
              <p className="text-zinc-400 mb-2 text-sm">
                {gameState?.players.length ?? 0} player{(gameState?.players.length ?? 0) !== 1 ? "s" : ""} in room
              </p>
              {isHost && (
                <button
                  onClick={handleStart}
                  disabled={!gameState || gameState.players.length < 2}
                  className="px-8 py-3 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-40"
                >
                  Start Game
                </button>
              )}
              {!isHost && (
                <p className="text-zinc-500 text-xs">Waiting for host to start...</p>
              )}
              {/* Player list */}
              {gameState && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {gameState.players.map(p => (
                    <div key={p.id} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.avatarColor }} />
                      <span className="text-zinc-300">{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {gameState && !isWaiting && (
            <>
              <PokerTable state={gameState} heroId={effectiveHeroId} latestReactions={latestReactions} />

              {/* Phase info */}
              <div className="flex items-center justify-between text-xs text-zinc-600 px-1">
                <span>Hand #{gameState.handNumber}</span>
                <span className="uppercase text-amber-400/60">{gameState.phase}</span>
                {gameState.pot > 0 && <ChipCount amount={gameState.pot} size="sm" />}
              </div>

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

              {/* Hand strength */}
              {heroHandEval && gameState.phase !== "showdown" && (
                <div className="text-center text-xs text-zinc-500">
                  Your hand: <span className="text-amber-400 font-medium">{heroHandEval.description}</span>
                </div>
              )}

              {/* Emoji reactions */}
              <div className="flex justify-center gap-2">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => handleEmoji(e)}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>

              {/* Action panel */}
              {isHeroTurn && gameState.phase !== "showdown" && (
                <ActionPanel
                  state={gameState}
                  heroId={effectiveHeroId}
                  onAction={handleAction}
                />
              )}

              {!isHeroTurn && gameState.phase !== "showdown" && (
                <div className="text-center text-sm text-zinc-600 py-2">
                  Waiting for {gameState.players[gameState.currentPlayerIndex]?.name}...
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat sidebar */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-zinc-900 bg-zinc-950 flex flex-col overflow-hidden"
            >
              <div className="p-3 border-b border-zinc-900 text-sm font-medium text-zinc-300">Chat</div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="text-xs">
                    <span className="font-bold" style={{ color: msg.avatarColor }}>{msg.playerName}: </span>
                    <span className="text-zinc-400">{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-zinc-900 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendChat()}
                  placeholder="Message..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
                <button onClick={handleSendChat} className="text-zinc-400 hover:text-zinc-200 transition-colors">
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <RunItVoteModal vote={gameState?.runItVote || null} heroId={effectiveHeroId} onVote={handleVote} />
      <Ledger entries={gameState?.ledger || []} open={ledgerOpen} onClose={() => setLedgerOpen(false)} />
      <RebuyModal
        open={rebuyOpen}
        startingStack={gameState?.startingStack || 1000}
        onRebuy={(amount) => { handleRebuy(amount); setRebuyOpen(false); }}
        onClose={() => setRebuyOpen(false)}
      />
    </div>
  );
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-4xl animate-pulse">🃏</div>
      </div>
    }>
      <RoomPageInner params={params} />
    </Suspense>
  );
}
