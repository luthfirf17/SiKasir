#!/bin/bash

# KasirKu Development Start Script
echo "🚀 Starting KasirKu Development Servers..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  Port $port is already in use"
        return 1
    fi
    return 0
}

# Check ports
check_port 5000 || echo "Backend port 5000 is busy"
check_port 3000 || echo "Frontend port 3000 is busy"

# Start backend in background
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers are starting..."
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "🔑 Demo Login Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
