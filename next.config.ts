import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
    memoryBasedWorkersCount: true,
    optimizePackageImports: ["@react-three/drei", "framer-motion", "recharts"],
  },
};

export default nextConfig;
