"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GameState } from "@/lib/poker/types";
import { PlayingCard } from "./Card";
import { Seat } from "./Seat";

// Seat positions around an ellipse, seat 0 (human) at bottom-center.
// 8 seats; percentages are relative to the table container.
const SEAT_POS: { left: string; top: string }[] = [
  { left: "50%", top: "98%" }, // 0 human bottom center
  { left: "12%", top: "84%" }, // 1
  { left: "2%", top: "46%" }, // 2
  { left: "16%", top: "8%" }, // 3
  { left: "50%", top: "0%" }, // 4 top center
  { left: "84%", top: "8%" }, // 5
  { left: "98%", top: "46%" }, // 6
  { left: "88%", top: "84%" }, // 7
];

interface TableProps {
  state: GameState;
  revealAll: boolean;
}

export function Table({ state, revealAll }: TableProps) {
  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-5xl">
      {/* wood rail */}
      <div className="absolute inset-0 rounded-[48%/60%] bg-[linear-gradient(145deg,#4a2c19,#2c1a10_60%,#3a2418)] shadow-2xl">
        {/* gold inner border */}
        <div className="absolute inset-[3%] rounded-[48%/60%] border-2 border-[#c9a84c]/70">
          {/* green felt */}
          <div className="absolute inset-[1.5%] rounded-[48%/60%] bg-[radial-gradient(ellipse_at_center,#1f6b41,#1a5c38_70%,#134227)] shadow-inner">
            {/* center zone outline */}
            <div className="absolute inset-[18%] rounded-[48%/60%] border border-white/10" />

            {/* center: pot + community */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <AnimatePresence>
                {state.pot > 0 && (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-full bg-black/50 px-4 py-1 text-center backdrop-blur-sm"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">
                      Pot
                    </div>
                    <div className="text-lg font-bold text-white font-[family-name:var(--font-jetbrains-mono)]">
                      ${state.pot}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 5 community slots */}
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const card = state.community[i];
                  return card ? (
                    <PlayingCard key={i} card={card} size="md" />
                  ) : (
                    <div
                      key={i}
                      className="h-[4.5rem] w-12 rounded-md border border-dashed border-white/15"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* seats */}
      {state.players.map((p) => {
        const pos = SEAT_POS[p.seat];
        return (
          <div
            key={p.seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: pos.left, top: pos.top }}
          >
            <Seat
              player={p}
              state={state}
              isHumanSeat={!p.isBot}
              reveal={revealAll}
            />
          </div>
        );
      })}
    </div>
  );
}
