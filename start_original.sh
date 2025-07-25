#!/bin/bash

echo "🚀 Starting BOOM Card Original Version"
echo "=================================="

# Start the backend
echo "Starting backend on port 8004..."
cd /Users/administrator/ai-automation-platform/user_projects/admin/proj_20250724_140011_4d773584/imported/BOOM\ Card_20250722_085243
python3 backend_original_simple.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start the frontend
echo "Starting frontend on port 3003..."
cd frontend
cp .env.original .env.local
npm run dev -- -p 3003 &
FRONTEND_PID=$!

echo ""
echo "✅ BOOM Card Original is running!"
echo "Frontend: http://localhost:3003"
echo "Backend: http://localhost:8004"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait