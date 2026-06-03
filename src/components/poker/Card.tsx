"use client";

import { motion } from "framer-motion";
import { Card as CardType } from "@/lib/poker/types";

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  small?: boolean;
  highlight?: boolean;
  delay?: number;
  className?: string;
}

const SUIT_COLORS: Record<string, string> = {
  "♠": "text-slate-300",
  "♥": "text-red-500",
  "♦": "text-sky-400",
  "♣": "text-emerald-400",
};

export function Card({ card, faceDown = false, small = false, highlight = false, delay = 0, className = "" }: CardProps) {
  const sizeClass = small ? "w-8 h-12" : "w-14 h-20";
  const textSize = small ? "text-xs" : "text-base";
  const centerSize = small ? "text-lg" : "text-3xl";

  if (faceDown || !card) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay, duration: 0.3, type: "spring", stiffness: 200 }}
        className={`${sizeClass} rounded-md border border-amber-800/40 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-lg flex items-center justify-center ${className}`}
      >
        <div className="w-[80%] h-[80%] rounded border border-amber-700/30 bg-[repeating-linear-gradient(45deg,rgba(201,168,76,0.05),rgba(201,168,76,0.05)_2px,transparent_2px,transparent_8px)]" />
      </motion.div>
    );
  }

  const suitColor = SUIT_COLORS[card.suit] || "text-zinc-100";

  return (
    <motion.div
      initial={{ scale: 0, y: -20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.35, type: "spring", stiffness: 180 }}
      className={`${sizeClass} rounded-md bg-white shadow-lg flex flex-col relative overflow-hidden cursor-default select-none
        ${highlight ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-900" : ""}
        ${className}`}
    >
      {/* Top-left corner */}
      <div className={`absolute top-1 left-1 ${textSize} font-bold leading-none ${suitColor} flex flex-col items-center`}>
        <span>{card.rank}</span>
        <span className="text-[10px]">{card.suit}</span>
      </div>

      {/* Center */}
      <div className={`absolute inset-0 flex items-center justify-center ${centerSize} ${suitColor} font-bold`}>
        {card.suit}
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className={`absolute bottom-1 right-1 ${textSize} font-bold leading-none ${suitColor} flex flex-col items-center rotate-180`}>
        <span>{card.rank}</span>
        <span className="text-[10px]">{card.suit}</span>
      </div>
    </motion.div>
  );
}
