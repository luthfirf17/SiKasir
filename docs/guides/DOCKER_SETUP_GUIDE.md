# 🐳 Docker Setup Guide untuk KasirKu

## 1. Install Docker Desktop

### macOS:
1. Download Docker Desktop dari: https://www.docker.com/products/docker-desktop/
2. Install aplikasi Docker Desktop
3. Jalankan Docker Desktop dan tunggu hingga status "Docker is running"
4. Verifikasi instalasi:
   ```bash
   docker --version
   docker-compose --version
   ```

### Alternatif menggunakan Homebrew:
```bash
brew install --cask docker
```

## 2. Setup Environment untuk Docker

Buat file `.env` di folder backend jika belum ada:
```bash
cd backend
cp .env.example .env
```

Edit file `.env` dengan konfigurasi Docker:
```env
# Database Configuration untuk Docker
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=kasirku_user
DB_PASSWORD=kasirku_password
DB_DATABASE=kasirku_db

# Redis Configuration untuk Docker
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=kasirku-super-secret-jwt-key-2024
JWT_REFRESH_SECRET=kasirku-super-secret-refresh-key-2024
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# App Configuration
NODE_ENV=production
PORT=5000
APP_NAME=KasirKu
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
```

## 3. Docker Commands untuk KasirKu

### 🚀 Quick Start (Jalankan semua services):
```bash
# Build dan jalankan semua container
docker-compose up -d

# Lihat status container
docker-compose ps

# Lihat logs
docker-compose logs -f
```

### 🔧 Development Commands:

#### Jalankan hanya database services:
```bash
# Hanya PostgreSQL dan Redis
docker-compose up -d postgres redis
```

#### Rebuild dan restart:
```bash
# Rebuild semua container
docker-compose up -d --build

# Rebuild hanya backend
docker-compose up -d --build backend
```

#### Stop dan cleanup:
```bash
# Stop semua container
docker-compose down

# Stop dan hapus volumes (HATI-HATI: data akan hilang)
docker-compose down -v

# Hapus images
docker-compose down --rmi all
```

### 📊 Monitoring Commands:

```bash
# Lihat resource usage
docker stats

# Masuk ke container backend
docker exec -it kasirku-backend sh

# Masuk ke database PostgreSQL
docker exec -it kasirku-postgres psql -U kasirku_user -d kasirku_db

# Lihat logs specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

## 4. Port Mapping

Setelah Docker berjalan, aplikasi akan tersedia di:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Nginx (jika diaktifkan)**: http://localhost:80

## 5. Troubleshooting

### Port sudah digunakan:
```bash
# Cek port yang digunakan
lsof -i :5000
lsof -i :3000
lsof -i :5432

# Kill process jika perlu
kill -9 <PID>
```

### Reset database:
```bash
# Stop container
docker-compose down

# Hapus volume database
docker volume rm kasir-modern_postgres_data

# Restart
docker-compose up -d
```

### Rebuild dari scratch:
```bash
# Stop semua
docker-compose down

# Hapus semua images dan volumes
docker system prune -a
docker volume prune

# Build ulang
docker-compose up -d --build
```

## 6. Development Workflow

### Untuk development backend:
```bash
# Option 1: Jalankan backend di local, database di Docker
docker-compose up -d postgres redis
cd backend
npm install
npm run dev

# Option 2: Semua di Docker dengan hot reload
docker-compose up -d
# Edit code, container akan restart otomatis
```

### Database migrations:
```bash
# Jalankan migration
docker exec -it kasirku-backend npm run migration:run

# Atau dari local jika backend tidak di Docker
npm run migration:run
```

## 7. Production Deployment

```bash
# Build untuk production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Atau dengan custom environment
docker-compose --env-file .env.production up -d
```

## 8. Backup & Restore

### Backup database:
```bash
docker exec kasirku-postgres pg_dump -U kasirku_user kasirku_db > backup.sql
```

### Restore database:
```bash
docker exec -i kasirku-postgres psql -U kasirku_user kasirku_db < backup.sql
```
