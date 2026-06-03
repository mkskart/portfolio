"use client";

import { motion } from "framer-motion";
import type { GameState } from "@/lib/poker/types";
import { ledgerRows } from "@/lib/poker/engine";
import { cn } from "@/lib/cn";

interface GameOverProps {
  state: GameState;
  mode: "humanBust" | "humanWins";
  onRebuy: () => void;
  onNewGame: () => void;
}

export function GameOverScreen({ state, mode, onRebuy, onNewGame }: GameOverProps) {
  const human = ledgerRows(state).find((r) => !r.isBot)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl border border-[#c9a84c]/40 bg-[#0a0a0a] p-7 text-center"
      >
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
          {mode === "humanWins" ? (
            <>
              You <span className="text-[#c9a84c]">Win</span>
            </>
          ) : (
            "Busted"
          )}
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {mode === "humanWins"
            ? "Every bot is out of chips. The table is yours."
            : "Your stack hit zero."}
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="text-xs uppercase tracking-widest text-white/40">
            Final P&amp;L
          </div>
          <div
            className={cn(
              "mt-1 text-3xl font-bold font-[family-name:var(--font-jetbrains-mono)]",
              human.net >= 0 ? "text-emerald-400" : "text-red-400",
            )}
          >
            {human.net >= 0 ? "+" : ""}${human.net}
          </div>
          <div className="mt-1 text-xs text-white/50">
            Stack ${human.stack} · Buy-in ${human.buyIn}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {mode === "humanBust" && (
            <button
              onClick={onRebuy}
              className="rounded-xl bg-[#c9a84c] px-6 py-3 font-bold text-black transition hover:brightness-110"
            >
              Rebuy $1,000
            </button>
          )}
          <button
            onClick={onNewGame}
            className="rounded-xl border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-[#c9a84c]/60"
          >
            New Game
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
