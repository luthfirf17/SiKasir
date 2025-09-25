#!/bin/bash

echo "🔥 Starting backend and frontend servers..."

# Kill any existing servers
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process on port 3001"
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "No process on port 3002"

echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "⏳ Waiting for backend to start..."
sleep 10

echo "🚀 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo "⏳ Waiting for frontend to start..."
sleep 10

echo "🧪 Testing login API..."
echo "Backend Health Check:"
curl -s http://localhost:3001/health | head -c 200

echo -e "\n\nLogin API Test:"
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin", 
    "password": "admin123",
    "role": "admin"
  }' -s | head -c 500

echo -e "\n\n✅ Both servers are running:"
echo "🔗 Backend: http://localhost:3001"
echo "🔗 Frontend: http://localhost:3002"
echo "🔧 To stop servers: kill $BACKEND_PID $FRONTEND_PID"
