"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getAccent, getAccentGlow, accentAlpha } from "@/lib/theme-colors";

// JARVIS and Smart Scheduler spotlights only surface in SWE mode, so their
// diagrams are intentionally hardcoded to the SWE green accent.
const SWE_GREEN = "#39ff14";
const SWE_GLOW = "#00ff41";

/**
 * Per-project animated visuals for the ProjectSpotlight panel. SVG diagrams
 * use `currentColor` (driven by an inline `color: var(--accent)`) because SVG
 * presentation attributes don't accept `var()`. Canvas diagrams resolve the
 * accent vars to concrete colors via the theme-colors helpers — a canvas 2D
 * context can't parse `var(--accent)` either.
 */

// ── nrf9160-zephyr-template: animated network topology ──────────────────────
export function Nrf9160Diagram() {
  return (
    <svg
      viewBox="0 0 400 200"
      className="h-full w-full opacity-80"
      style={{ color: "var(--accent)" }}
    >
      {/* Board node */}
      <rect x="10" y="75" width="90" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <text x="55" y="96" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="monospace">nRF9160</text>
      <text x="55" y="109" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.6">BOARD</text>

      {/* LoRa mesh node */}
      <rect x="155" y="65" width="90" height="70" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <text x="200" y="91" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="monospace">LoRa Mesh</text>
      <text x="200" y="104" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.6">40 nodes</text>
      <text x="200" y="117" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.5">LTE-M uplink</text>

      {/* AWS node */}
      <rect x="300" y="75" width="90" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <text x="345" y="96" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="monospace">AWS IoT</text>
      <text x="345" y="109" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="monospace" opacity="0.6">Core</text>

      {/* Connection lines */}
      <line x1="100" y1="100" x2="155" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="4 3" />
      <line x1="245" y1="100" x2="300" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="4 3" />

      {/* Animated packet dots (glow color) */}
      <g style={{ color: "var(--accent-glow)" }}>
        <circle r="4" fill="currentColor" opacity="0.9">
          <animateMotion dur="2s" repeatCount="indefinite" begin="0s">
            <mpath href="#nrf-path1" />
          </animateMotion>
        </circle>
        <circle r="4" fill="currentColor" opacity="0.9">
          <animateMotion dur="2s" repeatCount="indefinite" begin="1s">
            <mpath href="#nrf-path2" />
          </animateMotion>
        </circle>
      </g>

      <path id="nrf-path1" d="M 100 100 L 155 100" fill="none" />
      <path id="nrf-path2" d="M 245 100 L 300 100" fill="none" />

      {/* Protocol labels */}
      <text x="127" y="92" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="monospace" opacity="0.5">LoRa</text>
      <text x="272" y="92" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="monospace" opacity="0.5">MQTT/TLS</text>
    </svg>
  );
}

// ── pid-motor-sim: animated PID step response ───────────────────────────────
export function PidDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const accent = getAccent();
    const glow = getAccentGlow();
    let progress = 0;
    let animId = 0;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    // Pre-compute an underdamped second-order step response.
    const points: { x: number; y: number }[] = [];
    for (let t = 0; t <= 1; t += 0.005) {
      const x = t * W;
      let y: number;
      if (t < 0.15) {
        y = H * 0.8;
      } else {
        const tau = t - 0.15;
        const zeta = 0.5;
        const wn = 25;
        const wd = wn * Math.sqrt(1 - zeta * zeta);
        const response =
          1 -
          Math.exp(-zeta * wn * tau) *
            (Math.cos(wd * tau) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * tau));
        y = H * 0.8 - response * H * 0.6;
      }
      points.push({ x, y });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = accentAlpha(0.08);
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (H / 4) * i);
        ctx.lineTo(W, (H / 4) * i);
        ctx.stroke();
      }

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = accentAlpha(0.3);
      ctx.beginPath();
      ctx.moveTo(W * 0.15, H * 0.2);
      ctx.lineTo(W, H * 0.2);
      ctx.stroke();
      ctx.setLineDash([]);

      const endIdx = Math.floor(progress * (points.length - 1));
      if (endIdx < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 4;
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i <= endIdx; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = accentAlpha(0.4);
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.fillText("setpoint", W * 0.7, H * 0.17);
      ctx.fillText("response", W * 0.6, H * 0.35);
    };

    const animate = () => {
      if (cancelled) return;
      progress = Math.min(1, progress + 0.004);
      draw();
      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        restartTimer = setTimeout(() => {
          progress = 0;
          animate();
        }, 3000);
      }
    }

    animate();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animId);
      if (restartTimer) clearTimeout(restartTimer);
    };
  }, []);

  return <canvas ref={canvasRef} width={400} height={200} className="h-full w-full" />;
}

