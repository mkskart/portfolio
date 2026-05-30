// Shared timing for the SWE hero sequence, kept in its own dependency-free
// module so the eager hero bundle (hero.tsx) can read it without pulling in the
// canvas-heavy swe-hero.tsx (which loads lazily via the dynamic HeroScene).

// When the terminal transcript has finished typing (derived from the
// TERMINAL_LINES schedule in terminal-canvas.tsx).
export const TERMINAL_COMPLETE_MS = 5800;

// The name overlay reveals partway through the corruption that follows.
export const SWE_NAME_REVEAL_MS = TERMINAL_COMPLETE_MS + 600;
