#!/bin/bash

echo "🚀 Starting BOOM Card Original (Simplified)"
echo "=========================================="

cd frontend

# Create a simple next.config.js for original version
cat > next.config.original.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index_original',
      },
    ]
  },
}

module.exports = nextConfig
EOF

# Copy environment and config
cp .env.original .env.local
cp next.config.original.js next.config.js

echo "Starting on port 3003..."
npm run dev -- -p 3003