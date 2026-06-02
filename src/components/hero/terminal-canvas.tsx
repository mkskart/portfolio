"use client";

import { useEffect, useRef, useState } from "react";

interface TerminalLine {
  prompt: string;
  text: string;
  delay: number;
  output?: boolean;
  loading?: boolean;
  final?: boolean;
}

export const TERMINAL_LINES: TerminalLine[] = [
  { prompt: "kartheek@portfolio:~$ ", text: "whoami", delay: 0 },
  { prompt: "", text: "rising junior · ECE @ UT Austin", delay: 800, output: true },
  { prompt: "", text: "", delay: 1200 },
  { prompt: "kartheek@portfolio:~$ ", text: "cat projects.txt", delay: 1400 },
  { prompt: "", text: "J.A.R.V.I.S.       →  local-first agentic AI on RPi 5", delay: 2200, output: true },
  { prompt: "", text: "Smart Scheduler    →  full-stack, 120+ tests, Docker", delay: 2600, output: true },
  { prompt: "", text: "QuantClaw          →  70% win rate, live paper trading", delay: 3000, output: true },
  { prompt: "", text: "LiteWing           →  1kHz FreeRTOS flight controller", delay: 3400, output: true },
  { prompt: "", text: "", delay: 3800 },
  { prompt: "kartheek@portfolio:~$ ", text: "./run_portfolio.sh", delay: 4000 },
  { prompt: "", text: "Loading...  ▓▓▓▓▓▓▓▓▓▓  100%", delay: 4800, output: true, loading: true },
  { prompt: "", text: "Ready. ↓", delay: 5600, output: true, final: true },
];

const CHAR_SPEED = 45; // ms per character for typed lines

export function TerminalCanvas() {
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [typing, setTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Respect reduced motion — render the whole transcript immediately
    // (deferred to a timer so we don't setState synchronously in the effect).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setVisibleLines(TERMINAL_LINES), 0);
      return () => clearTimeout(t);
    }

    TERMINAL_LINES.forEach((line) => {
      const startTimer = setTimeout(() => {
        if (line.output || line.text === "") {
          // Output and blank lines appear instantly.
          setVisibleLines((prev) => [...prev, line]);
        } else {
          // Command lines type out character by character.
          setVisibleLines((prev) => [...prev, { ...line, text: "" }]);
          setTyping(true);
          const fullText = line.text;
          fullText.split("").forEach((_, charIdx) => {
            const charTimer = setTimeout(() => {
              setVisibleLines((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last) {
                  updated[updated.length - 1] = {
                    ...last,
                    text: fullText.slice(0, charIdx + 1),
                  };
                }
                return updated;
              });
              if (charIdx === fullText.length - 1) setTyping(false);
            }, charIdx * CHAR_SPEED);
            timers.push(charTimer);
          });
        }
      }, line.delay);
      timers.push(startTimer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Keep the latest line in view.
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const done = !typing && visibleLines.length === TERMINAL_LINES.length;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* Terminal body */}
      <div
        ref={containerRef}
        className="relative mx-auto max-h-[70vh] w-full max-w-2xl overflow-hidden px-4 md:px-8"
        style={{ opacity: 0.7 }}
      >
        {visibleLines.map((line, idx) => (
          <div
            key={idx}
            className="whitespace-pre font-mono text-[10px] leading-[18px] md:text-sm md:leading-7"
            style={{
              color: line.output
                ? line.final
                  ? "var(--accent-glow)"
                  : "color-mix(in srgb, var(--accent) 60%, transparent)"
                : "var(--accent)",
            }}
          >
            {line.prompt && (
              <span style={{ color: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>
                {line.prompt}
              </span>
            )}
            {line.text}
            {idx === visibleLines.length - 1 && typing && <BlinkingCursor />}
          </div>
        ))}

        {/* Persistent prompt + cursor once the transcript finishes */}
        {done && (
          <div className="font-mono text-[10px] leading-[18px] md:text-sm md:leading-7" style={{ color: "var(--accent)" }}>
            <span style={{ color: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>
              kartheek@portfolio:~${" "}
            </span>
            <BlinkingCursor />
          </div>
        )}
      </div>

      {/* Terminal-frame corner decorations */}
      <div
        className="absolute left-4 top-4 font-mono text-xs opacity-20 md:left-8 md:top-8"
        style={{ color: "var(--accent)" }}
      >
        bash 5.2.15
      </div>
      <div
        className="absolute right-4 top-4 font-mono text-xs opacity-20 md:right-8 md:top-8"
        style={{ color: "var(--accent)" }}
      >
        80×24
      </div>
    </div>
  );
}

function BlinkingCursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{ opacity: visible ? 1 : 0 }}>█</span>;
}
