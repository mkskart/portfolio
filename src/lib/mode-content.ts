import { SiteMode } from "./mode";

export interface ModeContent {
  subtitleCycle: string[];
  introParagraph: string;
  skillCategories: { label: string; items: string[] }[];
  /** Project IDs (see projects-data.ts) in priority order for this mode. */
  projectOrder: string[];
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
      "kinematic-transformer",
      "jarvis",
      "quantclaw",
      "smart-scheduler",
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
      "kinematic-transformer",
      "litewing",
      "jarvis",
      "nrf9160-template",
      "pid-motor-sim",
      "smart-scheduler",
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
      "quantclaw",
      "litewing",
      "nrf9160-template",
      "kinematic-transformer",
      "pid-motor-sim",
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
