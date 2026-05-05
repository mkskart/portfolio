"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const NAME = "KARTHEEK MUKKAVILLI";

export function ResumeHeader() {
  return (
    <header className="pb-10">
      <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tighter md:text-7xl">
        {NAME.split(" ").map((word, wi) => (
          <span key={wi} className="mr-3 inline-block overflow-hidden align-bottom">
            {word.split("").map((ch, ci) => (
              <motion.span
                key={ci}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 * (wi * 8 + ci), ease }}
                className="inline-block"
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6, ease }}
        className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm text-text-secondary"
      >
        <span>Austin, TX</span>
        <span>·</span>
        <a href="tel:+18327523951" className="hover:text-red-glow">
          +1 832-752-3951
        </a>
        <span>·</span>
        <a href="mailto:kartheek.mukkavilli@gmail.com" className="hover:text-red-glow">
          kartheek.mukkavilli@gmail.com
        </a>
        <span>·</span>
        <span>U.S. Citizen</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-text-muted"
      >
        <a
          href="https://www.linkedin.com/in/kartheek-mukkavilli/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-glow"
        >
          linkedin.com/in/kartheek-mukkavilli
        </a>
        <a
          href="https://github.com/mkskart"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-glow"
        >
          github.com/mkskart
        </a>
      </motion.div>
    </header>
  );
}
