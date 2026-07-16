"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ease } from "@/lib/motion";
import type { Landmark } from "@/lib/hand-kinematics";

const BionicArmScene = dynamic(
  () => import("./bionic-arm-scene").then((m) => m.BionicArmScene),
  { ssr: false, loading: () => null },
);
// MediaPipe is loaded inside HandCamera via dynamic import — keep this dynamic
// too so the heavy webcam component never enters the initial chunk.
const HandCamera = dynamic(
  () => import("./hand-camera").then((m) => m.HandCamera),
  { ssr: false, loading: () => null },
);

type CameraState = "idle" | "requesting" | "active" | "denied" | "error";

const STEPS = [
  {
    tag: "01 · Track",
    title: "Track",
    body: "MediaPipe Hands runs in your browser (WASM) and returns 21 3D landmarks per frame — the webcam stands in for the lab's sensor glove.",
  },
  {
    tag: "02 · Solve",
    title: "Solve",
    body: "Bone vectors between landmarks resolve into per-joint flexion angles, thumb opposition, and wrist orientation — ~16 DOF of articulation.",
  },
  {
    tag: "03 · Actuate",
    title: "Actuate",
    body: "Those angles critically-damp the procedural hand's joints in the render loop — the same telemetry→angle→actuation path as the real firmware.",
  },
];

export default function BionicArmClient() {
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const landmarksRef = useRef<Landmark[] | null>(null);
  const active = cameraState === "active";

  const onLandmarks = useCallback((lm: Landmark[] | null) => {
    landmarksRef.current = lm;
  }, []);

  async function enableCamera() {
    if (cameraState === "active") return;
    setCameraState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      stream.getTracks().forEach((t) => t.stop());
      setCameraState("active");
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      setCameraState(name === "NotAllowedError" ? "denied" : "error");
    }
  }

  function disableCamera() {
    setCameraState("idle");
    landmarksRef.current = null;
  }

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      {/* Top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-8">
        <Link
          href="/#bionic-arm"
          className="group inline-flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-red-glow"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          HCRL · BIONIC HAND
        </span>
      </div>

      {/* Simulation viewport */}
      <section className="relative flex h-screen flex-col">
        <div className="relative flex-1">
          <BionicArmScene interactive={active} landmarksRef={landmarksRef} controls autoRotate />

          {/* Title overlay */}
          <div className="pointer-events-none absolute left-6 top-24 md:left-10">
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
              Bionic Hand
            </h1>
            <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-text-secondary md:text-base">
              A browser analog of my HCRL research — your hand drives a 16-DOF
              robotic hand, live.
            </p>
          </div>

          {/* Webcam PiP */}
          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-28 right-6 z-20"
              >
                <HandCamera onLandmarks={onLandmarks} active />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls + status */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={active ? disableCamera : enableCamera}
              disabled={cameraState === "requesting"}
              className={`hidden rounded border px-5 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-200 md:inline-flex ${
                active
                  ? "border-red-primary bg-red-primary/10 text-red-glow"
                  : "border-border-subtle text-text-muted hover:border-red-primary hover:text-red-glow"
              } ${cameraState === "requesting" ? "cursor-wait opacity-50" : ""}`}
            >
              {cameraState === "requesting"
                ? "Requesting…"
                : active
                  ? "Stop camera"
                  : "Enable camera"}
            </button>
          </div>

          <p className="font-mono text-xs text-text-muted md:hidden">
            Hand tracking available on desktop — idle demo shown
          </p>

          <AnimatePresence mode="wait">
            {cameraState === "denied" && (
              <motion.p key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-xs text-red-glow">
                Camera access denied — showing the idle demo
              </motion.p>
            )}
            {cameraState === "error" && (
              <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-xs text-yellow-400">
                Camera unavailable — showing the idle demo
              </motion.p>
            )}
            {active && (
              <motion.p key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-xs text-emerald-400">
                ● Tracking your hand — no data leaves your device
              </motion.p>
            )}
            {cameraState === "idle" && (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden font-mono text-xs text-text-muted md:block">
                Enable your camera to drive the hand · runs entirely in-browser
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Writeup */}
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[880px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-red-glow">
              Human Centered Robotics Lab · UT Austin
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              From a sensor glove to your webcam
            </h2>
            <p className="mt-5 max-w-[64ch] text-lg leading-relaxed text-text-secondary">
              At HCRL I wrote C++ firmware on a Raspberry Pi Pico that synchronizes
              a 16-DOF bionic hand to a remote sensor glove at ~1ms
              sensor-to-actuation latency. This is the public, in-browser analog:
              the webcam replaces the glove, but the pipeline — capture telemetry,
              solve joint angles, actuate the hand — is the same shape. Nothing is
              uploaded; the model and the math run entirely on your device.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="glass rounded-2xl p-6"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {s.tag}
                </div>
                <div className="mt-2 font-display text-xl font-semibold text-text-primary">
                  {s.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-2">
            {["MediaPipe Hands", "React Three Fiber", "Joint kinematics", "C++ / RP2040 (real rig)"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-border-subtle bg-bg-elevated/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-text-muted"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="https://github.com/mkskart/kinematic-transformer"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-red-glow"
            >
              kinematic-transformer (public ML analog) →
            </a>
            <Link
              href="/resume"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-red-glow"
            >
              Full résumé →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
