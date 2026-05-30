"use client";

import { motion } from "framer-motion";
import { ease } from "@/lib/motion";
import { Project } from "@/lib/projects-data";
import { DIAGRAM_MAP } from "./project-diagrams";

/**
 * Full-width featured slot for a project that doesn't have a bespoke section.
 * Used by FeaturedSections for the per-mode headliners (e.g. nrf9160-template,
 * kinematic-transformer, JARVIS, Smart Scheduler).
 */
export function ProjectSpotlight({
  project,
  id,
}: {
  project: Project;
  id?: string;
}) {
  const Diagram = DIAGRAM_MAP[project.id];
  return (
    <section id={id} className="relative px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease }}
        >
          {project.isNew && (
            <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-red-glow">
              New
            </span>
          )}
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-text-primary md:text-[3.5rem]">
            {project.name}
          </h2>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-text-muted">
            {project.tagline}
          </p>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-text-secondary">
            {project.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border-subtle bg-bg-elevated/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary"
              >
                {s}
              </span>
            ))}
          </div>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-2 rounded border border-border-subtle px-6 py-3 font-mono text-sm text-text-primary transition-all duration-200 hover:border-red-primary hover:text-red-glow"
            >
              GitHub
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          )}
        </motion.div>

        {/* Right: animated monogram panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.1, ease }}
          className="relative aspect-square overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated"
        >
          <div className="grid-bg absolute inset-0 opacity-60" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--accent-glow) 14%, transparent), transparent 60%)",
            }}
          />
          {Diagram ? (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <Diagram />
            </div>
          ) : (
            <motion.span
              animate={{ opacity: [0.18, 0.32, 0.18] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center font-display text-[10rem] font-bold leading-none text-text-primary"
            >
              {project.name.charAt(0)}
            </motion.span>
          )}
        </motion.div>
      </div>
    </section>
  );
}
