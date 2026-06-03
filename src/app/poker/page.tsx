"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import type { GameState, PlayerAction } from "@/lib/poker/types";
import {
  applyAction,
  createInitialState,
  createPlayers,
  rebuyHuman,
  startHand,
} from "@/lib/poker/engine";
import { botThinkDelay, decideBotAction } from "@/lib/poker/bot";
import { Table } from "@/components/poker/Table";
import { Controls } from "@/components/poker/Controls";
import { Ledger } from "@/components/poker/Ledger";
import { StartScreen } from "@/components/poker/StartScreen";
import { GameOverScreen } from "@/components/poker/GameOverScreen";

const HUMAN_SEAT = 0;

type Action =
  | { type: "START" }
  | { type: "PLAYER_ACTION"; seat: number; action: PlayerAction }
  | { type: "NEXT_HAND" }
  | { type: "REBUY" }
  | { type: "NEW_GAME" };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
    case "NEW_GAME":
      return startHand(createInitialState(createPlayers()));
    case "PLAYER_ACTION":
      return applyAction(state, action.seat, action.action);
    case "NEXT_HAND":
      return startHand(state);
    case "REBUY":
      return startHand(rebuyHuman(state));
    default:
      return state;
  }
}

export default function PokerPage() {
  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => createInitialState(createPlayers()),
  );
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const human = state.players[HUMAN_SEAT];
  const liveCount = state.players.filter((p) => !p.busted).length;
  const botsLive = state.players.filter((p) => p.isBot && !p.busted).length;
  const humanBust = human.busted;
  const humanWins = started && botsLive === 0 && !humanBust;
  const gameOver = started && (humanBust || humanWins);

  // Drive bot turns with a thinking delay.
  useEffect(() => {
    if (!started || gameOver) return;
    if (state.phase === "handover" || state.phase === "idle") return;
    const seat = state.toAct;
    if (seat < 0) return;
    const p = state.players[seat];
    if (!p.isBot) return;

    const delay = botThinkDelay();
    timerRef.current = setTimeout(() => {
      const decision = decideBotAction(state, seat);
      dispatch({ type: "PLAYER_ACTION", seat, action: decision });
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, started, gameOver]);

  // Auto-deal next hand after showdown.
  useEffect(() => {
    if (!started || gameOver) return;
    if (state.phase !== "handover") return;
    if (liveCount < 2) return;
    const t = setTimeout(() => dispatch({ type: "NEXT_HAND" }), 2500);
    return () => clearTimeout(t);
  }, [state.phase, state.handNumber, started, gameOver, liveCount]);

  const handleStart = useCallback(() => {
    setStarted(true);
    dispatch({ type: "START" });
  }, []);

  const handleAction = useCallback((act: PlayerAction) => {
    dispatch({ type: "PLAYER_ACTION", seat: HUMAN_SEAT, action: act });
  }, []);

  const handleRebuy = useCallback(() => {
    dispatch({ type: "REBUY" });
  }, []);

  const handleNewGame = useCallback(() => {
    setStarted(true);
    dispatch({ type: "NEW_GAME" });
  }, []);

  const revealAll = state.phase === "handover" && state.winningSeats.length > 0;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0a] text-white">
      {/* back link */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-50 text-sm text-white/50 transition hover:text-[#c9a84c]"
      >
        ← back
      </Link>

      {/* ledger top-right */}
      <div className="absolute right-4 top-4 z-40">
        <Ledger state={state} />
      </div>

      {/* table */}
      <div className="flex h-full w-full items-center justify-center px-4 py-16">
        <Table state={state} revealAll={revealAll} />
      </div>

      {/* hand info / showdown banner */}
      {revealAll && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 text-center text-sm text-[#c9a84c] backdrop-blur">
          {state.log[state.log.length - 1]}
        </div>
      )}

      {/* controls bottom-center */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 flex w-full -translate-x-1/2 justify-center px-4">
        {started && !gameOver && (
          <Controls state={state} humanSeat={HUMAN_SEAT} onAction={handleAction} />
        )}
      </div>

      <AnimatePresence>
        {!started && <StartScreen onStart={handleStart} />}
      </AnimatePresence>

      <AnimatePresence>
        {gameOver && (
          <GameOverScreen
            state={state}
            mode={humanWins ? "humanWins" : "humanBust"}
            onRebuy={handleRebuy}
            onNewGame={handleNewGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
