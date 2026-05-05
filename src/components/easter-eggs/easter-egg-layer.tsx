"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { KonamiFlash } from "./konami-flash";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Listens for global Konami sequence + "verstappen" / "litewing" word triggers.
 * - Konami → overlay flash (visual)
 * - "verstappen" → audio cue from /easter-eggs/verstappen.mp3 (silent if missing)
 * - "litewing" → temporary page tilt
 *
 * Tile-local easter eggs (violin long-press, equity-curve scrub, name-shatter,
 * /garage hidden link) live in their own components.
 */
export function EasterEggLayer() {
  const [konamiActive, setKonamiActive] = useState(false);
  const [tilt, setTilt] = useState(false);

  useEffect(() => {
    let konamiIdx = 0;
    let typed = "";
    let typedTimer: ReturnType<typeof setTimeout> | null = null;

    const fireKonami = () => {
      setKonamiActive(true);
      window.setTimeout(() => setKonamiActive(false), 1200);
    };

    const playVerstappenAudio = () => {
      const audio = new Audio("/easter-eggs/verstappen.mp3");
      audio.volume = 0.8;
      // Silently no-op if the file is missing (404) or autoplay is blocked.
      audio.play().catch(() => {});
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      )
        return;

      // Konami — match arrow keys exactly, letters case-insensitively
      const expected = KONAMI[konamiIdx];
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === expected.toLowerCase()) {
        konamiIdx += 1;
        if (konamiIdx === KONAMI.length) {
          konamiIdx = 0;
          fireKonami();
        }
      } else {
        // Allow re-starting if the wrong key happens to be the first key of the sequence
        konamiIdx = k === KONAMI[0].toLowerCase() ? 1 : 0;
      }

      if (e.key.length === 1) {
        typed = (typed + e.key.toLowerCase()).slice(-12);
        if (typedTimer) clearTimeout(typedTimer);
        typedTimer = setTimeout(() => (typed = ""), 1500);

        if (typed.endsWith("verstappen")) {
          typed = "";
          playVerstappenAudio();
        } else if (typed.endsWith("litewing")) {
          typed = "";
          setTilt(true);
          window.setTimeout(() => setTilt(false), 2000);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (typedTimer) clearTimeout(typedTimer);
    };
  }, []);

  // Apply / remove tilt on body wrapper (LiteWing easter egg)
  useEffect(() => {
    const root = document.documentElement;
    if (tilt) {
      root.style.transition = "transform 600ms cubic-bezier(0.22,1,0.36,1)";
      root.style.transform = "rotate(-2.5deg)";
    } else {
      root.style.transform = "rotate(0deg)";
      const t = setTimeout(() => {
        root.style.transition = "";
        root.style.transform = "";
      }, 700);
      return () => clearTimeout(t);
    }
  }, [tilt]);

  return (
    <AnimatePresence>
      {konamiActive && <KonamiFlash key="k" />}
    </AnimatePresence>
  );
}
