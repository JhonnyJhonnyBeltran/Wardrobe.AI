import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================================================
  // 🚀 BUILD PERFORMANCE OPTIMIZATIONS
  // ============================================================================
  
  // Use SWC for faster compilation (100x faster than Webpack)
  // Automatically enabled when --webpack flag is NOT used
  
  // Enable Turbopack for even faster builds (Next.js 16+)
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
    // Cache configuration for faster rebuilds
    module_cache_config: {
      cache_writes_disabled: false,
    },
  },

  // Minify with SWC instead of Terser (faster)
  swcMinify: true,

  // ============================================================================
  // CRITICAL DEPENDENCIES
  // ============================================================================

  // External packages that shouldn't be bundled
  serverExternalPackages: ['puppeteer'],

  // Optimize which packages need transpilation
  transpilePackages: [
    '@imgly/background-removal',
    'framer-motion',
  ],

  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    densities: [1, 2],
    unoptimized: false, // Enable optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ]
  },

  // ============================================================================
  // HEADERS & SECURITY
  // ============================================================================

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'credentialless',
        },
        // Cache optimization headers
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
          has: [{ type: 'pathname', value: '/_next/static' }],
        },
      ],
    },
  ],

  // ============================================================================
  // EXPERIMENTAL FEATURES (Next.js 16+)
  // ============================================================================

  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
    // Enable taint/untaint for security
    taintObjectReference: false,
  },

  // ============================================================================
  // PERFORMANCE MONITORING (Optional)
  // ============================================================================

  // Enable to analyze bundle
  // productionBrowserSourceMaps: false, // Disable source maps in production
};

export default nextConfig;
