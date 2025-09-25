#!/bin/bash

# KasirKu Development Setup Script
echo "🚀 Setting up KasirKu Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not found. Please make sure PostgreSQL is installed and running."
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis is not found. Please make sure Redis is installed and running."
fi

echo "📦 Installing Backend Dependencies..."
cd backend
npm install

echo "🔧 Setting up Backend Environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update the .env file with your database and Redis configuration."
fi

echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install

echo "✅ Setup completed!"
echo ""
echo "🎯 Next Steps:"
echo "1. Update backend/.env with your database configuration"
echo "2. Make sure PostgreSQL and Redis are running"
echo "3. Run 'npm run dev' in the backend directory"
echo "4. Run 'npm start' in the frontend directory"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
