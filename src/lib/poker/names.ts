export interface BotIdentity {
  name: string;
  color: string;
}

// 7 unique bots with distinct avatar accent colors.
export const BOT_IDENTITIES: BotIdentity[] = [
  { name: "Johnny Mesa", color: "#e0723f" },
  { name: "Aces Delgado", color: "#d94f6e" },
  { name: "River Kate", color: "#4f8fd9" },
  { name: "Slowroll Sam", color: "#7c5cd9" },
  { name: "Tilt Vega", color: "#d9b94f" },
  { name: "Cooler Cruz", color: "#3fb6a8" },
  { name: "Nina Stacks", color: "#9bd94f" },
];

export const HUMAN_COLOR = "#c9a84c";
export const HUMAN_NAME = "You";
