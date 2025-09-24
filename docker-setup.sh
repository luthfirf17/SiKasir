#!/bin/bash

# KasirKu Docker Setup Script
# Script otomatis untuk setup Docker environment

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐳 KasirKu Docker Setup Script${NC}"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker is installed
if ! command_exists docker; then
    echo -e "${RED}❌ Docker tidak ditemukan!${NC}"
    echo -e "${YELLOW}📥 Silakan install Docker Desktop terlebih dahulu:${NC}"
    echo "   macOS: https://www.docker.com/products/docker-desktop/"
    echo "   atau gunakan Homebrew: brew install --cask docker"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker tidak berjalan!${NC}"
    echo -e "${YELLOW}🚀 Silakan jalankan Docker Desktop terlebih dahulu${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker terdeteksi dan berjalan${NC}"

# Check Docker Compose
if ! command_exists docker-compose; then
    echo -e "${YELLOW}⚠️  docker-compose tidak ditemukan, menggunakan 'docker compose'${NC}"
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Setup backend environment if not exists
if [ ! -f backend/.env ]; then
    echo -e "${BLUE}📝 Membuat file environment untuk backend...${NC}"
    cp backend/.env.example backend/.env
    
    # Update .env untuk Docker
    sed -i '' 's/DB_HOST=localhost/DB_HOST=postgres/' backend/.env
    sed -i '' 's/REDIS_HOST=localhost/REDIS_HOST=redis/' backend/.env
    
    echo -e "${GREEN}✅ File backend/.env telah dibuat dan dikonfigurasi untuk Docker${NC}"
else
    echo -e "${GREEN}✅ File backend/.env sudah ada${NC}"
fi

# Setup frontend environment if not exists
if [ ! -f frontend/.env ]; then
    echo -e "${BLUE}📝 Membuat file environment untuk frontend...${NC}"
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_APP_NAME=KasirKu
REACT_APP_VERSION=1.0.0
EOF
    echo -e "${GREEN}✅ File frontend/.env telah dibuat${NC}"
else
    echo -e "${GREEN}✅ File frontend/.env sudah ada${NC}"
fi

# Check if ports are available
echo -e "${BLUE}🔍 Memeriksa ketersediaan port...${NC}"

check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $port ($service) sedang digunakan${NC}"
        echo "   Proses yang menggunakan port:"
        lsof -Pi :$port -sTCP:LISTEN
        echo -e "${YELLOW}   Hentikan proses tersebut atau gunakan port lain${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port ($service) tersedia${NC}"
        return 0
    fi
}

PORT_ISSUES=0
check_port 3000 "Frontend" || PORT_ISSUES=$((PORT_ISSUES+1))
check_port 5000 "Backend" || PORT_ISSUES=$((PORT_ISSUES+1))
check_port 5432 "PostgreSQL" || PORT_ISSUES=$((PORT_ISSUES+1))
check_port 6379 "Redis" || PORT_ISSUES=$((PORT_ISSUES+1))

if [ $PORT_ISSUES -gt 0 ]; then
    echo -e "${RED}❌ Ada $PORT_ISSUES port yang konflik${NC}"
    echo -e "${YELLOW}💡 Hentikan aplikasi yang menggunakan port tersebut atau edit docker-compose.yml${NC}"
    read -p "Lanjutkan setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Menu pilihan setup
echo -e "\n${BLUE}🎯 Pilih mode setup:${NC}"
echo "1. Full Setup (Frontend + Backend + Database + Redis)"
echo "2. Backend Only (Backend + Database + Redis)"
echo "3. Database Only (PostgreSQL + Redis)"
echo "4. Development Mode (Database di Docker, Backend di local)"

read -p "Pilihan (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Menjalankan Full Setup...${NC}"
        $DOCKER_COMPOSE up -d
        ;;
    2)
        echo -e "${BLUE}🚀 Menjalankan Backend Setup...${NC}"
        $DOCKER_COMPOSE up -d postgres redis backend
        ;;
    3)
        echo -e "${BLUE}🚀 Menjalankan Database Setup...${NC}"
        $DOCKER_COMPOSE up -d postgres redis
        ;;
    4)
        echo -e "${BLUE}🚀 Menjalankan Development Mode...${NC}"
        $DOCKER_COMPOSE up -d postgres redis
        echo -e "${YELLOW}📝 Untuk menjalankan backend di local:${NC}"
        echo "   cd backend"
        echo "   npm install"
        echo "   npm run dev"
        ;;
    *)
        echo -e "${RED}❌ Pilihan tidak valid${NC}"
        exit 1
        ;;
esac

# Wait for services to start
echo -e "${BLUE}⏳ Menunggu services siap...${NC}"
sleep 10

# Check service status
echo -e "\n${BLUE}📊 Status Services:${NC}"
$DOCKER_COMPOSE ps

# Show useful information
echo -e "\n${GREEN}🎉 Setup Docker selesai!${NC}"
echo -e "\n${BLUE}📋 Informasi Akses:${NC}"

if [ "$choice" == "1" ]; then
    echo -e "🌐 Frontend: ${BLUE}http://localhost:3000${NC}"
fi

if [ "$choice" == "1" ] || [ "$choice" == "2" ]; then
    echo -e "🔌 Backend API: ${BLUE}http://localhost:5000${NC}"
fi

echo -e "🐘 PostgreSQL: ${BLUE}localhost:5432${NC}"
echo -e "🔴 Redis: ${BLUE}localhost:6379${NC}"

echo -e "\n${BLUE}🛠️  Perintah Berguna:${NC}"
echo -e "📊 Lihat status: ${YELLOW}$DOCKER_COMPOSE ps${NC}"
echo -e "📝 Lihat logs: ${YELLOW}$DOCKER_COMPOSE logs -f${NC}"
echo -e "🛑 Stop services: ${YELLOW}$DOCKER_COMPOSE down${NC}"
echo -e "🔄 Restart: ${YELLOW}$DOCKER_COMPOSE restart${NC}"

# Database connection test
if [ "$choice" != "4" ]; then
    echo -e "\n${BLUE}🔍 Testing database connection...${NC}"
    sleep 5
    if docker exec kasirku-postgres pg_isready -U kasirku_user >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Database masih starting up, tunggu beberapa detik${NC}"
    fi
fi

# Show logs for the first minute
echo -e "\n${BLUE}📝 Menampilkan logs (Ctrl+C untuk stop):${NC}"
$DOCKER_COMPOSE logs -f --tail=50
