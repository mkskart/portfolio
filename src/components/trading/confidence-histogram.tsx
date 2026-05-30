"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function generateBins() {
  return Array.from({ length: 20 }).map((_, i) => {
    const center = i / 20;
    const dx = center - 0.62;
    const v = Math.exp(-(dx * dx) * 18) * 100 * (0.85 + Math.random() * 0.3);
    return Math.round(v);
  });
}

export function ConfidenceHistogram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-10%" });
  const [bins, setBins] = useState<number[]>([]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setBins(generateBins()));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!inView || bins.length === 0) return;
    const t = setInterval(() => setBins(generateBins()), 4500);
    return () => clearInterval(t);
  }, [inView, bins.length]);

  const max = bins.length > 0 ? Math.max(...bins) : 1;

  return (
    <div ref={ref} className="flex h-[160px] items-end gap-1">
      {bins.map((b, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(b / max) * 100}%` }}
          transition={{ duration: 0.6, delay: i * 0.015, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 rounded-t-sm"
          style={{
            background:
              i / 20 > 0.55 && i / 20 < 0.7
                ? "linear-gradient(to top, var(--accent-glow), var(--accent-deep))"
                : "linear-gradient(to top, #1f1f1f, var(--accent-border))",
          }}
        />
      ))}
    </div>
  );
}
