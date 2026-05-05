"use client";

import { useEffect, useState } from "react";

const SYMBOLS = ["AAPL", "NVDA", "TSLA", "SPY", "QQQ", "MSFT", "AMD", "META"];

interface Tick {
  symbol: string;
  price: number;
  change: number;
}

function seed(symbol: string): number {
  // deterministic-ish per symbol
  return 100 + (symbol.charCodeAt(0) + symbol.charCodeAt(1)) % 220;
}

// Deterministic seed runs identically on server + client → no hydration mismatch.
// Drift updates start only after mount.
export function TickerBar() {
  const [ticks, setTicks] = useState<Tick[]>(() =>
    SYMBOLS.map((s) => ({ symbol: s, price: seed(s), change: 0 })),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    const t = setInterval(() => {
      setTicks((prev) =>
        prev.map((p) => {
          const drift = (Math.random() - 0.48) * 0.5;
          const np = Math.max(1, p.price + drift);
          return { ...p, price: np, change: drift };
        }),
      );
    }, 1800);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  return (
    <div className="flex items-center gap-5 overflow-hidden whitespace-nowrap font-mono text-[11px] text-text-secondary">
      {ticks.map((t) => {
        const up = t.change >= 0;
        return (
          <span key={t.symbol} className="flex items-center gap-1.5">
            <span className="text-text-primary">{t.symbol}</span>
            <span>{t.price.toFixed(2)}</span>
            {mounted && (
              <span className={up ? "text-emerald-400" : "text-red-glow"}>
                {up ? "+" : ""}
                {t.change.toFixed(2)}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
