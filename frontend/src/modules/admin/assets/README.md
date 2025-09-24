# Admin Assets

Folder ini berisi semua asset yang digunakan khusus untuk modul Admin.

## Struktur Folder

### `/images`
- Screenshot dashboard
- Banner admin
- Grafik dan chart images
- Foto placeholder untuk admin

### `/icons`
- Custom icons untuk admin interface
- SVG icons untuk menu admin
- Status indicators
- Action icons

## Panduan Penggunaan

```typescript
// Import image
import adminBanner from './images/admin-banner.png';

// Import icon
import { ReactComponent as AdminIcon } from './icons/admin-icon.svg';

// Penggunaan di komponen
<img src={adminBanner} alt="Admin Banner" />
<AdminIcon className="admin-icon" />
```

## Konvensi Penamaan
- Gunakan kebab-case untuk nama file
- Prefix dengan konteks: `admin-dashboard-chart.png`
- Format yang didukung: PNG, JPG, SVG, WebP
