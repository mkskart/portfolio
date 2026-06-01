import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
    memoryBasedWorkersCount: true,
    optimizePackageImports: ["@react-three/drei", "framer-motion", "recharts"],
  },
  webpack(config) {
    // Skip minification to cut peak build memory — the site runs identically,
    // JS output is just uncompressed (acceptable for a portfolio).
    config.optimization.minimize = false;
    return config;
  },
};

export default nextConfig;
