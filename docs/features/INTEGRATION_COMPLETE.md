# KasirKu - Integrasi Frontend, Backend, dan Database

## ✅ Status Integrasi

Sistem KasirKu telah berhasil mengintegrasikan:
- **Frontend**: React TypeScript dengan Material-UI (Port 3002)
- **Backend**: Node.js Express dengan TypeORM (Port 5001)  
- **Database**: SQLite untuk autentikasi user

## 🚀 Cara Menjalankan Sistem

### 1. Menjalankan Backend
```bash
cd backend
npm install
npx ts-node src/server.ts
```

### 2. Menjalankan Frontend
```bash
cd frontend
npm install
PORT=3002 npm start
```

### 3. Akses Aplikasi
- Frontend: http://localhost:3002
- Backend API: http://localhost:5001
- Health Check: http://localhost:5001/health

## 🔐 Sistem Autentikasi

### User Default yang Tersedia:
1. **Admin**
   - Username: `admin`
   - Password: `admin123`
   - Role: Administrator dengan akses penuh

2. **Owner**
   - Username: `owner`
   - Password: `owner123`
   - Role: Pemilik dengan akses manajemen

3. **Kasir**
   - Username: `kasir`
   - Password: `kasir123`
   - Role: Kasir dengan akses POS

4. **Kitchen**
   - Username: `kitchen`
   - Password: `kitchen123`
   - Role: Dapur dengan akses pesanan

### Fitur Login:
- ✅ Hash password dengan bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Database SQLite terintegrasi
- ✅ Auto-redirect setelah login
- ✅ Error handling

## 📂 Struktur Database

### Tabel Users:
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  role TEXT DEFAULT 'customer',
  status TEXT DEFAULT 'pending',
  phone VARCHAR,
  address TEXT,
  avatar VARCHAR,
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  password_reset_token VARCHAR,
  password_reset_expires DATETIME,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);
```

## 🔧 API Endpoints

### Authentication:
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Request Login:
```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}
```

### Response Login:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@kasirku.com",
      "fullName": "Administrator",
      "role": "admin",
      "status": "active"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  },
  "message": "Login berhasil sebagai Administrator"
}
```

## 🎯 Fitur Yang Sudah Implementasi

### Frontend:
- ✅ Login page dengan Material-UI
- ✅ Role selection dropdown
- ✅ Form validation dengan Formik & Yup
- ✅ Redux state management
- ✅ Auto-redirect after login
- ✅ Error handling & loading states
- ✅ Responsive design

### Backend:
- ✅ Express server dengan TypeORM
- ✅ SQLite database integration
- ✅ Password hashing dengan bcrypt
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling
- ✅ Auto-create default users

### Database:
- ✅ SQLite dengan TypeORM
- ✅ User entity dengan relations
- ✅ Auto-migration
- ✅ UUID primary keys
- ✅ Indexed columns
- ✅ Timestamps

## 🧪 Testing

### Manual Testing:
1. Buka http://localhost:3002
2. Pilih role (Admin/Owner/Kasir/Kitchen)
3. Masukkan credentials sesuai role
4. Click "Sign In"
5. Verifikasi redirect ke dashboard

### API Testing:
```bash
# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test health check
curl http://localhost:5001/health
```

## 📝 Next Steps

### Rencana Pengembangan:
1. Implementasi dashboard untuk setiap role
2. Menu management system
3. Order management
4. Payment integration
5. Inventory management
6. Reports & analytics

### Database Expansion:
- Tables: Menu, Orders, Payments, Inventory
- Relations antar entities
- Foreign key constraints
- Advanced queries

## ⚠️ Important Notes

1. **Database File**: `kasirku_auth.db` dibuat otomatis
2. **Password Security**: Menggunakan bcrypt dengan salt rounds 10
3. **JWT Secret**: Default untuk development, gunakan env variable untuk production
4. **CORS**: Dikonfigurasi untuk ports 3000, 3001, 3002
5. **Auto-Migration**: Database schema dibuat otomatis

## 🔍 Troubleshooting

### Port Conflicts:
```bash
# Kill process on port
lsof -ti:5001 | xargs kill -9

# Use different port for frontend
PORT=3002 npm start
```

### Database Issues:
```bash
# Reset database
rm kasirku_auth.db
# Restart server to recreate
```

### Backend Connection:
- Pastikan backend running di port 5001
- Check CORS configuration
- Verify API endpoints

Sistem KasirKu sekarang siap digunakan dengan autentikasi database yang lengkap! 🎉
