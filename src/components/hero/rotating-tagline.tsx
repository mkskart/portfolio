"use client";

import { useEffect, useState } from "react";

const TAGS = [
  "ECE @ UT AUSTIN",
  "EMBEDDED ENGINEER",
  "TRADER",
  "PROFESSIONAL VIOLINIST",
];

const SWAP_MS = 3000;
const FADE_MS = 300;

/**
 * Cycling tagline framed by static red brackets. Opacity-only crossfade —
 * no transforms or filters that would force layout, and the brackets never
 * unmount so they're stable.
 */
export function RotatingTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % TAGS.length);
        setVisible(true);
      }, FADE_MS);
    }, SWAP_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center justify-center gap-3 font-mono text-sm tracking-[0.3em] text-text-primary md:text-base"
      aria-live="polite"
    >
      <span className="text-red-glow" aria-hidden>[</span>
      <span
        className="inline-block whitespace-nowrap text-center"
        style={{
          minWidth: "min(360px, 80vw)",
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        {TAGS[index]}
      </span>
      <span className="text-red-glow" aria-hidden>]</span>
    </div>
  );
}
