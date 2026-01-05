import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer'],
  // Ensure puppeteer is not bundled by Webpack either
  webpack: (config) => {
    config.externals.push('puppeteer');
    
    // Support for WebAssembly (needed for @imgly/background-removal)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    // Fix for .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    
    return config;
  },
};

export default nextConfig;
