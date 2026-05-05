"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Signal = "BUY" | "HOLD" | "RISK HALT";
const STATES: Signal[] = ["BUY", "HOLD", "RISK HALT", "BUY", "HOLD"];

const styles: Record<Signal, { bg: string; ring: string; text: string }> = {
  BUY: { bg: "bg-emerald-500/15", ring: "ring-emerald-500/40", text: "text-emerald-300" },
  HOLD: { bg: "bg-bg-elevated", ring: "ring-border-subtle", text: "text-text-secondary" },
  "RISK HALT": { bg: "bg-red-primary/15", ring: "ring-red-glow/60", text: "text-red-glow" },
};

export function SignalPanel() {
  const [i, setI] = useState(0);
  const [conf, setConf] = useState<string | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      setConf((0.5 + Math.random() * 0.4).toFixed(2)),
    );
    const t = setInterval(() => {
      setI((p) => (p + 1) % STATES.length);
      setConf((0.5 + Math.random() * 0.4).toFixed(2));
    }, 2400);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  const s = STATES[i];
  const st = styles[s];

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          live signal
        </span>
        {s === "RISK HALT" && (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="font-mono text-[10px] uppercase tracking-widest text-red-glow"
          >
            warning
          </motion.span>
        )}
      </div>
      <div className="flex items-center justify-center py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-xl px-6 py-3 ring-1 ${st.bg} ${st.ring}`}
          >
            <span className={`font-display text-2xl font-bold tracking-tight ${st.text}`}>
              {s}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        confidence: {conf ?? "—"}
      </div>
    </div>
  );
}
