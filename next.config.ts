import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer'],
  // Ensure puppeteer is not bundled by Webpack either
  webpack: (config) => {
    config.externals.push('puppeteer');
    return config;
  },
};

export default nextConfig;
