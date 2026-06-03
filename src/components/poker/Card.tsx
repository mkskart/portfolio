"use client";

import { motion } from "framer-motion";
import type { Card as CardType } from "@/lib/poker/types";
import { RANK_LABELS, SUIT_COLORS, SUIT_SYMBOLS } from "@/lib/poker/deck";
import { cn } from "@/lib/cn";

interface CardProps {
  card?: CardType | null;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  dim?: boolean;
}

const SIZES = {
  sm: { w: "w-9", h: "h-13", corner: "text-[10px]", center: "text-xl", pad: "p-1" },
  md: { w: "w-12", h: "h-[4.5rem]", corner: "text-xs", center: "text-2xl", pad: "p-1.5" },
  lg: { w: "w-16", h: "h-24", corner: "text-sm", center: "text-4xl", pad: "p-2" },
};

export function PlayingCard({
  card,
  faceDown,
  size = "md",
  className,
  dim,
}: CardProps) {
  const s = SIZES[size];

  if (faceDown || !card) {
    return (
      <div
        className={cn(
          s.w,
          s.h,
          "relative rounded-md border border-[#2a2a2a] shadow-md",
          "bg-[linear-gradient(135deg,#1b1b22_0%,#262631_50%,#1b1b22_100%)]",
          className,
        )}
      >
        <div className="absolute inset-1 rounded-sm border border-[#c9a84c]/25" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#c9a84c]/40 text-lg font-[family-name:var(--font-space-grotesk)]">
            ♠
          </span>
        </div>
      </div>
    );
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const label = RANK_LABELS[card.rank];

  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        s.w,
        s.h,
        s.pad,
        "relative rounded-md bg-[#f7f5ef] shadow-md flex flex-col justify-between select-none",
        dim && "opacity-50",
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className={cn("leading-none font-bold", s.corner)}
        style={{ color }}
      >
        <div>{label}</div>
        <div className="-mt-0.5">{symbol}</div>
      </div>
      <div
        className={cn("absolute inset-0 flex items-center justify-center font-bold", s.center)}
        style={{ color }}
      >
        {symbol}
      </div>
      <div
        className={cn("self-end rotate-180 leading-none font-bold", s.corner)}
        style={{ color }}
      >
        <div>{label}</div>
        <div className="-mt-0.5">{symbol}</div>
      </div>
    </motion.div>
  );
}
