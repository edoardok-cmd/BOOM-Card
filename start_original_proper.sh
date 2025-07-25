#!/bin/bash

echo "🚀 Starting BOOM Card Original (Full Application)"
echo "=============================================="

cd frontend

# Backup current index.js
cp src/pages/index.js src/pages/index_static_backup.js

# Use the proper homepage
cp src/pages/index_proper.js src/pages/index.js

# Copy environment
cp .env.original .env.local

echo "Starting full BOOM Card application on port 3003..."
npm run dev -- -p 3003