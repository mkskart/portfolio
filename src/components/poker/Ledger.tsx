"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LedgerEntry } from "@/lib/poker/types";
import { X } from "lucide-react";

interface LedgerProps {
  entries: LedgerEntry[];
  open: boolean;
  onClose: () => void;
}

interface PlayerSummary {
  playerId: string;
  playerName: string;
  buyIns: number;
  rebuys: number;
  winnings: number;
  net: number;
}

export function Ledger({ entries, open, onClose }: LedgerProps) {
  // Summarize per player
  const summaryMap = new Map<string, PlayerSummary>();

  for (const e of entries) {
    if (!summaryMap.has(e.playerId)) {
      summaryMap.set(e.playerId, {
        playerId: e.playerId,
        playerName: e.playerName,
        buyIns: 0,
        rebuys: 0,
        winnings: 0,
        net: 0,
      });
    }
    const s = summaryMap.get(e.playerId)!;
    s.buyIns += e.buyIn;
    s.rebuys += e.rebuy;
    s.winnings += e.potWon;
    s.net = s.winnings - s.buyIns - s.rebuys;
  }

  const summaries = [...summaryMap.values()].sort((a, b) => b.net - a.net);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100">Ledger</h2>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Summary table */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="text-left p-3">Player</th>
                    <th className="text-right p-3">Buy-in</th>
                    <th className="text-right p-3">Rebuys</th>
                    <th className="text-right p-3">Won</th>
                    <th className="text-right p-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map(s => (
                    <tr key={s.playerId} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="p-3 text-zinc-200 font-medium">{s.playerName}</td>
                      <td className="p-3 text-right text-zinc-400 font-mono">${s.buyIns}</td>
                      <td className="p-3 text-right text-zinc-400 font-mono">${s.rebuys}</td>
                      <td className="p-3 text-right text-amber-400 font-mono">${s.winnings}</td>
                      <td className={`p-3 text-right font-mono font-bold ${s.net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {s.net >= 0 ? "+" : ""}{s.net}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Hand log */}
              {entries.length > 0 && (
                <div className="p-3">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Hand Log</h3>
                  <div className="space-y-1">
                    {entries.filter(e => e.potWon > 0).map((e, i) => (
                      <div key={i} className="flex justify-between text-xs text-zinc-400">
                        <span>Hand #{e.handNumber}</span>
                        <span>{e.playerName}</span>
                        <span className="text-amber-400">+${e.potWon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
