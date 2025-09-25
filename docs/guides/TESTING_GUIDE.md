# 🎉 KasirKu Development Environment - SIAP DIGUNAKAN!

## ✅ Status Setup
✅ **Backend Server**: Berjalan di http://localhost:5001  
✅ **Frontend React**: Berjalan di http://localhost:3000  
✅ **Database SQLite**: Terhubung dan sudah ada default users  
✅ **API Authentication**: Tested dan berfungsi  

## 🌐 Akses Aplikasi

### Frontend (React)
**URL**: http://localhost:3000

### Backend API
**URL**: http://localhost:5001  
**Health Check**: http://localhost:5001/health  
**Login Endpoint**: POST http://localhost:5001/api/auth/login  

## 👤 Login Credentials

Berikut adalah akun-akun yang sudah tersedia untuk testing:

### 1. Admin (Full Access)
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`
- **Email**: admin@kasirku.com

### 2. Owner (Management)
- **Username**: `owner`
- **Password**: `owner123`
- **Role**: `owner`
- **Email**: owner@kasirku.com

### 3. Kasir (POS System)
- **Username**: `kasir`
- **Password**: `kasir123`
- **Role**: `kasir`
- **Email**: kasir@kasirku.com

### 4. Kitchen (Kitchen Staff)
- **Username**: `kitchen`
- **Password**: `kitchen123`
- **Role**: `kitchen`
- **Email**: kitchen@kasirku.com

## 🧪 Cara Testing Login & Admin

### 1. Buka Frontend
Akses: http://localhost:3000

### 2. Login sebagai Admin
1. Di halaman login, pilih **Role**: "Admin"
2. Masukkan **Username**: `admin`
3. Masukkan **Password**: `admin123`
4. Klik tombol "Login"

### 3. Akses Admin Dashboard
Setelah login berhasil, Anda akan diarahkan ke admin dashboard dengan akses penuh.

## 🔧 Cara Menjalankan Ulang

Jika Anda perlu restart aplikasi:

### Start Backend
```bash
cd backend
npx ts-node src/server.ts
```

### Start Frontend (Terminal Baru)
```bash
cd frontend
npm start
```

### Atau gunakan script otomatis:
```bash
./start-all.sh
```

## 🛠️ Troubleshooting

### Jika Port Konflik:
- Backend menggunakan port 5001
- Frontend menggunakan port 3000
- Pastikan tidak ada aplikasi lain yang menggunakan port ini

### Jika Database Error:
- Database menggunakan SQLite (file `kasirku_demo.db` di folder backend)
- Untuk reset: hapus file database dan restart backend

### Jika Login Error:
- Pastikan backend berjalan di port 5001
- Check terminal backend untuk error messages
- Verify API endpoint: `curl -X GET http://localhost:5001/health`

## 📊 API Testing Manual

### Test Health Check:
```bash
curl -X GET http://localhost:5001/health
```

### Test Login API:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"admin"}'
```

## 🎯 Fitur yang Bisa Ditest

1. **Login System**: ✅ Ready
2. **Role-based Access**: ✅ Ready (Admin, Owner, Kasir, Kitchen)
3. **JWT Authentication**: ✅ Ready
4. **Admin Dashboard**: ✅ Ready untuk testing
5. **User Management**: ✅ Ready untuk testing

## 🚀 Next Steps

Sekarang Anda bisa:
1. Test fitur login dan autentikasi
2. Explore admin dashboard
3. Test different user roles
4. Develop dan customize fitur sesuai kebutuhan

**Happy Testing! 🎉**
