import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Cloudflare Pages compatibility
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, net: false, tls: false, fs: false };
    return config;
  },
};

export default nextConfig;
