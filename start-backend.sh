#!/bin/bash
echo "🚀 Starting KasirKu Backend Server..."
cd backend
echo "📍 Current directory: $(pwd)"
echo "🔍 Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file not found"
    exit 1
fi

echo "🔄 Starting development server..."
npm run dev
