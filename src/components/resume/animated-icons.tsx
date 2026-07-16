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

/** Bank columns — J.P. Morgan */
export function BankColumns({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const cols = [6, 14, 22, 30];
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {/* pediment */}
      <motion.polyline
        points="2,14 18,4 34,14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 0.6, ease }}
      />
      {/* base */}
      <motion.line x1="2" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="1.4"
        initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.55, ease }} style={{ originX: "50%" }} />
      {/* columns */}
      {cols.map((x, i) => (
        <motion.line key={x} x1={x} x2={x} y1="14" y2="32" stroke="currentColor" strokeWidth="1.2"
          initial={{ scaleY: 0 }} animate={{ scaleY: inView ? 1 : 0 }}
          transition={{ duration: 0.45, delay: 0.3 + i * 0.07, ease }} style={{ originY: "100%" }} />
      ))}
    </svg>
  );
}

/** Scatter plot — UH CFD research */
export function ScatterPlot({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const dots = [
    [8, 24], [12, 18], [16, 22], [20, 12], [24, 16], [28, 8], [10, 30], [22, 28],
  ] as const;
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <motion.line x1="4" y1="32" x2="4" y2="4" stroke="currentColor" strokeWidth="1.2"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 0.4, ease }} />
      <motion.line x1="4" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="1.2"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 0.4, ease }} />
      {dots.map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="1.8" fill="currentColor"
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: inView ? 0.85 : 0, scale: inView ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.35 + i * 0.07, ease }} />
      ))}
    </svg>
  );
}

/** Pulsing mic rings — JARVIS voice AI */
export function VoiceRings({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {/* mic body */}
      <motion.rect x="14" y="6" width="8" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4"
        initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.4, ease }} />
      {/* stand arc */}
      <motion.path d="M 10 17 Q 10 26 18 26 Q 26 26 26 17" fill="none" stroke="currentColor" strokeWidth="1.4"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease }} />
      <motion.line x1="18" y1="26" x2="18" y2="31" stroke="currentColor" strokeWidth="1.4"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.7, ease }} />
      {/* pulse ring */}
      <motion.circle cx="18" cy="14" r="10" fill="none" stroke="currentColor" strokeWidth="0.8"
        animate={inView ? { opacity: [0, 0.4, 0], scale: [0.7, 1.2, 0.7] } : {}}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
    </svg>
  );
}

/** Antenna / signal bars — nRF9160 LTE */
export function AntennaSignal({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {/* mast */}
      <motion.line x1="18" y1="32" x2="18" y2="10" stroke="currentColor" strokeWidth="1.4"
        initial={{ scaleY: 0 }} animate={{ scaleY: inView ? 1 : 0 }}
        transition={{ duration: 0.5, ease }} style={{ originY: "100%" }} />
      {/* arcs */}
      {[6, 11, 16].map((r, i) => (
        <motion.path key={r} d={`M ${18 - r} ${10 + r * 0.5} Q 18 ${10 - r * 0.8} ${18 + r} ${10 + r * 0.5}`}
          fill="none" stroke="currentColor" strokeWidth="1.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: inView ? 1 : 0, opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.15, ease }} />
      ))}
    </svg>
  );
}

/** Step-response curve — PID motor sim */
export function StepResponse({ width = 56, height = 28 }: { width?: number; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const top = 5;
  // step + damped oscillation settling
  const pts = [
    `0,${height - 3}`,
    `${width * 0.18},${height - 3}`,
    `${width * 0.18},${top + 1}`,
    `${width * 0.32},${top - 3}`,
    `${width * 0.44},${top + 5}`,
    `${width * 0.56},${top + 1}`,
    `${width * 0.68},${top + 3}`,
    `${width * 0.8},${top + 1.5}`,
    `${width},${top + 2}`,
  ].join(" L ");
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {/* setpoint dashed line */}
      <line x1="0" y1={top + 2} x2={width} y2={top + 2} stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />
      <motion.path d={"M " + pts} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.4, ease }} />
    </svg>
  );
}

