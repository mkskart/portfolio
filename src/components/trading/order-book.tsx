"use client";

import { useEffect, useState } from "react";

interface Level {
  price: number;
  qty: number;
}

const DEPTH = 8;

function generateLevels(side: "bid" | "ask", base: number): Level[] {
  return Array.from({ length: DEPTH }).map((_, i) => {
    const offset = (i + 1) * (0.05 + Math.random() * 0.04);
    const price = side === "bid" ? base - offset : base + offset;
    const qty = Math.floor(Math.random() * 480) + 20;
    return { price, qty };
  });
}

export function OrderBook() {
  const [base, setBase] = useState(143.10);
  const [bids, setBids] = useState<Level[]>(() => generateLevels("bid", 143.10));
  const [asks, setAsks] = useState<Level[]>(() => generateLevels("ask", 143.10));

  useEffect(() => {
    const t = setInterval(() => {
      setBase((b) => Math.max(50, b + (Math.random() - 0.5) * 0.18));
      setBids(generateLevels("bid", base));
      setAsks(generateLevels("ask", base));
    }, 1400);
    return () => clearInterval(t);
  }, [base]);

  const maxQty = Math.max(...bids.map((b) => b.qty), ...asks.map((a) => a.qty), 1);

  return (
    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
      <div>
        <div className="mb-1.5 text-text-muted uppercase tracking-widest text-[10px]">
          bids
        </div>
        {bids.map((b, i) => (
          <div key={i} className="relative grid grid-cols-2 px-1.5 py-0.5">
            <div
              className="absolute inset-y-0 right-0 bg-emerald-500/15"
              style={{ width: `${(b.qty / maxQty) * 100}%` }}
            />
            <span className="relative text-emerald-400">{b.price.toFixed(2)}</span>
            <span className="relative text-right text-text-secondary">{b.qty}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="mb-1.5 text-text-muted uppercase tracking-widest text-[10px]">
          asks
        </div>
        {asks.map((a, i) => (
          <div key={i} className="relative grid grid-cols-2 px-1.5 py-0.5">
            <div
              className="absolute inset-y-0 left-0 bg-red-glow/15"
              style={{ width: `${(a.qty / maxQty) * 100}%` }}
            />
            <span className="relative text-red-glow">{a.price.toFixed(2)}</span>
            <span className="relative text-right text-text-secondary">{a.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
