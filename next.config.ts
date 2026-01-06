import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  }
];

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
  
  // Security Headers
  async headers() {
    return [
      {
        // Aplicar a todas as rotas
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
