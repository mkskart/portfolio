"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const links: { href: string; label: string }[] = [
  { href: "/#experience", label: "Experience" },
  { href: "/#work", label: "Work" },
  { href: "/#hobbies", label: "Hobbies" },
  { href: "/#contact", label: "Contact" },
  { href: "/resume", label: "Resume" },
];

export function Nav() {
  const [shown, setShown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          className="fixed top-4 right-4 z-40"
        >
          {/* Desktop: inline pill (unchanged) */}
          <nav
            className={cn(
              "glass hidden rounded-full px-5 py-2.5 md:flex",
              "items-center gap-1 text-sm",
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

          {/* Mobile: compact menu button that opens the links (a wide pill would
              collide with the top-left now-playing widget). */}
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="glass grid h-11 w-11 place-items-center rounded-full text-text-primary"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.nav
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="glass absolute right-0 top-full mt-2 flex min-w-36 flex-col gap-1 rounded-2xl p-2 text-sm"
                >
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
                    >
                      {l.label}
                    </Link>
                  ))}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
