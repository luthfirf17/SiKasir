# Backend Structure Documentation

## 📁 Struktur Folder Backend yang Diperbaiki

### 🎯 **Prinsip Organisasi:**
- **Feature-based structure** - Setiap fitur memiliki folder terpisah
- **Clean Architecture** - Pemisahan core, features, dan shared
- **Scalability** - Mudah menambah fitur baru
- **Maintainability** - Kode mudah ditemukan dan dikelola

---

## 📂 **Struktur Lengkap:**

```
backend/
├── 📁 src/
│   ├── 📁 core/                    # Core system configurations
│   │   ├── 📁 database/           # Database configurations & migrations
│   │   │   ├── migrations/        # Database migrations
│   │   │   ├── seeders/          # Database seeders
│   │   │   ├── connection.ts     # Database connection setup
│   │   │   └── index.ts          # Database exports
│   │   ├── 📁 config/            # Application configurations
│   │   │   ├── database.ts       # Database config
│   │   │   ├── elasticsearch.ts  # Elasticsearch config
│   │   │   ├── redis.ts          # Redis config
│   │   │   └── index.ts          # Config exports
│   │   └── app.ts                # Express app configuration
│   │
│   ├── 📁 features/               # Business features (domain-driven)
│   │   ├── 📁 auth/              # Authentication & authorization
│   │   │   ├── controllers/      # Auth controllers
│   │   │   ├── services/         # Auth business logic
│   │   │   ├── models/           # Auth entities
│   │   │   ├── routes/           # Auth API routes
│   │   │   └── index.ts          # Auth module exports
│   │   │
│   │   ├── 📁 orders/            # Order management
│   │   │   ├── controllers/      # Order controllers
│   │   │   ├── services/         # Order business logic
│   │   │   ├── models/           # Order entities
│   │   │   ├── routes/           # Order API routes
│   │   │   └── index.ts          # Order module exports
│   │   │
│   │   ├── 📁 menu/              # Menu management
│   │   │   ├── controllers/      # Menu controllers
│   │   │   ├── services/         # Menu business logic
│   │   │   ├── models/           # Menu entities
│   │   │   ├── routes/           # Menu API routes
│   │   │   └── index.ts          # Menu module exports
│   │   │
│   │   ├── 📁 customers/         # Customer management
│   │   │   ├── controllers/      # Customer controllers
│   │   │   ├── services/         # Customer business logic
│   │   │   ├── models/           # Customer entities
│   │   │   ├── routes/           # Customer API routes
│   │   │   └── index.ts          # Customer module exports
│   │   │
│   │   ├── 📁 inventory/         # Inventory management
│   │   │   ├── controllers/      # Inventory controllers
│   │   │   ├── services/         # Inventory business logic
│   │   │   ├── models/           # Inventory entities
│   │   │   ├── routes/           # Inventory API routes
│   │   │   └── index.ts          # Inventory module exports
│   │   │
│   │   ├── 📁 payments/          # Payment processing
│   │   │   ├── controllers/      # Payment controllers
│   │   │   ├── services/         # Payment business logic
│   │   │   ├── models/           # Payment entities
│   │   │   ├── routes/           # Payment API routes
│   │   │   └── index.ts          # Payment module exports
│   │   │
│   │   └── 📁 tables/            # Table management
│   │       ├── controllers/      # Table controllers
│   │       ├── services/         # Table business logic
│   │       ├── models/           # Table entities
│   │       ├── routes/           # Table API routes
│   │       └── index.ts          # Table module exports
│   │
│   ├── 📁 shared/                # Shared utilities & common code
│   │   ├── 📁 middlewares/       # Common middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 services/          # Common services
│   │   │   ├── email.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 utils/             # Utility functions
│   │   │   ├── logger.ts
│   │   │   ├── response.ts
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   │
│   │   └── 📁 types/             # Shared TypeScript types
│   │       ├── common.types.ts
│   │       ├── api.types.ts
│   │       └── index.ts
│   │
│   ├── index.ts                  # Application entry point
│   └── server.ts                 # Server setup
│
├── 📁 tests/                     # Test files
│   ├── 📁 unit/                 # Unit tests
│   ├── 📁 integration/          # Integration tests
│   └── 📁 e2e/                  # End-to-end tests
│
├── 📁 docs/                      # Documentation
│   ├── API.md                   # API documentation
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── DEVELOPMENT.md           # Development guide
│
├── package.json                 # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Environment variables template
└── README.md                   # Project documentation
```

