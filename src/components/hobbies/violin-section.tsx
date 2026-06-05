"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type Mode = "western" | "carnatic";

interface ModeConfig {
  label: string;
  composer: string;
  audioSrc: string;
  description: string;
  accentColor: string;
  /** Heading split into two lines so the second can take the accent color. */
  heading: [string, string];
}

const MODES: Record<Mode, ModeConfig> = {
  western: {
    label: "Western",
    composer: "A. Vivaldi",
    audioSrc: "/violin/western.mp3",
    description: "SAMPADA Certified · ABRSM Grade 5",
    // theme-aware: follows the active site mode accent (Carnatic keeps its
    // distinct cultural orange below).
    accentColor: "var(--accent)",
    heading: ["Professional", "Violinist"],
  },
  carnatic: {
    label: "Carnatic",
    composer: "South Indian tradition",
    audioSrc: "/violin/carnatic.mp3",
    description: "Traditional South Indian classical",
    accentColor: "#FF6B35",
    heading: ["Classical", "Musician"],
  },
};

export function ViolinSection({ id }: { id?: string }) {
  const [mode, setMode] = useState<Mode>("western");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const current = MODES[mode];

  // HEAD-check whether an audio file exists for the current mode.
  // Lets us gray out the play button + show a "coming soon" hint without throwing.
  useEffect(() => {
    let cancelled = false;
    fetch(current.audioSrc, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setHasAudio(r.ok);
      })
      .catch(() => {
        if (!cancelled) setHasAudio(false);
      });
    return () => {
      cancelled = true;
    };
  }, [current.audioSrc]);

  // Stop playback when switching modes.
  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    const raf = requestAnimationFrame(() => setIsPlaying(false));
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // Cancel any active draw loop on unmount.
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  function setupAudio() {
    if (!audioRef.current || audioCtxRef.current) return;
    type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
    const w = window as WebkitWindow;
    const Ctor = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }

  function drawWaveform() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const rawAccent = MODES[mode].accentColor;

    // The canvas can't parse `var(--accent)`, so resolve it to a concrete hex.
    // Read each frame so it tracks live theme (mode) changes.
    const resolveAccent = () => {
      if (rawAccent.startsWith("var(")) {
        const name = rawAccent.slice(4, -1).trim();
        return (
          getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim() || "#e10600"
        );
      }
      return rawAccent;
    };

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accent = resolveAccent();

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255;
        const barHeight = v * canvas.height * 0.85;
        const alphaHex = Math.floor((0.4 + v * 0.6) * 255)
          .toString(16)
          .padStart(2, "0");
        ctx.fillStyle = `${accent}${alphaHex}`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        // Faint mirror on top for the "reflection" feel
        const mirrorAlphaHex = Math.floor(v * 0.3 * 255)
          .toString(16)
          .padStart(2, "0");
        ctx.fillStyle = `${accent}${mirrorAlphaHex}`;
        ctx.fillRect(x, 0, barWidth, barHeight * 0.3);
        x += barWidth + 1;
      }
    };

    render();
  }

  async function togglePlay() {
    if (!audioRef.current || !hasAudio) return;
    setupAudio();
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    } else {
      try {
        await audioCtxRef.current?.resume();
        await audioRef.current.play();
        setIsPlaying(true);
        drawWaveform();
      } catch {
        setIsPlaying(false);
      }
    }
  }

  return (
    <section
      id={id}
      data-section="violin"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg-base px-6 pt-12 pb-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.8, ease }}
        className="mb-12 flex flex-col items-center gap-3"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-red-glow">
          section · 04
        </span>
        {/* Mode toggle */}
        <div className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-elevated/50 p-1 backdrop-blur">
          {(["western", "carnatic"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                mode === m
                  ? "bg-red-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease }}
          className="w-full max-w-5xl"
        >
          <div
            className={`grid items-center gap-12 ${
              mode === "carnatic" ? "md:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* Main column */}
            <div className="flex flex-col items-center gap-8 text-center">
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-text-muted">
                  {current.composer}
                </p>
                <h2
                  className="font-display font-bold leading-[0.95] tracking-tight text-text-primary"
                  style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)" }}
                >
                  {current.heading[0]}
                </h2>
                <h2
                  className="font-display font-bold leading-[0.95] tracking-tight"
                  style={{
                    fontSize: "clamp(2.6rem, 7vw, 5rem)",
                    color: current.accentColor,
                  }}
                >
                  {current.heading[1]}
                </h2>
                <p className="mt-4 font-mono text-sm text-text-muted">
                  {current.description}
                </p>
              </div>

              {/* Western: decorative sheet music staff */}
              {mode === "western" && (
                <div className="relative h-[110px] w-full max-w-sm">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-30">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="my-3 h-px w-full bg-red-primary" />
                    ))}
                  </div>
                  {[
                    { left: "10%", top: "20%" },
                    { left: "25%", top: "40%" },
                    { left: "40%", top: "15%" },
                    { left: "55%", top: "50%" },
                    { left: "70%", top: "30%" },
                    { left: "85%", top: "45%" },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="absolute h-2 w-3 rounded-full bg-red-primary opacity-70"
                      style={{ left: p.left, top: p.top }}
                    />
                  ))}
                  <p className="absolute inset-x-0 bottom-0 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
                    Vivaldi · Four Seasons
                  </p>
                </div>
              )}

              {/* Waveform canvas */}
              <div className="relative h-24 w-full max-w-sm">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={96}
                  className="h-full w-full"
                />
                {!isPlaying && (
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
                    style={{ background: current.accentColor, opacity: 0.3 }}
                  />
                )}
              </div>

              {/* Play button */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={!hasAudio}
                className={`group inline-flex items-center gap-3 rounded-full border px-6 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                  hasAudio
                    ? "cursor-pointer border-border-subtle text-text-primary hover:border-red-glow hover:text-red-glow"
                    : "cursor-not-allowed border-border-subtle/60 text-text-muted"
                }`}
              >
                <span>{isPlaying ? "■ Stop" : "▶ Play"}</span>
                {!hasAudio && (
                  <span className="text-[10px] opacity-70">recording coming soon</span>
                )}
              </button>
            </div>

            {/* Right column — Carnatic only: stage photo */}
            {mode === "carnatic" && (
              <div className="flex items-center justify-center">
                <StagePhoto />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={current.audioSrc}
        onEnded={() => setIsPlaying(false)}
        preload="none"
      />
    </section>
  );
}

function StagePhoto() {
  const [hasPhoto, setHasPhoto] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/violin/stage-photo.jpg", { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setHasPhoto(r.ok);
      })
      .catch(() => {
        if (!cancelled) setHasPhoto(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hasPhoto) {
    return (
      <div className="flex aspect-[3/4] w-full max-w-sm items-center justify-center rounded border border-border-subtle bg-bg-elevated/50">
        <p className="px-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
          stage photo
          <br />
          coming soon
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded border border-border-subtle">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/violin/stage-photo.jpg"
        alt="Kartheek performing on stage"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}
