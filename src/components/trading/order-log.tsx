"use client";

import { useEffect, useState } from "react";

type Side = "BUY" | "SELL" | "HOLD" | "RISK";

interface Entry {
  id: number;
  ts: string;
  side: Side;
  symbol: string;
  qty?: number;
  price?: number;
  pnl?: number;
  note?: string;
}

const SYMBOLS = ["NVDA", "AAPL", "TSLA", "MSFT", "AMD", "SPY"];

function clock() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate(id: number): Entry {
  const r = Math.random();
  const symbol = pick(SYMBOLS);
  const ts = clock();
  if (r < 0.45) {
    return {
      id,
      ts,
      side: "BUY",
      symbol,
      qty: Math.ceil(Math.random() * 4) + 1,
      price: 100 + Math.random() * 200,
    };
  }
  if (r < 0.85) {
    const pnl = (Math.random() - 0.35) * 5;
    return {
      id,
      ts,
      side: "SELL",
      symbol,
      qty: Math.ceil(Math.random() * 4) + 1,
      price: 100 + Math.random() * 200,
      pnl,
    };
  }
  if (r < 0.95) {
    return {
      id,
      ts,
      side: "HOLD",
      symbol,
      note: `signal: confidence 0.${Math.floor(Math.random() * 30) + 50}`,
    };
  }
  return {
    id,
    ts,
    side: "RISK",
    symbol: "—",
    note: "volatility spike detected",
  };
}

const COLOR: Record<Side, string> = {
  BUY: "text-emerald-400",
  SELL: "text-red-glow",
  HOLD: "text-text-secondary",
  RISK: "text-amber-300",
};

const SKELETON_LINES = 6;

export function OrderLog() {
  // Render empty placeholder on server to avoid hydration mismatch.
  // Populate purely client-side via useEffect.
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    let id = 0;
    const seed = () =>
      setEntries(Array.from({ length: SKELETON_LINES }, () => generate(id++)));
    const raf = requestAnimationFrame(seed);
    const t = setInterval(() => {
      setEntries((prev) => [generate(id++), ...prev].slice(0, 8));
    }, 3500);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  if (entries.length === 0) {
    return (
      <ul className="font-mono text-[11px] leading-[1.7]">
        {Array.from({ length: SKELETON_LINES }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[68px_1fr] gap-3 truncate text-text-muted/30"
            aria-hidden
          >
            <span>[--:--:--]</span>
            <span>—</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="font-mono text-[11px] leading-[1.7]">
      {entries.map((e) => (
        <li key={e.id} className="grid grid-cols-[68px_1fr] gap-3 truncate">
          <span className="text-text-muted">[{e.ts}]</span>
          <span className="truncate">
            <span className={COLOR[e.side]}>{e.side.padEnd(4, " ")}</span>{" "}
            <span className="text-text-primary">{e.symbol}</span>
            {e.qty && (
              <span className="text-text-secondary">
                {" "}×{e.qty} @ {e.price?.toFixed(2)}
              </span>
            )}
            {typeof e.pnl === "number" && (
              <span className={e.pnl >= 0 ? "text-emerald-400" : "text-red-glow"}>
                {" "}({e.pnl >= 0 ? "+" : ""}${e.pnl.toFixed(2)})
              </span>
            )}
            {e.note && <span className="text-text-secondary"> {e.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
