"use client";

import { useEffect, useState } from "react";

export function LogicAnalyzerSection() {
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/litewing/logic-analyzer.png", { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setHasImage(r.ok);
      })
      .catch(() => {
        if (!cancelled) setHasImage(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="border-t border-border-subtle px-8 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-text-muted">
          Logic Analyzer Capture
        </p>
        <p className="mb-8 max-w-lg font-sans text-sm text-text-muted">
          GPIO toggling captured on a Saleae logic analyzer. The 1.0ms period and
          45µs jitter are measured directly from this trace — not estimated.
        </p>

        {hasImage ? (
          <div className="overflow-hidden rounded border border-border-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/litewing/logic-analyzer.png"
              alt="Saleae logic analyzer capture showing 1.0ms PID loop period with 45µs jitter"
              className="w-full"
            />
            <div className="bg-bg-elevated px-4 py-3 font-mono text-xs text-text-muted">
              Saleae Logic 2 · Channel 0 · GPIO PID timing marker · Period: 1.0ms ·
              Jitter: 45µs
            </div>
          </div>
        ) : (
          <div className="rounded border border-dashed border-border-subtle p-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
              logic analyzer screenshot coming soon
            </p>
            <p className="mt-2 font-mono text-[10px] text-text-muted/60">
              drop image at public/litewing/logic-analyzer.png
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
