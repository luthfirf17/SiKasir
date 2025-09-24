# Customer Assets

Folder ini berisi semua asset yang digunakan khusus untuk modul Customer.

## Struktur Folder

### `/images`
- Banner welcome customer
- Menu item photos
- Promo banners
- Restaurant ambiance photos
- QR code images

### `/icons`
- Customer-specific icons
- Menu category icons
- Rating stars
- Order status icons
- Payment method icons

## Panduan Penggunaan

```typescript
// Import image
import menuBanner from './images/menu-banner.jpg';

// Import icon
import { ReactComponent as OrderIcon } from './icons/order-icon.svg';

// Penggunaan di komponen
<img src={menuBanner} alt="Menu Banner" />
<OrderIcon className="order-icon" />
```

## Konvensi Penamaan
- Gunakan kebab-case untuk nama file
- Prefix dengan konteks: `customer-menu-category.png`
- Format yang didukung: PNG, JPG, SVG, WebP
