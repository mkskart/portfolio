"use client";

import { motion } from "framer-motion";
import { useMode } from "@/lib/mode-context";
import { MODES, MODE_LABELS } from "@/lib/mode";

export function ModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <div
      role="tablist"
      aria-label="Site mode"
      className="flex items-center gap-1 rounded-full border border-border-subtle bg-bg-elevated/60 p-1 backdrop-blur"
    >
      {MODES.map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(m)}
            className={`relative rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors duration-200 ${
              active ? "text-white" : "text-text-muted hover:text-text-primary"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 rounded-full bg-red-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{MODE_LABELS[m]}</span>
          </button>
        );
      })}
    </div>
  );
}
