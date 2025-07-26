/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  
  // Basic image configuration
  images: {
    unoptimized: true,
  },


  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'BOOM Card',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'
  },

  // Webpack configuration for path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
      '@components': require('path').resolve(__dirname, './src/components'),
      '@lib': require('path').resolve(__dirname, './src/lib'),
      '@hooks': require('path').resolve(__dirname, './src/hooks'),
      '@utils': require('path').resolve(__dirname, './src/utils'),
      '@styles': require('path').resolve(__dirname, './src/styles'),
      '@types': require('path').resolve(__dirname, './src/types'),
    }
    return config
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig