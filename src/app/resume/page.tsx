import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { ResumeHeader } from "@/components/resume/header";
import { ResumeSection, ResumeRole, Bullet } from "@/components/resume/section";
import { Skills } from "@/components/resume/skills";
import {
  UTTower,
  ChipPulse,
  Waveform,
  MiniEquity,
  LogicAnalyzer,
} from "@/components/resume/animated-icons";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume — Kartheek Mukkavilli, ECE @ UT Austin",
};

export default function ResumePage() {
  return (
    <div className="relative">
      {/* Top corner — back + download */}
      <div className="fixed top-4 left-4 z-30">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated/80 px-3 py-1.5 text-xs text-text-secondary backdrop-blur transition-colors hover:border-red-glow hover:text-red-glow"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
      </div>
      <div className="fixed top-4 right-4 z-30">
        <a
          href="/kartheek-mukkavilli-resume.pdf"
          download
          className="group inline-flex items-center gap-2 rounded-full border border-red-primary/50 bg-red-primary/10 px-3 py-1.5 text-xs text-red-glow backdrop-blur transition-all hover:bg-red-primary hover:text-white hover:red-glow"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </a>
      </div>

      <article className="mx-auto max-w-[760px] px-6 pt-28 pb-32 md:px-8">
        <ResumeHeader />

        <ResumeSection title="Education">
          <ResumeRole
            org="University of Texas at Austin"
            role="B.E. in Electrical and Computer Engineering · GPA 3.95 / 4.0"
            loc="Austin, TX"
            dates="Expected May 2028"
            icon={<UTTower size={36} />}
          >
            <Bullet>
              Coursework: Embedded Systems, Digital Logic Design, DSP,
              Software Design and Implementation, Circuit Theory, Discrete
              Mathematics, Linear Algebra.
            </Bullet>
            <Bullet>
              Elements of Computing Certificate (CS) · Business Foundations
              Minor.
            </Bullet>
          </ResumeRole>
        </ResumeSection>

        <ResumeSection title="Technical Skills">
          <Skills />
        </ResumeSection>

        <ResumeSection title="Experience">
          <ResumeRole
            org="Human Centered Robotics Laboratory"
            role="Research Assistant, University of Texas at Austin"
            loc="Austin, TX"
            dates="Jan 2026 – Present"
            icon={<Waveform width={56} height={28} />}
          >
            <Bullet>
              Built a Transformer-based sequence model in PyTorch to map
              glove telemetry to joint commands for a 16-DOF bionic arm
              (per-finger and thumb articulation, wrist, and elbow), running
              inference on an MCU for end-to-end teleoperation.
            </Bullet>
            <Bullet>
              Improved per-joint tracking by tuning the model and motor-control
              pipeline to correctly identify which joint the operator intended
              to move and replicate the motion in real time.
            </Bullet>
            <Bullet>
              Implemented PID control loops across 16 independent joints with
              pressure and tension feedback, working toward fine-grained grasp
              control suitable for fragile-object manipulation.
            </Bullet>
          </ResumeRole>

          <ResumeRole
            org="National Oilwell Varco"
            role="Embedded Systems Intern"
            loc="Houston, TX"
            dates="Jun 2025 – Aug 2025"
            icon={<ChipPulse size={28} />}
          >
            <Bullet>
              Wrote Zephyr RTOS firmware in C for an nRF9160-based IoT
              monitoring board, replacing a $20K-per-site PLC Modbus
              installation with a $250 plug-and-play unit (50 units deployed
              and field-validated).
            </Bullet>
            <Bullet>
              Designed an LTE-M reconnection protocol with graceful shutdown
              handshakes to prevent carrier-side blocking on power cycles,
              keeping the cellular link warm and ensuring continuous telemetry
              uplink to AWS IoT Core.
            </Bullet>
            <Bullet>
              Built a LoRa mesh between a parent board and per-machine sensor
              nodes for site-level data aggregation, with permission-scoped
              routing.
            </Bullet>
            <Bullet>
              Automated TLS certificate provisioning by flashing AWS-issued
              certs to all boards in parallel, cutting per-board onboarding
              from several hours to under a minute.
            </Bullet>
            <Bullet>
              Owned the firmware lifecycle from architecture through field
              deployment, delivering a production prototype on a $5K R&amp;D
              budget.
            </Bullet>
          </ResumeRole>

          <ResumeRole
            org="J.P. Morgan Chase"
            role="Software Engineering Intern"
            loc="Houston, TX"
            dates="Jun 2022 – Jul 2022"
          >
            <Bullet>
              Built a Spring Boot microservice on Cassandra with dynamic
              partitioning for time-series analytics, reducing query latency
              from ~200ms to ~50ms.
            </Bullet>
            <Bullet>
              Co-developed a React dashboard for metadata visualization,
              deployed for a 200-engineer internal analytics team. Served as
              project manager / scrum master for the intern team.
            </Bullet>
          </ResumeRole>

          <ResumeRole
            org="University of Houston"
            role="Computer Science Research Intern"
            loc="Houston, TX"
            dates="Jun 2023 – Aug 2023"
          >
            <Bullet>
              Built Python data-visualization tools to render multi-gigabyte
              CFD vortex datasets — 3D volumetric view, hierarchical tree
              views, scatterplots, time-series line graphs — supporting a
              graduate research team on coherent-structure extraction; credited
              on the NSF project webpage.
            </Bullet>
          </ResumeRole>
        </ResumeSection>

        <ResumeSection title="Projects">
          <ResumeRole
            org="Autonomous Algorithmic Trading Agent"
            role="Python · PyTorch · Groq API · Flask"
            dates=""
            icon={<MiniEquity width={56} height={28} />}
          >
            <Bullet>
              Built two architectures for autonomous equities trading on paper
              accounts: a genetic-algorithm system that breeds 50 candidate
              bots over 50 generations of backtested fitness selection, and an
              LLM-driven agent using the Groq API to make trade decisions
              under hard risk rules.
            </Bullet>
            <Bullet>
              Backtested on 5-minute candles over 12 months: 70% win rate
              across 250 trades. LLM agent live in paper trading: +$160 on
              $800 starting balance (~20% return in under one month).
            </Bullet>
            <Bullet>
              Deployed an Isolation Forest module for real-time anomaly
              detection to halt trading during abnormal volatility, with a
              Flask dashboard for live position monitoring.
            </Bullet>
          </ResumeRole>

          <ResumeRole
            org="LiteWing Drone"
            role="C++ · ESP32 · FreeRTOS"
            dates=""
            icon={<LogicAnalyzer width={56} height={28} />}
          >
            <Bullet>
              Wrote a C++ flight controller on ESP32 running a 1.0ms PID
              attitude loop, measured at 45µs of jitter using GPIO toggling
              captured on a Saleae logic analyzer.
            </Bullet>
            <Bullet>
              Implemented an I2C sensor pipeline reading the MPU-6050 IMU and
              driving four motors via 400Hz PWM, achieving stable hover within
              ±2.5° attitude error over 60-second flight tests.
            </Bullet>
            <Bullet>
              Built a custom ESP-NOW telemetry layer for low-overhead
              controller-to-drone communication.
            </Bullet>
          </ResumeRole>

          <ResumeRole
            org="J.A.R.V.I.S. — Personal AI Assistant"
            role="Python · FastAPI · RAG"
            dates=""
          >
            <Bullet>
              Voice-controlled assistant with a RAG pipeline over personal
              context for task memory, with a modular command engine routing
              voice intents to API actions and smart-home controls.
            </Bullet>
            <Bullet>
              Integrated YouTube Music, Google Calendar, and Google SDM APIs
              for cross-device control across macOS, iOS, and Linux.
            </Bullet>
          </ResumeRole>

          <ResumeRole
            org="Smart Scheduler"
            role="Python · SQLAlchemy · React · TypeScript · Docker"
            dates=""
          >
            <Bullet>
              RESTful Python/SQLAlchemy backend with a scheduling engine
              validated by 120+ Pytest unit tests, integrated with Google
              OAuth 2.0 in a Docker Compose microservice stack.
            </Bullet>
            <Bullet>Type-safe React + TypeScript frontend implementing the scheduling UI.</Bullet>
          </ResumeRole>

          <ResumeRole
            org="Obstacle Avoidance Robot"
            role="Arduino · Raspberry Pi · C++"
            dates=""
          >
            <Bullet>
              Autonomous navigation stack on a hybrid Arduino/Raspberry Pi
              platform fusing time-of-flight and ultrasonic sensors, with
              checksum-validated packet delivery between the two boards.
            </Bullet>
            <Bullet>
              Implemented Dijkstra-based pathfinding tested on a custom
              obstacle course.
            </Bullet>
          </ResumeRole>
        </ResumeSection>

        <ResumeSection title="Leadership and Awards">
          <ul className="space-y-2 text-[15px] leading-[1.65] text-text-secondary">
            <li>UT IEEE Robotics and Automation Society — engineering autonomous systems.</li>
            <li>
              TSA Co-Founder — coached 20+ members to Nationals 3× in App
              Development and Drone Design.
            </li>
            <li>4× Gold PVSA Medalist · SAMPADA Violin Certified · ABRSM Violin Grade 5.</li>
          </ul>
        </ResumeSection>
      </article>
    </div>
  );
}
