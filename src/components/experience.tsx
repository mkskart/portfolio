"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ease } from "@/lib/motion";
import { useMode } from "@/lib/mode-context";
import { MODE_CONTENT } from "@/lib/mode-content";

/**
 * Homepage work-experience timeline. A lean, one-line-per-role complement to
 * the full resume page — leads with credibility (industry + research) before
 * the project showcase. Blurbs reframe per mode; the resume page carries the
 * full bullets. Roles are reverse-chronological by start date.
 */
type RoleKey = "swri" | "hcrl" | "nov";

interface Role {
  key: RoleKey;
  org: string;
  role: string;
  loc: string;
  dates: string;
  /** Optional link to a live in-browser demo of the work. */
  sim?: { href: string; label: string };
}

const ROLES: Role[] = [
  {
    key: "swri",
    org: "Southwest Research Institute",
    role: "Student Engineer · Tactical Aerospace (Div 16)",
    loc: "San Antonio, TX",
    dates: "May 2026 – Present",
  },
  {
    key: "hcrl",
    org: "Human Centered Robotics Lab",
    role: "Research Assistant · UT Austin",
    loc: "Austin, TX",
    dates: "Jan 2026 – Present",
    sim: { href: "/bionic-arm", label: "try the live simulation" },
  },
  {
    key: "nov",
    org: "National Oilwell Varco",
    role: "Embedded Systems Intern",
    loc: "Houston, TX",
    dates: "Jun – Aug 2025",
  },
];

export function Experience() {
  const { mode } = useMode();
  const blurbs = MODE_CONTENT[mode].experienceBlurb;

  return (
    <section id="experience" className="px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[900px]">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-medium text-text-secondary">
            Experience
          </h2>
          <Link
            href="/resume"
            className="font-mono text-[11px] uppercase tracking-widest text-text-muted transition-colors hover:text-red-glow"
          >
            full résumé →
          </Link>
        </div>

        <div className="relative mt-10 pl-8">
          {/* timeline spine */}
          <span
            className="absolute left-[7px] top-1 bottom-1 w-px bg-border-subtle"
            aria-hidden
          />

          <AnimatePresence mode="wait">
            <motion.ul
              key={mode}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-9"
            >
              {ROLES.map((r) => (
                <motion.li
                  key={r.key}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
                  }}
                  className="relative"
                >
                  {/* node */}
                  <span
                    className="absolute -left-8 top-1 grid h-[15px] w-[15px] place-items-center rounded-full border border-red-primary/40 bg-bg-base"
                    aria-hidden
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-red-glow" />
                  </span>

                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-text-primary">
                      {r.org}
                    </h3>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                      {r.dates}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-2 text-sm text-text-secondary">
                    <span>{r.role}</span>
                    <span className="text-text-muted">· {r.loc}</span>
                  </div>
                  <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-text-secondary">
                    {blurbs[r.key]}
                  </p>
                  {r.sim && (
                    <Link
                      href={r.sim.href}
                      className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-red-glow/90 transition-colors hover:text-red-glow"
                    >
                      ● {r.sim.label} →
                    </Link>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
