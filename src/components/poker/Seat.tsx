"use client";

import { motion } from "framer-motion";
import type { GameState, Player } from "@/lib/poker/types";
import { PlayingCard } from "./Card";
import { cn } from "@/lib/cn";

interface SeatProps {
  player: Player;
  state: GameState;
  isHumanSeat: boolean;
  // reveal hole cards (showdown) even for bots
  reveal: boolean;
}

function badges(state: GameState, seat: number) {
  const live = state.players.filter((p) => !p.busted).map((p) => p.seat);
  if (live.length < 2) return [];
  const order = live;
  const di = order.indexOf(state.dealer);
  const heads = live.length === 2;
  const sbSeat = heads ? order[di] : order[(di + 1) % order.length];
  const bbSeat = heads ? order[(di + 1) % order.length] : order[(di + 2) % order.length];
  const out: string[] = [];
  if (seat === state.dealer) out.push("D");
  if (seat === sbSeat) out.push("SB");
  if (seat === bbSeat) out.push("BB");
  return out;
}

export function Seat({ player, state, isHumanSeat, reveal }: SeatProps) {
  const isTurn = state.toAct === player.seat;
  const isWinner = state.winningSeats.includes(player.seat);
  const showCards = isHumanSeat || reveal;
  const seatBadges = badges(state, player.seat);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* hole cards */}
      <div className="flex gap-1">
        {player.holeCards.length > 0 && !player.busted ? (
          player.holeCards.map((c, i) => (
            <PlayingCard
              key={i}
              card={showCards ? c : undefined}
              faceDown={!showCards}
              size={isHumanSeat ? "md" : "sm"}
              dim={player.folded}
            />
          ))
        ) : null}
      </div>

      {/* name plate */}
      <motion.div
        animate={
          isTurn
            ? { boxShadow: ["0 0 0px #c9a84c", "0 0 16px #c9a84c", "0 0 0px #c9a84c"] }
            : { boxShadow: "0 0 0px transparent" }
        }
        transition={isTurn ? { duration: 1.4, repeat: Infinity } : { duration: 0.3 }}
        className={cn(
          "relative min-w-[7rem] rounded-lg border px-2.5 py-1 text-center",
          "bg-black/70 backdrop-blur-sm",
          isWinner ? "border-[#c9a84c]" : "border-white/10",
          player.folded && "opacity-50",
        )}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: player.color }}
          />
          <span className="text-xs font-medium text-white truncate max-w-[6rem]">
            {player.name}
          </span>
        </div>
        <div className="text-[13px] font-bold text-[#c9a84c] font-[family-name:var(--font-jetbrains-mono)]">
          {player.busted ? "BUST" : `$${player.stack}`}
        </div>

        {/* badges */}
        {seatBadges.length > 0 && (
          <div className="absolute -right-2 -top-2 flex gap-0.5">
            {seatBadges.map((b) => (
              <span
                key={b}
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                  b === "D"
                    ? "bg-white text-black"
                    : "bg-[#c9a84c] text-black",
                )}
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {isTurn && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-wider text-[#c9a84c]">
            Your turn
          </div>
        )}
      </motion.div>

      {/* current-round bet */}
      {player.committed > 0 && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#c9a84c] bg-[#c9a84c]/40" />
          <span className="text-[11px] font-semibold text-white font-[family-name:var(--font-jetbrains-mono)]">
            ${player.committed}
          </span>
        </motion.div>
      )}
    </div>
  );
}
