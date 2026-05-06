"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { HandPose } from "@/components/litewing/drone-scene";
import {
  TelemetryOverlay,
  type Telemetry,
} from "@/components/litewing/telemetry-overlay";
import { FlightSpecs } from "@/components/litewing/flight-specs";
import { BuildBreakdown } from "@/components/litewing/build-breakdown";
import { LogicAnalyzerSection } from "@/components/litewing/logic-analyzer-section";

const DroneScene = dynamic(
  () => import("@/components/litewing/drone-scene").then((m) => m.DroneScene),
  { ssr: false, loading: () => null },
);

// MediaPipe is loaded inside WebcamPiP via dynamic import — keep this dynamic
// too so the heavy webcam component never enters the initial chunk.
const WebcamPiP = dynamic(
  () => import("@/components/litewing/webcam-pip").then((m) => m.WebcamPiP),
  { ssr: false, loading: () => null },
);

type ControlMode = "cursor" | "hand";
type CameraState = "idle" | "requesting" | "active" | "denied" | "error";

const ZERO_POSE: HandPose = { x: 0, y: 0, z: 0, isFist: false };
const ZERO_TELEMETRY: Telemetry = {
  roll: 0,
  pitch: 0,
  yaw: 0,
  throttle: 0,
  alt: 0,
  batt: 100,
};

