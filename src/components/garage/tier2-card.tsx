"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { TierTwoCar } from "./garage-data";

const MiniGarageScene = dynamic(
  () => import("./garage-scene").then((m) => m.MiniGarageScene),
  { ssr: false, loading: () => null },
);

interface Props {
  car: TierTwoCar;
  onPromote?: (car: TierTwoCar) => void;
}

export function Tier2Card({ car, onPromote }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(false);

  // Lazy-mount the mini viewer only when the card scrolls into view.
  // Once mounted, leave it mounted (don't thrash on scroll).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onPromote ? () => onPromote(car) : undefined}
      disabled={!onPromote}
      className="group flex cursor-pointer flex-col overflow-hidden rounded border border-border-subtle bg-bg-elevated text-left transition-all duration-300 hover:-translate-y-1 hover:border-red-glow hover:shadow-[0_8px_30px_-12px_rgba(255,23,68,0.4)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-base">
        {/* Desktop: lazy mini 3D viewer */}
        <div className="hidden h-full w-full md:block">
          {inView ? (
            <MiniGarageScene glbSrc={car.glb} />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
        {/* Mobile: static monogram placeholder (no 3D to save bandwidth) */}
        <div className="flex h-full w-full items-center justify-center md:hidden">
          <span className="font-display text-3xl font-bold text-red-glow/30">
            {car.name.split(" ").map((w) => w[0]).join("")}
          </span>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm text-text-primary">{car.name}</p>
          <p className="truncate font-mono text-[10px] text-text-muted">{car.year}</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-red-glow">{car.hp}hp</span>
      </div>
    </button>
  );
}
