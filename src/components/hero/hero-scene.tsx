"use client";

import { CircuitCanvas } from "./circuit-canvas";

/**
 * Hero background. Was a custom GLSL FBM shader; now a vanilla 2D canvas
 * drawing animated PCB circuit traces — much lighter (no three.js), still
 * mouse-reactive, and more on-theme for an embedded engineer.
 */
export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 bg-bg-base">
      <CircuitCanvas />
      {/* Smooth fade to base at top + bottom for clean section transitions */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{ background: "linear-gradient(to bottom, #0a0a0a, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }}
      />
    </div>
  );
}