export default function LiteWingPage() {
  const [mode, setMode] = useState<ControlMode>("cursor");
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [handPose, setHandPose] = useState<HandPose>(ZERO_POSE);
  const [telemetry, setTelemetry] = useState<Telemetry>(ZERO_TELEMETRY);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Stable ref the telemetry interval reads — keeps the interval stable
  // even though MediaPipe updates handPose ~30Hz. Without this, the
  // interval would be torn down before each 100ms tick fires.
  const handPoseRef = useRef<HandPose>(ZERO_POSE);
  useEffect(() => {
    handPoseRef.current = handPose;
  }, [handPose]);

  // Refs for fist rising-edge detection. The MediaPipe callback is memoized
  // with empty deps, so reading state directly would close over stale values.
  const lastFistRef = useRef(false);
  const isFlippingRef = useRef(false);
  useEffect(() => {
    isFlippingRef.current = isFlipping;
  }, [isFlipping]);

  const onHandPose = useCallback((p: HandPose) => {
    setHandPose(p);
    // Rising edge: fire only when the hand transitions open → fist, and not
    // while a flip is already in flight. Open-fingers state still updates
    // the ref so the next close re-arms the trigger.
    if (p.isFist && !lastFistRef.current && !isFlippingRef.current) {
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 900);
    }
    lastFistRef.current = p.isFist;
  }, []);

  async function enableHandControl() {
    if (cameraState === "active") return;
    setCameraState("requesting");
    try {
      // Pre-flight: request once to surface the permission prompt and confirm
      // a camera exists. MediaPipe's Camera class will get its own stream.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      stream.getTracks().forEach((t) => t.stop());
      setCameraState("active");
      setMode("hand");
      setShowGuide(true);
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      setCameraState(name === "NotAllowedError" ? "denied" : "error");
      setMode("cursor");
    }
  }

  function disableHandControl() {
    setMode("cursor");
    setCameraState((s) => (s === "active" ? "idle" : s));
    setHandPose(ZERO_POSE);
    setShowGuide(false);
    lastFistRef.current = false;
  }

  // Auto-dismiss the guide 5s after it appears.
  useEffect(() => {
    if (!showGuide) return;
    const timer = setTimeout(() => setShowGuide(false), 5000);
    return () => clearTimeout(timer);
  }, [showGuide]);

  // Telemetry tick — reads the latest pose via ref so it never restarts.
  useEffect(() => {
    const interval = setInterval(() => {
      const live = mode === "hand" && cameraState === "active";
      setTelemetry((prev) => {
        if (live) {
          const p = handPoseRef.current;
          return {
            roll: parseFloat((p.x * 25 + (Math.random() - 0.5) * 0.5).toFixed(1)),
            pitch: parseFloat((p.y * 20 + (Math.random() - 0.5) * 0.5).toFixed(1)),
            yaw: parseFloat((prev.yaw + (Math.random() - 0.5) * 0.3).toFixed(1)),
            throttle: Math.min(100, Math.max(0, Math.round(50 + p.y * -30))),
            alt: parseFloat(
              (1.2 + p.y * -0.8 + (Math.random() - 0.5) * 0.05).toFixed(2),
            ),
            batt: Math.max(0, prev.batt - 0.01),
          };
        }
        // Idle decay toward 0
        return {
          roll: parseFloat((prev.roll * 0.95).toFixed(1)),
          pitch: parseFloat((prev.pitch * 0.95).toFixed(1)),
          yaw: parseFloat((prev.yaw * 0.95).toFixed(1)),
          throttle: Math.max(0, prev.throttle - 1),
          alt: parseFloat((prev.alt * 0.98).toFixed(2)),
          batt: prev.batt,
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [mode, cameraState]);

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      {/* Top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-8">
        <Link
          href="/#litewing"
          className="group inline-flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-red-glow"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          LITEWING
        </span>
      </div>

      {/* Simulation viewport */}
      <section className="relative flex h-screen flex-col">
        <div className="relative flex-1">
          <DroneScene
            mode={mode}
            externalPose={mode === "hand" ? handPose : null}
            isFlipping={isFlipping}
          />

          <TelemetryOverlay telemetry={telemetry} mode={mode} />

          <AnimatePresence>
            {showGuide && mode === "hand" && cameraState === "active" && (
              <ControlGuide
                key="guide"
                onDismiss={() => setShowGuide(false)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mode === "hand" && cameraState === "active" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-28 right-6 z-20"
              >
                <WebcamPiP onHandPose={onHandPose} active />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mode toggle + status hint */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={disableHandControl}
              className={`rounded border px-5 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-200 ${
                mode === "cursor"
                  ? "border-red-primary bg-red-primary/10 text-red-glow"
                  : "border-border-subtle text-text-muted hover:border-text-secondary"
              }`}
            >
              Cursor
            </button>

            <button
              type="button"
              onClick={enableHandControl}
              disabled={cameraState === "requesting"}
              className={`hidden rounded border px-5 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-200 md:inline-flex ${
                mode === "hand"
                  ? "border-red-primary bg-red-primary/10 text-red-glow"
                  : "border-border-subtle text-text-muted hover:border-red-primary hover:text-red-glow"
              } ${cameraState === "requesting" ? "cursor-wait opacity-50" : ""}`}
            >
              {cameraState === "requesting" ? "Requesting…" : "Hand Control"}
            </button>
          </div>

          <p className="font-mono text-xs text-text-muted md:hidden">
            Hand tracking available on desktop
          </p>

          <AnimatePresence mode="wait">
            {cameraState === "denied" && (
              <motion.p
                key="denied"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-red-glow"
              >
                Camera access denied — using cursor mode
              </motion.p>
            )}
            {cameraState === "error" && (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-yellow-400"
              >
                Camera unavailable — using cursor mode
              </motion.p>
            )}
            {cameraState === "active" && mode === "hand" && (
              <motion.p
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-emerald-400"
              >
                ● Hand tracking active — no data leaves your device
              </motion.p>
            )}
            {mode === "cursor" && cameraState === "idle" && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-text-muted"
              >
                Move your cursor to control · or try hand tracking
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      <FlightSpecs />
      <BuildBreakdown />
      <LogicAnalyzerSection />
    </main>
  );
}

function ControlGuide({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded border border-border-subtle bg-bg-base/80 px-6 py-4 backdrop-blur-sm"
    >
      <div className="grid grid-cols-3 gap-6 font-mono text-xs">
        <div className="text-center">
          <div className="mb-1 text-lg text-red-glow">↔</div>
          <div className="text-text-muted">left / right</div>
          <div className="text-text-primary">roll</div>
        </div>
        <div className="text-center">
          <div className="mb-1 text-lg text-red-glow">↕</div>
          <div className="text-text-muted">up / down</div>
          <div className="text-text-primary">pitch</div>
        </div>
        <div className="text-center">
          <div className="mb-1 text-lg text-red-glow">✊</div>
          <div className="text-text-muted">make a fist</div>
          <div className="text-text-primary">flip</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 w-full text-center font-mono text-[10px] text-text-muted transition-colors hover:text-text-primary"
      >
        got it ×
      </button>
    </motion.div>
  );
}