/** Connected nodes — kinematic transformer */
export function NodeGraph({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const nodes = [[18, 6], [8, 20], [28, 20], [13, 32], [23, 32]] as const;
  const edges = [[0,1],[0,2],[1,2],[1,3],[2,4],[1,4],[2,3]] as const;
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {edges.map(([a, b], i) => (
        <motion.line key={i}
          x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="currentColor" strokeWidth="0.9" opacity={0.5}
          initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease }} />
      ))}
      {nodes.map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="2.5" fill="currentColor"
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.5 + i * 0.08, ease }} />
      ))}
    </svg>
  );
}

/** Calendar grid — Smart Scheduler */
export function CalendarGrid({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const cells = [[8,14],[16,14],[24,14],[8,22],[16,22],[24,22],[8,30],[16,30]];
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {/* border */}
      <motion.rect x="3" y="7" width="30" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3"
        initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.4, ease }} />
      {/* header bar */}
      <motion.line x1="3" y1="13" x2="33" y2="13" stroke="currentColor" strokeWidth="1.1"
        initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease }} style={{ originX: "0%" }} />
      {/* notches */}
      {[11, 19].map((x, i) => (
        <motion.line key={x} x1={x} y1="4" x2={x} y2="10" stroke="currentColor" strokeWidth="1.4"
          initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }}
          transition={{ delay: 0.1 + i * 0.1 }} />
      ))}
      {/* dots */}
      {cells.map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="1.6" fill="currentColor"
          initial={{ opacity: 0 }} animate={{ opacity: inView ? [0, 1] : 0 }}
          transition={{ duration: 0.2, delay: 0.5 + i * 0.06 }} />
      ))}
    </svg>
  );
}

/** Radar sweep — Obstacle Avoidance Robot */
export function RadarSweep({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {[6, 11, 16].map((r, i) => (
        <motion.circle key={r} cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.4}
          initial={{ opacity: 0 }} animate={{ opacity: inView ? 0.4 : 0 }}
          transition={{ duration: 0.4, delay: i * 0.12, ease }} />
      ))}
      {/* sweeping arm — rotate a <g> around the radar center */}
      <motion.g
        style={{ transformBox: "view-box", transformOrigin: "18px 18px" }}
        animate={inView ? { rotate: [0, 360] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      >
        <line x1="18" y1="18" x2="18" y2="2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </motion.g>
      {/* blips */}
      <motion.circle cx="26" cy="12" r="1.6" fill="currentColor"
        animate={inView ? { opacity: [0, 1, 0] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.2, 0.45] }} />
      <motion.circle cx="11" cy="24" r="1.6" fill="currentColor"
        animate={inView ? { opacity: [0, 1, 0] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, times: [0.5, 0.7, 0.95] }} />
    </svg>
  );
}

/** Converging pair spread — Statistical Arbitrage */
export function PairSpread({ width = 56, height = 28 }: { width?: number; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const a = `M 0 ${height * 0.25} C ${width * 0.3} ${height * 0.1}, ${width * 0.55} ${height * 0.55}, ${width} ${height * 0.45}`;
  const b = `M 0 ${height * 0.75} C ${width * 0.3} ${height * 0.9}, ${width * 0.55} ${height * 0.45}, ${width} ${height * 0.55}`;
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <motion.path d={a} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.4, ease }} />
      <motion.path d={b} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity={0.55}
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.4, ease }} />
    </svg>
  );
}

/** Option payoff hockey-stick — Options Pricing & Greeks */
export function PayoffCurve({ width = 56, height = 28 }: { width?: number; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const zero = height - 5;
  const pts = `0,${zero} ${width * 0.45},${zero} ${width},5`;
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {/* breakeven axis */}
      <line x1="0" y1={zero} x2={width} y2={zero} stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />
      <motion.polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.3, ease }} />
    </svg>
  );
}

