"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ease } from "@/lib/motion";

const DroneScene = dynamic(
  () => import("./drone-scene").then((m) => m.DroneScene),
  { ssr: false, loading: () => null },
);

const STATS = [
  { value: "1.0ms", label: "PID loop period" },
  { value: "45µs", label: "Measured jitter (Saleae)" },
  { value: "±2.5°", label: "Hover accuracy" },
];

export function LiteWingSection() {
  const [interacted, setInteracted] = useState(false);
  return (
    <section id="litewing" className="relative isolate overflow-hidden px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 md:grid-cols-2">
        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease }}
          className="space-y-8"
        >
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-[4rem]">
            LiteWing
          </h2>
          <p className="max-w-[44ch] text-lg leading-relaxed text-text-secondary">
            Custom flight controller. ESP32. Written in C++ from the metal up.
          </p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-3 gap-3"
          >
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
                }}
                className="glass rounded-xl p-3"
              >
                <div className="font-mono text-xl font-semibold text-text-primary md:text-2xl">
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <p className="max-w-[50ch] text-base leading-relaxed text-text-secondary">
            Wrote the attitude control loop, sensor fusion pipeline, and a
            custom ESP-NOW telemetry layer.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/litewing"
              className="group inline-flex items-center gap-2 rounded border border-border-subtle px-6 py-3 font-mono text-sm text-text-primary transition-all duration-200 hover:border-red-primary hover:text-red-glow"
            >
              Open simulation
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="https://github.com/mkskart/litewing"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-red-glow"
            >
              GitHub →
            </a>
          </div>
        </motion.div>

        {/* Right scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.1, ease }}
          className="relative h-[440px] md:h-[520px]"
        >
          <DroneScene onInteract={() => setInteracted(true)} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 60% 50%, rgba(255,23,68,0.12), transparent 60%)",
            }}
          />
          <AnimatePresence>
            {!interacted && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: 1.2, duration: 0.6, ease }}
                className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted"
              >
                ← move your cursor →
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
