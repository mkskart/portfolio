"use client";

import { motion } from "framer-motion";
import { ease } from "@/lib/motion";

const COPY =
  "I'm a sophomore at UT Austin building things at the intersection of embedded systems, machine learning, and finance. I write firmware that ships to oil rigs, train transformers to control bionic hands, and run an autonomous trading agent that's currently outperforming the market in paper. I also play violin and watch a lot of F1.";

export function Intro() {
  const words = COPY.split(/\s+/);

  return (
    <section id="intro" className="relative px-6 py-32 md:py-40">
      <div className="mx-auto max-w-[1100px]">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
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
      </div>
    </section>
  );
}
