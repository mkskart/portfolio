"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "intro", label: "Intro" },
  { id: "work", label: "Featured" },
  { id: "litewing", label: "LiteWing" },
  { id: "other-work", label: "Other Work" },
  { id: "hobbies", label: "F1" },
  { id: "hobbies-garage", label: "Garage" },
  { id: "hobbies-spotify", label: "Music" },
  { id: "hobbies-violin", label: "Violin" },
  { id: "contact", label: "Contact" },
];

export function SectionIndicator() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Reveal once we've scrolled past the hero
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id));
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry whose center is closest to the viewport center.
        let bestI = -1;
        let bestDist = Infinity;
        const vh = window.innerHeight;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const r = entry.boundingClientRect;
          const dist = Math.abs(r.top + r.height / 2 - vh / 2);
          const idx = elements.indexOf(entry.target as HTMLElement);
          if (dist < bestDist && idx >= 0) {
            bestDist = dist;
            bestI = idx;
          }
        });
        if (bestI >= 0) setActive(bestI);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    elements.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!shown) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease }}
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 md:block"
      aria-label="Section navigation"
    >
      <ul className="flex flex-col gap-3">
        {SECTIONS.map((s, i) => {
          const isActive = i === active;
          const isHovered = hovered === i;
          return (
            <li key={s.id} className="relative">
              <button
                type="button"
                onClick={() => scrollTo(s.id)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                aria-label={s.label}
                aria-current={isActive ? "true" : undefined}
                className="flex h-4 items-center"
              >
                <span
                  className={`block transition-all duration-300 ${
                    isActive
                      ? "h-2 w-2 rounded-full bg-red-glow"
                      : "h-1.5 w-1.5 rounded-full bg-text-muted/40 hover:bg-text-secondary"
                  }`}
                  style={
                    isActive
                      ? { boxShadow: "0 0 10px color-mix(in srgb, var(--red-glow) 70%, transparent)" }
                      : undefined
                  }
                />
              </button>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border-subtle bg-bg-elevated/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-text-primary backdrop-blur"
                >
                  {s.label}
                </motion.span>
              )}
            </li>
          );
        })}
      </ul>
    </motion.aside>
  );
}
