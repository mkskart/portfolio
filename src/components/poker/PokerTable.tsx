"use client";

import { GameState, Player, EmojiReaction } from "@/lib/poker/types";
import { Card } from "./Card";
import { PlayerSeat } from "./PlayerSeat";
import { ChipCount } from "./ChipCount";

interface PokerTableProps {
  state: GameState;
  heroId: string;
  latestReactions: EmojiReaction[];
}

// Position a list of players around an oval table
// Returns { top, left } as percentage strings
function getSeatPositions(count: number, heroIdx: number): { top: string; left: string }[] {
  // Map from logical positions around oval to hero-relative positions
  // We always want hero at bottom center (position = 0.5, 0.92)
  // Other players spread around oval
  const positions: { top: string; left: string }[] = [];

  // Pre-defined oval positions (top=0 is top), hero at index=0 goes to bottom
  const ovalPositions = [
    { top: "88%", left: "50%" },  // index 0 = bottom center (hero)
    { top: "70%", left: "82%" },  // bottom right
    { top: "40%", left: "90%" },  // right
    { top: "12%", left: "75%" },  // top right
    { top: "8%",  left: "50%" },  // top center
    { top: "12%", left: "25%" },  // top left
    { top: "40%", left: "10%" },  // left
    { top: "70%", left: "18%" },  // bottom left
  ];

  // Remap so heroIdx sits at ovalPositions[0]
  for (let i = 0; i < count; i++) {
    const mappedIdx = (i - heroIdx + count) % count;
    positions.push(ovalPositions[mappedIdx % ovalPositions.length]);
  }

  return positions;
}

export function PokerTable({ state, heroId, latestReactions }: PokerTableProps) {
  const { players, communityCards, pot, sidePots, phase, dealerIndex, smallBlindIndex, bigBlindIndex, currentPlayerIndex, lastHandResult } = state;

  if (players.length === 0) return null;

  const heroIdx = players.findIndex(p => p.id === heroId);
  const effectiveHeroIdx = heroIdx === -1 ? 0 : heroIdx;

  const seatPositions = getSeatPositions(players.length, effectiveHeroIdx);

  const reactionMap = new Map<string, EmojiReaction>();
  for (const r of latestReactions) {
    reactionMap.set(r.playerId, r);
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: "60%" }}>
      {/* Table felt — oval */}
      <div
        className="absolute inset-0 m-4 rounded-[50%] border-4 shadow-2xl"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, #16472e 0%, #0d3320 60%, #081e14 100%)",
          borderColor: "#c9a84c",
          boxShadow: "0 0 40px rgba(201,168,76,0.15), inset 0 0 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Community cards + pot in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          {/* Community cards */}
          <div className="flex gap-2">
            {communityCards.map((card, i) => {
              const isWinningCard = lastHandResult?.winners.some(() => true); // simplify
              return (
                <Card
                  key={card.id}
                  card={card}
                  delay={i * 0.12}
                  highlight={false}
                />
              );
            })}
            {/* Placeholders */}
            {Array.from({ length: Math.max(0, 5 - communityCards.length) }).map((_, i) => (
              <div
                key={`ph-${i}`}
                className="w-14 h-20 rounded-md border-2 border-dashed border-green-800/40 opacity-30"
              />
            ))}
          </div>

          {/* Pot */}
          {pot > 0 && (
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs text-zinc-400 font-medium">POT</div>
              <ChipCount amount={pot} size="lg" />
              {sidePots.length > 1 && (
                <div className="text-[10px] text-zinc-500">
                  {sidePots.length} side pots
                </div>
              )}
            </div>
          )}

          {/* Phase badge */}
          {phase !== "waiting" && (
            <div className="text-xs text-amber-400/60 uppercase tracking-widest font-mono">
              {phase}
            </div>
          )}
        </div>
      </div>

      {/* Player seats positioned around the oval */}
      {players.map((player, idx) => {
        const pos = seatPositions[idx];
        const isHero = player.id === heroId;
        const showCards = isHero || phase === "showdown";

        return (
          <div
            key={player.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            <PlayerSeat
              player={player}
              isHero={isHero}
              isDealer={idx === dealerIndex}
              isSmallBlind={idx === smallBlindIndex}
              isBigBlind={idx === bigBlindIndex}
              isTurn={idx === currentPlayerIndex && (phase !== "waiting" && phase !== "showdown")}
              showCards={showCards}
              reaction={reactionMap.get(player.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