/** Factor bar chart — Factor Model / Alpha Research */
export function FactorBars({ width = 56, height = 28 }: { width?: number; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const bars = [0.5, 0.85, 0.35, 0.7, 0.55];
  const bw = width / (bars.length * 1.6);
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      {bars.map((h, i) => {
        const bh = h * (height - 4);
        const x = i * (bw * 1.6) + bw * 0.3;
        return (
          <motion.rect key={i} x={x} width={bw} y={height - 1 - bh} height={bh} fill="currentColor" opacity={0.8}
            initial={{ scaleY: 0, originY: 1 }} animate={{ scaleY: inView ? 1 : 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease }} style={{ transformBox: "fill-box", originY: "100%" }} />
        );
      })}
    </svg>
  );
}

/** Profile card — RecruIT */
export function ProfileCard({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <motion.rect x="4" y="7" width="28" height="22" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3"
        initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.4, ease }} />
      {/* avatar */}
      <motion.circle cx="13" cy="15" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.3"
        initial={{ scale: 0 }} animate={{ scale: inView ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease }} style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }} />
      <motion.path d="M 8 24 Q 13 19 18 24" fill="none" stroke="currentColor" strokeWidth="1.3"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.45, ease }} />
      {/* detail lines */}
      {[13, 18, 23].map((y, i) => (
        <motion.line key={y} x1="22" y1={y} x2="28" y2={y} stroke="currentColor" strokeWidth="1.2" opacity={0.6}
          initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }}
          transition={{ duration: 0.35, delay: 0.5 + i * 0.1, ease }} style={{ originX: "0%" }} />
      ))}
    </svg>
  );
}

/** Vortex spiral — VorticeApp */
export function VortexSpiral({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  // Archimedean spiral
  let d = "M 18 18";
  const turns = 3;
  const steps = 60;
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = (i / steps) * 14;
    const x = 18 + r * Math.cos(t);
    const y = 18 + r * Math.sin(t);
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <motion.path d={d} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.6, ease }} />
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

/** Delta-wing jet with a pulsing sensor core — Southwest Research Institute */
export function JetDelta({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const jet =
    "M 18 3 L 20 15 L 33 27 L 20 25 L 20 30 L 24 34 L 18 32 L 12 34 L 16 30 L 16 25 L 3 27 L 16 15 Z";
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      <motion.path
        d={jet}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.4, ease }}
      />
      {/* sensor integration unit — pulsing core */}
      <motion.circle
        cx="18"
        cy="19"
        r="2.2"
        fill="currentColor"
        animate={inView ? { opacity: [0.4, 1, 0.4], scale: [0.8, 1.15, 0.8] } : {}}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }}
      />
    </svg>
  );
}

/** Checkered flag — PitWall F1 telemetry */
export function CheckeredFlag({ size = 28 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const cols = 4;
  const rows = 3;
  const cw = 5.5;
  const ch = 5;
  const x0 = 9;
  const y0 = 5;
  const squares: { x: number; y: number; i: number }[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) squares.push({ x: x0 + c * cw, y: y0 + r * ch, i: idx });
      idx++;
    }
  }
  return (
    <svg ref={ref} viewBox="0 0 36 36" width={size} height={size} aria-hidden style={{ color: "var(--accent-glow)" }}>
      {/* pole */}
      <motion.line
        x1="8"
        y1="4"
        x2="8"
        y2="33"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: inView ? 1 : 0 }}
        transition={{ duration: 0.5, ease }}
        style={{ originY: "0%" }}
      />
      {/* flag border */}
      <motion.rect
        x="8.5"
        y="4.5"
        width={cols * cw + 0.5}
        height={rows * ch}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity={0.5}
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 0.5 : 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      {/* checker squares */}
      {squares.map((s) => (
        <motion.rect
          key={s.i}
          x={s.x}
          y={s.y}
          width={cw}
          height={ch}
          fill="currentColor"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: inView ? 0.9 : 0, scale: inView ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.3 + s.i * 0.05, ease }}
          style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }}
        />
      ))}
    </svg>
  );
}
