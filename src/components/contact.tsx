"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, FileText, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/brand-icons";
import { ease } from "@/lib/motion";

const SOCIALS = [
  { href: "https://github.com/mkskart", label: "GitHub", icon: GithubIcon, external: true },
  { href: "https://www.linkedin.com/in/kartheek-mukkavilli/", label: "LinkedIn", icon: LinkedinIcon, external: true },
  { href: "https://www.instagram.com/kartheek.k.mukkavilli/", label: "Instagram", icon: InstagramIcon, external: true },
  { href: "mailto:kartheek.mukkavilli@gmail.com", label: "Email", icon: Mail, external: true },
  { href: "/resume", label: "Resume", icon: FileText, external: false },
];

export function Contact() {
  return (
    <section id="contact" className="relative px-6 pt-28 pb-16 md:pt-36 md:pb-20">
      <div className="mx-auto max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, ease }}
          className="font-display text-5xl font-bold leading-[0.95] tracking-tighter md:text-[6rem] lg:text-[7rem]"
        >
          Let&apos;s build{" "}
          <span className="bg-gradient-to-br from-red-primary via-red-glow to-amber-200 bg-clip-text text-transparent">
            something.
          </span>
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
          className="mt-12 flex flex-wrap gap-3"
        >
          {SOCIALS.map((s) => (
            <motion.div
              key={s.href}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
              }}
            >
              {s.external ? (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated/60 px-5 py-3 text-sm text-text-secondary transition-all hover:-translate-y-1 hover:border-red-glow hover:text-text-primary hover:red-glow"
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ) : (
                <Link
                  href={s.href}
                  className="group inline-flex items-center gap-2 rounded-xl border border-red-primary/40 bg-red-primary/5 px-5 py-3 text-sm text-red-glow transition-all hover:-translate-y-1 hover:bg-red-primary hover:text-white hover:red-glow"
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border-subtle pt-8 text-xs text-text-muted md:flex-row md:items-center md:justify-between">
          <div className="font-mono">
            Built with Next.js, Three.js, Framer Motion ·{" "}
            <a
              href="https://github.com/mkskart/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-glow"
            >
              view source →
            </a>
          </div>
          <div className="font-mono">© 2026 Kartheek Mukkavilli · Austin, TX</div>
        </div>
      </div>
    </section>
  );
}
