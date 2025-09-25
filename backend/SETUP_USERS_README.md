# Setup Default Users

Script ini digunakan untuk membuat akun default pada sistem KasirKu.

## Akun Default yang Dibuat

| Username | Password  | Role      | Email                  |
|----------|-----------|-----------|------------------------|
| admin    | admin123  | ADMIN     | admin@kasirku.com     |
| owner    | owner123  | OWNER     | owner@kasirku.com     |
| kasir    | kasir123  | KASIR     | kasir@kasirku.com     |
| kitchen  | kitchen123| KITCHEN   | kitchen@kasirku.com   |

## Cara Menjalankan

### Opsi 1: Jalankan Script Langsung
```bash
cd backend
npm run setup-users
```

### Opsi 2: Jalankan dengan ts-node
```bash
cd backend
npx ts-node src/scripts/setup-default-users.ts
```

## Catatan Penting

- Script ini **HANYA membuat akun jika belum ada** di database
- Jika akun sudah ada, script akan melewatkannya
- Password di-hash menggunakan bcrypt dengan salt rounds 12
- Script ini **tidak akan dijalankan otomatis** saat server startup
- Login sekarang **bergantung sepenuhnya pada database**

## Keamanan

- Password default harus diganti setelah setup
- Gunakan password yang kuat untuk production
- Pertimbangkan untuk menghapus script ini setelah setup awal