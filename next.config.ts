import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts']
  },
  // Garantir que arquivos estáticos sejam copiados corretamente
  outputFileTracingRoot: undefined,
};

export default nextConfig;
