/**
 * Reads the live theme accent colors from the CSS custom properties set in
 * globals.css (and overridden per [data-mode]). Canvas 2D / WebGL contexts
 * cannot parse `var(--accent)` strings, so anything drawing to a canvas must
 * resolve the variable to a concrete color first via these helpers.
 *
 * Call inside an effect / RAF loop — never at module scope (the DOM isn't
 * ready and the mode attribute may not be applied yet).
 */

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function getAccent(): string {
  return readVar("--accent", "#e10600");
}

export function getAccentGlow(): string {
  return readVar("--accent-glow", "#ff1744");
}

export function getAccentDeep(): string {
  return readVar("--accent-deep", "#8b0000");
}

/** rgba() built from the accent, with the given alpha. Useful for fills/grids. */
export function accentAlpha(alpha: number): string {
  const hex = getAccent();
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(225, 6, 0, ${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
