"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  TIER_ONE,
  TIER_TWO,
  BADGE_STYLES,
  type TierOneCar,
  type TierTwoCar,
} from "@/components/garage/garage-data";
import { Tier2Card } from "@/components/garage/tier2-card";

const ease = [0.22, 1, 0.36, 1] as const;

const GarageScene = dynamic(
  () => import("@/components/garage/garage-scene").then((m) => m.GarageScene),
  { ssr: false, loading: () => <div className="h-full w-full bg-bg-base" /> },
);

type ActiveCar =
  | { kind: "tier1"; car: TierOneCar }
  | { kind: "tier2"; car: TierTwoCar };

export default function GaragePage() {
  const [tier1Idx, setTier1Idx] = useState(0);
  const [promoted, setPromoted] = useState<TierTwoCar | null>(null);
  const [loaded, setLoaded] = useState(false);
  const showroomRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const active: ActiveCar = promoted
    ? { kind: "tier2", car: promoted }
    : { kind: "tier1", car: TIER_ONE[tier1Idx] };

  const next = () => {
    setPromoted(null);
    setTier1Idx((p) => (p + 1) % TIER_ONE.length);
  };
  const prev = () => {
    setPromoted(null);
    setTier1Idx((p) => (p - 1 + TIER_ONE.length) % TIER_ONE.length);
  };
  const jumpTier1 = (idx: number) => {
    setPromoted(null);
    setTier1Idx(idx);
  };

  const promote = (car: TierTwoCar) => {
    setPromoted(car);
    showroomRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Reset skeleton on every car change. Cleared by GarageScene's onLoaded
  // callback once the new GLB is past Suspense and rendering.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setLoaded(false));
    return () => cancelAnimationFrame(raf);
  }, [active.car.id]);

  // Priority preload: warm the cache for the first car on mount, then warm
  // the next car only after each navigation (slight delay so the current
  // model paints first).
  useEffect(() => {
    useGLTF.preload(TIER_ONE[0].glb);
  }, []);
  useEffect(() => {
    if (active.kind !== "tier1") return;
    const nextIdx = (tier1Idx + 1) % TIER_ONE.length;
    const t = setTimeout(() => useGLTF.preload(TIER_ONE[nextIdx].glb), 500);
    return () => clearTimeout(t);
  }, [tier1Idx, active.kind]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Programmatic zoom via direct camera-position math (avoids three's
  // undocumented dollyIn/dollyOut). Scales the offset from the orbit target
  // and clamps to min/maxDistance.
  const zoomBy = useCallback((factor: number) => {
    const c = controlsRef.current;
    if (!c) return;
    const offset = c.object.position.clone().sub(c.target);
    const newDist = THREE.MathUtils.clamp(
      offset.length() * factor,
      c.minDistance,
      c.maxDistance,
    );
    offset.setLength(newDist);
    c.object.position.copy(c.target).add(offset);
    c.update();
  }, []);

  return (
    <div className="relative min-h-screen bg-bg-base">
      {/* ──────────────── Tier 1 showroom ──────────────── */}
      <section
        ref={showroomRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Top bar */}
        <div className="absolute left-4 top-4 z-30 flex items-center">
          <Link
            href="/#garage"
            className="group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated/70 px-3 py-1.5 text-xs text-text-secondary backdrop-blur transition-colors hover:border-red-glow hover:text-red-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back
          </Link>
        </div>
        {/* Centered title pill */}
        <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2">
          <div className="rounded-full border border-border-subtle bg-bg-elevated/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-text-muted backdrop-blur">
            DREAM GARAGE · {TIER_ONE.length + TIER_TWO.length} cars
          </div>
        </div>

        {/* Zoom controls — top-right of the viewer */}
        <div className="absolute right-4 top-4 z-30 flex flex-col gap-2">
          <ZoomBtn label="Zoom in" onClick={() => zoomBy(0.85)}>
            <Plus className="h-4 w-4" />
          </ZoomBtn>
          <ZoomBtn label="Zoom out" onClick={() => zoomBy(1.18)}>
            <Minus className="h-4 w-4" />
          </ZoomBtn>
        </div>

        {/* Scene — re-keyed on car change for a clean crossfade */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.car.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              className="absolute inset-0"
            >
              {active.car.glb && (
                <GarageScene
                  glbSrc={active.car.glb}
                  interactive
                  controlsRef={controlsRef}
                  onLoaded={() => setLoaded(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Loading skeleton — shows while !loaded, fades when GLB resolves */}
        <AnimatePresence>
          {!loaded && (
            <motion.div
              key={`skel-${active.car.id}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            >
              <CarLoadingSkeleton carName={active.car.name} year={active.car.year} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right-side info panel — desktop */}
        <AnimatePresence mode="wait">
          <motion.aside
            key={active.car.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.45, ease }}
            className="pointer-events-none absolute right-6 top-1/2 z-30 hidden max-w-[380px] -translate-y-1/2 md:block"
          >
            <div className="flex items-center gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-red-glow">
                {active.car.year}
              </div>
              {active.kind === "tier1" && active.car.badge && (
                <span
                  className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${BADGE_STYLES[active.car.badge]}`}
                >
                  {active.car.badge}
                </span>
              )}
            </div>
            <h1
              className="mt-2 font-display font-semibold tracking-tight text-text-primary"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)", lineHeight: 1.05 }}
            >
              {active.car.name}
            </h1>

            <dl className="mt-6 grid grid-cols-3 gap-x-4 gap-y-1 border-t border-border-subtle pt-5">
              <Stat label="HP" value={active.car.hp} suffix="hp" />
              <Stat label="TOP SPEED" value={active.car.topSpeed} />
              {active.kind === "tier1" ? (
                <Stat label="WEIGHT" value={active.car.weight} />
              ) : (
                <Stat label="TIER" value="2" />
              )}
            </dl>

            {active.kind === "tier1" && (
              <p className="mt-5 max-w-[44ch] border-l-2 border-red-primary pl-3 text-sm italic leading-relaxed text-text-secondary">
                &ldquo;{active.car.why}&rdquo;
              </p>
            )}

            {active.kind === "tier1" && active.car.id === "testarossa-2025" && (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-text-muted">
                ← see the original
              </p>
            )}
            {active.kind === "tier1" && active.car.id === "testarossa-classic" && (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-text-muted">
                see the 2025 refresh →
              </p>
            )}
          </motion.aside>
        </AnimatePresence>

        {/* Mobile info — bottom-stacked */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`m-${active.car.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="pointer-events-none absolute bottom-24 left-6 right-6 z-30 md:hidden"
          >
            <div className="flex items-center gap-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-red-glow">
                {active.car.year}
              </div>
              {active.kind === "tier1" && active.car.badge && (
                <span
                  className={`rounded-sm px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest ${BADGE_STYLES[active.car.badge]}`}
                >
                  {active.car.badge}
                </span>
              )}
            </div>
            <div className="mt-1 font-display text-2xl font-semibold tracking-tight text-text-primary">
              {active.car.name}
            </div>
            <div className="mt-1 font-mono text-xs text-text-secondary">
              {active.car.hp}hp · {active.car.topSpeed}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
          <button
            onClick={prev}
            aria-label="Previous"
            className="rounded-full border border-border-subtle bg-bg-elevated/80 p-3 text-text-secondary backdrop-blur transition-colors hover:border-red-glow hover:text-red-glow"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {TIER_ONE.map((c, idx) => {
              const isActive = active.kind === "tier1" && idx === tier1Idx;
              return (
                <button
                  key={c.id}
                  onClick={() => jumpTier1(idx)}
                  aria-label={c.name}
                  className={`h-2 rounded-full transition-all ${
                    isActive ? "w-8 bg-red-glow" : "w-2 bg-text-muted/40 hover:bg-text-secondary"
                  }`}
                />
              );
            })}
          </div>
          <button
            onClick={next}
            aria-label="Next"
            className="rounded-full border border-border-subtle bg-bg-elevated/80 p-3 text-text-secondary backdrop-blur transition-colors hover:border-red-glow hover:text-red-glow"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-4 z-30 hidden font-mono text-[10px] uppercase tracking-widest text-text-muted md:block">
          drag to rotate · ± to zoom · ←→ arrows
        </div>
      </section>

      {/* ──────────────── Tier 2 grid ──────────────── */}
      <section className="border-t border-border-subtle px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
              Also in the garage
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
              {TIER_TWO.length} more
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
            {TIER_TWO.map((car) => (
              <Tier2Card key={car.id} car={car} onPromote={promote} />
            ))}
          </div>

          <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-text-muted">
            click a card to load it in the showroom
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm font-semibold text-red-glow">
        {value}
        {suffix && <span className="ml-0.5 text-text-muted">{suffix}</span>}
      </dd>
    </div>
  );
}

function ZoomBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded border border-border-subtle bg-bg-elevated/80 font-mono text-text-primary backdrop-blur transition-colors hover:border-red-glow hover:text-red-glow"
    >
      {children}
    </button>
  );
}

function CarLoadingSkeleton({
  carName,
  year,
}: {
  carName: string;
  year: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="h-2 w-2 animate-pulse rounded-full bg-red-primary" />
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
          {year}
        </p>
        <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-text-primary">
          {carName}
        </p>
      </div>
    </div>
  );
}
