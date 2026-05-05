"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = ["KARTHEEK", "MUKKAVILLI"];

interface Frag {
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

// Each letter splits into N fragments. Fragments are computed lazily client-side
// to avoid SSR/CSR randomness mismatch.
const FRAGMENTS_PER_LETTER = 10;

function makeFragmentsForLetter(): Frag[] {
  return Array.from({ length: FRAGMENTS_PER_LETTER }).map(() => ({
    x: (Math.random() - 0.5) * 480,
    y: (Math.random() - 0.5) * 360,
    rotate: (Math.random() - 0.5) * 720,
    scale: 0.2 + Math.random() * 0.4,
  }));
}

export function NameDisplay() {
  const [shatterKey, setShatterKey] = useState(0);
  // 2D map: line index → letter index → fragment[].
  // Empty on server; populated on first shatter trigger to keep SSR pure.
  const [fragMap, setFragMap] = useState<Frag[][][]>([]);

  // Pre-warm fragment map on mount so the first shatter is instant.
  // Wrapped in rAF to satisfy react-hooks/set-state-in-effect.
  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      setFragMap(
        LINES.map((line) =>
          line.split("").map(() => makeFragmentsForLetter()),
        ),
      ),
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  const onClick = () => {
    setShatterKey((prev) => {
      const next = prev + 1;
      if (next % 5 === 0) {
        setFragMap(
          LINES.map((line) =>
            line.split("").map(() => makeFragmentsForLetter()),
          ),
        );
        return next;
      }
      return prev;
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Kartheek Mukkavilli"
      className="relative block w-full cursor-pointer select-none focus:outline-none"
    >
      <AnimatePresence mode="popLayout">
        <h1
          key={shatterKey}
          className="font-display font-bold leading-[0.92] tracking-[-0.04em] text-text-primary"
          style={{ fontSize: "clamp(3rem, 13vw, 9.5rem)" }}
        >
          {LINES.map((line, li) => (
            <div key={li} className="flex justify-center overflow-visible">
              {line.split("").map((ch, ci) => {
                const isShatter = shatterKey > 0;
                const frags = fragMap[li]?.[ci];
                if (isShatter && frags) {
                  return (
                    <span
                      key={ci}
                      className="relative inline-block"
                      style={{
                        width: ch === "I" ? "0.45em" : "0.62em",
                      }}
                    >
                      {/* Reformed letter that fades back in */}
                      <motion.span
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: 0.9 + ci * 0.02,
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {ch}
                      </motion.span>
                      {/* Particle fragments — small letter copies that fly out */}
                      {frags.map((f, fi) => (
                        <motion.span
                          key={fi}
                          className="absolute inset-0 flex items-center justify-center text-red-glow"
                          style={{ opacity: 0.55 }}
                          initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 0.9 }}
                          animate={{
                            x: f.x,
                            y: f.y,
                            scale: f.scale,
                            rotate: f.rotate,
                            opacity: 0,
                          }}
                          transition={{
                            delay: ci * 0.015,
                            duration: 1.0 + (fi % 3) * 0.1,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </span>
                  );
                }
                // Initial mask-swipe reveal (one-time)
                return (
                  <motion.span
                    key={ci}
                    className="inline-block"
                    initial={{ y: "1.05em", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.85,
                      delay: 0.04 * (li * 8 + ci),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </div>
          ))}
        </h1>
      </AnimatePresence>
    </button>
  );
}
