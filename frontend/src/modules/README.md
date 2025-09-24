# Frontend Module Structure

Struktur folder frontend telah diorganisir berdasarkan role untuk memudahkan maintenance dan pengembangan. Setiap modul memiliki struktur yang konsisten dan terpisah berdasarkan tanggung jawab.

## 📁 Struktur Folder

```
frontend/src/
├── modules/                    # Modul berdasarkan role
│   ├── admin/                  # Modul Admin
│   │   ├── pages/              # Halaman khusus admin
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── TablesPage.tsx
│   │   │   ├── MenuPage.tsx
│   │   │   └── SystemConfigPage.tsx
│   │   ├── components/         # Komponen khusus admin
│   │   │   ├── ModernAdminNavigation.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── hooks/              # Custom hooks admin
│   │   │   └── index.ts
│   │   ├── services/           # API services admin
│   │   │   └── index.ts
│   │   ├── types/              # Type definitions admin
│   │   │   └── index.ts
│   │   └── index.ts            # Export utama modul admin
│   │
│   ├── kasir/                  # Modul Kasir
│   │   ├── pages/              # Halaman khusus kasir
│   │   │   └── KasirDashboard.tsx
│   │   ├── components/         # Komponen khusus kasir
│   │   │   ├── KasirNavigation.tsx
│   │   │   └── KasirLayout.tsx
│   │   ├── hooks/              # Custom hooks kasir
│   │   ├── services/           # API services kasir
│   │   ├── types/              # Type definitions kasir
│   │   └── index.ts            # Export utama modul kasir
│   │
│   ├── owner/                  # Modul Owner
│   │   ├── pages/              # Halaman khusus owner
│   │   │   └── OwnerDashboard.tsx
│   │   ├── components/         # Komponen khusus owner
│   │   │   └── OwnerNavigation.tsx
│   │   ├── hooks/              # Custom hooks owner
│   │   ├── services/           # API services owner
│   │   ├── types/              # Type definitions owner
│   │   └── index.ts            # Export utama modul owner
│   │
│   ├── kitchen/                # Modul Kitchen/Waiter
│   │   ├── pages/              # Halaman khusus kitchen
│   │   │   └── WaiterDashboard.tsx
│   │   ├── components/         # Komponen khusus kitchen
│   │   │   └── KitchenNavigation.tsx
│   │   ├── hooks/              # Custom hooks kitchen
│   │   ├── services/           # API services kitchen
│   │   ├── types/              # Type definitions kitchen
│   │   └── index.ts            # Export utama modul kitchen
│   │
│   └── customer/               # Modul Customer
│       ├── pages/              # Halaman khusus customer
│       │   └── CustomerApp.tsx
│       ├── components/         # Komponen khusus customer
│       │   └── CustomerNavigation.tsx
│       ├── hooks/              # Custom hooks customer
│       ├── services/           # API services customer
│       ├── types/              # Type definitions customer
│       └── index.ts            # Export utama modul customer
│
├── components/                 # Komponen umum (shared)
├── hooks/                      # Custom hooks umum
├── services/                   # API services umum
├── store/                      # Redux store dan slices
├── types/                      # Type definitions umum
├── theme/                      # Material-UI theme
├── utils/                      # Utility functions
└── pages/                      # Halaman umum (login, dll)
```

## 🎯 Keuntungan Struktur Ini

### 1. **Separation of Concerns**
- Setiap role memiliki folder terpisah
- Mudah menemukan kode yang relevan
- Mengurangi coupling antar modul

### 2. **Scalability**
- Mudah menambah fitur baru per role
- Struktur konsisten untuk semua modul
- Independent development per role

### 3. **Maintainability**
- Kode terorganisir dengan baik
- Mudah debugging dan testing
- Clear ownership per modul

### 4. **Team Development**
- Developer bisa fokus pada role tertentu
- Mengurangi konflik merge
- Parallel development capability

## 🚀 Cara Penggunaan

### Import Komponen dari Modul

```typescript
// Import dari modul admin
import { AdminDashboard, AdminLayout, ModernAdminNavigation } from '@/modules/admin';

// Import dari modul kasir
import { KasirDashboard, KasirLayout, KasirNavigation } from '@/modules/kasir';

// Import dari modul owner
import { OwnerDashboard, OwnerNavigation } from '@/modules/owner';

// Import dari modul kitchen
import { KitchenDashboard, KitchenNavigation } from '@/modules/kitchen';

// Import dari modul customer
import { CustomerApp, CustomerNavigation } from '@/modules/customer';
```

### Penggunaan Layout

```typescript
// Admin Page
import { AdminLayout } from '@/modules/admin';

const AdminPage = () => (
  <AdminLayout title="Dashboard" breadcrumbs={[{label: 'Analytics'}]}>
    <YourPageContent />
  </AdminLayout>
);

// Kasir Page
import { KasirLayout } from '@/modules/kasir';

const KasirPage = () => (
  <KasirLayout title="POS System">
    <YourPOSContent />
  </KasirLayout>
);
```

## 🎨 Design System per Role

### Admin - **Biru & Dark Theme**
- Professional dan authoritative
- Focus pada analytics dan management

### Kasir - **Hijau & Fresh Theme**
- User-friendly untuk transaksi cepat
- Focus pada POS dan payment

### Owner - **Ungu & Premium Theme**
- Executive dan strategic
- Focus pada business insights

### Kitchen - **Orange & Energetic Theme**
- Dynamic untuk workflow cepat
- Focus pada order management

### Customer - **Hijau & Friendly Theme**
- Welcoming dan easy to use
- Focus pada menu browsing dan ordering

## 📝 Migration Notes

File-file lama di `/pages` telah dipindahkan ke modul yang sesuai:
- `DashboardPage.tsx` → `modules/admin/pages/`
- `KasirDashboard.tsx` → `modules/kasir/pages/`
- `OwnerDashboard.tsx` → `modules/owner/pages/`
- `WaiterDashboard.tsx` → `modules/kitchen/pages/`
- `CustomerApp.tsx` → `modules/customer/pages/`

## 🔄 Next Steps

1. Update routing untuk menggunakan modul baru
2. Implement API services per modul
3. Add custom hooks per modul
4. Enhance type definitions
5. Add unit tests per modul
6. Create shared components documentation

## 🤝 Contributing

Saat menambah fitur baru:
1. Tentukan role yang sesuai
2. Buat komponen di folder modul yang tepat
3. Update index.ts untuk export
4. Tambah type definitions jika diperlukan
5. Update documentation
