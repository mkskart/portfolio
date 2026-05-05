"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  TIER_ONE,
  TIER_TWO,
  BADGE_STYLES,
  type TierOneCar,
  type TierTwoCar,
} from "@/components/garage/garage-data";

const ease = [0.22, 1, 0.36, 1] as const;

type AnyCar = TierOneCar | TierTwoCar;
const isTierOne = (c: AnyCar): c is TierOneCar => "weight" in c;

const ALL_CARS: AnyCar[] = [...TIER_ONE, ...TIER_TWO];

export function GarageSection({ id }: { id?: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section
      id={id}
      data-section="garage"
      className="relative min-h-screen w-full bg-bg-base px-6 py-32 md:px-10"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-red-glow">
              section · 02
            </p>
            <h2
              className="mt-3 font-display font-semibold leading-[0.95] tracking-tight text-text-primary"
              style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}
            >
              Dream{" "}
              <span className="bg-gradient-to-br from-red-primary via-red-glow to-amber-200 bg-clip-text text-transparent">
                Garage
              </span>
            </h2>
            <p className="mt-3 font-mono text-sm text-text-muted">
              {ALL_CARS.length} cars · click to inspect
            </p>
          </motion.div>

          <Link
            href="/garage"
            className="group inline-flex items-center gap-2 self-start rounded-full border border-red-primary/60 bg-red-primary/5 px-5 py-3 text-sm text-red-glow transition-all duration-300 hover:bg-red-primary hover:text-white"
          >
            Enter the garage
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Tile grid — wraps on every breakpoint */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
          {ALL_CARS.map((car) => (
            <CarTile
              key={car.id}
              car={car}
              isExpanded={expanded === car.id}
              onToggle={() =>
                setExpanded((prev) => (prev === car.id ? null : car.id))
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CarTileProps {
  car: AnyCar;
  isExpanded: boolean;
  onToggle: () => void;
}

function CarTile({ car, isExpanded, onToggle }: CarTileProps) {
  const tierOne = isTierOne(car);
  return (
    <motion.button
      type="button"
      layout
      onClick={onToggle}
      transition={{ layout: { duration: 0.3, ease } }}
      className={`group relative cursor-pointer overflow-hidden rounded border p-4 text-left transition-colors duration-200 ${
        isExpanded
          ? "col-span-2 border-red-primary bg-bg-elevated md:col-span-3 lg:col-span-3"
          : "border-border-subtle bg-bg-elevated hover:-translate-y-0.5 hover:border-red-glow"
      }`}
    >
      {tierOne && car.badge && (
        <span
          className={`mb-2 inline-block rounded px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest ${BADGE_STYLES[car.badge]}`}
        >
          {car.badge}
        </span>
      )}

      <p className="font-mono text-[10px] tracking-widest text-text-muted">
        {car.year}
      </p>
      <p className="mt-1 font-display text-sm font-semibold leading-tight tracking-tight text-text-primary">
        {car.name}
      </p>
      <p className="mt-2 font-mono text-xs text-red-glow">{car.hp}hp</p>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border-subtle pt-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  TOP SPEED
                </p>
                <p className="mt-0.5 font-mono text-xs text-text-primary">
                  {car.topSpeed}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  WEIGHT
                </p>
                <p className="mt-0.5 font-mono text-xs text-text-primary">
                  {tierOne ? car.weight : "—"}
                </p>
              </div>
            </div>
            {tierOne && car.why && (
              <p className="mt-3 border-l-2 border-red-primary pl-3 font-sans text-xs italic leading-relaxed text-text-secondary">
                &ldquo;{car.why}&rdquo;
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
