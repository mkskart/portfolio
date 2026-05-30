export type SiteMode = "firmware" | "quant" | "swe";

export const DEFAULT_MODE: SiteMode = "firmware";

export const MODE_LABELS: Record<SiteMode, string> = {
  firmware: "Firmware",
  quant: "Quant",
  swe: "SWE",
};

export const MODES: SiteMode[] = ["firmware", "quant", "swe"];

/** URL search param key used to persist the active mode. */
export const MODE_PARAM = "mode";

export function isSiteMode(value: string | null | undefined): value is SiteMode {
  return value === "firmware" || value === "quant" || value === "swe";
}

export function getModeFromUrl(): SiteMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  const params = new URLSearchParams(window.location.search);
  const mode = params.get(MODE_PARAM);
  return isSiteMode(mode) ? mode : DEFAULT_MODE;
}

export function setModeInUrl(mode: SiteMode) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set(MODE_PARAM, mode);
  window.history.replaceState({}, "", url.toString());
}
