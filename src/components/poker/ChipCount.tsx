"use client";

interface ChipCountProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChipCount({ amount, size = "md", className = "" }: ChipCountProps) {
  const formatted = amount >= 1000
    ? `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`
    : amount.toString();

  const sizeClass = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold rounded
      bg-amber-900/30 border border-amber-600/40 text-amber-300 ${sizeClass} ${className}`}>
      <span className="text-amber-500">$</span>
      {formatted}
    </span>
  );
}
