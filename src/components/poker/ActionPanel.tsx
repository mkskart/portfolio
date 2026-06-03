"use client";

import { useState } from "react";
import { GameState } from "@/lib/poker/types";
import { getCallAmount, canCheck } from "@/lib/poker/game-engine";

interface ActionPanelProps {
  state: GameState;
  heroId: string;
  onAction: (action: { type: string; amount?: number }) => void;
  disabled?: boolean;
}

export function ActionPanel({ state, heroId, onAction, disabled = false }: ActionPanelProps) {
  const [raiseAmount, setRaiseAmount] = useState(state.bigBlind * 2);
  const [showRaise, setShowRaise] = useState(false);

  const hero = state.players.find(p => p.id === heroId);
  if (!hero || hero.status !== "active") return null;

  const callAmount = getCallAmount(state, heroId);
  const canCheckNow = canCheck(state, heroId);
  const minRaise = state.minRaise;
  const maxRaise = hero.chips + hero.currentBet;
  const pot = state.pot;

  const presets = [
    { label: "1/2 Pot", value: Math.max(minRaise, hero.currentBet + Math.floor(pot * 0.5)) },
    { label: "Pot", value: Math.max(minRaise, hero.currentBet + pot) },
    { label: "2x BB", value: Math.max(minRaise, hero.currentBet + state.bigBlind * 2) },
    { label: "3x BB", value: Math.max(minRaise, hero.currentBet + state.bigBlind * 3) },
  ];

  const handleRaise = () => {
    const clamped = Math.max(minRaise, Math.min(raiseAmount, maxRaise));
    onAction({ type: "raise", amount: clamped });
    setShowRaise(false);
  };

  const handleAllIn = () => {
    onAction({ type: "all-in" });
    setShowRaise(false);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl backdrop-blur-sm">
      {showRaise && (
        <div className="flex flex-col gap-2 pb-2 border-b border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Raise to</span>
            <span className="font-mono text-amber-300 font-bold">${raiseAmount}</span>
          </div>
          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            step={state.bigBlind}
            value={raiseAmount}
            onChange={e => setRaiseAmount(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <div className="flex gap-1 flex-wrap">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => setRaiseAmount(Math.min(p.value, maxRaise))}
                className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRaise}
              disabled={disabled}
              className="flex-1 py-2 rounded-lg font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50"
            >
              Raise to ${raiseAmount}
            </button>
            <button
              onClick={() => setShowRaise(false)}
              className="px-3 py-2 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {/* Fold */}
        <button
          onClick={() => onAction({ type: "fold" })}
          disabled={disabled}
          className="flex-1 min-w-[80px] py-3 rounded-lg font-bold text-sm bg-zinc-800 hover:bg-red-900/60 hover:text-red-400 text-zinc-300 border border-zinc-700 hover:border-red-800 transition-all disabled:opacity-50"
        >
          Fold
        </button>

        {/* Check or Call */}
        {canCheckNow ? (
          <button
            onClick={() => onAction({ type: "check" })}
            disabled={disabled}
            className="flex-1 min-w-[80px] py-3 rounded-lg font-bold text-sm bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-800 transition-all disabled:opacity-50"
          >
            Check
          </button>
        ) : (
          <button
            onClick={() => onAction({ type: "call" })}
            disabled={disabled || callAmount === 0}
            className="flex-1 min-w-[80px] py-3 rounded-lg font-bold text-sm bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-800 transition-all disabled:opacity-50"
          >
            Call ${callAmount}
          </button>
        )}

        {/* Raise */}
        <button
          onClick={() => {
            setRaiseAmount(Math.max(minRaise, hero.currentBet + Math.floor(pot * 0.75)));
            setShowRaise(s => !s);
          }}
          disabled={disabled || hero.chips <= callAmount}
          className="flex-1 min-w-[80px] py-3 rounded-lg font-bold text-sm bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-800 transition-all disabled:opacity-50"
        >
          Raise
        </button>

        {/* All-in */}
        <button
          onClick={handleAllIn}
          disabled={disabled || hero.chips === 0}
          className="flex-1 min-w-[80px] py-3 rounded-lg font-bold text-sm bg-red-900/50 hover:bg-red-800/70 text-red-300 border border-red-800 transition-all disabled:opacity-50"
        >
          All-in
        </button>
      </div>

      {/* Call info */}
      {!canCheckNow && callAmount > 0 && (
        <div className="text-center text-xs text-zinc-500">
          Call {callAmount} to stay in — pot is ${state.pot}
        </div>
      )}
    </div>
  );
}
