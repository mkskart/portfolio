"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border-subtle py-10 first:border-t-0 first:pt-0 last:border-b-0">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-15% 0px" }}
        className="relative inline-block font-display text-xs font-semibold uppercase tracking-[0.32em] text-text-secondary"
      >
        {title}
        <motion.span
          className="absolute -bottom-1.5 left-0 block h-px w-full bg-red-glow"
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1, transition: { duration: 0.7, ease } },
          }}
          style={{ transformOrigin: "left" }}
        />
      </motion.h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function ResumeRole({
  org,
  role,
  loc,
  dates,
  icon,
  children,
}: {
  org: string;
  role: string;
  loc?: string;
  dates: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1 flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <h3 className="font-display text-lg font-semibold tracking-tight text-text-primary">
              {org}
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
              {dates}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm text-text-secondary">
            <span>{role}</span>
            {loc && <span className="text-text-muted">· {loc}</span>}
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-2 pl-1 text-[15px] leading-[1.65] text-text-secondary md:pl-12">
        {children}
      </ul>
    </motion.div>
  );
}

export function Bullet({
  children,
  marker,
}: {
  children: React.ReactNode;
  marker?: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 flex-shrink-0">
        {marker ?? <span className="block h-1 w-1 rounded-full bg-red-glow" />}
      </span>
      <span>{children}</span>
    </li>
  );
}
