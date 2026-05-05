"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

function generate(points = 220, end = 160) {
  const arr: number[] = [];
  let v = 0;
  for (let i = 0; i < points; i++) {
    const drift = (Math.random() - 0.42) * 6;
    v = Math.max(-60, v + drift);
    arr.push(v);
  }
  const last = arr[arr.length - 1];
  const k = end / (last || 1);
  return arr.map((a) => a * k);
}

export function EquityModal(props: Props) {
  return (
    <AnimatePresence>
      {props.open && <EquityModalInner key="open" onClose={props.onClose} />}
    </AnimatePresence>
  );
}

function EquityModalInner({ onClose }: { onClose: () => void }) {
  const [data] = useState<number[]>(() => generate(220, 160));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const x = e.clientX - r.left;
    const i = Math.max(
      0,
      Math.min(data.length - 1, Math.round((x / r.width) * (data.length - 1))),
    );
    setHoverIdx(i);
  };

  const w = 1000;
  const h = 480;
  const pad = 32;
  const max = Math.max(...data, 10);
  const min = Math.min(...data, -10);
  const span = max - min || 1;

  const path =
    "M " +
    data
      .map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / span) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(" L ");

  const hoverX =
    hoverIdx !== null ? pad + (hoverIdx / (data.length - 1)) * (w - pad * 2) : null;
  const hoverY =
    hoverIdx !== null
      ? h - pad - ((data[hoverIdx] - min) / span) * (h - pad * 2)
      : null;

  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-md"
    >
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass-red w-full max-w-5xl overflow-hidden rounded-2xl"
      >
            <div className="flex items-center justify-between border-b border-border-accent px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="live-dot" />
                <span className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                  equity_simulated.csv
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${w} ${h}`}
                onMouseMove={onMove}
                onMouseLeave={() => setHoverIdx(null)}
                className="block h-[60vh] w-full cursor-crosshair"
              >
                <defs>
                  <linearGradient id="modal-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF1744" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FF1744" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {Array.from({ length: 6 }).map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    x2={w}
                    y1={(h / 6) * (i + 1)}
                    y2={(h / 6) * (i + 1)}
                    stroke="#1f1f1f"
                    strokeDasharray="3 4"
                  />
                ))}
                <path
                  d={`${path} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`}
                  fill="url(#modal-area)"
                />
                <path d={path} fill="none" stroke="#FF1744" strokeWidth="2" />

                {hoverX !== null && hoverY !== null && (
                  <g>
                    <line
                      x1={hoverX}
                      x2={hoverX}
                      y1={pad}
                      y2={h - pad}
                      stroke="#FF1744"
                      strokeDasharray="3 3"
                      strokeOpacity="0.6"
                    />
                    <circle cx={hoverX} cy={hoverY} r="5" fill="#FF1744" />
                  </g>
                )}
              </svg>

              {hoverIdx !== null && hoverX !== null && (
                <div
                  className="pointer-events-none absolute top-3 rounded-md border border-border-accent bg-bg-elevated/95 px-3 py-2 font-mono text-xs"
                  style={{
                    left: `calc(${(hoverX / w) * 100}% + 12px)`,
                    transform: "translateX(0)",
                  }}
                >
                  <div className="text-text-secondary">
                    t = {String(hoverIdx).padStart(3, "0")} / {data.length}
                  </div>
                  <div className="text-text-primary">
                    P&amp;L: ${data[hoverIdx].toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border-subtle px-5 py-3 font-mono text-xs text-text-muted">
              Drag across the chart to scrub through simulated time. Press Esc
              to close.
            </div>
      </motion.div>
    </motion.div>
  );
}
