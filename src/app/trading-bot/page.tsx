import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Dashboard } from "@/components/trading/dashboard";
import { EquityCurve } from "@/components/trading/equity-curve";
import { OrderBook } from "@/components/trading/order-book";
import { ConfidenceHistogram } from "@/components/trading/confidence-histogram";
import { CountUp } from "@/components/count-up";

export const metadata: Metadata = {
  title: "QuantClaw — Algorithmic Trading Engine",
  description:
    "QuantClaw — a self-improving genetic system paired with an LLM-driven decision engine, running on real market data.",
};

const STACK = ["Python", "PyTorch", "Groq API", "Flask", "Alpaca", "Isolation Forest"];

const PILLARS = [
  {
    n: "01",
    title: "Genetic Algorithm System",
    body:
      "50 candidate bots × 50 generations of fitness selection, daily — the population breeds toward whichever rule-set survives the backtest.",
  },
  {
    n: "02",
    title: "LLM Decision Engine",
    body:
      "An autonomous agent making trade decisions under hard risk rules — the model can hedge, hold, or halt, never override the risk layer.",
  },
  {
    n: "03",
    title: "Risk Controls",
    body:
      "An Isolation Forest watches volatility in real time. Anomaly score above threshold halts trading instantly — capital preservation first.",
  },
];

export default function TradingBotPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="px-6 pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-red-glow"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to portfolio
          </Link>

          <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-border-accent bg-red-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-red-glow">
            <span className="live-dot" />
            currently running
          </span>

          <h1 className="mt-6 max-w-[18ch] font-display text-5xl font-semibold leading-[1.02] tracking-tighter md:text-[5.5rem]">
            <span className="bg-gradient-to-br from-red-primary via-red-glow to-amber-200 bg-clip-text text-transparent">
              QuantClaw
            </span>
          </h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-[0.3em] text-text-muted">
            Algorithmic Trading Engine
          </p>

          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-text-secondary md:text-xl">
            Two architectures, one mandate: don&apos;t lose money. A
            self-improving genetic system paired with an LLM decision engine
            running on real market data — strategy stays proprietary.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {STACK.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border-subtle bg-bg-elevated/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Live dashboard */}
      <section className="px-6 pb-24 md:pb-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium text-text-secondary">
              Live dashboard
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              data: simulated · click chart to scrub
            </span>
          </div>
          <Dashboard />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="max-w-[26ch] font-display text-3xl font-semibold tracking-tight md:text-5xl">
            How it works (vaguely).
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.n}
                className="glass relative rounded-2xl p-6 transition-colors hover:border-border-accent"
              >
                <div className="font-mono text-[11px] uppercase tracking-widest text-red-glow">
                  {p.n}
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backtest results + extra panels */}
      <section className="px-6 py-24 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            Backtest, 12 months.
          </h2>
          <div className="mt-2 max-w-[60ch] text-lg leading-relaxed text-text-secondary">
            5-minute candles. 250 trades evaluated.
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="glass-red md:col-span-2 rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  equity_curve · 12mo
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">
                  +20% net
                </span>
              </div>
              <EquityCurve height={320} expandable={false} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="glass rounded-2xl p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  win rate
                </div>
                <div className="mt-2 font-display text-5xl font-bold text-emerald-300">
                  <CountUp to={70} suffix="%" />
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  trades evaluated
                </div>
                <div className="mt-2 font-display text-5xl font-bold text-text-primary">
                  <CountUp to={250} />
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  paper P/L · live
                </div>
                <div className="mt-2 font-display text-5xl font-bold text-red-glow">
                  +$<CountUp to={160} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                order_book.NVDA · L2
              </div>
              <OrderBook />
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  signal_confidence · histogram
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  μ ≈ 0.62
                </span>
              </div>
              <ConfidenceHistogram />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
            strategy is proprietary
          </span>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-red-glow"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to portfolio
          </Link>
        </div>
      </section>
    </div>
  );
}
