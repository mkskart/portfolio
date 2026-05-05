"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ease } from "@/lib/motion";

interface Card {
  title: string;
  tag?: string;
  blurb: string;
  detail: string;
  stack: string[];
  /** Show a "github coming soon" placeholder in the modal — for personal projects whose repos aren't public yet. */
  githubPending?: boolean;
}

const CARDS: Card[] = [
  {
    title: "HCRL Bionic Arm",
    tag: "● ACTIVE RESEARCH",
    blurb:
      "Transformer-based motion prediction for a 16-DOF bionic arm at UT's Human Centered Robotics Lab.",
    detail:
      "Mapping glove telemetry to per-joint commands across fingers, thumb, wrist, and elbow — running inference on an MCU for end-to-end teleoperation. PID loops on every joint with pressure and tension feedback, working toward fragile-object grasps.",
    stack: ["PyTorch", "Embedded ML", "Motor control", "PID"],
  },
  {
    title: "J.A.R.V.I.S.",
    blurb:
      "Voice-controlled AI assistant with RAG memory and tool use across macOS, iOS, Linux.",
    detail:
      "Modular command engine routing voice intents to API actions. RAG pipeline over personal context for task memory, integrated with YouTube Music, Google Calendar, and Google SDM for cross-device control.",
    stack: ["Python", "FastAPI", "RAG", "LLMs"],
    githubPending: true,
  },
  {
    title: "Smart Scheduler",
    blurb:
      "Full-stack scheduler with OAuth, 120+ tests, microservice architecture.",
    detail:
      "RESTful Python/SQLAlchemy backend with a scheduling engine validated by 120+ Pytest unit tests, integrated with Google OAuth 2.0 in a Docker Compose microservice stack. Type-safe React + TypeScript frontend.",
    stack: ["Python", "SQLAlchemy", "React", "TypeScript", "Docker"],
    githubPending: true,
  },
  {
    title: "Obstacle Avoidance Robot",
    blurb:
      "Autonomous Arduino/RPi navigation stack with multi-modal sensor fusion.",
    detail:
      "Hybrid Arduino/Raspberry Pi platform fusing time-of-flight and ultrasonic sensors, with checksum-validated packet delivery between boards. Dijkstra-based pathfinding tested on a custom obstacle course.",
    stack: ["C++", "Arduino", "Raspberry Pi", "Sensor fusion"],
    githubPending: true,
  },
];

export function OtherWork() {
  const [open, setOpen] = useState<Card | null>(null);

  return (
    <section id="other-work" className="px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="font-display text-2xl font-medium text-text-secondary">
          Other Work
        </h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {CARDS.map((c) => (
            <motion.button
              key={c.title}
              type="button"
              onClick={() => setOpen(c)}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
              }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2, ease }}
              className="glass group relative overflow-hidden rounded-2xl p-6 text-left hover:border-border-accent hover:red-glow"
            >
              {c.tag && (
                <div className="mb-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-red-glow">
                  {c.tag}
                </div>
              )}
              <h3 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
                {c.title}
              </h3>
              <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-text-secondary">
                {c.blurb}
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
                    "radial-gradient(circle at 75% 0%, rgba(255,23,68,0.12), transparent 60%)",
                }}
              />
            </motion.button>
          ))}
        </motion.div>
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
                  {open.tag && (
                    <div className="font-mono text-[10px] uppercase tracking-widest text-red-glow">
                      {open.tag}
                    </div>
                  )}
                  <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                    {open.title}
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
                  {open.detail}
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
                {open.githubPending && (
                  <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
                    github coming soon
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
