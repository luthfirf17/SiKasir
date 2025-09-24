# Owner Assets

Folder ini berisi semua asset yang digunakan khusus untuk modul Owner.

## Struktur Folder

### `/images`
- Business analytics charts
- Revenue graphs
- Restaurant photos
- Marketing banners
- Financial report templates

### `/icons`
- Business metrics icons
- Financial indicators
- Growth and analytics icons
- Management action icons
- Report type icons

## Panduan Penggunaan

```typescript
// Import image
import revenueChart from './images/revenue-chart.png';

// Import icon
import { ReactComponent as AnalyticsIcon } from './icons/analytics-icon.svg';

// Penggunaan di komponen
<img src={revenueChart} alt="Revenue Chart" />
<AnalyticsIcon className="analytics-icon" />
```

## Konvensi Penamaan
- Gunakan kebab-case untuk nama file
- Prefix dengan konteks: `owner-revenue-dashboard.png`
- Format yang didukung: PNG, JPG, SVG, WebP
