#!/bin/bash

echo "🚀 Starting BOOM Card Fixed Version (Full Application)"
echo "=================================================="

cd frontend

# Use the proper homepage for fixed version too
cp src/pages/index_proper.js src/pages/index.js

# Copy environment
cp .env.fixed .env.local

echo "Starting fixed BOOM Card application on port 3001..."
npm run dev -- -p 3001