---

## 🚀 **Keuntungan Struktur Baru:**

### 1. **Feature-Based Organization**
- ✅ Setiap fitur terisolasi dalam folder sendiri
- ✅ Mudah menemukan kode terkait fitur tertentu
- ✅ Tim dapat bekerja paralel pada fitur berbeda

### 2. **Clear Separation of Concerns**
- ✅ **Core**: Konfigurasi sistem dan database
- ✅ **Features**: Business logic per domain
- ✅ **Shared**: Utilities yang digunakan bersama

### 3. **Scalability**
- ✅ Mudah menambah fitur baru
- ✅ Setiap fitur dapat dikembangkan independen
- ✅ Mendukung microservices architecture di masa depan

### 4. **Maintainability**
- ✅ Kode terorganisir dengan baik
- ✅ Mudah debugging dan troubleshooting
- ✅ Testing lebih mudah dilakukan

---

## 📋 **Mapping File Lama ke Struktur Baru:**

### **Models** → **Features/[domain]/models/**
```
models/User.ts → features/auth/models/User.ts
models/Order.ts → features/orders/models/Order.ts
models/Menu.ts → features/menu/models/Menu.ts
models/Customer.ts → features/customers/models/Customer.ts
models/Inventory.ts → features/inventory/models/Inventory.ts
models/Payment.ts → features/payments/models/Payment.ts
models/Table.ts → features/tables/models/Table.ts
```

### **Controllers** → **Features/[domain]/controllers/**
```
controllers/KasirController.ts → features/orders/controllers/OrderController.ts
controllers/CustomerController.ts → features/customers/controllers/CustomerController.ts
controllers/OwnerController.ts → features/auth/controllers/OwnerController.ts
controllers/WaiterController.ts → features/orders/controllers/WaiterController.ts
```

### **Routes** → **Features/[domain]/routes/**
```
routes/kasirRoutes.ts → features/orders/routes/order.routes.ts
routes/customerRoutes.ts → features/customers/routes/customer.routes.ts
routes/ownerRoutes.ts → features/auth/routes/owner.routes.ts
routes/waiterRoutes.ts → features/orders/routes/waiter.routes.ts
```

### **Config & Utils** → **Core & Shared**
```
config/ → core/config/
middlewares/ → shared/middlewares/
utils/ → shared/utils/
types/ → shared/types/
services/ → shared/services/
```

---

## 🛠 **Langkah Implementasi:**

1. **Phase 1**: Buat struktur folder baru ✅
2. **Phase 2**: Pindahkan file ke lokasi yang sesuai
3. **Phase 3**: Update import paths di semua file
4. **Phase 4**: Update package.json scripts
5. **Phase 5**: Update dokumentasi dan README

---

## 📝 **Konvensi Penamaan:**

### **File Naming:**
- Controllers: `[Entity]Controller.ts` (PascalCase)
- Services: `[entity].service.ts` (camelCase)
- Models: `[Entity].ts` (PascalCase)
- Routes: `[entity].routes.ts` (camelCase)
- Middlewares: `[name].middleware.ts` (camelCase)

### **Folder Naming:**
- Features: `kebab-case` atau `camelCase`
- Sub-folders: `camelCase`

---

## 🔄 **Import Examples:**

```typescript
// Before (old structure)
import { User } from '../models/User';
import { authMiddleware } from '../middlewares/authMiddleware';

// After (new structure)
import { User } from '@features/auth/models/User';
import { authMiddleware } from '@shared/middlewares/auth.middleware';
```

---

**Status**: ✅ Struktur folder telah dibuat
**Next Steps**: Pindahkan file-file dan update import paths
