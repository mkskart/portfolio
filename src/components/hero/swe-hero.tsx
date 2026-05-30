"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getAccent, getAccentGlow } from "@/lib/theme-colors";
import { TerminalCanvas, TERMINAL_LINES } from "./terminal-canvas";
import { TERMINAL_COMPLETE_MS } from "./swe-timing";

// SWE hero sequence: terminal types → characters corrupt into 0/1 and fall →
// Matrix rain fills the background. Self-contained phase machine.

type SwePhase = "terminal" | "corrupting" | "rain";

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const LINE_H = 28; // matches DOM terminal leading-7
const FONT_PX = 14; // matches text-sm

// ── Phase 2: terminal characters corrupt into 0/1 and fall ──────────────────
interface FallingChar {
  ch: string; // currently displayed glyph
  x: number;
  y: number;
  vy: number;
  opacity: number;
  phase: 0 | 1 | 2; // waiting | glitching | falling
  startDelay: number;
  glitchTimer: number;
  glitchLeft: number;
  dead: boolean;
}

function DissolveCanvas({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const canvasMaybe = canvasRef.current;
    if (!canvasMaybe) return;
    const ctxMaybe = canvasMaybe.getContext("2d");
    if (!ctxMaybe) return;
    const canvas = canvasMaybe;
    const ctx = ctxMaybe;

    const fire = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(fire, 0);
      return () => clearTimeout(t);
    }

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.max(1, w * dpr);
    canvas.height = Math.max(1, h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${FONT_PX}px ${MONO}`;
    ctx.textBaseline = "alphabetic";

    const accent = getAccent();
    const glow = getAccentGlow();
    const charW = ctx.measureText("M").width || 8.4;

    // Mirror the DOM terminal layout: centered max-w-2xl (672) block, px-8.
    const blockW = Math.min(672, w);
    const textLeft = (w - blockW) / 2 + 32;
    const numLines = TERMINAL_LINES.length;
    const textTop = (h - numLines * LINE_H) / 2;

    const chars: FallingChar[] = [];
    TERMINAL_LINES.forEach((line, li) => {
      const full = (line.prompt ?? "") + line.text;
      for (let ci = 0; ci < full.length; ci++) {
        if (full[ci] === " ") continue;
        chars.push({
          ch: full[ci],
          x: textLeft + ci * charW,
          y: textTop + li * LINE_H + FONT_PX,
          vy: 0,
          opacity: 1,
          phase: 0,
          startDelay: Math.random() * 600,
          glitchTimer: 0,
          glitchLeft: 4 + Math.floor(Math.random() * 5),
          dead: false,
        });
      }
    });

    const GRAVITY = 0.0022; // px/ms^2
    let elapsed = 0;
    let lastTs = performance.now();
    let animId = 0;

    const frame = (now: number) => {
      const dt = Math.min(64, now - lastTs);
      lastTs = now;
      elapsed += dt;

      ctx.clearRect(0, 0, w, h);

      let remaining = 0;
      for (const c of chars) {
        if (c.dead) continue;
        remaining++;

        if (c.phase === 0) {
          if (elapsed >= c.startDelay) c.phase = 1;
        } else if (c.phase === 1) {
          c.glitchTimer += dt;
          if (c.glitchTimer >= 50) {
            c.glitchTimer -= 50;
            c.ch = Math.random() > 0.5 ? "1" : "0";
            c.glitchLeft--;
            if (c.glitchLeft <= 0) c.phase = 2;
          }
        } else {
          c.vy += GRAVITY * dt;
          c.y += c.vy * dt;
          c.opacity -= 0.0011 * dt;
          if (c.y > h + 20 || c.opacity <= 0) {
            c.dead = true;
            continue;
          }
        }

        const isGlitch = c.phase >= 1;
        ctx.fillStyle = colorWithAlpha(
          c.phase === 2 ? accent : glow,
          Math.max(0, Math.min(1, c.opacity)) * (isGlitch ? 1 : 0.85),
        );
        ctx.fillText(c.ch, c.x, c.y);
      }

      if (remaining === 0) {
        fire();
        return;
      }
      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, w, h);
    };
  }, [onComplete]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

// ── Phase 3: Matrix rain (binary) with center vignette ──────────────────────
function MatrixRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasMaybe = canvasRef.current;
    if (!canvasMaybe) return;
    const ctxMaybe = canvasMaybe.getContext("2d");
    if (!ctxMaybe) return;
    const canvas = canvasMaybe;
    const ctx = ctxMaybe;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const accent = getAccent();
    const glow = getAccentGlow();

    const COL_SPACING = 15;
    const CHAR_H = 16;
    const TRAIL = 20;

    let w = 0;
    let h = 0;
    let animId = 0;
    let lastTs = performance.now();

    interface Column {
      head: number; // head row position (in rows, can be fractional/negative)
      speed: number; // rows per second
    }
    let cols: Column[] = [];

    const resetColumns = () => {
      const n = Math.ceil(w / COL_SPACING);
      cols = Array.from({ length: n }, () => ({
        head: -Math.random() * (h / CHAR_H),
        speed: 6 + Math.random() * 9, // ~6–15 chars/sec
      }));
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${CHAR_H - 3}px ${MONO}`;
      ctx.textBaseline = "top";
      resetColumns();
    };
    resize();
    window.addEventListener("resize", resize);

    const drawVignette = () => {
      const cx = w / 2;
      const cy = h / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
      grad.addColorStop(0, "rgba(10,10,10,0.75)");
      grad.addColorStop(0.4, "rgba(10,10,10,0.4)");
      grad.addColorStop(1, "rgba(10,10,10,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    const drawFrame = (dtRows: number) => {
      ctx.clearRect(0, 0, w, h);

      cols.forEach((col, i) => {
        const x = i * COL_SPACING;
        col.head += dtRows * col.speed;
        for (let k = 0; k < TRAIL; k++) {
          const row = Math.floor(col.head) - k;
          if (row < 0) continue;
          const y = row * CHAR_H;
          if (y > h) continue;
          const ch = Math.random() > 0.5 ? "1" : "0";
          // Head brightest (glow), trail fades toward 0.
          const a = (1 - k / TRAIL) * 0.5;
          ctx.fillStyle = colorWithAlpha(k === 0 ? glow : accent, k === 0 ? 0.9 : a);
          ctx.fillText(ch, x, y);
        }
        if ((col.head - TRAIL) * CHAR_H > h) {
          col.head = -Math.random() * 8;
          col.speed = 6 + Math.random() * 9;
        }
      });

      drawVignette();
    };

    if (reduced) {
      drawFrame(0);
      return () => {
        window.removeEventListener("resize", resize);
        ctx.clearRect(0, 0, w, h);
      };
    }

    const frame = (now: number) => {
      const dt = Math.min(64, now - lastTs);
      lastTs = now;
      drawFrame(dt / 1000);
      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, w, h);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

// Build an rgba()/8-digit-hex string from a hex color + alpha.
function colorWithAlpha(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(57,255,20,${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function SweHero() {
  const [phase, setPhase] = useState<SwePhase>("terminal");

  useEffect(() => {
    const t = setTimeout(() => setPhase("corrupting"), TERMINAL_COMPLETE_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0">
      {phase === "terminal" && <TerminalCanvas />}
      {phase === "corrupting" && <DissolveCanvas onComplete={() => setPhase("rain")} />}
      {phase !== "terminal" && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <MatrixRainCanvas />
        </motion.div>
      )}
    </div>
  );
}
