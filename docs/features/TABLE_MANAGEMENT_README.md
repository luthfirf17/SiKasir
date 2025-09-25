# 🍽️ Sistem Manajemen Meja - Restaurant Table Management System

## 📋 Overview

Sistem manajemen meja yang komprehensif untuk restoran dengan fitur-fitur canggih untuk mengoptimalkan operasional dan meningkatkan pengalaman pelanggan.

## 🌟 Fitur Utama

### 1. **Manajemen Meja Lengkap**
- ✅ Tambah/Edit/Hapus meja
- ✅ Atur kapasitas dan lokasi
- ✅ Status real-time (Tersedia/Terisi/Dibersihkan/Reservasi/Rusak)
- ✅ QR Code otomatis untuk setiap meja
- ✅ Posisi meja dengan koordinat X,Y

### 2. **Sistem Reservasi Khusus**
- 🎯 Status "Meja Dipesan" untuk reservasi
- 📅 Input waktu reservasi (dari-sampai)
- 👤 Data pelanggan (nama, telepon, jumlah tamu)
- 🔒 Proteksi meja dari walk-in customer
- ⏰ Notifikasi otomatis expired reservation

### 3. **Manajemen Area/Bagian**
- 🏢 **Indoor Dining** - Area utama ber-AC
- 🌿 **Outdoor Terrace** - Teras dengan pemandangan taman
- 👑 **VIP Section** - Area eksklusif dengan layanan premium
- 🚬 **Smoking Area** - Area khusus merokok dengan ventilasi
- 🚭 **Non-Smoking Zone** - Area bebas asap untuk keluarga
- 🏢 **Second Floor** - Lantai 2 dengan pemandangan kota
- 🌅 **Rooftop Terrace** - Atap dengan pemandangan panorama

### 4. **Riwayat dan Analytics**
- 📊 **Usage History** - Riwayat penggunaan setiap meja
- ⏱️ **Duration Tracking** - Durasi penggunaan pelanggan
- 💰 **Revenue Tracking** - Total pesanan dan pembayaran per meja
- 📈 **Analytics Dashboard** - Meja paling/kurang populer
- 🎯 **Utilization Rate** - Tingkat pemanfaatan meja
- 📋 **Performance Reports** - Laporan performa operasional

### 5. **QR Code Integration**
- 📱 QR Code unik untuk setiap meja
- 🔗 Link langsung ke menu digital
- 📊 Tracking scan count
- 🖨️ Print dan download QR code
- 📱 Mobile-friendly ordering

## 🏗️ Arsitektur Sistem

### **Backend Components**

#### Models
```typescript
// Table Model - Core table entity
Table {
  table_id, table_number, capacity, status, area,
  position_x, position_y, reservation_info,
  usage_statistics, maintenance_info
}

// Table Usage History - Detailed usage tracking
TableUsageHistory {
  usage_id, table_id, customer_info,
  start_time, end_time, duration,
  order_amount, payment_amount, usage_type
}
```

#### Controllers
- **TableController** - CRUD operations, status management
- **QRCodeController** - QR code generation and tracking
- **AnalyticsController** - Usage statistics and reports

#### Routes
```
GET    /api/tables                    - List all tables
POST   /api/tables                    - Create new table
GET    /api/tables/:id                - Get table details
PUT    /api/tables/:id                - Update table
DELETE /api/tables/:id                - Delete table
PATCH  /api/tables/:id/status         - Update table status
GET    /api/tables/:id/qr-code        - Get QR code
GET    /api/tables/:id/usage-history  - Get usage history
GET    /api/tables/stats              - Get statistics
GET    /api/tables/dashboard          - Dashboard data
```

### **Frontend Components**

#### Main Pages
- **TablesPage** - Main table management interface
- **FloorPlanView** - Interactive floor plan
- **AreaManagement** - Area configuration

#### Dialogs & Modals
- **TableFormDialog** - Add/edit table form
- **StatusUpdateDialog** - Update table status
- **QRCodeDialog** - Display and manage QR codes
- **TableHistoryDialog** - Usage history and analytics
- **ReservationDialog** - Reservation management

#### Services
- **TableService** - API communication
- **AnalyticsService** - Data processing
- **QRCodeService** - QR code operations

## 🎯 Use Cases

### **Untuk Staff Restaurant**

