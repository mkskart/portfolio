"use client";

import type { ControlMode } from "./drone-scene";

export interface Telemetry {
  roll: number;
  pitch: number;
  yaw: number;
  throttle: number;
  alt: number;
  batt: number;
}

interface Props {
  telemetry: Telemetry;
  mode: ControlMode;
}

function signed(val: number) {
  return val >= 0 ? `+${val.toFixed(1)}` : val.toFixed(1);
}

export function TelemetryOverlay({ telemetry, mode }: Props) {
  const { roll, pitch, yaw, throttle, alt, batt } = telemetry;
  return (
    <div className="pointer-events-none absolute bottom-44 left-1/2 z-10 -translate-x-1/2 md:bottom-28">
      <div className="rounded border border-border-subtle bg-black/60 px-4 py-3 font-mono text-xs backdrop-blur-sm md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Stat label="ROLL" value={`${signed(roll)}°`} active={Math.abs(roll) > 2} />
          <Stat label="PITCH" value={`${signed(pitch)}°`} active={Math.abs(pitch) > 2} />
          <Stat label="YAW" value={`${signed(yaw)}°`} active={Math.abs(yaw) > 1} />
          <div className="hidden h-6 w-px bg-border-subtle md:block" />
          <Stat label="THROTTLE" value={`${throttle}%`} active={throttle > 10} />
          <Stat label="ALT" value={`${alt.toFixed(2)}m`} active={alt > 0.1} />
          <Stat label="BATT" value={`${batt.toFixed(0)}%`} warning={batt < 20} />
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 border-t border-border-subtle pt-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              mode === "hand" ? "animate-pulse bg-emerald-400" : "bg-text-muted"
            }`}
          />
          <span className="text-[10px] uppercase tracking-widest text-text-muted">
            {mode === "hand" ? "Hand tracking active" : "Cursor mode"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  active,
  warning,
}: {
  label: string;
  value: string;
  active?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="mb-1 text-[9px] uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div
        className={`text-sm font-semibold transition-colors duration-100 ${
          warning
            ? "text-yellow-400"
            : active
              ? "text-red-glow"
              : "text-text-primary"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
