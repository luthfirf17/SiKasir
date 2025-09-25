#!/bin/bash

echo "🚀 Starting KasirKu - Table Management System Demo"
echo "=================================================="

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🏗️  Starting services..."
echo ""

# Start backend in background
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 KasirKu Table Management System is starting!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "📋 Features Available:"
echo "   ✅ Comprehensive Table Management"
echo "   ✅ QR Code Generation for Tables"
echo "   ✅ Interactive Floor Plan View"
echo "   ✅ Table Status Management"
echo "   ✅ Reservation System"
echo "   ✅ Usage History & Analytics"
echo "   ✅ Area-based Organization"
echo ""
echo "🗂️  Table Areas Available:"
echo "   • Indoor"
echo "   • Outdoor"
echo "   • VIP"
echo "   • Smoking Area"
echo "   • Second Floor"
echo ""
echo "📊 Table Statuses:"
echo "   🟢 Available"
echo "   🔴 Occupied"
echo "   🟡 Reserved"
echo "   🔵 Cleaning"
echo "   ⚪ Out of Order"
echo ""
echo "🎯 Demo Data Included:"
echo "   • 12 Sample Tables"
echo "   • Various Statuses & Areas"
echo "   • Usage Statistics"
echo "   • Reservation Data"
echo ""
echo "To stop the servers, press Ctrl+C"
echo ""

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped!"
    exit 0
}

# Set trap for cleanup
trap cleanup INT

# Wait for processes
wait
