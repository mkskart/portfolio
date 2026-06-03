"use client";

import { motion } from "framer-motion";

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-white sm:text-5xl"
      >
        Texas <span className="text-[#c9a84c]">Hold&apos;em</span>
      </motion.h1>
      <p className="mt-3 max-w-md text-center text-sm text-white/60">
        Sit down against seven AI regulars. $1,000 stacks, $5/$10 blinds, winner
        takes the table.
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="mt-7 rounded-xl bg-[#c9a84c] px-8 py-3 text-base font-bold text-black shadow-[0_0_30px_rgba(201,168,76,0.4)]"
      >
        Sit Down
      </motion.button>
    </motion.div>
  );
}
