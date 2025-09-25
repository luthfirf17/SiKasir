#!/bin/bash
echo "🌐 Starting KasirKu Frontend..."
cd frontend
echo "📍 Current directory: $(pwd)"
echo "🔍 Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file not found"
    exit 1
fi

echo "🔄 Starting React development server..."
npm start
