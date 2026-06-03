"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RunItVote } from "@/lib/poker/types";

interface RunItVoteModalProps {
  vote: RunItVote | null;
  heroId: string;
  onVote: (times: number) => void;
}

export function RunItVoteModal({ vote, heroId, onVote }: RunItVoteModalProps) {
  if (!vote) return null;

  const yesVotes = Object.values(vote.votes).filter(Boolean).length;
  const hasVoted = heroId in vote.votes;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
      >
        <div className="bg-zinc-900 border border-amber-600/40 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
          <h2 className="text-xl font-bold text-amber-300 mb-2 text-center">Run It Twice?</h2>
          <p className="text-zinc-400 text-sm text-center mb-4">
            All players are all-in. Vote to run the remaining board cards {vote.times} times.
          </p>

          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: vote.threshold }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold
                  ${i < yesVotes ? "bg-emerald-600 border-emerald-400 text-white" : "border-zinc-700 text-zinc-600"}`}
              >
                {i < yesVotes ? "✓" : "?"}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-zinc-500 mb-4">
            {yesVotes}/{vote.threshold} votes to run it {vote.times}x
          </p>

          {!hasVoted && (
            <div className="flex gap-3">
              <button
                onClick={() => onVote(vote.times)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-800 hover:bg-emerald-700 text-emerald-200 border border-emerald-600 transition-colors"
              >
                ✓ Run it {vote.times}x
              </button>
              <button
                onClick={() => onVote(1)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
              >
                ✕ Run it once
              </button>
            </div>
          )}

          {hasVoted && (
            <p className="text-center text-zinc-400 text-sm">
              Waiting for other players to vote...
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
