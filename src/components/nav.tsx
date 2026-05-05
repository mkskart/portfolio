"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

const links: { href: string; label: string }[] = [
  { href: "/#work", label: "Work" },
  { href: "/#hobbies", label: "Hobbies" },
  { href: "/#contact", label: "Contact" },
  { href: "/resume", label: "Resume" },
];

export function Nav() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {shown && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 right-4 z-40 hidden md:block"
        >
          <nav
            className={cn(
              "glass rounded-full px-5 py-2.5",
              "flex items-center gap-1 text-sm",
            )}
          >
            <Link
              href="/"
              className="mr-2 font-display font-semibold tracking-tight text-text-primary hover:text-red-glow transition-colors"
            >
              KM
            </Link>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative rounded-full px-3 py-1.5 text-text-secondary transition-colors hover:text-text-primary"
              >
                {l.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-red-glow transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
