export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  github?: string;
  /** Headliner projects rendered as full-width featured sections per mode. */
  isFeatured?: boolean;
  /** Active research with no public repo (e.g. HCRL). */
  isActiveResearch?: boolean;
  /** Which site modes surface this project. */
  modes: ("firmware" | "quant" | "swe")[];
}

export const ALL_PROJECTS: Project[] = [
  // ── FIRMWARE ──────────────────────────────────────────────────────────────

  {
    id: "litewing",
    name: "LiteWing",
    tagline: "Custom quadcopter flight controller",
    description:
      "1kHz FreeRTOS PID attitude control loop on ESP32, measured at 1.0ms period / 45µs jitter via GPIO toggling on a Saleae logic analyzer. Complementary filter IMU fusion from MPU-6050 over I²C, 400Hz PWM motor output, custom ESP-NOW telemetry layer between controller and drone.",
    stack: ["C++", "FreeRTOS", "ESP32", "MPU-6050", "ESP-NOW"],
    github: "https://github.com/mkskart/litewing",
    isFeatured: true,
    modes: ["firmware"],
  },
  {
    id: "nrf9160-template",
    name: "nrf9160-zephyr-template",
    tagline: "Production Zephyr firmware template for nRF9160",
    description:
      "Open-sourced production firmware generalized from NOV field deployment. LTE-M bring-up with exponential backoff reconnect protocol, GNSS PVT parsing, AWS IoT Core MQTT over mTLS, RTT/UART structured logging, and automated TLS certificate provisioning via AT%CMNG. 50+ units field-validated.",
    stack: ["C", "Zephyr RTOS", "nRF9160", "LTE-M", "GNSS", "AWS IoT"],
    github: "https://github.com/mkskart/nrf9160-zephyr-template",
    modes: ["firmware"],
  },
  {
    id: "pid-motor-sim",
    name: "pid-motor-sim",
    tagline: "3-DOF PID simulator with Ziegler-Nichols auto-tuning",
    description:
      "3-DOF DC motor arm simulation with anti-windup PID, derivative-on-measurement, and Ziegler-Nichols auto-tuning. 80-configuration gain sweep with rise time, settling time, and overshoot metrics. Public analog of HCRL motor API and LiteWing flight controller work.",
    stack: ["Python", "Control Systems", "Simulation"],
    github: "https://github.com/mkskart/pid-motor-sim",
    modes: ["firmware"],
  },
  {
    id: "obstacle-robot",
    name: "Obstacle Avoidance Robot",
    tagline: "Autonomous Arduino/RPi navigation stack",
    description:
      "Hybrid Arduino/Raspberry Pi platform fusing ToF and ultrasonic sensors. Dijkstra pathfinding on an occupancy grid with live obstacle replanning. Custom UART protocol with XOR checksum validation between the two boards, 99.9% packet delivery in testing.",
    stack: ["C++", "Arduino", "Raspberry Pi", "UART"],
    github: "https://github.com/mkskart/obstacle-avoidance",
    modes: ["firmware"],
  },

  // ── QUANT ─────────────────────────────────────────────────────────────────

  {
    id: "quantclaw",
    name: "QuantClaw",
    tagline: "Algorithmic trading engine",
    description:
      "Genetic algorithm breeds 50 VWAP+RSI strategy variants over 50 generations of backtested fitness selection each morning. 12-month backtest on 5-minute candles: 70% win rate across 250 evaluated trades, +20% net return. Live paper trading via Alpaca: +$160 on $800 starting balance in under one month. Isolation Forest circuit breaker halts trading on volatility anomalies. Groq LLM agent variant for autonomous decision-making.",
    stack: ["Python", "Genetic Algorithms", "Alpaca API", "Isolation Forest", "Groq API"],
    github: "https://github.com/mkskart/QuantClaw",
    isFeatured: true,
    modes: ["quant"],
  },
  {
    id: "stat-arb",
    name: "Statistical Arbitrage Engine",
    tagline: "Pairs trading with Kalman dynamic hedging",
    description:
      "Screens a single-sector universe for cointegrated pairs (Engle-Granger on all C(n,2) combinations), models the spread with both static OLS and a dynamic Kalman-filter hedge ratio, and runs a vectorized backtest with HMM volatility-regime filter. OLS Sharpe 1.74, max DD −5.2%. Kalman filter produces a 3.7× tighter spread (PSX/MPC: σ 1.71 vs 6.28 OLS) demonstrating the dynamic hedge works correctly. Honest note: static OLS produced better risk-adjusted returns here — 'dynamic' is not automatically 'better.'",
    stack: ["Python", "Kalman Filter", "HMM", "statsmodels", "pykalman"],
    github: "https://github.com/mkskart/statistical-arbitrage-engine",
    modes: ["quant"],
  },
  {
    id: "options-dashboard",
    name: "Options Pricing & Greeks Dashboard",
    tagline: "BSM from scratch, Monte Carlo, live IV surface",
    description:
      "No QuantLib — all pricing math implemented directly in NumPy/SciPy. Closed-form BSM with all 5 Greeks in trader-friendly units (Theta/calendar day, Vega/vol point, Rho/1% rate). Monte Carlo with antithetic variates: ~40% SE reduction vs plain MC on slightly-ITM calls on equal sample budget. Live IV surface from yfinance SPY chain across 12 expiries using Brent's method inversion. Produces the classic downward-sloping skew showing exactly where BSM's constant-vol assumption fails.",
    stack: ["Python", "NumPy", "SciPy", "Black-Scholes", "Monte Carlo", "plotly"],
    github: "https://github.com/mkskart/options-pricing-dashboard",
    modes: ["quant"],
  },
  {
    id: "factor-model",
    name: "Factor Model / Alpha Research",
    tagline: "FF3 replication, custom factor, Barra-style optimizer",
    description:
      "Fama-French 3-factor replication on 40 large-cap names over 155 months. Cross-sectional mean market beta ~0.97 (as expected), SMB ~−0.18 (genuine large-cap anti-size tilt), R² ~41%. Custom short-term reversal factor with full IC diagnostics: mean IC ~0.017, t-stat ~0.84 — correctly identifies the signal as non-tradeable in liquid large-caps (documented anomaly arbitraged away in mega-caps). Barra-style max-Sharpe optimizer: Sharpe ~1.68 vs SPY ~0.9. Survivorship bias documented explicitly throughout.",
    stack: ["Python", "Fama-French", "Kalman", "statsmodels", "scipy"],
    github: "https://github.com/mkskart/factor-model-alpha-research",
    modes: ["quant"],
  },

  // ── SWE ───────────────────────────────────────────────────────────────────

  {
    id: "pitwall",
    name: "PitWall",
    tagline: "Real-time F1 telemetry & race-replay platform",
    description:
      "Full-stack Formula 1 telemetry platform: a live timing tower, a 3D track map (React Three Fiber) where all 20 cars render in three instanced draw calls mutated imperatively for zero React re-renders at 60fps, and a binary-search replay engine that interpolates every car's state along an arc-length-parameterized racing line for scrubbable race replay. Streams live data from OpenF1 over Server-Sent Events (server-side polling, client auto-reconnect), falls back to an Ergast-compatible source for older seasons, and degrades to a deterministic, clearly-labelled simulation when no session is live. Source-agnostic Zustand store, Zod-validated boundaries, TanStack Query caching.",
    stack: ["Next.js", "TypeScript", "React Three Fiber", "Zustand", "TanStack Query", "SSE"],
    github: "https://github.com/mkskart/PitWall",
    modes: ["swe"],
  },
  {
    id: "jarvis",
    name: "J.A.R.V.I.S.",
    tagline: "Local-first voice AI assistant",
    description:
      "Fully local voice AI running on Raspberry Pi 5 — nothing leaves the device. Porcupine wake-word activation, Whisper.cpp offline STT, SAPI TTS, Ollama LLM brain, Mem0 + ChromaDB persistent RAG memory. Tool integrations: Gmail, Google Calendar, browser automation (Playwright), Telegram. FastAPI + WebSocket real-time dashboard. Sub-500ms median response latency on RPi 5.",
    stack: ["Python", "FastAPI", "Ollama", "Whisper.cpp", "ChromaDB", "Porcupine", "Mem0"],
    github: "https://github.com/mkskart/J.A.R.V.I.S.",
    isFeatured: true,
    modes: ["swe"],
  },
  {
    id: "smart-scheduler",
    name: "SmartScheduler",
    tagline: "Full-stack scheduling application",
    description:
      "Greedy deadline/priority scheduling backend: tasks sorted by priority then deadline, placed into working-hours slots respecting existing bookings. FastAPI + SQLAlchemy 2.0, Google OAuth 2.0 in Docker Compose microservices. 120+ Pytest unit tests at 85% line coverage. Type-safe React + TypeScript frontend with real-time schedule updates.",
    stack: ["Python", "FastAPI", "SQLAlchemy", "React", "TypeScript", "Docker", "OAuth 2.0"],
    github: "https://github.com/mkskart/smartschedule",
    modes: ["swe"],
  },
  {
    id: "kinematic-transformer",
    name: "kinematic-transformer",
    tagline: "Transformer for multi-joint kinematic forecasting",
    description:
      "PyTorch Transformer encoder (~69K parameters) for multi-joint kinematic sequence forecasting on synthetic telemetry. Val MSE 0.003108, 0.571ms inference latency vs LSTM baseline 0.656ms. Public analog of the ML pipeline powering the HCRL bionic-hand teleoperation system.",
    stack: ["Python", "PyTorch", "Transformers"],
    github: "https://github.com/mkskart/kinematic-transformer",
    modes: ["firmware", "quant"],
  },
  {
    id: "recruit",
    name: "RecruIT",
    tagline: "Job tracking + scraping dashboard",
    description:
      "Full-stack internship tracking and scraping dashboard built for personal recruiting use. Node/Express + TypeScript backend with SQLite, cron-based scraping from 4 GitHub-hosted internship boards (quant + SWE tracks). Fit scoring engine (0–100) weighing track match, skill keywords, location, and firm prestige. Email digest notifications via nodemailer. React + Vite + TypeScript frontend with drag-and-drop kanban and Recharts analytics.",
    stack: ["Node.js", "TypeScript", "Express", "SQLite", "React", "Vite", "Recharts"],
    github: "https://github.com/mkskart/RecruIT",
    modes: ["swe"],
  },
  {
    id: "vorticeapp",
    name: "VorticeApp",
    tagline: "NSF fluid dynamics visualization",
    description:
      "Python data visualization tools for multi-gigabyte CFD vortex datasets, built for a graduate research team at the University of Houston. Four chart types: 3D volumetric vortex structure view, hierarchical tree, scatterplot for cluster analysis, and time-series line tracking. Credited on the NSF Multi-scale Coherent Structure Extraction project webpage.",
    stack: ["Python", "scikit-learn", "matplotlib", "CFD"],
    github: undefined, // Repo left private
    modes: ["swe"],
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
