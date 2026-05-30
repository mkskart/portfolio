export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  github?: string;
  isNew?: boolean;
  /** Headliner projects rendered as full-width featured sections per mode. */
  isFeatured?: boolean;
}

export const ALL_PROJECTS: Project[] = [
  {
    id: "litewing",
    name: "LiteWing",
    tagline: "Custom quadcopter flight controller",
    description:
      "1 kHz FreeRTOS PID attitude control loop on ESP32. Measured 1.0ms period / 45µs jitter via GPIO + Saleae. Complementary filter IMU fusion, 400Hz PWM motor output, custom ESP-NOW telemetry layer.",
    stack: ["C++", "FreeRTOS", "ESP32", "MPU-6050"],
    github: "https://github.com/mkskart/litewing",
    isFeatured: true,
  },
  {
    id: "quantclaw",
    name: "QuantClaw",
    tagline: "Algorithmic trading engine",
    description:
      "Genetic algorithm breeds 50 VWAP+RSI strategy variants over 50 generations daily. 12-month backtest: 70% win rate over 250 trades, +20% net return. Live paper trading: +$160 on $800 in one month. Isolation Forest circuit breaker + Groq LLM agent.",
    stack: ["Python", "Alpaca API", "Isolation Forest", "Groq API"],
    github: "https://github.com/mkskart/QuantClaw",
    isFeatured: true,
  },
  {
    id: "jarvis",
    name: "J.A.R.V.I.S.",
    tagline: "Local-first voice AI assistant",
    description:
      "Fully local voice AI on Raspberry Pi 5. Porcupine wake-word, Whisper.cpp STT, Ollama LLM, Mem0 + ChromaDB RAG memory. Tools for Gmail, Calendar, browser automation, and Telegram. FastAPI + WebSocket dashboard.",
    stack: ["Python", "FastAPI", "Ollama", "Whisper.cpp", "ChromaDB", "Porcupine"],
    github: "https://github.com/mkskart/J.A.R.V.I.S.",
  },
  {
    id: "nrf9160-template",
    name: "nrf9160-zephyr-template",
    tagline: "Production Zephyr firmware template",
    description:
      "Open-sourced production firmware template for the nRF9160: LTE-M bring-up with exponential backoff, GNSS PVT parsing, AWS IoT MQTT over mTLS, RTT/UART logging, and automated TLS provisioning. Generalized from NOV production firmware.",
    stack: ["C", "Zephyr RTOS", "nRF9160", "AWS IoT", "LTE-M"],
    github: "https://github.com/mkskart/nrf9160-zephyr-template",
    isNew: true,
  },
  {
    id: "pid-motor-sim",
    name: "pid-motor-sim",
    tagline: "PID control simulator with auto-tuning",
    description:
      "3-DOF DC motor arm simulation with anti-windup PID, derivative-on-measurement, and Ziegler-Nichols auto-tuning. 80-config gain sweep with rise time, settling time, and overshoot metrics.",
    stack: ["Python"],
    github: "https://github.com/mkskart/pid-motor-sim",
    isNew: true,
  },
  {
    id: "kinematic-transformer",
    name: "kinematic-transformer",
    tagline: "Transformer for multi-joint motion forecasting",
    description:
      "Transformer encoder (~69K params) forecasting multi-joint kinematic sequences. Val MSE 0.003108, 0.571ms inference latency vs LSTM 0.656ms. Public analog of HCRL bionic-hand ML pipeline.",
    stack: ["Python", "PyTorch"],
    github: "https://github.com/mkskart/kinematic-transformer",
    isNew: true,
  },
  {
    id: "smart-scheduler",
    name: "Smart Scheduler",
    tagline: "Full-stack scheduling application",
    description:
      "Greedy deadline/priority scheduling backend with 120+ Pytest unit tests (85% coverage). Docker Compose microservices with Google OAuth 2.0. Type-safe React + TypeScript frontend.",
    stack: ["Python", "FastAPI", "React", "TypeScript", "Docker", "OAuth 2.0"],
    github: "https://github.com/mkskart/smartschedule",
  },
  {
    id: "hcrl",
    name: "HCRL Bionic Arm",
    tagline: "16-DOF bionic hand control research",
    description:
      "Transformer-based motion prediction and PID control for a 16-DOF bionic arm at UT's Human Centered Robotics Lab. 1ms sensor-to-actuation latency.",
    stack: ["PyTorch", "C++", "Raspberry Pi Pico"],
    // No GitHub — active research, no public repo
  },
];

export function projectById(id: string): Project | undefined {
  return ALL_PROJECTS.find((p) => p.id === id);
}

/** Projects ordered per the given mode's projectOrder, dropping unknown IDs. */
export function orderedProjects(order: string[]): Project[] {
  return order
    .map((id) => projectById(id))
    .filter((p): p is Project => Boolean(p));
}