// ── kinematic-transformer: animated attention heatmap ───────────────────────
export function KinematicDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const N = 4; // 4×4 grid = 16 joints
    const cellSize = Math.min(canvas.width, canvas.height) / (N + 1);
    const padding = cellSize * 0.5;
    let animId = 0;

    let weights = Array.from({ length: N * N }, () => Math.random());

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      weights = weights.map((w) => Math.max(0, Math.min(1, w + (Math.random() - 0.5) * 0.05)));

      for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
          const x = padding + col * cellSize;
          const y = padding + row * cellSize;
          const w = weights[row * N + col];

          ctx.fillStyle = accentAlpha(w * 0.6);
          ctx.fillRect(x, y, cellSize - 2, cellSize - 2);

          ctx.fillStyle = accentAlpha(0.5);
          ctx.font = "7px JetBrains Mono, monospace";
          ctx.textAlign = "center";
          ctx.fillText(`J${row * N + col + 1}`, x + cellSize / 2 - 1, y + cellSize / 2 + 3);
        }
      }

      ctx.fillStyle = accentAlpha(0.3);
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.textAlign = "left";
      ctx.fillText("attention weights", padding, canvas.height - 8);
      ctx.textAlign = "right";
      ctx.fillText("16-DOF", canvas.width - padding, canvas.height - 8);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} className="h-full w-full" />;
}

// ── J.A.R.V.I.S.: agent pipeline (WAKE WORD → STT → LLM → TOOLS → fan-out) ──
export function JarvisDiagram() {
  // Main-chain edges and the TOOLS fan-out edges, each with a traveling pulse.
  const chainEdges = [
    { id: "j-e1", d: "M 90 67 L 108 67" },
    { id: "j-e2", d: "M 158 67 L 176 67" },
    { id: "j-e3", d: "M 226 67 L 244 67" },
  ];
  const fanEdges = [
    { id: "j-f1", d: "M 284 82 L 39 268" },
    { id: "j-f2", d: "M 284 82 L 125 268" },
    { id: "j-f3", d: "M 284 82 L 211 268" },
    { id: "j-f4", d: "M 284 82 L 297 268" },
  ];
  const leaves = [
    { x: 4, label: "Gmail" },
    { x: 90, label: "Calendar" },
    { x: 176, label: "Browser" },
    { x: 262, label: "Telegram" },
  ];

  return (
    <svg viewBox="0 0 328 320" className="h-full w-full opacity-90" style={{ color: SWE_GREEN }}>
      {/* Main pipeline nodes */}
      <PipeNode x={6} w={84} label="WAKE WORD" />
      <PipeNode x={108} w={50} label="STT" />
      <PipeNode x={176} w={50} label="LLM" />
      <PipeNode x={244} w={80} label="TOOLS" />

      {/* Leaf (tool) nodes */}
      {leaves.map((l) => (
        <g key={l.label}>
          <rect
            x={l.x}
            y={268}
            width={62}
            height={30}
            rx={4}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            opacity={0.5}
          />
          <text
            x={l.x + 31}
            y={286}
            textAnchor="middle"
            fill="currentColor"
            fontSize={8}
            fontFamily="monospace"
            opacity={0.75}
          >
            {l.label}
          </text>
        </g>
      ))}

      {/* Edges */}
      {[...chainEdges, ...fanEdges].map((e) => (
        <path key={e.id} id={e.id} d={e.d} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
      ))}

      {/* Traveling pulses */}
      <g style={{ color: SWE_GLOW }}>
        {chainEdges.map((e, i) => (
          <circle key={e.id} r={3.2} fill="currentColor">
            <animateMotion dur="1.6s" begin={`${i * 0.4}s`} repeatCount="indefinite">
              <mpath href={`#${e.id}`} />
            </animateMotion>
          </circle>
        ))}
        {fanEdges.map((e, i) => (
          <circle key={e.id} r={3} fill="currentColor">
            <animateMotion dur="2s" begin={`${1.2 + i * 0.25}s`} repeatCount="indefinite">
              <mpath href={`#${e.id}`} />
            </animateMotion>
          </circle>
        ))}
      </g>
    </svg>
  );
}

