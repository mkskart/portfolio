"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { NameDisplay } from "./name-display";
import { RotatingTagline } from "./rotating-tagline";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  { ssr: false, loading: () => null },
);

export function Hero() {
  return (
    <section className="relative isolate flex h-[100svh] w-full items-center justify-center overflow-hidden">
      <HeroScene />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 text-center">
        <NameDisplay />
        <div className="mt-6 md:mt-8">
          <RotatingTagline />
        </div>
      </div>

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
