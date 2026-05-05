"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  height?: number;
  expandable?: boolean;
  onExpand?: () => void;
}

function generateCurve(points = 64, end = 160) {
  const arr: number[] = [];
  let v = 0;
  for (let i = 0; i < points; i++) {
    const drift = (Math.random() - 0.42) * 14;
    v = Math.max(-40, v + drift);
    arr.push(v);
  }
  const last = arr[arr.length - 1];
  const k = end / (last || 1);
  return arr.map((a) => a * k);
}

export function EquityCurve({ height = 220, expandable = true, onExpand }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: false, margin: "-10% 0px" });
  // Empty on server, populate client-side to avoid hydration mismatch.
  const [data, setData] = useState<number[]>([]);
  const [genId, setGenId] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setData(generateCurve(72, 160)));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!inView || data.length === 0) return;
    const t = setInterval(() => {
      setData(generateCurve(72, 160));
      setGenId((g) => g + 1);
    }, 8000);
    return () => clearInterval(t);
  }, [inView, data.length]);

  const w = 600;
  const h = height;
  const pad = 12;
  const hasData = data.length > 0;
  const max = hasData ? Math.max(...data, 10) : 10;
  const min = hasData ? Math.min(...data, -10) : -10;
  const span = max - min || 1;

  const path = hasData
    ? "M " +
      data
        .map((v, i) => {
          const x = pad + (i / (data.length - 1)) * (w - pad * 2);
          const y = h - pad - ((v - min) / span) * (h - pad * 2);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" L ")
    : "";

  const areaPath = hasData
    ? `M ${pad},${h - pad} L ` +
      data
        .map((v, i) => {
          const x = pad + (i / (data.length - 1)) * (w - pad * 2);
          const y = h - pad - ((v - min) / span) * (h - pad * 2);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" L ") +
      ` L ${w - pad},${h - pad} Z`
    : "";

  const last = hasData ? data[data.length - 1] : 0;
  const lastX = w - pad;
  const lastY = hasData ? h - pad - ((last - min) / span) * (h - pad * 2) : h / 2;

  return (
    <button
      type="button"
      onClick={expandable ? onExpand : undefined}
      className="group relative block w-full cursor-zoom-in text-left focus:outline-none"
      aria-label="Equity curve — click to expand"
    >
      <svg
        ref={ref}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="block h-full w-full"
        key={genId}
      >
        <defs>
          <linearGradient id="eq-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF1744" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF1744" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="eq-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="60%" stopColor="#FF1744" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* grid */}
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            x2={w}
            y1={(h / 4) * (i + 1)}
            y2={(h / 4) * (i + 1)}
            stroke="#1f1f1f"
            strokeDasharray="3 4"
          />
        ))}

        {/* zero line */}
        {min < 0 && max > 0 && (
          <line
            x1="0"
            x2={w}
            y1={h - pad - ((0 - min) / span) * (h - pad * 2)}
            y2={h - pad - ((0 - min) / span) * (h - pad * 2)}
            stroke="#525252"
            strokeWidth="1"
          />
        )}

        {hasData && (
          <>
            <motion.path
              d={areaPath}
              fill="url(#eq-area)"
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ duration: 1.4, delay: 0.4 }}
            />

            <motion.path
              d={path}
              fill="none"
              stroke="url(#eq-line)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: inView ? 1 : 0 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.circle
              cx={lastX}
              cy={lastY}
              r="4"
              fill="#34d399"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0 }}
              transition={{ delay: 1.6, duration: 0.4 }}
            />
          </>
        )}
      </svg>

      {hasData && (
        <div className="absolute right-3 top-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 font-mono text-xs text-emerald-300">
          +${last.toFixed(0)}
        </div>
      )}
    </button>
  );
}
