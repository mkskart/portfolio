interface Card {
  title: string;
  tag: string;
  description: string;
  details: string[];
}

const CARDS: Card[] = [
  {
    title: "PID Attitude Control",
    tag: "C++ · ESP32",
    description:
      "1kHz control loop with proportional, integral, and derivative terms tuned for stable hover. Loop period measured at 1.0ms with 45µs jitter using GPIO toggling on a Saleae logic analyzer.",
    details: [
      "Separate PID for roll, pitch, yaw",
      "Anti-windup on integral term",
      "Derivative filtering to reduce noise",
    ],
  },
  {
    title: "IMU Sensor Fusion",
    tag: "I²C · MPU-6050",
    description:
      "MPU-6050 IMU read over I²C at 400Hz. Raw accelerometer and gyroscope data fused to produce stable attitude estimates resistant to vibration noise.",
    details: [
      "Complementary filter (gyro + accel)",
      "400Hz PWM motor output",
      "4-motor mixing for quadcopter geometry",
    ],
  },
  {
    title: "ESP-NOW Telemetry",
    tag: "Custom Protocol",
    description:
      "Custom low-latency communication protocol over ESP-NOW between controller and drone. Lower overhead than standard TCP/IP for real-time control data.",
    details: [
      "Sub-10ms round-trip latency",
      "Connectionless — no handshake overhead",
      "Packet loss detection and recovery",
    ],
  },
];

export function BuildBreakdown() {
  return (
    <section className="border-t border-border-subtle px-8 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-12 font-mono text-xs uppercase tracking-widest text-text-muted">
          How it&apos;s built
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded border border-border-subtle p-6 transition-colors hover:border-red-primary/50"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-red-glow">
                {card.tag}
              </span>
              <h3 className="mb-3 mt-2 font-display text-lg font-semibold text-text-primary">
                {card.title}
              </h3>
              <p className="mb-4 font-sans text-sm leading-relaxed text-text-muted">
                {card.description}
              </p>
              <ul className="space-y-1">
                {card.details.map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-2 font-mono text-[11px] text-text-muted"
                  >
                    <span className="mt-0.5 text-red-glow">›</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
