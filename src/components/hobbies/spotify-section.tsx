"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface NowPlaying {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImage?: string;
  songUrl?: string;
  progressMs?: number;
  durationMs?: number;
}
interface TopTracks {
  tracks: { title: string; artist: string; albumImage: string; url: string }[];
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("fetch failed");
    return r.json();
  });

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function SpotifySection({ id }: { id?: string }) {
  const { data: now, error: nowError } = useSWR<NowPlaying>(
    "/api/spotify/now-playing",
    fetcher,
    { refreshInterval: 20_000, shouldRetryOnError: false },
  );
  const { data: top, error: topError } = useSWR<TopTracks>(
    "/api/spotify/top-tracks",
    fetcher,
    { refreshInterval: 60 * 60 * 1000, shouldRetryOnError: false },
  );

  const [progress, setProgress] = useState(0);
  const startRef = useRef({ start: 0, at: 0, dur: 0 });

  useEffect(() => {
    if (!now?.isPlaying || !now.durationMs) return;
    startRef.current = {
      start: now.progressMs ?? 0,
      at: Date.now(),
      dur: now.durationMs,
    };
    const tick = () => {
      const { start, at, dur } = startRef.current;
      const elapsed = Date.now() - at;
      setProgress(Math.min(dur, start + elapsed));
    };
    const raf = requestAnimationFrame(tick);
    const t = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, [now?.isPlaying, now?.progressMs, now?.durationMs]);

  const playing = now?.isPlaying ?? false;
  const pct = playing && now?.durationMs ? (progress / now.durationMs) * 100 : 0;
  const live = !nowError && !topError;

  return (
    <section
      id={id}
      data-section="spotify"
      className="relative isolate flex min-h-screen w-full items-center overflow-hidden bg-bg-base"
    >
      {/* Subtle radial */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, color-mix(in srgb, var(--accent-deep) 35%, transparent), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 md:px-10 lg:grid-cols-[480px_1fr] lg:gap-20">
        {/* Vinyl */}
        <div className="relative mx-auto aspect-square w-full max-w-[420px]">
          <Vinyl albumImage={now?.albumImage} spinning={playing} />
        </div>

        {/* Info */}
        <div className="space-y-7">
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-red-glow">
            section · 03 {!live && "· data unavailable"}
          </span>

          <motion.div
            key={now?.title ?? "silent"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            {playing && now?.title ? (
              <>
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-red-glow">
                  <span className="live-dot" />
                  now playing
                </span>
                <a
                  href={now.songUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block font-display font-semibold leading-tight tracking-tight text-text-primary transition-colors hover:text-red-glow"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                >
                  {now.title}
                </a>
                <div className="mt-2 font-mono text-base text-text-secondary md:text-lg">
                  {now.artist}
                </div>

                <div className="mt-6 max-w-md">
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-bg-elevated">
                    <motion.div
                      className="h-full bg-red-glow"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4, ease: "linear" }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    <span>{fmt(progress)}</span>
                    <span>{fmt(now.durationMs ?? 0)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
                  currently
                </span>
                <div
                  className="mt-3 font-display font-semibold leading-tight tracking-tight text-text-primary"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                >
                  silence.
                </div>
                <p className="mt-2 max-w-[44ch] text-text-secondary">
                  {live ? "When the music's on, it lives here." : "Live data unavailable — top tracks below."}
                </p>
              </>
            )}
          </motion.div>

          {/* Top tracks */}
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
              top tracks · this month
            </div>
            <div className="flex gap-3">
              {(top?.tracks ?? Array.from({ length: 5 })).slice(0, 5).map((t, i) => (
                <a
                  key={i}
                  href={t && (t as { url?: string }).url ? (t as { url?: string }).url : "#"}
                  target="_blank"
                  rel="noreferrer"
                  title={t ? `${t.title} — ${t.artist}` : "—"}
                  className="group relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-border-subtle bg-bg-elevated transition-transform hover:scale-110 md:h-16 md:w-16"
                >
                  {t && (t as { albumImage?: string }).albumImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={(t as { albumImage?: string }).albumImage}
                      alt={t.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Vinyl({ albumImage, spinning }: { albumImage?: string; spinning: boolean }) {
  return (
    <div
      className="relative aspect-square w-full"
      style={{
        animation: `vinyl-spin ${spinning ? "5s" : "18s"} linear infinite`,
      }}
    >
      {/* Outer disc */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, #181818 0%, #0a0a0a 65%, #050505 100%)",
          boxShadow:
            "0 30px 60px -15px rgba(0,0,0,0.7), 0 0 80px -20px color-mix(in srgb, var(--accent-glow) 25%, transparent), inset 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      />
      {/* Concentric grooves */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: 22 }).map((_, i) => {
          const r = 32 + i * 2.6;
          return (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.025)"
              strokeWidth="0.6"
            />
          );
        })}
        {/* Light reflection arc */}
        <defs>
          <radialGradient id="vinyl-reflection" cx="40%" cy="35%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="url(#vinyl-reflection)" />
      </svg>

      {/* Center label with album art */}
      <div className="absolute left-1/2 top-1/2 aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-red-primary/30 bg-bg-elevated shadow-[0_0_24px_-6px_var(--glow-a40)]">
        {albumImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={albumImage} alt="album art" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, var(--accent-deep) 0%, var(--accent-border) 60%, #0a0a0a 100%)",
            }}
          />
        )}
        {/* Spindle hole */}
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg-base" />
      </div>

      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="vinyl-spin"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
