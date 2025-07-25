#!/bin/bash

echo "🚀 Starting BOOM Card Fixed Version"
echo "=================================="

# Start the backend
echo "Starting backend on port 8005..."
cd /Users/administrator/ai-automation-platform/user_projects/admin/proj_20250724_140011_4d773584/imported/BOOM\ Card_20250722_085243
python3 backend_fixed_full.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start the frontend
echo "Starting frontend on port 3001..."
cd frontend
cp .env.fixed .env.local
npm run dev -- -p 3001 &
FRONTEND_PID=$!

echo ""
echo "✅ BOOM Card Fixed is running!"
echo "Frontend: http://localhost:3001"
echo "Backend: http://localhost:8005"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait