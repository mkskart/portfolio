"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ease } from "@/lib/motion";
import { useMode } from "@/lib/mode-context";
import { MODE_CONTENT } from "@/lib/mode-content";
import { ALL_PROJECTS, orderedProjects, Project } from "@/lib/projects-data";

/** Projects that get their own full-width featured section never duplicate here. */
function otherWorkProjects(order: string[]): Project[] {
  const featured = new Set(order.slice(0, 2));
  const inOrder = orderedProjects(order).filter((p) => !featured.has(p.id));
  const extras = ALL_PROJECTS.filter((p) => !order.includes(p.id));
  return [...inOrder, ...extras];
}

function projectTag(p: Project): string | undefined {
  if (p.id === "hcrl") return "● ACTIVE RESEARCH";
  if (p.isNew) return "NEW";
  return undefined;
}

export function OtherWork() {
  const { mode } = useMode();
  const [open, setOpen] = useState<Project | null>(null);

  const cards = otherWorkProjects(MODE_CONTENT[mode].projectOrder);

  return (
    <section id="other-work" className="px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="font-display text-2xl font-medium text-text-secondary">
          Other Work
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {cards.map((c) => {
              const tag = projectTag(c);
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  onClick={() => setOpen(c)}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
                  }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.2, ease }}
                  className="glass card-hover group relative overflow-hidden rounded-2xl p-6 text-left transition-shadow duration-300"
                >
                  {tag && (
                    <div className="mb-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-red-glow">
                      {tag}
                    </div>
                  )}
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
                    {c.name}
                  </h3>
                  <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-text-secondary">
                    {c.tagline}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.stack.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-border-subtle bg-bg-elevated/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at 75% 0%, var(--accent-subtle), transparent 60%)",
                    }}
                  />
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-md"
          >
            <motion.div
              key="dlg"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.35, ease }}
              onClick={(e) => e.stopPropagation()}
              className="glass-red w-full max-w-2xl overflow-hidden rounded-2xl"
            >
              <div className="flex items-start justify-between border-b border-border-accent p-5">
                <div>
                  {projectTag(open) && (
                    <div className="font-mono text-[10px] uppercase tracking-widest text-red-glow">
                      {projectTag(open)}
                    </div>
                  )}
                  <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                    {open.name}
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  className="rounded-md p-2 text-text-secondary hover:bg-bg-elevated"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-5 p-6">
                <p className="text-base leading-relaxed text-text-secondary">
                  {open.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {open.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border-subtle bg-bg-elevated/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {open.github && (
                  <a
                    href={open.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-text-muted transition-colors hover:text-red-glow"
                  >
                    GitHub →
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