1. **Host/Hostess**
   - Melihat real-time status semua meja
   - Mengatur reservasi dan walk-in
   - Mengelola waiting list

2. **Waiter/Waitress**
   - Update status meja saat customer datang/pergi
   - Melihat informasi customer dan pesanan
   - Koordinasi dengan kitchen untuk service

3. **Manager**
   - Analytics dan laporan performa
   - Optimasi layout dan kapasitas
   - Tracking revenue per area

4. **Admin**
   - Konfigurasi meja dan area
   - Maintenance scheduling
   - System configuration

### **Untuk Customer**
1. **QR Code Scanning**
   - Scan QR code di meja untuk akses menu
   - Order langsung dari smartphone
   - Panggil waiter untuk bantuan

2. **Reservation System**
   - Book meja via website/app
   - Konfirmasi otomatis via SMS/email
   - Check-in digital saat tiba

## 📊 Analytics & Reports

### **Table Performance Metrics**
- **Utilization Rate** - Persentase waktu meja terpakai
- **Average Turn Time** - Rata-rata durasi per customer
- **Revenue per Table** - Pendapatan per meja
- **Peak Hours Analysis** - Analisis jam sibuk

### **Area Performance**
- **Most Popular Area** - Area paling diminati
- **Revenue by Area** - Pendapatan per area
- **Capacity Utilization** - Pemanfaatan kapasitas
- **Customer Preferences** - Preferensi pelanggan

### **Operational Insights**
- **Wait Time Analysis** - Analisis waktu tunggu
- **Staff Efficiency** - Efisiensi pelayanan
- **Customer Satisfaction** - Tingkat kepuasan
- **Revenue Optimization** - Optimasi pendapatan

## 🔧 Technical Features

### **Real-time Updates**
- WebSocket connections untuk status real-time
- Automatic refresh setiap 30 detik
- Push notifications untuk staff

### **Mobile Responsive**
- Touch-friendly interface
- Swipe gestures untuk navigasi
- Optimized untuk tablet dan smartphone

### **Accessibility**
- Keyboard navigation
- Screen reader compatible
- High contrast mode
- Multiple language support

### **Performance**
- Lazy loading untuk large datasets
- Optimized database queries
- Caching untuk frequently accessed data
- Progressive Web App (PWA) support

## 🚀 Installation & Setup

### Prerequisites
```bash
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, untuk caching)
```

### Backend Setup
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/kasir_db
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379

# Frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
```

## 🎨 UI/UX Highlights

### **Dashboard Overview**
- 📊 Real-time statistics cards
- 🎯 Quick action buttons
- 📈 Visual charts and graphs
- 🔔 Important notifications

### **Table Management**
- 🎛️ **Grid View** - Card-based table display
- 📋 **List View** - Tabular data view
- 🗺️ **Floor Plan** - Interactive visual layout
- 🎨 **Color Coding** - Status-based visual indicators

### **Advanced Features**
- 🔍 **Smart Search** - Multi-criteria filtering
- 📱 **QR Code Management** - Easy generation and tracking
- 📊 **Analytics Dashboard** - Comprehensive insights
- 🎯 **Drag & Drop** - Intuitive table positioning

## 🔮 Future Enhancements

### **Phase 2 Features**
- 🤖 **AI-Powered Optimization** - Otomatis optimal table assignment
- 📱 **Mobile App** - Dedicated mobile application
- 🔔 **Push Notifications** - Real-time alerts
- 💳 **Payment Integration** - Direct payment dari QR code

### **Phase 3 Features**
- 🌐 **Multi-Branch Support** - Support multiple restaurant locations
- 📊 **Advanced Analytics** - Machine learning insights
- 🎵 **Ambiance Control** - Music and lighting control
- 🍽️ **Smart Ordering** - AI-powered menu recommendations

## 🤝 Contributing

Sistem ini dibangun dengan arsitektur modular dan dapat dengan mudah dikembangkan. Kontribusi dalam bentuk:

- 🐛 Bug reports dan fixes
- ✨ Feature requests dan implementations
- 📚 Documentation improvements
- 🎨 UI/UX enhancements

## 📄 License

MIT License - Feel free to use and modify for your restaurant needs!

---

**Built with ❤️ for restaurant industry**

*Sistem Manajemen Meja yang Modern, Efisien, dan User-Friendly*
