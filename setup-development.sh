#!/bin/bash

# KasirKu Development Setup Script - Quick Start untuk Login & Admin
# Script untuk menjalankan backend + database + frontend secara lokal

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 KasirKu Development Setup - Login & Admin Testing${NC}"
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Memeriksa prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js tidak ditemukan! Silakan install Node.js v18+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm tidak ditemukan! Silakan install npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) dan npm $(npm --version) terdeteksi${NC}"

# Create project root directory navigation
PROJECT_ROOT="$(pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Setup Backend Environment
echo -e "\n${BLUE}🔧 Setup Backend Environment...${NC}"

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}📝 Membuat file .env untuk backend...${NC}"
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    
    # Update .env untuk development lokal dengan SQLite
    cat > "$BACKEND_DIR/.env" << EOF
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (SQLite untuk development)
DB_TYPE=sqlite
DB_DATABASE=kasirku_demo.db

# JWT Configuration
JWT_SECRET=kasirku-development-secret-key-2024
JWT_REFRESH_SECRET=kasirku-development-refresh-key-2024
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# App Configuration
APP_NAME=KasirKu
APP_URL=http://localhost:3000
API_URL=http://localhost:5000

# Security
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=debug
EOF
    echo -e "${GREEN}✅ File backend/.env telah dibuat dengan konfigurasi SQLite${NC}"
else
    echo -e "${GREEN}✅ File backend/.env sudah ada${NC}"
fi

# Setup Frontend Environment
echo -e "\n${BLUE}🔧 Setup Frontend Environment...${NC}"

if [ ! -f "$FRONTEND_DIR/.env" ]; then
    echo -e "${YELLOW}📝 Membuat file .env untuk frontend...${NC}"
    cat > "$FRONTEND_DIR/.env" << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_API_BASE_URL=http://localhost:5000

# App Configuration
REACT_APP_APP_NAME=KasirKu
REACT_APP_VERSION=1.0.0

# Development
REACT_APP_ENV=development
GENERATE_SOURCEMAP=true
EOF
    echo -e "${GREEN}✅ File frontend/.env telah dibuat${NC}"
else
    echo -e "${GREEN}✅ File frontend/.env sudah ada${NC}"
fi

# Install Backend Dependencies
echo -e "\n${BLUE}📦 Install Backend Dependencies...${NC}"
cd "$BACKEND_DIR"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing backend packages...${NC}"
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies sudah ada${NC}"
fi

# Install Frontend Dependencies
echo -e "\n${BLUE}📦 Install Frontend Dependencies...${NC}"
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing frontend packages...${NC}"
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies sudah ada${NC}"
fi

# Check and setup database
echo -e "\n${BLUE}💾 Setup Database...${NC}"
cd "$BACKEND_DIR"

# Check if database file exists
if [ ! -f "kasirku_demo.db" ]; then
    echo -e "${YELLOW}📝 Database tidak ditemukan, akan dibuat otomatis saat backend start${NC}"
else
    echo -e "${GREEN}✅ Database SQLite sudah ada${NC}"
fi

# Create start scripts
echo -e "\n${BLUE}📝 Membuat start scripts...${NC}"

# Backend start script
cat > "$PROJECT_ROOT/start-backend.sh" << 'EOF'
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
EOF

# Frontend start script
cat > "$PROJECT_ROOT/start-frontend.sh" << 'EOF'
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
EOF

# Full start script
cat > "$PROJECT_ROOT/start-all.sh" << 'EOF'
#!/bin/bash

# Function to run commands in new terminal tabs (macOS)
run_in_new_tab() {
    local cmd="$1"
    local title="$2"
    
    osascript -e "
    tell application \"Terminal\"
        do script \"cd '$PROJECT_ROOT' && $cmd\"
        set custom title of front window to \"$title\"
    end tell
    "
}

echo "🚀 Starting KasirKu Full Stack Application..."
echo "This will open new terminal tabs for backend and frontend"

