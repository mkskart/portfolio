import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Lower webpack's peak memory during compilation.
    webpackMemoryOptimizations: true,
    // Size the build-worker pool by available RAM instead of CPU count, so the
    // 2-core/8GB Vercel container doesn't spawn parallel workers that each
    // balloon on the 3D stack and get OOM-killed (SIGKILL).
    memoryBasedWorkersCount: true,
    // Rewrite the @react-three/drei barrel import to direct deep imports so
    // webpack doesn't pull drei's whole module graph through the bundler.
    optimizePackageImports: ["@react-three/drei"],
  },
};

export default nextConfig;
