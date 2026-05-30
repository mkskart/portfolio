"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { NameDisplay } from "./name-display";
import { RotatingTagline } from "./rotating-tagline";
import { ModeToggle } from "@/components/mode-toggle";
import { useMode } from "@/lib/mode-context";
import { SWE_NAME_REVEAL_MS } from "./swe-timing";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  { ssr: false, loading: () => null },
);

// In SWE mode the terminal types out, then dissolves into Matrix rain. The
// name emerges partway through that corruption (see swe-hero.tsx).
const SWE_REVEAL_DELAY_MS = SWE_NAME_REVEAL_MS;

export function Hero() {
  const { mode } = useMode();
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    if (mode !== "swe") {
      // Defer to rAF rather than setState synchronously in the effect body.
      const raf = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(raf);
    }
    // Let the terminal play first, then bring the overlay in.
    const hide = requestAnimationFrame(() => setRevealed(false));
    const show = window.setTimeout(() => setRevealed(true), SWE_REVEAL_DELAY_MS);
    return () => {
      cancelAnimationFrame(hide);
      clearTimeout(show);
    };
  }, [mode]);

  return (
    <section className="relative isolate flex h-[100svh] w-full items-center justify-center overflow-hidden">
      <HeroScene />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-[1400px] px-6 text-center"
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 16 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: revealed ? "auto" : "none" }}
      >
        <NameDisplay />
        <div className="mt-6 flex justify-center md:mt-8">
          <ModeToggle />
        </div>
        <div className="mt-5 md:mt-6">
          <RotatingTagline />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-text-muted"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em]">scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
