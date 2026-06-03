"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameState } from "@/lib/poker/types";
import { ledgerRows } from "@/lib/poker/engine";
import { cn } from "@/lib/cn";

export function Ledger({ state }: { state: GameState }) {
  const [open, setOpen] = useState(false);
  const rows = ledgerRows(state);

  return (
    <div className="pointer-events-auto">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-white/15 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur hover:border-[#c9a84c]/60"
      >
        {open ? "Hide" : "Ledger"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-2 w-72 rounded-xl border border-white/10 bg-black/85 p-3 backdrop-blur-md"
          >
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5 text-[11px]">
              <div className="text-white/40 uppercase tracking-wide">Player</div>
              <div className="text-right text-white/40 uppercase tracking-wide">Stack</div>
              <div className="text-right text-white/40 uppercase tracking-wide">P&amp;L</div>
              {rows.map((r) => (
                <div key={r.seat} className="contents">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className={cn("truncate text-white/85", r.busted && "line-through opacity-50")}>
                      {r.name}
                    </span>
                  </div>
                  <div className="text-right font-[family-name:var(--font-jetbrains-mono)] text-white/85">
                    ${r.stack}
                  </div>
                  <div
                    className={cn(
                      "text-right font-[family-name:var(--font-jetbrains-mono)] font-semibold",
                      r.net > 0 ? "text-emerald-400" : r.net < 0 ? "text-red-400" : "text-white/50",
                    )}
                  >
                    {r.net > 0 ? "+" : ""}
                    {r.net}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 border-t border-white/10 pt-1.5 text-[10px] text-white/40">
              Buy-in $1,000 each
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
