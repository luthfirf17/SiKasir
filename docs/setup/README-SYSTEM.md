# Aplikasi Kasir Modern - Dokumentasi Lengkap

## Deskripsi Sistem
Sistem Point of Sale (POS) modern untuk restoran/kafe mewah dengan arsitektur microservices, menggunakan React.js + TypeScript di frontend dan Node.js + Express + PostgreSQL di backend.

## Aktor dan Alur Penggunaan

### 1. ADMIN
**Fitur:**
- User Management (CRUD users, role assignment)
- Menu Management (CRUD menu items, categories, pricing)
- Table Management (floor plan, table status, reservations)
- System Configuration (payment methods, tax settings, printer config)
- Real-time dashboard dengan analytics

**Akses:** `/dashboard`, `/users`, `/menu`, `/tables`, `/system`

### 2. WAITERS
**Alur Penggunaan:**
1. Login ke tablet waiter
2. Lihat floor plan restoran dengan status meja real-time
3. Terima notifikasi panggilan customer dari meja
4. Input pesanan customer (manual atau dari tablet meja)
5. Kirim pesanan ke kitchen dan kasir (otomatis)
6. Terima notifikasi ketika pesanan siap diantar
7. Update status pesanan menjadi "terantar"
8. Bantu customer untuk pembayaran di meja (QRIS)
9. Lihat history pesanan dan performa personal

**Fitur Khusus:**
- Visual floor plan dengan drag-and-drop
- Real-time order status updates
- Offline mode untuk input pesanan
- Integration dengan tablet meja customer

**Akses:** `/waiter`

### 3. KASIR
**Alur Penggunaan:**
1. Login ke sistem kasir
2. Terima notifikasi pesanan baru dari customer/waiters
3. Proses pembayaran (tunai, kartu, e-wallet, QRIS)
4. Split bill untuk pembayaran terpisah
5. Proses refund dan void transaction
6. Generate receipt (digital/thermal printer)
7. Lihat laporan penjualan harian/mingguan
8. Manajemen shift (buka/tutup shift, cash reconciliation)

**Fitur Khusus:**
- Split bill functionality
- Multiple payment methods integration
- Thermal printer integration
- Cash management system
- Shift reporting

**Akses:** `/kasir`

### 4. CUSTOMER
**Alur Penggunaan:**
1. Scan QR code di meja
2. Browse menu digital dengan kategori
3. Pilih item menu dan tambahkan ke cart
4. Konfirmasi pesanan (otomatis ke kitchen dan kasir)
5. Request bill ketika selesai
6. Pembayaran via QRIS/e-wallet di meja
7. Berikan rating dan feedback
8. Lihat history pesanan dan loyalty points

**Fitur Khusus:**
- QR code ordering system
- Digital menu dengan gambar dan deskripsi
- Real-time order tracking
- Integrated payment system
- Loyalty program integration

**Akses:** `/customer/:tableId` (Public access via QR code)

### 5. OWNER/MANAJER
**Alur Penggunaan:**
1. Login ke dashboard owner
2. Lihat dashboard analitik real-time (penjualan, profit, customer)
3. Generate laporan keuangan (harian, mingguan, bulanan)
4. Monitor performa staff (waiters, kasir, kitchen)
5. Analisis inventory dan cost control
6. Lihat customer feedback dan rating
7. Manajemen promo dan diskon
8. Forecasting penjualan dengan AI/ML

**Fitur Khusus:**
- Real-time business analytics
- Predictive sales forecasting
- Staff performance tracking
- Customer insights
- Multi-location management

**Akses:** `/owner`

## Arsitektur Teknis

### Frontend
- **Framework:** React.js 18+ dengan TypeScript
- **UI Library:** Material-UI v5
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **Form Management:** Formik + Yup validation
- **HTTP Client:** Axios
- **Real-time:** Socket.IO client

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js dengan TypeScript
- **Database:** PostgreSQL 15+ dengan TimescaleDB untuk analytics
- **ORM:** TypeORM
- **Authentication:** JWT + OAuth2
- **Caching:** Redis
- **Real-time:** Socket.IO
- **File Upload:** Multer

### Database
- **Primary:** PostgreSQL 15+
- **Analytics:** TimescaleDB extension untuk time-series data
- **Caching:** Redis untuk session management
- **File Storage:** Local storage / AWS S3 (configurable)