# Start backend in new tab
run_in_new_tab "./start-backend.sh" "KasirKu Backend"

# Wait a bit for backend to start
sleep 3

# Start frontend in new tab  
run_in_new_tab "./start-frontend.sh" "KasirKu Frontend"

echo ""
echo "🎉 Applications starting in separate terminal tabs!"
echo "📋 Access Points:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔌 Backend:  http://localhost:5000"
echo "   📊 Health:   http://localhost:5000/health"
echo ""
echo "📝 Default Admin Login (akan dibuat otomatis):"
echo "   Email: admin@kasirku.com"
echo "   Password: admin123"
EOF

# Make scripts executable
chmod +x "$PROJECT_ROOT/start-backend.sh"
chmod +x "$PROJECT_ROOT/start-frontend.sh"
chmod +x "$PROJECT_ROOT/start-all.sh"

echo -e "${GREEN}✅ Start scripts telah dibuat${NC}"

# Create admin seeder if not exists
echo -e "\n${BLUE}👤 Setup Default Admin User...${NC}"

cat > "$BACKEND_DIR/create-admin.js" << 'EOF'
// Simple script to create default admin user
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'kasirku_demo.db');
const db = new sqlite3.Database(dbPath);

async function createAdminUser() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create users table if not exists
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            isActive BOOLEAN DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Insert admin user
    db.run(`
        INSERT OR REPLACE INTO users (id, email, password, name, role, isActive)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        'admin-001',
        'admin@kasirku.com',
        hashedPassword,
        'Admin KasirKu',
        'admin',
        1
    ], function(err) {
        if (err) {
            console.error('Error creating admin user:', err);
        } else {
            console.log('✅ Default admin user created successfully!');
            console.log('📧 Email: admin@kasirku.com');
            console.log('🔑 Password: admin123');
        }
        db.close();
    });
}

createAdminUser();
EOF

# Show final instructions
echo -e "\n${GREEN}🎉 Setup Development Environment Selesai!${NC}"
echo -e "\n${BLUE}📋 Cara Menjalankan:${NC}"
echo -e "\n${YELLOW}Opsi 1 - Otomatis (Recommended):${NC}"
echo -e "   ${BLUE}./start-all.sh${NC}"
echo -e "   (Akan membuka backend dan frontend di terminal tab terpisah)"

echo -e "\n${YELLOW}Opsi 2 - Manual:${NC}"
echo -e "   Terminal 1: ${BLUE}./start-backend.sh${NC}"
echo -e "   Terminal 2: ${BLUE}./start-frontend.sh${NC}"

echo -e "\n${YELLOW}Opsi 3 - Step by Step:${NC}"
echo -e "   1. ${BLUE}cd backend && npm run dev${NC}"
echo -e "   2. ${BLUE}cd frontend && npm start${NC} (di terminal baru)"

echo -e "\n${BLUE}🔗 URL Akses:${NC}"
echo -e "   🌐 Frontend (React): ${BLUE}http://localhost:3000${NC}"
echo -e "   🔌 Backend API: ${BLUE}http://localhost:5000${NC}"
echo -e "   📊 Health Check: ${BLUE}http://localhost:5000/health${NC}"

echo -e "\n${BLUE}👤 Default Login Admin:${NC}"
echo -e "   📧 Email: ${YELLOW}admin@kasirku.com${NC}"
echo -e "   🔑 Password: ${YELLOW}admin123${NC}"

echo -e "\n${BLUE}🛠️  Troubleshooting:${NC}"
echo -e "   📝 Backend logs: Lihat terminal backend"
echo -e "   🌐 Frontend logs: Lihat terminal frontend"
echo -e "   💾 Database: SQLite file 'kasirku_demo.db' di folder backend"
echo -e "   🔄 Reset database: Hapus file 'kasirku_demo.db' dan restart backend"

echo -e "\n${GREEN}✨ Siap untuk testing Login dan Admin panel!${NC}"
