"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteMode, DEFAULT_MODE, getModeFromUrl, setModeInUrl } from "./mode";

interface ModeContextValue {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
}

const ModeContext = createContext<ModeContextValue>({
  mode: DEFAULT_MODE,
  setMode: () => {},
});

const FLASH_MS = 150;

/** Drives the CSS theme: firmware (default) clears the attribute, others set
 *  data-mode on <html> so the [data-mode="…"] var overrides in globals.css
 *  recolor the whole site. */
function applyThemeAttribute(newMode: SiteMode) {
  if (typeof document === "undefined") return;
  if (newMode === DEFAULT_MODE) {
    delete document.documentElement.dataset.mode;
  } else {
    document.documentElement.dataset.mode = newMode;
  }
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<SiteMode>(DEFAULT_MODE);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Hydrate from the URL on mount so ?mode= links land on the right persona.
  // Deferred to a microtask so the SSR-matched default renders first (no
  // hydration mismatch) and we don't setState synchronously inside the effect.
  useEffect(() => {
    const fromUrl = getModeFromUrl();
    if (fromUrl !== DEFAULT_MODE) {
      queueMicrotask(() => {
        setModeState(fromUrl);
        applyThemeAttribute(fromUrl);
      });
    }
  }, []);

  const setMode = useCallback(
    (newMode: SiteMode) => {
      setModeState((current) => {
        if (current === newMode) return current;
        // Brief full-screen flash so a mode switch feels like a context change.
        setIsTransitioning(true);
        window.setTimeout(() => {
          setModeState(newMode);
          setModeInUrl(newMode);
          applyThemeAttribute(newMode);
          setIsTransitioning(false);
        }, FLASH_MS);
        return current;
      });
    },
    [],
  );

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FLASH_MS / 1000 }}
            className="pointer-events-none fixed inset-0 z-[100] bg-black/60"
          />
        )}
      </AnimatePresence>
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
