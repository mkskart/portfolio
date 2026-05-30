"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MediaWithFallback } from "@/components/media-with-fallback";

const ease = [0.22, 1, 0.36, 1] as const;

// Fictional but plausible HUD telemetry overlays
const HUD = [
  { label: "LAP", value: "44 / 57", x: "8%", y: "18%" },
  { label: "S1", value: "23.412", x: "78%", y: "16%" },
  { label: "GAP", value: "+3.621s", x: "82%", y: "76%" },
  { label: "DRS", value: "ENABLED", x: "12%", y: "78%", glow: true },
];

export function F1Section({ id }: { id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax: huge "33" scrolls slower; copy scrolls slightly faster
  const numberY = useTransform(scrollYProgress, [0, 1], [180, -180]);
  const headingY = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const streakX = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section
      id={id}
      ref={ref}
      data-section="f1"
      className="relative isolate flex min-h-screen w-full items-center overflow-hidden bg-bg-base"
    >
      {/* Background — drop /public/f1/loop.{webm,mp4} to replace the CSS streaks */}
      <div className="absolute inset-0 -z-10">
        <MediaWithFallback
          src="/f1/loop.webm"
          srcMp4="/f1/loop.mp4"
          className="h-full w-full object-cover opacity-70"
        >
          <CssStreaksFallback streakX={streakX} />
        </MediaWithFallback>
        {/* Left-side dark gradient — keeps foreground copy readable over busy footage */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10" />
        {/* Centered radial vignette on top */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.65) 80%, #0a0a0a 100%)",
          }}
        />
      </div>

      {/* Huge parallax "33" — Verstappen's old number */}
      <motion.div
        style={{ y: numberY }}
        className="pointer-events-none absolute right-[-4vw] top-1/2 -translate-y-1/2 select-none font-mono font-bold leading-none text-[#e10600]/[0.07]"
        aria-hidden
      >
        <span style={{ fontSize: "clamp(20rem, 55vw, 56rem)" }}>33</span>
      </motion.div>

      {/* HUD overlays — staggered fade-in */}
      <div className="pointer-events-none absolute inset-0">
        {HUD.map((h, i) => (
          <motion.div
            key={h.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20% 0px" }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.7, ease }}
            className="absolute font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ left: h.x, top: h.y }}
          >
            <div className="text-text-muted">{h.label}</div>
            <div
              className={`mt-1 text-base ${
                h.glow
                  ? "text-[#ff1744] [text-shadow:0_0_12px_rgba(255,23,68,0.6),0_0_32px_rgba(255,23,68,0.3)]"
                  : "text-text-primary"
              }`}
            >
              {h.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Foreground copy */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <motion.div
          style={{ y: headingY }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, ease }}
          className="max-w-[26ch]"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#ff1744]">
            section · 01
          </span>
          <h2
            className="mt-4 font-display font-semibold leading-[0.95] tracking-tight text-text-primary"
            style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}
          >
            Sundays are for{" "}
            <span className="bg-gradient-to-br from-[#e10600] via-[#ff1744] to-amber-200 bg-clip-text text-transparent">
              racing.
            </span>
          </h2>
          <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-text-secondary">
            Diehard Verstappen / Red Bull Racing fan since the start.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
            <span className="h-px w-8 bg-text-muted/60" />
            try typing <span className="text-[#ff1744]">verstappen</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CssStreaksFallback({
  streakX,
}: {
  streakX: ReturnType<typeof useTransform<number, string>>;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505]">
      {/* Large abstract red car silhouette ghost (SVG) — drifts on parallax */}
      <motion.svg
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        className="absolute left-0 top-1/2 h-[40vh] w-full -translate-y-1/2 opacity-30"
        style={{ x: streakX }}
        aria-hidden
      >
        <defs>
          <linearGradient id="car-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF1744" stopOpacity="0" />
            <stop offset="40%" stopColor="#FF1744" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E10600" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M40 130 Q80 110 200 100 L320 90 Q420 80 520 84 L640 100 Q720 110 760 130 L760 150 L40 150 Z"
          fill="url(#car-grad)"
        />
        {/* Front wing */}
        <rect x="640" y="118" width="120" height="6" fill="url(#car-grad)" />
        {/* Cockpit */}
        <ellipse cx="430" cy="80" rx="60" ry="20" fill="url(#car-grad)" opacity="0.85" />
        {/* Wheels */}
        <circle cx="200" cy="148" r="22" fill="#0a0a0a" stroke="#FF1744" strokeWidth="1.5" />
        <circle cx="600" cy="148" r="22" fill="#0a0a0a" stroke="#FF1744" strokeWidth="1.5" />
      </motion.svg>

      {/* Speed streaks — lots of them, staggered */}
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-px"
          style={{
            top: `${(i / 24) * 100}%`,
            left: `${-30 + (i % 4) * 8}%`,
            width: `${30 + (i % 5) * 14}%`,
            background:
              "linear-gradient(to right, transparent, rgba(255,23,68,0.6), transparent)",
            animation: `f1-streak ${1.4 + (i % 6) * 0.25}s linear ${i * 0.08}s infinite`,
            opacity: 0.55,
          }}
        />
      ))}
      <style>{`
        @keyframes f1-streak {
          0%   { transform: translateX(-30%); opacity: 0; }
          15%  { opacity: 0.7; }
          85%  { opacity: 0.7; }
          100% { transform: translateX(140%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
