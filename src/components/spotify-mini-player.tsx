"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";

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

/**
 * Floating "Off the Clock" mini player — fixed top-left on the homepage.
 * Collapsed: spinning disc + now-playing (or an empty disc + "nothing playing").
 * Hover (desktop) or tap (touch) expands it to add the live progress bar and
 * this month's top tracks. Display-only — clicking opens the track in Spotify.
 * Uses themed accent tokens so it recolors with the active site mode.
 */
export function SpotifyMiniPlayer() {
  const { data: now } = useSWR<NowPlaying>("/api/spotify/now-playing", fetcher, {
    refreshInterval: 20_000,
    shouldRetryOnError: false,
  });
  const { data: top } = useSWR<TopTracks>("/api/spotify/top-tracks", fetcher, {
    refreshInterval: 60 * 60 * 1000,
    shouldRetryOnError: false,
  });

  const [progress, setProgress] = useState(0);
  const startRef = useRef({ start: 0, at: 0, dur: 0 });

  useEffect(() => {
    if (!now?.isPlaying || !now.durationMs) return;
    startRef.current = { start: now.progressMs ?? 0, at: Date.now(), dur: now.durationMs };
    const tick = () => {
      const { start, at, dur } = startRef.current;
      setProgress(Math.min(dur, start + (Date.now() - at)));
    };
    const raf = requestAnimationFrame(tick);
    const t = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, [now?.isPlaying, now?.progressMs, now?.durationMs]);

  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;

  const playing = now?.isPlaying ?? false;
  const pct = playing && now?.durationMs ? (progress / now.durationMs) * 100 : 0;
  const tracks = top?.tracks ?? [];

  return (
    <div
      className="fixed left-4 top-4 z-40 w-[13.5rem] md:w-[19rem]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="glass overflow-hidden rounded-2xl border border-border-subtle shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]">
        {/* Collapsed trigger */}
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          aria-expanded={open}
          aria-label={
            playing
              ? `Now playing: ${now?.title} by ${now?.artist}. Toggle details.`
              : "Nothing playing. Toggle top tracks."
          }
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
        >
          <MiniDisc albumImage={playing ? now?.albumImage : undefined} spinning={playing} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.25em]">
              {playing ? (
                <>
                  <span className="live-dot" />
                  <span className="text-red-glow">now playing</span>
                </>
              ) : (
                <span className="text-text-muted">nothing playing</span>
              )}
            </span>
            <span className="mt-1 block truncate font-display text-sm font-semibold text-text-primary">
              {playing ? now?.title : "Off the clock"}
            </span>
            <span className="block truncate font-mono text-[11px] text-text-secondary">
              {playing ? now?.artist : "— silence —"}
            </span>
          </span>
        </button>

        {/* Slim progress line (collapsed + playing) */}
        {playing && !open && (
          <div className="h-[2px] w-full bg-bg-elevated">
            <div className="h-full bg-red-glow" style={{ width: `${pct}%` }} />
          </div>
        )}

        {/* Expanded panel */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease }}
              className="overflow-hidden"
            >
              <div className="space-y-4 px-3 pb-3.5 pt-1">
                {/* Live progress when playing */}
                {playing && (
                  <div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-bg-elevated">
                      <motion.div
                        className="h-full bg-red-glow"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4, ease: "linear" }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-widest text-text-muted">
                      <span>{fmt(progress)}</span>
                      <span>{fmt(now?.durationMs ?? 0)}</span>
                    </div>
                    {now?.songUrl && (
                      <a
                        href={now.songUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-block font-mono text-[10px] uppercase tracking-widest text-text-muted transition-colors hover:text-red-glow"
                      >
                        open in spotify ↗
                      </a>
                    )}
                  </div>
                )}

                {/* Top tracks */}
                <div>
                  <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-text-muted">
                    top tracks · this month
                  </div>
                  {tracks.length > 0 ? (
                    <ul className="space-y-1">
                      {tracks.slice(0, 5).map((t, i) => (
                        <li key={i}>
                          <a
                            href={t.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            title={`${t.title} — ${t.artist}`}
                            className="group flex items-center gap-2.5 rounded-md p-1 transition-colors hover:bg-bg-elevated"
                          >
                            <span className="grid h-8 w-8 flex-shrink-0 place-items-center overflow-hidden rounded bg-bg-elevated font-mono text-[10px] text-text-muted">
                              {t.albumImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={t.albumImage} alt="" className="h-full w-full object-cover" />
                              ) : (
                                i + 1
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs text-text-primary transition-colors group-hover:text-red-glow">
                                {t.title}
                              </span>
                              <span className="block truncate font-mono text-[10px] text-text-secondary">
                                {t.artist}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-mono text-[11px] text-text-muted">No top tracks right now.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MiniDisc({ albumImage, spinning }: { albumImage?: string; spinning: boolean }) {
  return (
    <span className="relative h-11 w-11 flex-shrink-0">
      <span
        className="absolute inset-0 grid place-items-center rounded-full"
        style={{
          background: "radial-gradient(circle at center, #181818 0%, #0a0a0a 72%)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.05), 0 4px 12px -4px rgba(0,0,0,0.6)",
          animation: spinning ? "mini-spin 4s linear infinite" : "none",
        }}
        aria-hidden
      >
        <span className="absolute inset-[3px] rounded-full border border-white/[0.04]" />
        <span className="absolute inset-[7px] rounded-full border border-white/[0.04]" />
        {/* center label */}
        <span className="relative grid h-[56%] w-[56%] place-items-center overflow-hidden rounded-full border border-red-primary/30 bg-bg-elevated">
          {albumImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={albumImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <span
              className="block h-full w-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, var(--accent-deep) 0%, var(--accent-border) 60%, #0a0a0a 100%)",
              }}
            />
          )}
          <span className="absolute h-1 w-1 rounded-full bg-bg-base" />
        </span>
      </span>
      <style>{`
        @keyframes mini-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { [style*="mini-spin"] { animation: none !important; } }
      `}</style>
    </span>
  );
}
