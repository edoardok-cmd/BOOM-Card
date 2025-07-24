/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  poweredByHeader: false,
  
  // Basic image configuration - use unoptimized for static export
  images: {
    unoptimized: true,
    domains: ['localhost', 'api.boomcard.com', 'boom-card.onrender.com'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'BOOM Card',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://boom-card.onrender.com/api'
  },

  // Completely disable TypeScript checking
  typescript: {
    ignoreBuildErrors: true,
    ignoreDevErrors: true,
  },

  // ESLint configuration - ignore during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Simple webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig