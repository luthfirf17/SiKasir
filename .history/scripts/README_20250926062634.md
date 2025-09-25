# 🔧 Scripts Kasir-Modern

Koleksi script untuk setup, development, testing, dan deployment sistem Kasir-Modern.

## 📁 Struktur Scripts

```
scripts/
├── quick-start.sh          # Quick start untuk development
├── setup/                  # Script setup dan instalasi
│   ├── setup.sh           # Setup dasar sistem
│   ├── setup-database.sh  # Setup database PostgreSQL
│   ├── setup-development.sh # Setup environment development
│   └── SYSTEM_READY.sh    # Verifikasi sistem siap
├── start/                  # Script untuk menjalankan aplikasi
│   ├── start-all.sh       # Start frontend & backend
│   ├── start-backend.sh   # Start backend only
│   ├── start-both.sh      # Start both services
│   ├── start-dev.sh       # Start development mode
│   ├── start-frontend.sh  # Start frontend only
│   └── start-table-management-demo.sh # Demo table management
├── test/                   # Script testing dan validasi
│   ├── test-menu-integration.sh # Test integrasi menu
│   └── test-menu-management.sh  # Test manajemen menu
└── docker/                 # Script Docker
    └── docker-setup.sh     # Setup environment Docker
```

## 🚀 Quick Start

Untuk memulai development dengan cepat:

```bash
# Dari root directory project
./scripts/quick-start.sh
```

## 🔧 Setup Scripts

### Setup Lengkap Sistem
```bash
# Setup dasar
./scripts/setup/setup.sh

# Setup database
./scripts/setup/setup-database.sh

# Setup environment development
./scripts/setup/setup-development.sh

# Verifikasi sistem
./scripts/setup/SYSTEM_READY.sh
```

## ▶️ Start Scripts

### Development Mode
```bash
# Start semua services (frontend + backend)
./scripts/start/start-all.sh

# Start dalam mode development
./scripts/start/start-dev.sh

# Start individual services
./scripts/start/start-frontend.sh
./scripts/start/start-backend.sh
```

### Production/Testing
```bash
# Start untuk testing
./scripts/start/start-both.sh

# Demo table management
./scripts/start/start-table-management-demo.sh
```

## 🧪 Test Scripts

```bash
# Test integrasi menu
./scripts/test/test-menu-integration.sh

# Test manajemen menu
./scripts/test/test-menu-management.sh
```

## 🐳 Docker Scripts

```bash
# Setup Docker environment
./scripts/docker/docker-setup.sh
```

## 📋 Prerequisites

Pastikan sistem memiliki:
- Node.js (v16+)
- npm atau yarn
- PostgreSQL (v13+)
- Docker & Docker Compose (untuk containerized deployment)

## 🔄 Workflow Development

1. **Setup**: Jalankan script setup untuk environment
2. **Development**: Gunakan `start-dev.sh` untuk development
3. **Testing**: Jalankan test scripts untuk validasi
4. **Production**: Gunakan Docker scripts untuk deployment

## 📞 Troubleshooting

Jika ada masalah dengan script:
1. Pastikan script memiliki permission execute: `chmod +x script.sh`
2. Cek log output untuk error messages
3. Pastikan semua prerequisites terinstall
4. Jalankan `./scripts/setup/SYSTEM_READY.sh` untuk diagnosis

## 📝 Notes

- Semua script menggunakan absolute path untuk reliability
- Script akan menampilkan progress dan status
- Error handling sudah diimplementasikan di setiap script
- Backup otomatis dibuat sebelum perubahan kritikal

---

*Terakhir diupdate: September 2025*