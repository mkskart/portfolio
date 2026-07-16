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
  /** Per-mode Education coursework line (matches each resume PDF). */
  coursework: string[];
  skillCategories: { label: string; items: string[] }[];
  /** Project IDs (see projects-data.ts) in priority order for this mode. */
  projectOrder: string[];
  /** Mode-tailored project entries rendered on the resume page. */
  resumeProjects: ResumeProject[];
  /** Full experience bullets for the resume page. */
  experienceFraming: {
    swri: string[];
    hcrl: string[];
    nov: string[];
  };
  /** One-line-per-role blurbs for the homepage Experience timeline. */
  experienceBlurb: {
    swri: string;
    hcrl: string;
    nov: string;
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
      "I'm a rising junior at UT Austin building things close to the metal. I write production firmware that's shipped to 50 oil-field units, build flight controllers from scratch, develop FPGA firmware for tactical aerospace systems, and contribute to bionic-hand research. I work in C, C++, and Verilog on real hardware — nRF9160, ESP32, RP2040, Xilinx FPGAs — with Zephyr and FreeRTOS.",
    coursework: [
      "Embedded Systems", "Digital Logic Design", "Digital Signal Processing",
      "Signals & Systems", "Computer Architecture", "Operating Systems",
      "Software Design", "Algorithms", "Circuit Theory", "Discrete Mathematics",
      "Linear Algebra", "Differential Equations",
    ],
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
        label: "FPGA / Hardware",
        items: [
          "Xilinx Vivado", "Verilog", "nRF9160", "ESP32", "Raspberry Pi",
          "Arduino", "MPU-6050", "KiCad", "Fusion 360", "Saleae Logic",
          "nrfjprog", "AWS IoT Core",
        ],
      },
      {
        label: "DevOps / Tools",
        items: ["Docker", "GitLab CI/CD", "Git", "Linux"],
      },
    ],
    projectOrder: [
      "litewing",
      "nrf9160-template",
      "pid-motor-sim",
      "kinematic-transformer",
      "obstacle-robot",
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
        name: "kinematic-transformer",
        tagline: "Python · PyTorch",
        bullets: [
          "Transformer encoder for real-time multi-joint kinematic forecasting; 0.571ms inference latency — demonstrates ML-to-actuation pipeline design for embedded control systems.",
          "Public analog of the ML pipeline powering HCRL bionic-hand teleoperation. Synthetic telemetry dataset, fully reproducible.",
        ],
        stack: ["Python", "PyTorch"],
        github: "https://github.com/mkskart/kinematic-transformer",
      },
    ],
    experienceFraming: {
      swri: [
        "Developing FPGA firmware and a bootloader for the F-16 SIU (Sensor Integration Unit) in Xilinx Vivado within an ITAR-controlled environment, consolidating divergent legacy codebases into a single validated monorepo with clean version-control history.",
        "Validated clean-clone build portability across multiple development machines, eliminating environment-specific toolchain drift ahead of full containerization.",
        "Building a Dockerized build environment and GitLab CI/CD pipelines to automate synthesis, implementation, and bitstream validation, reducing manual build overhead for the firmware team.",
      ],
      hcrl: [
        "Architected C++ firmware on Raspberry Pi Pico to synchronize 16-DOF bionic hand kinematics from remote glove telemetry, achieving 1ms sensor-to-actuation latency.",
        "Tuned PID control loops for 10 independent joints, improving tracking from unreliable to consistently stable real-time replication across the full range of hand motion.",
        "Debugged the sensor-to-actuation pipeline end-to-end using onboard logging to isolate and reduce latency bottlenecks.",
      ],
      nov: [
        "Replaced $20K/site legacy PLC/Modbus installations with a custom nRF9160 board under $250 (98% cost reduction), deployed across 50 field units within a $5K R&D budget.",
        "Engineered C/Zephyr RTOS firmware for LTE-M + GNSS over a 40-node LoRa mesh to AWS IoT Core; wrote a safe-shutdown handshake preventing LTE tower rejection on power cycle.",
        "Automated TLS certificate provisioning via Python + AT%CMNG, reducing per-unit onboarding from hours to under one minute across all deployed units.",
        "Led full product lifecycle — KiCad PCB layout, Fusion 360 enclosure, firmware dev, and field validation — delivering production-ready hardware under budget.",
      ],
    },
    experienceBlurb: {
      swri: "Building FPGA firmware and a bootloader for the F-16 SIU in an ITAR-controlled environment, with a Dockerized GitLab CI/CD build pipeline.",
      hcrl: "C++ firmware on an RP2040 syncing a 16-DOF bionic hand from glove telemetry at 1ms sensor-to-actuation latency.",
      nov: "Replaced $20K/site legacy PLCs with a custom $250 nRF9160 board — 98% cost cut, 50 units on a LoRa mesh to AWS IoT.",
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
    coursework: [
      "Algorithms", "Signals & Systems", "Digital Signal Processing",
      "Discrete Mathematics", "Linear Algebra", "Differential Equations",
      "Circuit Theory",
    ],
    skillCategories: [
      { label: "Languages", items: ["Python", "C++", "SQL", "TypeScript"] },
      {
        label: "Quant / ML",
        items: [
          "PyTorch", "scikit-learn", "statsmodels", "Kalman Filtering",
          "HMM Regime Detection", "Engle-Granger Cointegration", "Monte Carlo",
          "Black-Scholes", "Genetic Algorithms",
        ],
      },
      {
        label: "Math",
        items: [
          "Linear Algebra", "Probability & Statistics",
          "Time-Series Analysis", "Stochastic Processes",
        ],
      },
      {
        label: "Infra / Tools",
        items: ["Alpaca API", "FastAPI", "Docker", "GitLab CI/CD", "SQLAlchemy", "Git"],
      },
    ],
    projectOrder: [
      "quantclaw",
      "stat-arb",
      "options-dashboard",
      "kinematic-transformer",
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
        name: "kinematic-transformer",
        tagline: "Python · PyTorch",
        bullets: [
          "PyTorch Transformer encoder (~69K params) forecasting multi-joint kinematic sequences: 0.003108 validation MSE, 0.571ms inference vs 0.656ms for an LSTM baseline.",
          "Benchmarked against the LSTM baseline on identical synthetic telemetry to isolate architecture as the source of the latency and accuracy gains.",
        ],
        stack: ["Python", "PyTorch"],
        github: "https://github.com/mkskart/kinematic-transformer",
      },
    ],
    experienceFraming: {
      swri: [
        "Modernizing a legacy firmware build pipeline in an ITAR-controlled environment, consolidating fragmented codebases into a single validated, version-controlled system.",
        "Validated build reproducibility across development environments, laying groundwork for full CI/CD automation — rigorous verification methodology applicable to research pipeline validation.",
        "Building a Dockerized, GitLab CI/CD-automated build and validation pipeline to replace a manual, GUI-driven workflow — direct experience with reproducible, production-grade automation.",
      ],
      hcrl: [
        "Trained a PyTorch Transformer on high-frequency glove telemetry to predict 16-DOF bionic hand motion, achieving 1ms sensor-to-actuation latency — directly analogous to low-latency signal-to-execution pipelines.",
        "Applied PID control and real-time signal processing across 16 joints, improving tracking consistency from unreliable to stable — quantitative systems tuning under real-time constraints.",
        "Processed and cleaned high-frequency, multi-channel sensor telemetry, building intuition for handling noisy time-series data at scale.",
      ],
      nov: [
        "Architected a 40-node distributed IoT sensor network with reliable data ingestion pipelines to AWS IoT Core — experience applicable to market data collection and distributed systems design.",
        "Replaced $20K/site legacy system with $250 custom board (98% cost reduction); automated deployment tooling cutting onboarding from hours to under one minute across 50 field units.",
        "Automated TLS certificate provisioning via Python scripting, reducing per-unit onboarding overhead across all 50 deployed units.",
      ],
    },
    experienceBlurb: {
      swri: "Modernizing a legacy firmware build into a validated, Dockerized GitLab CI/CD pipeline in an ITAR-controlled environment.",
      hcrl: "Trained a PyTorch Transformer on high-frequency telemetry to predict 16-DOF hand motion at 1ms latency — low-latency signal-to-execution work.",
      nov: "Architected a 40-node distributed sensor network with reliable ingestion to AWS IoT — 98% cost cut vs the legacy system.",
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
      "I'm a rising junior at UT Austin building full-stack systems across embedded, backend, and AI. I've shipped production firmware to 50 field units, built real-time data platforms with live 3D visualization, and architected local-first agentic AI pipelines. I care about systems that actually work in the real world.",
    coursework: [
      "Algorithms", "Computer Architecture", "Operating Systems",
      "Software Design", "Digital Logic Design", "Discrete Mathematics",
    ],
    skillCategories: [
      {
        label: "Languages",
        items: ["Python", "C", "C++", "Java", "TypeScript", "SQL"],
      },
      {
        label: "Frameworks / Tools",
        items: [
          "React", "FastAPI", "Spring Boot", "Node.js", "Docker",
          "GitLab CI/CD", "SQLAlchemy", "Git",
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
      "pitwall",
      "smart-scheduler",
      "recruit",
      "vorticeapp",
    ],
    resumeProjects: [
      {
        name: "PitWall",
        tagline: "Next.js · TypeScript · React Three Fiber",
        bullets: [
          "Real-time F1 telemetry dashboard with a 3D track map (React Three Fiber) driven by a live Server-Sent Events stream; arc-length parameterization for accurate car positioning and automatic SSE reconnect handling.",
          "Binary-search replay engine interpolates every car's state at any instant for scrubbable race replay; dual OpenF1/Ergast sources normalized behind one typed model, with a deterministic simulation fallback when no session is live.",
        ],
        stack: ["Next.js", "TypeScript", "React Three Fiber", "Zustand", "SSE"],
        github: "https://github.com/mkskart/PitWall",
      },
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
        name: "RecruIT",
        tagline: "Node.js · TypeScript · Express · React · Vite",
        bullets: [
          "Full-stack internship tracking dashboard with cron-based scraping from 4 GitHub-hosted job boards (quant + SWE tracks). Fit scoring engine (0–100) on track match, skill keywords, location, and firm prestige.",
          "Email digest notifications via nodemailer. React + Vite + TypeScript frontend with drag-and-drop kanban and Recharts analytics dashboard.",
        ],
        stack: ["Node.js", "TypeScript", "Express", "SQLite", "React", "Vite"],
        github: "https://github.com/mkskart/RecruIT",
      },
    ],
    experienceFraming: {
      swri: [
        "Modernizing a legacy firmware build pipeline in an ITAR-controlled environment, consolidating fragmented codebases into a single validated, version-controlled monorepo.",
        "Validated build reproducibility across multiple development machines ahead of full containerization, eliminating environment-specific toolchain drift.",
        "Containerized the build toolchain with Docker and integrated it into a GitLab CI/CD pipeline, replacing a manual, GUI-driven workflow with automated, reproducible builds.",
      ],
      hcrl: [
        "Integrated a PyTorch Transformer to predict 16-DOF bionic hand motion from glove telemetry, achieving 1ms sensor-to-actuation latency.",
        "Refined a modular PID motor control API for 10 joints, improving tracking from unreliable to consistently stable real-time replication.",
        "Debugged and profiled the sensor-to-actuation pipeline end-to-end to isolate and resolve latency bottlenecks.",
      ],
      nov: [
        "Replaced a $20K/site legacy PLC system with a custom nRF9160 board under $250 (98% cost reduction), deployed across 50 field units.",
        "Engineered Zephyr RTOS C firmware for LTE-M/GNSS over a 40-node LoRa mesh to AWS IoT Core, writing a safe-shutdown protocol to prevent LTE tower rejection on power cycle.",
        "Automated TLS certificate provisioning via Python + AT%CMNG scripting, reducing per-unit onboarding from hours to under a minute.",
      ],
    },
    experienceBlurb: {
      swri: "Modernizing a legacy firmware build into a version-controlled monorepo, containerized with Docker and automated via GitLab CI/CD.",
      hcrl: "Integrated a PyTorch Transformer and a modular PID control API to drive a 16-DOF bionic hand at 1ms sensor-to-actuation latency.",
      nov: "Shipped Zephyr RTOS firmware to 50 field units — LTE-M/GNSS over a 40-node LoRa mesh to AWS IoT Core, at 1/80th the legacy cost.",
    },
  },
};
