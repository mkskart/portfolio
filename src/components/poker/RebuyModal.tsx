"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RebuyModalProps {
  open: boolean;
  startingStack: number;
  onRebuy: (amount: number) => void;
  onClose: () => void;
}

export function RebuyModal({ open, startingStack, onRebuy, onClose }: RebuyModalProps) {
  const [amount, setAmount] = useState(startingStack);

  const presets = [startingStack / 2, startingStack, startingStack * 2].filter(v => v > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-zinc-100 mb-4 text-center">Rebuy</h2>

            <div className="flex gap-2 mb-4">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors
                    ${amount === p ? "bg-amber-600 border-amber-400 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"}`}
                >
                  ${p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-zinc-400 text-sm">Custom:</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { onRebuy(amount); onClose(); }}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors"
              >
                Rebuy ${amount}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
