"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Users, Bot, Plus } from "lucide-react";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function PokerLobbyPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [tab, setTab] = useState<"create" | "join" | null>(null);
  const [name, setName] = useState("");
  const [startingStack, setStartingStack] = useState(1000);
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [avatarColor] = useState(() => {
    const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#e91e63"];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  const handleCreate = () => {
    if (!name.trim()) return;
    const code = generateRoomCode();
    const params = new URLSearchParams({
      name: name.trim(),
      color: avatarColor,
      host: "1",
      stack: String(startingStack),
      sb: String(smallBlind),
      bb: String(bigBlind),
    });
    router.push(`/poker/${code}?${params}`);
  };

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return;
    const code = joinCode.toUpperCase().trim();
    const params = new URLSearchParams({ name: name.trim(), color: avatarColor });
    router.push(`/poker/${code}?${params}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: "#0a0a0a" }}>
      {/* Background felt texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #c9a84c 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

      {/* Back link */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🃏</div>
          <h1 className="text-4xl font-black text-zinc-100 mb-2">Texas Hold'em</h1>
          <p className="text-zinc-500 text-sm">Multiplayer poker — up to 8 players per room</p>
        </div>

        {/* Name input — always shown */}
        <div className="mb-6">
          <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Tab buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTab(tab === "create" ? null : "create")}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
              ${tab === "create" ? "bg-amber-900/30 border-amber-600/60 text-amber-300" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
          >
            <Plus size={22} />
            <span className="text-sm font-semibold">Create Room</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTab(tab === "join" ? null : "join")}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
              ${tab === "join" ? "bg-blue-900/30 border-blue-600/60 text-blue-300" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
          >
            <Users size={22} />
            <span className="text-sm font-semibold">Join Room</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/poker/bots?name=${encodeURIComponent(name || "Player")}&color=${encodeURIComponent(avatarColor)}`)}
            className="p-4 rounded-xl border flex flex-col items-center gap-2 transition-all bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          >
            <Bot size={22} />
            <span className="text-sm font-semibold">vs Bots</span>
          </motion.button>
        </div>

        {/* Create room panel */}
        {tab === "create" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 mb-4 space-y-4"
          >
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Room Settings</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Starting Stack</label>
                <input
                  type="number"
                  value={startingStack}
                  onChange={e => setStartingStack(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Small Blind</label>
                <input
                  type="number"
                  value={smallBlind}
                  onChange={e => setSmallBlind(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Big Blind</label>
                <input
                  type="number"
                  value={bigBlind}
                  onChange={e => setBigBlind(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-40"
            >
              Create Room
            </button>
          </motion.div>
        )}

        {/* Join room panel */}
        {tab === "join" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 mb-4 space-y-4"
          >
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Join a Room</h3>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Room Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono text-center uppercase tracking-[0.3em] focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={!name.trim() || joinCode.length < 6}
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40"
            >
              Join Room
            </button>
          </motion.div>
        )}

        {/* Info */}
        <p className="text-center text-xs text-zinc-600">
          Rooms auto-close when empty · No registration needed
        </p>
      </motion.div>
    </div>
  );
}
