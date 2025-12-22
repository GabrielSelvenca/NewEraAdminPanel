import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  swcMinify: true,
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
