"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function KonamiFlash() {
  return (
    <motion.div
      key="konami"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.08 }}
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      {/* White flash → red wash slams in */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.06 }}
        style={{ background: "#E10600" }}
      />
      {/* Concentric burst lines */}
      <motion.div
        className="absolute h-2 w-2 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 60, opacity: 0 }}
        transition={{ delay: 0.45, duration: 0.7, ease }}
        style={{
          boxShadow: "0 0 0 2px #FFFFFF, 0 0 0 8px rgba(255,255,255,0.4)",
        }}
      />
      {/* Text zoom in/out */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0, letterSpacing: "0.5em" }}
        animate={{
          scale: [0.4, 1.05, 1, 1, 1.4],
          opacity: [0, 1, 1, 1, 0],
          letterSpacing: ["0.5em", "0.4em", "0.4em", "0.4em", "0.6em"],
        }}
        transition={{
          delay: 0.5,
          duration: 0.7,
          times: [0, 0.2, 0.4, 0.7, 1],
          ease,
        }}
        className="relative z-10"
      >
        <span className="font-mono text-5xl font-bold uppercase text-white md:text-7xl">
          DRS ENABLED
        </span>
      </motion.div>
    </motion.div>
  );
}
