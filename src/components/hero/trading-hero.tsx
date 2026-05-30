"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Bloomberg-terminal-style quant hero: scrolling ticker tape + a live
// candlestick chart that scrolls left continuously and forms a new candle on
// the right edge in real time, with a blur scrim between the chart and the
// name overlay so the foreground text stays legible.

const GOLD = "#f59e0b"; // up candles / accents — intentional, not theme color
const DOWN = "#ef4444"; // down candles — intentional, not theme color

const TICKER_SYMBOLS = [
  "AAPL", "NVDA", "TSLA", "SPY", "QQQ", "BTC", "META", "MSFT", "AMD", "GOOGL", "AMZN", "ETH",
];

interface Ticker {
  symbol: string;
  price: number;
  change: number;
}

function makeTickers(): Ticker[] {
  return TICKER_SYMBOLS.map((symbol) => ({
    symbol,
    price: parseFloat((Math.random() * 800 + 40).toFixed(2)),
    change: parseFloat((Math.random() * 6 - 3).toFixed(2)),
  }));
}

// ── Scrolling ticker tape ───────────────────────────────────────────────────
function TickerTape() {
  const [tickers, setTickers] = useState<Ticker[]>(makeTickers);

  useEffect(() => {
    const t = setInterval(() => {
      setTickers((prev) =>
        prev.map((tk) =>
          Math.random() > 0.6
            ? { ...tk, change: parseFloat((Math.random() * 6 - 3).toFixed(2)) }
            : tk,
        ),
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const row = [...tickers, ...tickers];

  return (
    <div
      className="absolute inset-x-0 top-0 z-20 flex items-center overflow-hidden border-b py-2"
      style={{ borderColor: "rgba(245,158,11,0.18)", backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <motion.div
        className="flex shrink-0 gap-8 whitespace-nowrap pr-8 font-mono text-xs"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, ease: "linear", repeat: Infinity }}
      >
        {row.map((tk, i) => {
          const up = tk.change >= 0;
          return (
            <span key={`${tk.symbol}-${i}`} className="flex items-center gap-2">
              <span style={{ color: GOLD }}>{tk.symbol}</span>
              <span style={{ color: "rgba(245,158,11,0.55)" }}>{tk.price.toFixed(2)}</span>
              <span style={{ color: up ? GOLD : DOWN }}>
                {up ? "▲" : "▼"} {up ? "+" : ""}
                {tk.change.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  isUp: boolean;
}

// ── Live candlestick chart ──────────────────────────────────────────────────
// Maintains a rolling window of candles. The whole series scrolls left at a
// constant speed; once it has scrolled one candle-width the oldest candle is
// dropped and a fresh one begins forming on the right. The forming candle's
// body grows from 0→full over the interval, simulating price action.
function CandlestickChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasMaybe = canvasRef.current;
    if (!canvasMaybe) return;
    const ctxMaybe = canvasMaybe.getContext("2d");
    if (!ctxMaybe) return;
    const canvas = canvasMaybe;
    const ctx = ctxMaybe;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const SPACING = 16;
    const BODY_W = 9;
    const MARGIN_RIGHT = 48;
    const CANDLE_MS = 800; // time for one candle to form / scroll one slot
    const PAD_Y = 64;

    let w = 0;
    let h = 0;
    let animId = 0;
    let lastClose = 100;
    let candles: Candle[] = [];
    let offset = 0; // px scrolled within the current (forming) candle
    let lastTs = performance.now();

    const targetCount = () => Math.ceil(w / SPACING) + 4;

    const makeCandle = (): Candle => {
      const open = lastClose;
      const drift = (Math.random() - 0.46) * 6;
      const close = Math.max(8, open + drift);
      const high = Math.max(open, close) + Math.random() * 3;
      const low = Math.min(open, close) - Math.random() * 3;
      lastClose = close;
      return { open, high, low, close, isUp: close >= open };
    };

    const refill = () => {
      candles = [];
      lastClose = 100;
      const n = targetCount();
      for (let i = 0; i < n; i++) candles.push(makeCandle());
      offset = 0;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      refill();
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (formingProgress: number) => {
      ctx.clearRect(0, 0, w, h);
      if (w === 0 || h === 0) return;

      const n = candles.length;
      // Price scale from the full (final) range of the visible candles.
      let max = -Infinity;
      let min = Infinity;
      for (const c of candles) {
        if (c.high > max) max = c.high;
        if (c.low < min) min = c.low;
      }
      const range = max - min || 1;
      const toY = (v: number) => PAD_Y + (1 - (v - min) / range) * (h - PAD_Y * 2);

      // Faint grid
      ctx.strokeStyle = "rgba(245,158,11,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = (h / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      for (let i = 0; i < n; i++) {
        const c = candles[i];
        // Newest candle anchored near the right edge; offset slides left.
        const x = w - MARGIN_RIGHT - (n - 1 - i) * SPACING - offset;
        if (x < -SPACING || x > w + SPACING) continue;

        const forming = i === n - 1;
        const p = forming ? formingProgress : 1;
        // Interpolate from open so the forming candle visibly builds.
        const dClose = c.open + (c.close - c.open) * p;
        const dHigh = c.open + (c.high - c.open) * p;
        const dLow = c.open - (c.open - c.low) * p;
        const color = c.isUp ? GOLD : DOWN;

        // Wick
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, toY(dHigh));
        ctx.lineTo(x, toY(dLow));
        ctx.stroke();

        // Body
        const yOpen = toY(c.open);
        const yClose = toY(dClose);
        const top = Math.min(yOpen, yClose);
        const bh = Math.max(forming ? 0 : 2, Math.abs(yClose - yOpen));
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = color;
        ctx.fillRect(x - BODY_W / 2, top, BODY_W, bh);
        ctx.globalAlpha = 1;
      }
    };

    const animate = (now: number) => {
      const dt = Math.min(64, now - lastTs);
      lastTs = now;

      offset += (SPACING / CANDLE_MS) * dt;
      if (offset >= SPACING) {
        offset -= SPACING;
        // The forming candle is now closed; start a new one and drop the oldest.
        candles.push(makeCandle());
        while (candles.length > targetCount() + 2) candles.shift();
      }

      draw(Math.min(1, offset / SPACING));
      animId = requestAnimationFrame(animate);
    };

    if (reduced) {
      draw(1); // static fully-formed chart
    } else {
      animId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

export function TradingHero() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
      <CandlestickChart />

      {/* Blur scrim between the chart and the name overlay for legibility. */}
      <div
        className="absolute inset-0 z-10"
        style={{
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          background:
            "radial-gradient(ellipse at center, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.35) 45%, rgba(10,10,10,0.15) 100%)",
        }}
      />

      <TickerTape />
    </div>
  );
}
