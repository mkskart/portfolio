"use client";

import { useState } from "react";
import { TickerBar } from "./ticker-bar";
import { EquityCurve } from "./equity-curve";
import { OrderLog } from "./order-log";
import { SignalPanel } from "./signal-panel";
import { EquityModal } from "./equity-modal";

export function Dashboard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="glass-red red-glow rounded-2xl p-1 shadow-[0_30px_80px_-20px_var(--glow-a20)]">
        <div className="rounded-[14px] bg-bg-base/70 p-4 md:p-5">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2.5">
              <span className="live-dot" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
                paper.trading.live
              </span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              env: simulated
            </div>
          </div>

          {/* Ticker */}
          <div className="border-b border-border-subtle py-2">
            <TickerBar />
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  equity_curve.live
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  click to scrub
                </span>
              </div>
              <EquityCurve onExpand={() => setOpen(true)} />
            </div>
            <div className="rounded-xl border border-border-subtle bg-bg-elevated/50 p-4">
              <SignalPanel />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border-subtle bg-bg-elevated/40 p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
              order_log.tail
            </div>
            <OrderLog />
          </div>
        </div>
      </div>
      <EquityModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
