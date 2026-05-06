const STATS = [
  { value: "1.0ms", label: "PID loop period", sub: "ESP32 @ 1kHz" },
  { value: "45µs", label: "Measured loop jitter", sub: "GPIO + Saleae logic analyzer" },
  { value: "±2.5°", label: "Attitude hold accuracy", sub: "60-second hover test" },
];

export function FlightSpecs() {
  return (
    <section className="border-t border-border-subtle px-8 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-12 font-mono text-xs uppercase tracking-widest text-text-muted">
          Flight Performance
        </p>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {STATS.map((s) => (
            <div
              key={s.value}
              className="rounded border border-border-subtle p-6"
            >
              <div className="mb-2 font-mono text-3xl font-bold text-red-glow">
                {s.value}
              </div>
              <div className="mb-1 font-display text-sm text-text-primary">
                {s.label}
              </div>
              <div className="font-mono text-xs text-text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
