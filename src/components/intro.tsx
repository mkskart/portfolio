"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ease } from "@/lib/motion";
import { useMode } from "@/lib/mode-context";
import { MODE_CONTENT } from "@/lib/mode-content";

export function Intro() {
  const { mode } = useMode();
  const copy = MODE_CONTENT[mode].introParagraph;
  const words = copy.split(/\s+/);

  return (
    <section id="intro" className="relative px-6 py-32 md:py-40">
      <div className="mx-auto max-w-[1100px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15% 0px" }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            variants={{ visible: { transition: { staggerChildren: 0.022 } } }}
            className="font-display text-2xl font-medium leading-[1.45] text-text-primary text-balance md:text-[2.5rem] md:leading-[1.35]"
          >
            {words.map((w, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
                  visible: {
                    opacity: i % 11 === 6 ? 1 : 0.92,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.6, ease },
                  },
                }}
                className="inline-block"
              >
                {w}
                {i < words.length - 1 && <span>&nbsp;</span>}
              </motion.span>
            ))}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
