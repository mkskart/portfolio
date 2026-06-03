import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Poker — Texas Hold'em",
  description: "Single-player Texas Hold'em against AI bots.",
};

export default function PokerLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#0a0a0a] text-white">{children}</div>;
}
