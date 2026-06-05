import { SiteMode } from "./mode";

export interface ResumeProject {
  name: string;
  tagline: string;
  bullets: string[];
  stack: string[];
  github?: string;
}

export interface ModeContent {
  subtitleCycle: string[];
  introParagraph: string;
  skillCategories: { label: string; items: string[] }[];
  /** Project IDs (see projects-data.ts) in priority order for this mode. */
  projectOrder: string[];
  /** Mode-tailored project entries rendered on the resume page. */
  resumeProjects: ResumeProject[];
  experienceFraming: {
    hcrl: string[];
    nov: string[];
    jpmc: string[];
  };
}

export const MODE_CONTENT: Record<SiteMode, ModeContent> = {
  firmware: {
    subtitleCycle: [
      "ECE @ UT Austin",
      "Embedded Engineer",
      "Firmware Developer",
      "Professional Violinist",
    ],
    introParagraph:
      "I'm a rising junior at UT Austin building things close to the metal. I write production firmware that ships to oil rigs, build flight controllers from scratch, and contribute to bionic prosthetics research. I work in C and C++ on real hardware — nRF9160, ESP32, Raspberry Pi Pico — with Zephyr and FreeRTOS.",
    skillCategories: [
      { label: "Languages", items: ["C", "C++", "Python", "Assembly"] },
      {
        label: "Embedded / RTOS",
        items: [
          "Zephyr RTOS", "FreeRTOS", "nRF Connect SDK", "LTE-M", "GNSS",
          "LoRa", "MQTT", "UART", "RTT", "I²C", "SPI", "PWM", "ESP-NOW", "TLS/mTLS",
        ],
      },
      {
        label: "Hardware / Tools",
        items: [
          "nRF9160", "ESP32", "Raspberry Pi", "Arduino", "MPU-6050",
          "KiCad", "Saleae Logic Analyzer", "nrfjprog", "AWS IoT Core",
        ],
      },
    ],
    projectOrder: [
      "litewing",
      "nrf9160-template",
      "pid-motor-sim",
      "obstacle-robot",
      "hcrl",
    ],
    resumeProjects: [
      {
        name: "LiteWing Drone",
        tagline: "C++ · ESP32 · FreeRTOS",
        bullets: [
          "Wrote a C++ flight controller on ESP32 running a 1.0ms PID attitude loop, measured at 45µs of jitter using GPIO toggling captured on a Saleae logic analyzer.",
          "Implemented I²C sensor fusion pipeline reading MPU-6050 IMU, driving four motors via 400Hz PWM — stable hover within ±2.5° over 60-second tests.",
          "Built a custom ESP-NOW telemetry layer for low-overhead controller-to-drone communication.",
        ],
        stack: ["C++", "FreeRTOS", "ESP32", "MPU-6050"],
        github: "https://github.com/mkskart/litewing",
      },
      {
        name: "nrf9160-zephyr-template",
        tagline: "C · Zephyr RTOS · nRF9160",
        bullets: [
          "Open-sourced production Zephyr firmware generalized from NOV field deployment — LTE-M bring-up with exponential backoff, GNSS PVT parsing, AWS IoT Core MQTT over mTLS.",
          "Automated TLS certificate provisioning via AT%CMNG, cutting per-unit onboarding from hours to under one minute across 50+ deployed units.",
        ],
        stack: ["C", "Zephyr RTOS", "nRF9160", "LTE-M", "AWS IoT"],
        github: "https://github.com/mkskart/nrf9160-zephyr-template",
      },
      {
        name: "pid-motor-sim",
        tagline: "Python · Control Systems",
        bullets: [
          "3-DOF DC motor arm simulation with anti-windup PID, derivative-on-measurement, and Ziegler-Nichols auto-tuning across 80 gain configurations.",
          "Outputs rise time, settling time, and overshoot metrics per configuration. Public analog of HCRL motor API and LiteWing flight controller work.",
        ],
        stack: ["Python"],
        github: "https://github.com/mkskart/pid-motor-sim",
      },
      {
        name: "Obstacle Avoidance Robot",
        tagline: "C++ · Arduino · Raspberry Pi",
        bullets: [
          "Hybrid Arduino/RPi navigation stack fusing ToF and ultrasonic sensors. Dijkstra pathfinding on occupancy grid with live replanning on obstacle detection.",
          "Custom UART protocol with XOR checksum validation between boards — 99.9% packet delivery in testing.",
        ],
        stack: ["C++", "Arduino", "Raspberry Pi"],
        github: "https://github.com/mkskart/obstacle-avoidance",
      },
    ],
    experienceFraming: {
      hcrl: [
        "Architected C++ firmware on Raspberry Pi Pico to synchronize 16-DOF bionic hand kinematics from remote glove telemetry, achieving 1ms sensor-to-actuation latency.",
        "Tuned PID control loops for 10 independent joints, improving tracking from unreliable to consistently stable real-time replication across the full range of hand motion.",
      ],
      nov: [
        "Replaced $20K/site legacy PLC/Modbus installations with a custom nRF9160 board under $250 (98% cost reduction), deployed across 50 field units within a $5K R&D budget.",
        "Engineered C/Zephyr RTOS firmware for LTE-M + GNSS over a 40-node LoRa mesh to AWS IoT Core; wrote a safe-shutdown handshake preventing LTE tower rejection on power cycle.",
        "Automated TLS certificate provisioning via Python + AT%CMNG, reducing per-unit onboarding from hours to under one minute across all deployed units.",
        "Led full product lifecycle — KiCad PCB layout, Fusion 360 enclosure, firmware dev, and field validation — delivering production-ready hardware under budget.",
      ],
      jpmc: [
        "Built a Spring Boot/Cassandra microservice for a 2M+ record keyspace; optimized SQL logic reducing latency by 40%.",
      ],
    },
  },

  quant: {
    subtitleCycle: [
      "ECE @ UT Austin",
      "Algorithmic Trader",
      "ML Engineer",
      "Professional Violinist",
    ],
    introParagraph:
      "I'm a rising junior at UT Austin building quantitative systems at the intersection of machine learning and markets. I design and backtest algorithmic trading strategies, build low-latency data pipelines, and apply transformer models to real-time signal processing. Currently running a live paper trading engine.",
    skillCategories: [
      { label: "Languages", items: ["Python", "C++", "Java", "SQL", "TypeScript"] },
      {
        label: "Quant / ML",
        items: [
          "PyTorch", "scikit-learn", "Isolation Forest", "Genetic Algorithms",
          "Transformer Models", "Time-Series Analysis", "Backtesting",
        ],
      },
      {
        label: "Infra / Tools",
        items: [
          "Alpaca API", "Groq API", "FastAPI", "Docker", "SQLAlchemy",
          "AWS IoT Core", "Git",
        ],
      },
      {
        label: "Math",
        items: [
          "Linear Algebra", "Discrete Mathematics",
          "Digital Signal Processing", "Probability & Statistics",
        ],
      },
    ],
    projectOrder: [
      "quantclaw",
      "stat-arb",
      "options-dashboard",
      "factor-model",
    ],
    resumeProjects: [
      {
        name: "QuantClaw",
        tagline: "Python · Genetic Algorithms · Alpaca API",
        bullets: [
          "Genetic algorithm breeds 50 VWAP+RSI strategy variants over 50 generations daily; 12-month backtest on 5-minute candles: 70% win rate, 250 trades, +20% net return.",
          "Live paper trading: +$160 on $800 starting balance in under one month. Isolation Forest circuit breaker halts on volatility anomalies. Groq LLM agent variant for autonomous decisions.",
        ],
        stack: ["Python", "Genetic Algorithms", "Alpaca API", "Groq API"],
        github: "https://github.com/mkskart/QuantClaw",
      },
      {
        name: "Statistical Arbitrage Engine",
        tagline: "Python · Kalman Filter · HMM",
        bullets: [
          "Screens single-sector universe for cointegrated pairs (Engle-Granger), models spread with OLS and dynamic Kalman-filter hedge ratio. OLS Sharpe 1.74, max DD −5.2% on energy sector.",
          "Kalman hedge produces 3.7× tighter spread vs OLS (PSX/MPC: σ 1.71 vs 6.28). 2-state HMM volatility-regime filter suppresses entries in high-vol regimes. Survivorship bias documented.",
        ],
        stack: ["Python", "Kalman Filter", "HMM", "statsmodels"],
        github: "https://github.com/mkskart/statistical-arbitrage-engine",
      },
      {
        name: "Options Pricing & Greeks Dashboard",
        tagline: "Python · NumPy · SciPy · Black-Scholes",
        bullets: [
          "Closed-form BSM with all 5 Greeks (no QuantLib). Monte Carlo with antithetic variates: ~40% SE reduction vs plain MC on equal sample budget. Brent's method IV inversion to ~1e-10 precision.",
          "Live IV surface from SPY yfinance chain across 12 expiries — produces correct downward skew, visually demonstrating where BSM's constant-vol assumption fails.",
        ],
        stack: ["Python", "NumPy", "SciPy", "plotly"],
        github: "https://github.com/mkskart/options-pricing-dashboard",
      },
      {
        name: "Factor Model / Alpha Research",
        tagline: "Python · Fama-French · Mean-Variance Optimization",
        bullets: [
          "FF3 replication on 40 large-caps, 155 months. Cross-sectional mean market beta ~0.97, SMB ~−0.18 (genuine large-cap tilt), R² ~41%. Survivorship bias documented explicitly.",
          "Barra-style max-Sharpe optimizer: Sharpe ~1.68 vs SPY ~0.9 in-sample. Custom short-term reversal factor with IC diagnostics: mean IC ~0.017 correctly identifies signal as non-tradeable in mega-caps.",
        ],
        stack: ["Python", "statsmodels", "scipy"],
        github: "https://github.com/mkskart/factor-model-alpha-research",
      },
    ],
    experienceFraming: {
      hcrl: [
        "Trained a PyTorch Transformer on high-frequency glove telemetry to predict 16-DOF bionic hand motion, achieving 1ms sensor-to-actuation latency — directly analogous to low-latency signal-to-execution pipelines.",
        "Applied PID control and real-time signal processing across 16 joints, improving tracking consistency from unreliable to stable — demonstrates quantitative systems tuning under real-time constraints.",
      ],
      nov: [
        "Architected a 40-node distributed IoT sensor network with reliable data ingestion pipelines to AWS IoT Core — experience applicable to market data collection and distributed systems design.",
        "Replaced $20K/site legacy system with $250 custom board (98% cost reduction); automated deployment tooling cutting onboarding from hours to under one minute across 50 field units.",
      ],
      jpmc: [
        "Built a Spring Boot/Cassandra microservice for a 2M+ record production keyspace; optimized SQL query logic reducing latency by 40%.",
        "Delivered a ReactJS + AG Grid real-time metadata dashboard for 200+ internal engineers on a 4-person scrum team.",
      ],
    },
  },

  swe: {
    subtitleCycle: [
      "ECE @ UT Austin",
      "Software Engineer",
      "Full-Stack Developer",
      "Professional Violinist",
    ],
    introParagraph:
      "I'm a rising junior at UT Austin building full-stack systems across embedded, backend, and AI. I've shipped production firmware to 50 field units, built microservices handling millions of records, and architected agentic AI pipelines. I care about systems that actually work in the real world.",
    skillCategories: [
      {
        label: "Languages",
        items: ["Python", "C", "C++", "Java", "TypeScript", "SQL", "Assembly"],
      },
      {
        label: "Frameworks / Tools",
        items: [
          "React", "FastAPI", "Spring Boot", "Node.js", "Docker",
          "SQLAlchemy", "AWS IoT Core", "Git",
        ],
      },
      {
        label: "Concepts",
        items: [
          "REST APIs", "Microservices", "OAuth 2.0", "CI/CD",
          "RAG Pipelines", "Agentic Systems",
        ],
      },
    ],
    projectOrder: [
      "jarvis",
      "smart-scheduler",
      "kinematic-transformer",
      "recruit",
      "vorticeapp",
    ],
    resumeProjects: [
      {
        name: "J.A.R.V.I.S.",
        tagline: "Python · FastAPI · Ollama · Whisper.cpp",
        bullets: [
          "Fully local voice AI on Raspberry Pi 5: Porcupine wake-word, Whisper.cpp offline STT, Ollama LLM, Mem0 + ChromaDB persistent RAG memory. Nothing leaves the device.",
          "Tool integrations: Gmail, Google Calendar, browser automation (Playwright), Telegram. FastAPI + WebSocket real-time dashboard. Sub-500ms median response on RPi 5.",
        ],
        stack: ["Python", "FastAPI", "Ollama", "Whisper.cpp", "ChromaDB", "Porcupine"],
        github: "https://github.com/mkskart/J.A.R.V.I.S.",
      },
      {
        name: "SmartScheduler",
        tagline: "Python · FastAPI · React · TypeScript · Docker",
        bullets: [
          "Greedy deadline/priority scheduling backend: tasks sorted by priority then deadline, placed into working-hours slots respecting existing bookings. 120+ Pytest unit tests at 85% coverage.",
          "Google OAuth 2.0 in Docker Compose microservices. Type-safe React + TypeScript frontend with real-time schedule updates.",
        ],
        stack: ["Python", "FastAPI", "SQLAlchemy", "React", "TypeScript", "Docker"],
        github: "https://github.com/mkskart/smartschedule",
      },
      {
        name: "kinematic-transformer",
        tagline: "Python · PyTorch",
        bullets: [
          "PyTorch Transformer encoder (~69K params) for multi-joint kinematic sequence forecasting. Val MSE 0.003108, 0.571ms inference vs LSTM baseline 0.656ms.",
          "Public analog of the ML pipeline powering HCRL bionic-hand teleoperation. Synthetic telemetry dataset, fully reproducible.",
        ],
        stack: ["Python", "PyTorch"],
        github: "https://github.com/mkskart/kinematic-transformer",
      },
      {
        name: "RecruIT",
        tagline: "Node.js · TypeScript · Express · React · Vite",
        bullets: [
          "Full-stack internship tracking dashboard with cron-based scraping from 4 GitHub-hosted job boards (quant + SWE tracks). Fit scoring engine (0–100) on track match, skill keywords, location, and firm prestige.",
          "Email digest notifications via nodemailer. React + Vite + TypeScript frontend with drag-and-drop kanban and Recharts analytics dashboard.",
        ],
        stack: ["Node.js", "TypeScript", "Express", "SQLite", "React", "Vite"],
        github: "https://github.com/mkskart/RecruIT",
      },
      {
        name: "VorticeApp",
        tagline: "Python · matplotlib · CFD Visualization",
        bullets: [
          "Python data visualization tools for multi-gigabyte CFD vortex datasets, built for a graduate research team at University of Houston.",
          "Four chart types: 3D volumetric vortex structure, hierarchical tree, scatterplot cluster analysis, time-series line tracking. Credited on NSF Multi-scale Coherent Structure Extraction project webpage.",
        ],
        stack: ["Python", "matplotlib", "scikit-learn"],
        github: undefined,
      },
    ],
    experienceFraming: {
      hcrl: [
        "Integrated a PyTorch Transformer to predict 16-DOF bionic hand motion from glove telemetry, achieving 1ms sensor-to-actuation latency.",
        "Refined a modular PID motor control API for 10 joints, improving tracking from unreliable to consistently stable real-time replication.",
      ],
      nov: [
        "Replaced a $20K/site legacy PLC system with a custom nRF9160 board under $250 (98% cost reduction), deployed across 50 field units.",
        "Engineered Zephyr RTOS C firmware for LTE-M/GNSS over a 40-node LoRa mesh to AWS IoT Core, writing a safe-shutdown protocol to prevent LTE tower rejection on power cycle.",
        "Automated TLS certificate provisioning via Python + AT%CMNG, cutting per-unit onboarding from hours to under one minute.",
      ],
      jpmc: [
        "Built a Spring Boot/Cassandra microservice designed for a 2M+ record production keyspace with dynamic filtering and sorting.",
        "Optimized SQL query logic reducing analytical latency by 40%; delivered a ReactJS + AG Grid metadata dashboard for 200+ engineers.",
      ],
    },
  },
};
