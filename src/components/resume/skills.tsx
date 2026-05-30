"use client";

import { motion } from "framer-motion";
import { SiteMode } from "@/lib/mode";
import { MODE_CONTENT } from "@/lib/mode-content";

const ease = [0.22, 1, 0.36, 1] as const;

const GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Languages",
    items: ["C", "C++", "Python", "Java", "JavaScript / TypeScript", "SQL", "Assembly", "Verilog"],
  },
  {
    label: "Embedded",
    items: [
      "Zephyr RTOS",
      "nRF Connect SDK",
      "LTE-M",
      "LoRa",
      "GNSS",
      "MQTT",
      "TLS",
      "I2C",
      "UART",
      "PWM",
      "RTT/SWD debugging",
    ],
  },
  {
    label: "Tools",
    items: ["KiCad", "Saleae Logic", "Git", "Docker", "AWS IoT Core"],
  },
  {
    label: "Frameworks",
    items: ["React", "Node.js", "Spring Boot", "FastAPI", "PyTorch", "scikit-learn"],
  },
  {
    label: "Hardware",
    items: ["nRF9160", "ESP32", "Raspberry Pi", "Arduino", "MPU-6050"],
  },
  {
    label: "Certifications",
    items: ["PCAP", "PCEP", "Amazon Junior Software Developer"],
  },
];

export function Skills({ mode }: { mode?: SiteMode }) {
  const groups = mode ? MODE_CONTENT[mode].skillCategories : GROUPS;
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.label} className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr]">
          <div className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
            {g.label}
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10% 0px" }}
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="flex flex-wrap gap-1.5"
          >
            {g.items.map((s) => (
              <motion.span
                key={s}
                variants={{
                  hidden: { opacity: 0, y: 8, scale: 0.9 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.35, ease },
                  },
                }}
                className="rounded-md border border-border-subtle bg-bg-elevated/60 px-2.5 py-1 font-mono text-[11px] text-text-secondary"
              >
                {s}
              </motion.span>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
