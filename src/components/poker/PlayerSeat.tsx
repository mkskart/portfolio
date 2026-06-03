"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player, Card as CardType, EmojiReaction } from "@/lib/poker/types";
import { Card } from "./Card";
import { ChipCount } from "./ChipCount";

interface PlayerSeatProps {
  player: Player;
  isHero: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isTurn: boolean;
  showCards: boolean;
  reaction?: EmojiReaction;
  className?: string;
}

export function PlayerSeat({
  player,
  isHero,
  isDealer,
  isSmallBlind,
  isBigBlind,
  isTurn,
  showCards,
  reaction,
  className = "",
}: PlayerSeatProps) {
  const statusLabel =
    player.status === "folded" ? "Folded" :
    player.status === "all-in" ? "ALL IN" :
    player.status === "sitting-out" ? "Sitting Out" : null;

  return (
    <div className={`relative flex flex-col items-center gap-1 ${className}`}>
      {/* Floating emoji reaction */}
      <AnimatePresence>
        {reaction && (
          <motion.div
            key={reaction.id}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -60, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl pointer-events-none z-50"
          >
            {reaction.emoji}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards (above avatar for non-hero) */}
      {!isHero && (
        <div className="flex gap-0.5">
          {player.holeCards.length > 0 ? (
            player.holeCards.map((card, i) => (
              <Card
                key={card.id}
                card={showCards ? card : undefined}
                faceDown={!showCards}
                small
                delay={i * 0.1}
              />
            ))
          ) : (
            <div className="w-16 h-12" />
          )}
        </div>
      )}

      {/* Avatar ring + badge */}
      <div className="relative">
        <motion.div
          animate={isTurn ? { boxShadow: ["0 0 0 0 rgba(201,168,76,0.7)", "0 0 0 8px rgba(201,168,76,0)", "0 0 0 0 rgba(201,168,76,0.7)"] } : {}}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
            border-2 ${isTurn ? "border-amber-400" : "border-zinc-700"} shadow-lg`}
          style={{ backgroundColor: player.avatarColor }}
        >
          {player.name.charAt(0).toUpperCase()}
        </motion.div>

        {/* Dealer / SB / BB badges */}
        {isDealer && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-black text-xs font-black flex items-center justify-center shadow-md">D</div>
        )}
        {!isDealer && isSmallBlind && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center shadow-md">S</div>
        )}
        {!isDealer && !isSmallBlind && isBigBlind && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-black flex items-center justify-center shadow-md">B</div>
        )}

        {/* Status badge */}
        {statusLabel && (
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded text-[9px] font-bold whitespace-nowrap
            ${player.status === "all-in" ? "bg-red-600 text-white" : player.status === "folded" ? "bg-zinc-700 text-zinc-400" : "bg-zinc-600 text-zinc-300"}`}>
            {statusLabel}
          </div>
        )}
      </div>

      {/* Name */}
      <div className={`text-xs font-medium truncate max-w-[80px] text-center
        ${!player.isConnected ? "text-zinc-600" : isTurn ? "text-amber-300" : "text-zinc-300"}`}>
        {player.name}
        {player.isBot && <span className="text-zinc-500"> 🤖</span>}
      </div>

      {/* Chip count */}
      <ChipCount amount={player.chips} size="sm" />

      {/* Current bet */}
      {player.currentBet > 0 && (
        <div className="text-xs text-amber-400 font-mono">
          Bet: ${player.currentBet}
        </div>
      )}

      {/* Hero cards (shown at bottom) */}
      {isHero && (
        <div className="flex gap-1 mt-1">
          {player.holeCards.map((card, i) => (
            <Card key={card.id} card={card} delay={i * 0.15} />
          ))}
        </div>
      )}
    </div>
  );
}