### Deployment
- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** Nginx
- **Environment:** Development, Staging, Production
- **CI/CD:** GitHub Actions (ready)

## Struktur Database

### Core Tables
- `users` - User management dengan RBAC
- `menu_items` - Menu management dengan kategorisasi
- `categories` - Menu categories
- `tables` - Table management dengan posisi
- `orders` - Order tracking dengan status
- `order_items` - Individual order items
- `transactions` - Payment processing
- `shifts` - Kasir shift management

### Analytics Tables (TimescaleDB)
- `sales_analytics` - Time-series sales data
- `customer_analytics` - Customer behavior tracking
- `inventory_analytics` - Stock movement tracking
- `staff_performance` - Staff metrics over time

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Waiter API
- `GET /api/waiter/tables` - Get table status
- `POST /api/waiter/orders` - Create order
- `PUT /api/waiter/orders/:id/status` - Update order status
- `GET /api/waiter/notifications` - Get notifications
- `GET /api/waiter/performance` - Get waiter performance

### Kasir API
- `GET /api/kasir/pending-orders` - Get pending payments
- `POST /api/kasir/process-payment` - Process payment
- `POST /api/kasir/split-bill` - Split bill functionality
- `POST /api/kasir/print-receipt` - Print receipt
- `GET /api/kasir/shift/current` - Get current shift

### Customer API
- `GET /api/customer/table/:tableId/menu` - Get menu for table
- `POST /api/customer/order` - Create order
- `GET /api/customer/order/:orderId/status` - Order status
- `POST /api/customer/payment/qris/generate` - Generate QRIS
- `POST /api/customer/feedback` - Submit feedback

### Owner API
- `GET /api/owner/dashboard/metrics` - Dashboard metrics
- `GET /api/owner/staff/performance` - Staff performance
- `GET /api/owner/forecasting/sales` - Sales forecasting
- `GET /api/owner/customers/insights` - Customer insights
- `POST /api/owner/promotions` - Create promotion

## Real-time Features
- Order status updates (Socket.IO)
- Table status changes
- Payment notifications
- Kitchen order notifications
- Waiter call alerts
- Live dashboard updates

## Security
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Input validation & sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## Payment Integration
- **Cash payments** dengan cash reconciliation
- **Card payments** (Visa, Mastercard, debit)
- **E-wallets** (GoPay, OVO, DANA, LinkAja)
- **QRIS** untuk QR code payments
- **Split bill** functionality
- **Refund & void** transaction support

## Offline Capabilities
- Waiter app dapat bekerja offline
- Local storage untuk order buffering
- Sync otomatis ketika online
- Progressive Web App (PWA) ready

## Analytics & Reporting
- Real-time sales dashboard
- Staff performance metrics
- Customer satisfaction tracking
- Inventory cost analysis
- Profit & loss reporting
- Tax reporting
- Custom date range reports
- Automated report scheduling

## Mobile Responsiveness
- Responsive design untuk semua device
- Touch-friendly interface
- Tablet optimization untuk waiters
- Mobile optimization untuk customer app

## Development Setup

### Prerequisites
- Node.js v18+
- PostgreSQL 15+
- Redis
- Docker & Docker Compose

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd kasir-modern

# Install dependencies
npm run install:all

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development
npm run dev
```

### Production Deployment
```bash
# Build containers
docker-compose -f docker-compose.prod.yml build

# Start production
docker-compose -f docker-compose.prod.yml up -d
```

## Testing
- Unit tests dengan Jest
- Integration tests dengan Supertest
- E2E tests dengan Cypress
- API testing dengan Postman collections

## Monitoring
- Application logging dengan Winston
- Error tracking dengan Sentry (optional)
- Performance monitoring
- Database query optimization
- Health check endpoints

## Future Enhancements
- AI-powered sales forecasting
- Kitchen display system integration
- Inventory auto-ordering
- Customer loyalty program expansion
- Multi-language support
- Voice ordering capabilities
- Advanced reporting dengan machine learning

## Support & Maintenance
- Comprehensive error handling
- Automated backups
- Performance optimization
- Security updates
- Feature updates
- 24/7 monitoring ready

---
**Developed with ❤️ for modern restaurant operations**
