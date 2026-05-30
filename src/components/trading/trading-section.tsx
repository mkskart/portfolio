"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Dashboard } from "./dashboard";
import { CountUp } from "@/components/count-up";
import { ease } from "@/lib/motion";

export function TradingSection() {
  return (
    <section
      id="quantclaw-feature"
      className="relative px-6 py-24 md:py-32"
      aria-labelledby="trading-bot-title"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-16">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease }}
            className="space-y-7"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border-accent bg-red-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-red-glow">
              <span className="live-dot" />
              currently running
            </span>

            <h2
              id="trading-bot-title"
              className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-[3.5rem]"
            >
              <span className="bg-gradient-to-br from-red-primary via-red-glow to-amber-200 bg-clip-text text-transparent">
                QuantClaw
              </span>
            </h2>

            <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted">
              Algorithmic Trading Engine
            </p>

            <p className="max-w-[44ch] text-lg leading-relaxed text-text-secondary">
              A self-improving genetic system paired with an LLM-driven
              decision engine, running on real market data.{" "}
              <span className="text-text-primary">Strategy is proprietary.</span>
            </p>

            <div className="grid grid-cols-3 gap-4 border-y border-border-subtle py-5">
              <div>
                <div className="font-mono text-2xl font-semibold text-emerald-300 md:text-3xl">
                  +<CountUp to={20} suffix="%" />
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  paper return
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-text-primary md:text-3xl">
                  <CountUp to={70} suffix="%" />
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  backtest win rate
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-text-primary md:text-3xl">
                  <CountUp to={250} />
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  trades evaluated
                </div>
              </div>
            </div>

            <Link
              href="/trading-bot"
              className="group inline-flex items-center gap-2 rounded-md border border-red-primary px-5 py-2.5 text-sm font-medium text-red-glow transition-all duration-200 hover:bg-red-primary hover:text-white hover:shadow-[0_0_24px_-4px_var(--glow-a60)]"
            >
              See the deep dive
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Right dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, ease, delay: 0.1 }}
          >
            <Dashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