function PipeNode({ x, w, label }: { x: number; w: number; label: string }) {
  return (
    <g>
      <rect x={x} y={52} width={w} height={30} rx={4} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.7} />
      <text
        x={x + w / 2}
        y={70}
        textAnchor="middle"
        fill="currentColor"
        fontSize={label.length > 4 ? 8 : 10}
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}

// ── Smart Scheduler: tasks fill a week grid, then optimize into order ────────
const SCHED_TASKS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
// Pre-chosen scattered slots (0..19) and the compacted "optimized" layout.
const SCATTERED = [2, 6, 9, 11, 14, 3, 17, 8, 12];
const OPTIMIZED = [0, 1, 2, 5, 6, 7, 10, 11, 12];

export function SmartSchedulerDiagram() {
  const [revealed, setRevealed] = useState(0);
  const [optimized, setOptimized] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => {
        setRevealed(SCHED_TASKS.length);
        setOptimized(true);
      });
      return () => cancelAnimationFrame(raf);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      setRevealed(0);
      setOptimized(false);
      // Reveal tasks one by one.
      SCHED_TASKS.forEach((_, i) => {
        timers.push(setTimeout(() => setRevealed(i + 1), 250 * (i + 1)));
      });
      // Optimize once all are placed.
      timers.push(setTimeout(() => setOptimized(true), 250 * SCHED_TASKS.length + 900));
      // Loop.
      timers.push(setTimeout(runCycle, 250 * SCHED_TASKS.length + 4200));
    };
    runCycle();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Static week-grid backdrop */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 gap-1.5">
        {Array.from({ length: 20 }).map((_, slot) => (
          <div key={slot} className="rounded-sm" style={{ border: "1px solid rgba(57,255,20,0.12)" }} />
        ))}
      </div>

      {/* Task blocks — persistent, repositioned (and animated) on optimize */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 gap-1.5">
        <AnimatePresence>
          {SCHED_TASKS.slice(0, revealed).map((label, i) => {
            const slot = optimized ? OPTIMIZED[i] : SCATTERED[i];
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="flex items-center justify-center rounded-sm"
                style={{
                  gridColumnStart: (slot % 5) + 1,
                  gridRowStart: Math.floor(slot / 5) + 1,
                  backgroundColor: "rgba(57,255,20,0.16)",
                  border: `1px solid ${SWE_GREEN}`,
                }}
              >
                <span
                  className="font-mono"
                  style={{ color: SWE_GLOW, fontSize: "7px", letterSpacing: "0.05em" }}
                >
                  TASK {label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const DIAGRAM_MAP: Record<string, ComponentType> = {
  "nrf9160-template": Nrf9160Diagram,
  "pid-motor-sim": PidDiagram,
  "kinematic-transformer": KinematicDiagram,
  jarvis: JarvisDiagram,
  "smart-scheduler": SmartSchedulerDiagram,
};
