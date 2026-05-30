"use client";

import { useEffect, useState } from "react";
import { useMode } from "@/lib/mode-context";
import { MODE_CONTENT } from "@/lib/mode-content";

const SWAP_MS = 3000;
const FADE_MS = 300;

/**
 * Cycling tagline framed by static red brackets. The cycle list is driven by
 * the active site mode. Opacity-only crossfade — no transforms or filters that
 * would force layout, and the brackets never unmount so they're stable.
 */
export function RotatingTagline() {
  const { mode } = useMode();
  const tags = MODE_CONTENT[mode].subtitleCycle;

  // `tick` only ever increments on the interval; the displayed index is derived
  // from it against the current mode's list, so switching modes swaps the text
  // without restarting the timer or stale-closing over the old list.
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(true);
  const index = tick % tags.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setTick((t) => t + 1);
        setVisible(true);
      }, FADE_MS);
    }, SWAP_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center justify-center gap-3 font-mono text-sm uppercase tracking-[0.3em] text-text-primary md:text-base"
      aria-live="polite"
    >
      <span className="text-red-glow" aria-hidden>
        [
      </span>
      <span
        className="inline-block whitespace-nowrap text-center"
        style={{
          minWidth: "min(360px, 80vw)",
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        {tags[index]}
      </span>
      <span className="text-red-glow" aria-hidden>
        ]
      </span>
    </div>
  );
}
