"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMode } from "@/lib/mode-context";
import { CircuitCanvas } from "./circuit-canvas";
import { SweHero } from "./swe-hero";
import { TradingHero } from "./trading-hero";

/**
 * Hero background. The visual swaps per mode:
 *  - firmware → animated PCB circuit traces (CircuitCanvas)
 *  - swe      → terminal typing → corruption → Matrix rain (SweHero)
 *  - quant    → simulated trading dashboard (TradingHero)
 * Each crossfades on mode change; the gradient fades to base keep the section
 * transitions clean regardless of which background is active.
 */
export function HeroScene() {
  const { mode } = useMode();

  return (
    <div className="absolute inset-0 -z-10 bg-bg-base">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {mode === "firmware" && <CircuitCanvas />}
          {mode === "swe" && <SweHero />}
          {mode === "quant" && <TradingHero />}
        </motion.div>
      </AnimatePresence>

      {/* Smooth fade to base at top + bottom for clean section transitions */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{ background: "linear-gradient(to bottom, #0a0a0a, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }}
      />
    </div>
  );
}
