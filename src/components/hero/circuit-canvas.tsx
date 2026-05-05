"use client";

import { useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vec2 {
  x: number;
  y: number;
}

interface Node {
  pos: Vec2;
  connections: number[]; // indices into nodes array
}

type ICComponent = {
  type: "ic";
  pos: Vec2;
  w: number;
  h: number;
  label: string;
};
type ResistorComponent = {
  type: "resistor";
  pos: Vec2;
  horizontal: boolean;
};
type CapacitorComponent = {
  type: "capacitor";
  pos: Vec2;
};
type Component = ICComponent | ResistorComponent | CapacitorComponent;

interface Signal {
  pathNodes: number[];
  progress: number;
  speed: number;
  opacity: number;
  phase: "traveling" | "fading";
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID = 20;
const TRACE_COLOR_PRIMARY = "#E10600";
const TRACE_COLOR_SECONDARY = "#FF4444";
const PAD_COLOR = "#FF6644";
const SIGNAL_COLOR = "#FF1744";
const SIGNAL_GLOW = "#FF6060";
const TRACE_OPACITY = 0.35;
const COMPONENT_OPACITY = 0.45;
const MAX_SIGNALS = 8;
const SIGNAL_SPEED_MIN = 0.003;
const SIGNAL_SPEED_MAX = 0.007;

const IC_LABELS = [
  "nRF9160",
  "ESP32",
  "STM32",
  "MPU6050",
  "LTE-M",
  "UART",
  "SPI",
  "I²C",
  "GPIO",
  "PWM",
  "ADC",
  "MCU",
];

// ─── Component drawers ────────────────────────────────────────────────────────

function drawIC(
  ctx: CanvasRenderingContext2D,
  pos: Vec2,
  w: number,
  h: number,
  pinCount: number,
  label: string,
  alpha: number,
) {
  ctx.globalAlpha = alpha * COMPONENT_OPACITY;

  // IC body
  ctx.fillStyle = "#0A0A0A";
  ctx.strokeStyle = TRACE_COLOR_PRIMARY;
  ctx.lineWidth = 1;
  ctx.fillRect(pos.x, pos.y, w, h);
  ctx.strokeRect(pos.x, pos.y, w, h);

  // Pin-1 notch on top edge
  ctx.beginPath();
  ctx.arc(pos.x + w / 2, pos.y, 4, 0, Math.PI, true);
  ctx.stroke();

  // Label
  ctx.fillStyle = TRACE_COLOR_PRIMARY;
  ctx.font = `${Math.max(8, Math.floor(w / label.length))}px JetBrains Mono, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, pos.x + w / 2, pos.y + h / 2);

  // Pins along left + right edges
  const pinsPerSide = Math.floor(pinCount / 2);
  const pinSpacing = h / (pinsPerSide + 1);
  ctx.fillStyle = PAD_COLOR;
  for (let i = 0; i < pinsPerSide; i++) {
    const y = pos.y + pinSpacing * (i + 1);
    ctx.fillRect(pos.x - 8, y - 2, 8, 4);
    ctx.fillRect(pos.x + w, y - 2, 8, 4);
  }

  ctx.globalAlpha = 1;
}

function drawResistor(
  ctx: CanvasRenderingContext2D,
  pos: Vec2,
  horizontal: boolean,
  alpha: number,
) {
  ctx.globalAlpha = alpha * COMPONENT_OPACITY;
  ctx.lineWidth = 1;

  if (horizontal) {
    // Body
    ctx.fillStyle = "#141414";
    ctx.strokeStyle = TRACE_COLOR_SECONDARY;
    ctx.fillRect(pos.x - 10, pos.y - 4, 20, 8);
    ctx.strokeRect(pos.x - 10, pos.y - 4, 20, 8);
    // Leads
    ctx.strokeStyle = TRACE_COLOR_PRIMARY;
    ctx.beginPath();
    ctx.moveTo(pos.x - 18, pos.y);
    ctx.lineTo(pos.x - 10, pos.y);
    ctx.moveTo(pos.x + 10, pos.y);
    ctx.lineTo(pos.x + 18, pos.y);
    ctx.stroke();
    // SMD pads
    ctx.fillStyle = PAD_COLOR;
    ctx.fillRect(pos.x - 20, pos.y - 3, 6, 6);
    ctx.fillRect(pos.x + 14, pos.y - 3, 6, 6);
  } else {
    ctx.fillStyle = "#141414";
    ctx.strokeStyle = TRACE_COLOR_SECONDARY;
    ctx.fillRect(pos.x - 4, pos.y - 10, 8, 20);
    ctx.strokeRect(pos.x - 4, pos.y - 10, 8, 20);
    ctx.strokeStyle = TRACE_COLOR_PRIMARY;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y - 18);
    ctx.lineTo(pos.x, pos.y - 10);
    ctx.moveTo(pos.x, pos.y + 10);
    ctx.lineTo(pos.x, pos.y + 18);
    ctx.stroke();
    ctx.fillStyle = PAD_COLOR;
    ctx.fillRect(pos.x - 3, pos.y - 22, 6, 6);
    ctx.fillRect(pos.x - 3, pos.y + 16, 6, 6);
  }
  ctx.globalAlpha = 1;
}

function drawCapacitor(ctx: CanvasRenderingContext2D, pos: Vec2, alpha: number) {
  ctx.globalAlpha = alpha * COMPONENT_OPACITY;
  ctx.strokeStyle = TRACE_COLOR_SECONDARY;
  ctx.lineWidth = 1.5;

  // Two parallel plates
  ctx.beginPath();
  ctx.moveTo(pos.x - 8, pos.y - 3);
  ctx.lineTo(pos.x + 8, pos.y - 3);
  ctx.moveTo(pos.x - 8, pos.y + 3);
  ctx.lineTo(pos.x + 8, pos.y + 3);
  ctx.stroke();

  // Leads
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y - 3);
  ctx.lineTo(pos.x, pos.y - 12);
  ctx.moveTo(pos.x, pos.y + 3);
  ctx.lineTo(pos.x, pos.y + 12);
  ctx.stroke();

  // Round pads
  ctx.fillStyle = PAD_COLOR;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y - 14, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y + 14, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function drawVia(
  ctx: CanvasRenderingContext2D,
  pos: Vec2,
  alpha: number,
  glowing = false,
) {
  ctx.globalAlpha = alpha * (glowing ? 1 : COMPONENT_OPACITY);
  if (glowing) {
    ctx.shadowColor = SIGNAL_GLOW;
    ctx.shadowBlur = 8;
  }

  // Outer copper ring
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
  ctx.strokeStyle = glowing ? SIGNAL_COLOR : TRACE_COLOR_PRIMARY;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner drilled hole
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = glowing ? SIGNAL_COLOR : "#2A0808";
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CircuitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Vec2>({ x: -999, y: -999 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvasMaybe = canvasRef.current;
    if (!canvasMaybe) return;
    const ctxMaybe = canvasMaybe.getContext("2d");
    if (!ctxMaybe) return;
    // Pinned non-null aliases so closures defined below see the narrowed
    // types — TS doesn't reliably propagate narrowing into hoisted
    // `function` declarations that capture the outer `let`/`const`.
    const canvas: HTMLCanvasElement = canvasMaybe;
    const ctx: CanvasRenderingContext2D = ctxMaybe;

    const isMobile = window.innerWidth < 768;
    let animId = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Build the PCB graph ─────────────────────────────────────────────────────
    const cols = Math.floor(canvas.width / GRID);
    const rows = Math.floor(canvas.height / GRID);

    const nodes: Node[] = [];
    const nodeMap = new Map<string, number>();

    function addNode(gx: number, gy: number): number {
      const key = `${gx},${gy}`;
      const existing = nodeMap.get(key);
      if (existing !== undefined) return existing;
      const idx = nodes.length;
      nodes.push({ pos: { x: gx * GRID, y: gy * GRID }, connections: [] });
      nodeMap.set(key, idx);
      return idx;
    }

    function connectNodes(a: number, b: number) {
      if (a === b) return;
      if (!nodes[a].connections.includes(b)) nodes[a].connections.push(b);
      if (!nodes[b].connections.includes(a)) nodes[b].connections.push(a);
    }

    const density = isMobile ? 0.3 : 0.55;
    for (let gx = 1; gx < cols - 1; gx++) {
      for (let gy = 1; gy < rows - 1; gy++) {
        if (Math.random() > density) continue;
        const a = addNode(gx, gy);

        // Right neighbor
        if (Math.random() > 0.3 && gx + 1 < cols - 1) {
          const steps = 1 + Math.floor(Math.random() * 4);
          if (gx + steps < cols - 1) {
            connectNodes(a, addNode(gx + steps, gy));
          }
        }
        // Down neighbor
        if (Math.random() > 0.3 && gy + 1 < rows - 1) {
          const steps = 1 + Math.floor(Math.random() * 4);
          if (gy + steps < rows - 1) {
            connectNodes(a, addNode(gx, gy + steps));
          }
        }
        // L-shaped trace (right then down)
        if (Math.random() > 0.5 && gx + 2 < cols - 1 && gy + 2 < rows - 1) {
          const hSteps = 1 + Math.floor(Math.random() * 3);
          const vSteps = 1 + Math.floor(Math.random() * 3);
          const mid = addNode(gx + hSteps, gy);
          const end = addNode(gx + hSteps, gy + vSteps);
          connectNodes(a, mid);
          connectNodes(mid, end);
        }
      }
    }

    // ── Place components ───────────────────────────────────────────────────────
    const components: Component[] = [];
    const componentDensity = isMobile ? 0.008 : 0.015;

    const icCount = Math.floor(cols * rows * componentDensity * 0.3);
    for (let i = 0; i < icCount; i++) {
      const gx = 3 + Math.floor(Math.random() * Math.max(1, cols - 6));
      const gy = 3 + Math.floor(Math.random() * Math.max(1, rows - 6));
      const w = (3 + Math.floor(Math.random() * 3)) * GRID;
      const h = (4 + Math.floor(Math.random() * 4)) * GRID;
      components.push({
        type: "ic",
        pos: { x: gx * GRID, y: gy * GRID },
        w,
        h,
        label: IC_LABELS[Math.floor(Math.random() * IC_LABELS.length)],
      });
    }

    const rCount = Math.floor(cols * rows * componentDensity * 1.5);
    for (let i = 0; i < rCount; i++) {
      components.push({
        type: "resistor",
        pos: {
          x: (2 + Math.floor(Math.random() * Math.max(1, cols - 4))) * GRID,
          y: (2 + Math.floor(Math.random() * Math.max(1, rows - 4))) * GRID,
        },
        horizontal: Math.random() > 0.5,
      });
    }

    const cCount = Math.floor(cols * rows * componentDensity);
    for (let i = 0; i < cCount; i++) {
      components.push({
        type: "capacitor",
        pos: {
          x: (2 + Math.floor(Math.random() * Math.max(1, cols - 4))) * GRID,
          y: (2 + Math.floor(Math.random() * Math.max(1, rows - 4))) * GRID,
        },
      });
    }

    // Vias scattered densely across the board
    const viaPositions: Vec2[] = [];
    const viaCount = Math.floor(cols * rows * componentDensity * 3);
    for (let i = 0; i < viaCount; i++) {
      viaPositions.push({
        x: Math.floor(Math.random() * cols) * GRID,
        y: Math.floor(Math.random() * rows) * GRID,
      });
    }

    // ── Signal pathfinding (BFS, returns longest path within depth budget) ─────
    function findPath(startIdx: number, maxDepth = 20): number[] {
      const visited = new Set<number>([startIdx]);
      const queue: { idx: number; path: number[] }[] = [
        { idx: startIdx, path: [startIdx] },
      ];
      let best: number[] = [startIdx];
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        const { idx, path } = item;
        if (path.length > best.length) best = path;
        if (path.length >= maxDepth) continue;
        for (const n of nodes[idx].connections) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push({ idx: n, path: [...path, n] });
          }
        }
      }
      return best;
    }

    // ── Signals ────────────────────────────────────────────────────────────────
    const signals: Signal[] = [];
    function spawnSignal() {
      if (nodes.length === 0) return;
      const startIdx = Math.floor(Math.random() * nodes.length);
      const path = findPath(startIdx, 12 + Math.floor(Math.random() * 15));
      if (path.length < 3) return;
      signals.push({
        pathNodes: path,
        progress: 0,
        speed: SIGNAL_SPEED_MIN + Math.random() * (SIGNAL_SPEED_MAX - SIGNAL_SPEED_MIN),
        opacity: 1,
        phase: "traveling",
        color: Math.random() > 0.3 ? SIGNAL_COLOR : "#FF9900",
      });
    }
    for (let i = 0; i < 3; i++) spawnSignal();

    // ── Trace renderer (per frame, with cursor proximity glow) ─────────────────
    function drawAllTraces(mouseX: number, mouseY: number) {
      ctx.lineWidth = 1;
      const drawn = new Set<string>();
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (const j of a.connections) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (drawn.has(key)) continue;
          drawn.add(key);
          const b = nodes[j];

          // Cheap cursor proximity from segment midpoint
          const midX = (a.pos.x + b.pos.x) / 2;
          const midY = (a.pos.y + b.pos.y) / 2;
          const dist = Math.hypot(midX - mouseX, midY - mouseY);
          const proximity = isMobile ? 0 : Math.max(0, 1 - dist / 180);

          ctx.globalAlpha = TRACE_OPACITY + proximity * 0.4;
          ctx.strokeStyle = TRACE_COLOR_PRIMARY;
          ctx.lineWidth = proximity > 0.2 ? 1.5 : 1;
          if (proximity > 0.1) {
            ctx.shadowColor = TRACE_COLOR_PRIMARY;
            ctx.shadowBlur = proximity * 6;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.moveTo(a.pos.x, a.pos.y);
          // L-shaped between non-aligned nodes (no diagonal traces)
          if (a.pos.x !== b.pos.x && a.pos.y !== b.pos.y) {
            ctx.lineTo(a.pos.x, b.pos.y);
          }
          ctx.lineTo(b.pos.x, b.pos.y);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function drawSignals() {
      for (const sig of signals) {
        const { pathNodes, progress, opacity, color } = sig;
        if (pathNodes.length < 2) continue;

        const segLens: number[] = [];
        let totalLen = 0;
        for (let i = 1; i < pathNodes.length; i++) {
          const a = nodes[pathNodes[i - 1]].pos;
          const b = nodes[pathNodes[i]].pos;
          const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
          segLens.push(len);
          totalLen += len;
        }
        if (totalLen === 0) continue;

        const traveled = progress * totalLen;
        let remaining = traveled;
        let signalPos: Vec2 = nodes[pathNodes[0]].pos;
        for (let i = 0; i < segLens.length; i++) {
          if (remaining <= segLens[i]) {
            const a = nodes[pathNodes[i]].pos;
            const b = nodes[pathNodes[i + 1]].pos;
            const t = segLens[i] === 0 ? 0 : remaining / segLens[i];
            // Mirror the L-shape used by drawAllTraces: horizontal first, then vertical
            if (a.x !== b.x) {
              if (t < 0.5) {
                signalPos = { x: a.x + (b.x - a.x) * (t * 2), y: a.y };
              } else {
                signalPos = { x: b.x, y: a.y + (b.y - a.y) * ((t - 0.5) * 2) };
              }
            } else {
              signalPos = { x: a.x, y: a.y + (b.y - a.y) * t };
            }
            break;
          }
          remaining -= segLens[i];
          signalPos = nodes[pathNodes[i + 1]].pos;
        }

        // Trail dots (faded copies behind the head)
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = color;
        for (let t = 0; t < 5; t++) {
          ctx.globalAlpha = opacity * (1 - t * 0.2) * 0.6;
          ctx.beginPath();
          ctx.arc(signalPos.x, signalPos.y, 2 - t * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Head dot
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(signalPos.x, signalPos.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Light up nearby vias as the signal passes
        for (const via of viaPositions) {
          if (Math.hypot(via.x - signalPos.x, via.y - signalPos.y) < 15) {
            drawVia(ctx, via, opacity, true);
          }
        }
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      drawAllTraces(mx, my);

      for (const comp of components) {
        if (comp.type === "ic") {
          drawIC(ctx, comp.pos, comp.w, comp.h, 16, comp.label, 1);
        } else if (comp.type === "resistor") {
          drawResistor(ctx, comp.pos, comp.horizontal, 1);
        } else {
          drawCapacitor(ctx, comp.pos, 1);
        }
      }

      for (const via of viaPositions) drawVia(ctx, via, 1, false);

      // Update signal phase + opacity
      for (let i = signals.length - 1; i >= 0; i--) {
        const sig = signals[i];
        if (sig.phase === "traveling") {
          sig.progress = Math.min(1, sig.progress + sig.speed);
          if (sig.progress >= 1) sig.phase = "fading";
        } else {
          sig.opacity -= 0.04;
          if (sig.opacity <= 0) {
            signals.splice(i, 1);
            continue;
          }
        }
      }

      drawSignals();

      if (signals.length < MAX_SIGNALS && Math.random() < 0.02) spawnSignal();

      animId = requestAnimationFrame(tick);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ willChange: "transform", opacity: 0.65 }}
      aria-hidden
    />
  );
}
