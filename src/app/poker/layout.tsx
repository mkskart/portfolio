import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poker — Texas Hold'em",
  description: "Multiplayer Texas Hold'em poker with bot opponents",
};

export default function PokerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {children}
    </div>
  );
}
