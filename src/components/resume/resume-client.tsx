"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import { SiteMode, MODES, MODE_LABELS } from "@/lib/mode";
import { useMode } from "@/lib/mode-context";
import { ResumeContent } from "./resume-content";

function pdfHref(mode: SiteMode) {
  return `/kartheek-mukkavilli-resume-${mode}.pdf`;
}

export function ResumeClient() {
  // Read from the global mode context so the toggle drives document.dataset.mode
  // and the entire resume recolors via the CSS theme vars (gold/green/red).
  const { mode, setMode } = useMode();
  // Tracks the last mode whose PDF was confirmed present. Deriving `available`
  // from it means a mode switch reads as "unavailable" until its own HEAD check
  // resolves — no stale flash, and no synchronous setState inside the effect.
  const [availableMode, setAvailableMode] = useState<SiteMode | null>(null);
  const available = availableMode === mode;

  // Check whether the mode-specific PDF exists; fall back gracefully if not.
  useEffect(() => {
    let cancelled = false;
    fetch(pdfHref(mode), { method: "HEAD" })
      .then((res) => {
        if (!cancelled && res.ok) setAvailableMode(mode);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <div className="relative">
      {/* Top bar — back · mode toggle · download */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-2 px-3 py-4 md:gap-3 md:px-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated/80 px-3 py-1.5 text-xs text-text-secondary backdrop-blur transition-colors hover:border-red-glow hover:text-red-glow"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>

        {/* Absolutely centered so the toggle's position is independent of the
            Back/Download widths — keeps the sliding pill animation stable when
            the Download button changes width across mode switches. */}
        <div
          role="tablist"
          aria-label="Resume mode"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-border-subtle bg-bg-elevated/60 p-1 backdrop-blur"
        >
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m)}
                className={`relative rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors duration-200 md:px-4 md:text-xs md:tracking-widest ${
                  active ? "text-white" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="resume-mode-pill"
                    className="absolute inset-0 rounded-full bg-red-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{MODE_LABELS[m]}</span>
              </button>
            );
          })}
        </div>

        {available ? (
          <a
            href={pdfHref(mode)}
            download
            className="group inline-flex items-center gap-2 rounded-full border border-red-primary/50 bg-red-primary/10 px-3 py-1.5 text-xs text-red-glow backdrop-blur transition-all hover:bg-red-primary hover:text-white hover:red-glow"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </a>
        ) : (
          <span
            aria-disabled="true"
            title="PDF coming soon"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated/60 px-3 py-1.5 text-xs text-text-muted backdrop-blur"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PDF coming soon</span>
            <span className="sm:hidden">Soon</span>
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
        >
          <ResumeContent mode={mode} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
