"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ease } from "@/lib/motion";

const DroneScene = dynamic(
  () => import("./litewing/drone-scene").then((m) => m.DroneScene),
  { ssr: false, loading: () => null },
);
const BionicArmScene = dynamic(
  () => import("./bionic-arm/bionic-arm-scene").then((m) => m.BionicArmScene),
  { ssr: false, loading: () => null },
);

/** Mounts its 3D preview only once scrolled near — two idle canvases is a lot. */
function LazyStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "300px" });
  return (
    <div ref={ref} className="absolute inset-0">
      {inView ? children : null}
    </div>
  );
}

interface CardProps {
  anchorId: string;
  eyebrow: string;
  title: string;
  blurb: string;
  chips: string[];
  href: string;
  hrefLabel: string;
  github?: string;
  delay: number;
  children: React.ReactNode;
}

function FlagshipCard({
  anchorId,
  eyebrow,
  title,
  blurb,
  chips,
  href,
  hrefLabel,
  github,
  delay,
  children,
}: CardProps) {
  return (
    <motion.div
      id={anchorId}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, delay, ease }}
      className="glass card-hover group relative overflow-hidden rounded-2xl"
    >
      {/* 3D idle preview */}
      <div className="relative h-64 md:h-72">
        <LazyStage>{children}</LazyStage>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, rgba(255,23,68,0.1), transparent 65%)",
          }}
        />
      </div>

      <div className="space-y-4 p-6 md:p-7">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-glow">
          {eyebrow}
        </div>
        <h3 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          {title}
        </h3>
        <p className="max-w-[46ch] text-base leading-relaxed text-text-secondary">
          {blurb}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border-subtle bg-bg-elevated/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted"
            >
              {c}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Link
            href={href}
            className="group/link inline-flex items-center gap-2 rounded border border-border-subtle px-5 py-2.5 font-mono text-sm text-text-primary transition-all duration-200 hover:border-red-primary hover:text-red-glow"
          >
            {hrefLabel}
            <span className="transition-transform group-hover/link:translate-x-1">→</span>
          </Link>
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-red-glow"
            >
              GitHub →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Firmware headliner: two flagship builds sharing one spotlight. Each card shows
 * an idle 3D preview and opens to its full interactive simulation on a dedicated
 * page (/litewing, /bionic-arm) — the camera and heavy interaction live there.
 */
export function FirmwareFlagships() {
  return (
    <section id="flagships" className="relative px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease }}
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Firmware in Motion
          </h2>
          <p className="mt-3 max-w-[52ch] text-base text-text-secondary">
            Two flagship builds — both live, both from the metal up. Open either
            for the full interactive simulation.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <FlagshipCard
            anchorId="litewing"
            eyebrow="01 · Flight"
            title="LiteWing"
            blurb="Custom ESP32 flight controller — a 1ms PID attitude loop written in C++ from the metal up. Steer it with your cursor, or your hand."
            chips={["ESP32", "C++", "FreeRTOS", "1ms PID"]}
            href="/litewing"
            hrefLabel="Open simulation"
            github="https://github.com/mkskart/litewing"
            delay={0}
          >
            <DroneScene />
          </FlagshipCard>

          <FlagshipCard
            anchorId="bionic-arm"
            eyebrow="02 · Robotics"
            title="Bionic Hand"
            blurb="Webcam hand tracking drives a 16-DOF robotic hand in real time — a browser analog of my HCRL bionic-hand research. Runs entirely on-device."
            chips={["MediaPipe", "R3F", "16-DOF", "HCRL"]}
            href="/bionic-arm"
            hrefLabel="Try the simulation"
            delay={0.12}
          >
            <BionicArmScene interactive={false} controls={false} autoRotate />
          </FlagshipCard>
        </div>
      </div>
    </section>
  );
}
