"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function UTTower({ size = 36 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <svg ref={ref} viewBox="0 0 60 80" width={size} height={(size * 80) / 60} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {/* Base */}
      <motion.rect
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: inView ? 1 : 0 }}
        transition={{ duration: 0.7, ease }}
        x="6"
        y="50"
        width="48"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* Body */}
      <motion.rect
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: inView ? 1 : 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease }}
        x="20"
        y="20"
        width="20"
        height="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* Top */}
      <motion.rect
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: inView ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease }}
        x="24"
        y="10"
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* Spire */}
      <motion.line
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.7, ease }}
        x1="30"
        y1="2"
        x2="30"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* Window slits */}
      {[26, 34, 42].map((y) => (
        <motion.line
          key={y}
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 0.5 : 0 }}
          transition={{ duration: 0.3, delay: 0.5 + y / 200 }}
          x1="24"
          x2="36"
          y1={y}
          y2={y}
          stroke="currentColor"
          strokeWidth="0.6"
        />
      ))}
    </svg>
  );
}

export function ChipPulse({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <svg ref={ref} viewBox="0 0 40 40" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <motion.rect
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.6 }}
        transition={{ duration: 0.5, ease }}
        x="10"
        y="10"
        width="20"
        height="20"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* pins */}
      {[14, 20, 26].map((p) => (
        <g key={p}>
          <line x1={p} x2={p} y1="6" y2="10" stroke="currentColor" strokeWidth="1.2" />
          <line x1={p} x2={p} y1="30" y2="34" stroke="currentColor" strokeWidth="1.2" />
          <line x1="6" x2="10" y1={p} y2={p} stroke="currentColor" strokeWidth="1.2" />
          <line x1="30" x2="34" y1={p} y2={p} stroke="currentColor" strokeWidth="1.2" />
        </g>
      ))}
      <motion.circle
        cx="20"
        cy="20"
        r="3"
        fill="currentColor"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function Waveform({ width = 90, height = 28 }: { width?: number; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const points = 40;
  const path =
    "M 0 " +
    (height / 2) +
    " " +
    Array.from({ length: points })
      .map((_, i) => {
        const x = (i / (points - 1)) * width;
        const y =
          height / 2 +
          Math.sin(i * 0.7) * (height / 2.6) * (0.4 + 0.6 * Math.sin(i * 0.18));
        return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <motion.path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.6, ease }}
      />
    </svg>
  );
}

function generateEquityWalk(): number[] {
  const data: number[] = [];
  let v = 4;
  for (let i = 0; i < 24; i++) {
    v += (Math.random() - 0.35) * 1.6;
    data.push(v);
  }
  return data;
}

export function MiniEquity({ width = 100, height = 28 }: { width?: number; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  // Empty on server, populate client-side to avoid SSR/CSR randomness mismatch.
  const [data, setData] = useState<number[]>([]);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setData(generateEquityWalk()));
    return () => cancelAnimationFrame(raf);
  }, []);
  const hasData = data.length > 0;
  const max = hasData ? Math.max(...data) : 1;
  const min = hasData ? Math.min(...data) : 0;
  const span = max - min || 1;
  const path = hasData
    ? "M " +
      data
        .map((v, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((v - min) / span) * (height - 2) - 1;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" L ")
    : "";
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      <motion.path
        d={path}
        fill="none"
        stroke="#34d399"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.6, ease }}
      />
    </svg>
  );
}

export function LogicAnalyzer({ width = 100, height = 28 }: { width?: number; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  // square wave with one tiny jitter glitch
  const segs = 16;
  const segW = width / segs;
  const high = 4;
  const low = height - 4;
  let pts = `0,${low}`;
  for (let i = 0; i < segs; i++) {
    const x1 = i * segW;
    const x2 = (i + 1) * segW;
    const y = i % 2 === 0 ? high : low;
    const yPrev = i % 2 === 0 ? low : high;
    pts += ` L ${x1},${yPrev} L ${x1},${y} L ${x2},${y}`;
  }

  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <motion.path
        d={"M " + pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.4, ease }}
      />
      <motion.line
        x1={width * 0.5}
        x2={width * 0.5}
        y1="0"
        y2={height}
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeDasharray="2 2"
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ delay: 1.2 }}
      />
    </svg>
  );
}
