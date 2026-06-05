"use client";

import { SiteMode } from "@/lib/mode";
import { MODE_CONTENT } from "@/lib/mode-content";
import { ResumeHeader } from "./header";
import { ResumeSection, ResumeRole, Bullet } from "./section";
import { Skills } from "./skills";
import {
  UTTower,
  ChipPulse,
  Waveform,
  MiniEquity,
  LogicAnalyzer,
} from "./animated-icons";

function projectIcon(name: string) {
  if (name.startsWith("LiteWing")) return <LogicAnalyzer width={56} height={28} />;
  if (name === "QuantClaw") return <MiniEquity width={56} height={28} />;
  return undefined;
}

export function ResumeContent({ mode }: { mode: SiteMode }) {
  const { experienceFraming, resumeProjects } = MODE_CONTENT[mode];

  return (
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
            Coursework: Embedded Systems, Digital Logic Design, DSP, Software
            Design and Implementation, Circuit Theory, Discrete Mathematics,
            Linear Algebra.
          </Bullet>
          <Bullet>
            Elements of Computing Certificate (CS) · Business Foundations Minor.
          </Bullet>
        </ResumeRole>
      </ResumeSection>

      <ResumeSection title="Technical Skills">
        <Skills mode={mode} />
      </ResumeSection>

      <ResumeSection title="Experience">
        <ResumeRole
          org="Human Centered Robotics Laboratory"
          role="Research Assistant, University of Texas at Austin"
          loc="Austin, TX"
          dates="Jan 2026 – Present"
          icon={<Waveform width={56} height={28} />}
        >
          {experienceFraming.hcrl.map((b, i) => (
            <Bullet key={i}>{b}</Bullet>
          ))}
        </ResumeRole>

        <ResumeRole
          org="National Oilwell Varco"
          role="Embedded Systems Intern"
          loc="Houston, TX"
          dates="Jun 2025 – Aug 2025"
          icon={<ChipPulse size={28} />}
        >
          {experienceFraming.nov.map((b, i) => (
            <Bullet key={i}>{b}</Bullet>
          ))}
        </ResumeRole>

        <ResumeRole
          org="J.P. Morgan Chase"
          role="Software Engineering Intern"
          loc="Houston, TX"
          dates="Jun 2022 – Jul 2022"
        >
          {experienceFraming.jpmc.map((b, i) => (
            <Bullet key={i}>{b}</Bullet>
          ))}
        </ResumeRole>

        <ResumeRole
          org="University of Houston"
          role="Computer Science Research Intern"
          loc="Houston, TX"
          dates="Jun 2023 – Aug 2023"
        >
          <Bullet>
            Built Python data-visualization tools to render multi-gigabyte CFD
            vortex datasets — 3D volumetric view, hierarchical tree views,
            scatterplots, time-series line graphs — supporting a graduate
            research team on coherent-structure extraction; credited on the NSF
            project webpage.
          </Bullet>
        </ResumeRole>
      </ResumeSection>

      <ResumeSection title="Projects">
        {resumeProjects.map((p) => (
          <ResumeRole
            key={p.name}
            org={p.name}
            role={p.tagline}
            dates=""
            icon={projectIcon(p.name)}
          >
            {p.bullets.map((b, i) => (
              <Bullet key={i}>{b}</Bullet>
            ))}
            <li className="flex flex-wrap items-center gap-2 pt-1">
              {p.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border-subtle bg-bg-elevated/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                >
                  {s}
                </span>
              ))}
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-text-muted transition-colors hover:text-red-glow"
                >
                  GitHub →
                </a>
              )}
            </li>
          </ResumeRole>
        ))}
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
  );
}
