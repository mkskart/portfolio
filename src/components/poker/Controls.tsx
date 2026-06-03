"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { GameState, PlayerAction } from "@/lib/poker/types";
import { getConstraints, RAISE_INCREMENT } from "@/lib/poker/engine";
import { cn } from "@/lib/cn";

interface ControlsProps {
  state: GameState;
  humanSeat: number;
  onAction: (action: PlayerAction) => void;
}

function snap(value: number, min: number, max: number): number {
  const snapped = Math.round(value / RAISE_INCREMENT) * RAISE_INCREMENT;
  return Math.max(min, Math.min(snapped, max));
}

export function Controls({ state, humanSeat, onAction }: ControlsProps) {
  const isTurn = state.toAct === humanSeat;
  const c = getConstraints(state, humanSeat);
  // Reset the slider whenever the betting context changes by keying the value
  // to a signature and storing the user override alongside it.
  const sig = `${state.handNumber}:${state.currentBet}:${state.toAct}`;
  const [override, setOverride] = useState<{ sig: string; value: number } | null>(
    null,
  );
  const raiseTo = override && override.sig === sig ? override.value : c.minRaiseTo;
  const setRaiseTo = (v: number) => setOverride({ sig, value: v });

  if (!isTurn) return null;

  const potTotal =
    state.pot + state.players.reduce((s, p) => s + p.committed, 0);
  const presets: { label: string; to: number }[] = [
    { label: "Min", to: c.minRaiseTo },
    { label: "2x", to: snap(state.currentBet * 2 || RAISE_INCREMENT * 2, c.minRaiseTo, c.maxRaiseTo) },
    { label: "3x", to: snap(state.currentBet * 3 || RAISE_INCREMENT * 3, c.minRaiseTo, c.maxRaiseTo) },
    { label: "Pot", to: snap(state.currentBet + potTotal, c.minRaiseTo, c.maxRaiseTo) },
    { label: "All-in", to: c.maxRaiseTo },
  ];

  const callLabel = c.canCheck ? "Check" : `Call $${c.callAmount}`;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-[#c9a84c]/40 bg-black/80 p-3 shadow-[0_0_24px_rgba(201,168,76,0.25)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* fold + check/call */}
        <div className="flex gap-2">
          <button
            onClick={() => onAction({ type: "fold" })}
            className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Fold
          </button>
          <button
            onClick={() =>
              onAction({ type: c.canCheck ? "check" : "call" })
            }
            className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            {callLabel}
          </button>
        </div>

        {/* raise controls */}
        {c.canRaise && (
          <div className="flex flex-1 items-center gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap gap-1">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setRaiseTo(p.to)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[11px] font-semibold transition",
                      raiseTo === p.to
                        ? "border-[#c9a84c] bg-[#c9a84c]/20 text-[#c9a84c]"
                        : "border-white/15 text-white/70 hover:border-[#c9a84c]/50",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={c.minRaiseTo}
                max={c.maxRaiseTo}
                step={RAISE_INCREMENT}
                value={raiseTo}
                onChange={(e) =>
                  setRaiseTo(snap(Number(e.target.value), c.minRaiseTo, c.maxRaiseTo))
                }
                className="w-full accent-[#c9a84c]"
              />
            </div>
            <div className="flex flex-col items-stretch gap-1">
              <div className="text-center text-base font-bold text-[#c9a84c] font-[family-name:var(--font-jetbrains-mono)]">
                ${raiseTo}
              </div>
              <button
                onClick={() =>
                  onAction(
                    raiseTo >= c.maxRaiseTo
                      ? { type: "allin" }
                      : { type: "raise", amount: raiseTo },
                  )
                }
                className="rounded-lg bg-[#c9a84c] px-5 py-2 text-sm font-bold text-black transition hover:brightness-110"
              >
                {raiseTo >= c.maxRaiseTo ? "All-in" : "Raise"}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
