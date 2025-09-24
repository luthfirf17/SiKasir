# Kitchen Assets

Folder ini berisi semua asset yang digunakan khusus untuk modul Kitchen.

## Struktur Folder

### `/images`
- Kitchen dashboard backgrounds
- Food preparation images
- Kitchen equipment photos
- Order ticket templates
- Kitchen timer visuals

### `/icons`
- Kitchen equipment icons
- Cooking status icons
- Timer and clock icons
- Order priority indicators
- Food category icons

## Panduan Penggunaan

```typescript
// Import image
import kitchenDashboard from './images/kitchen-dashboard.jpg';

// Import icon
import { ReactComponent as CookingIcon } from './icons/cooking-icon.svg';

// Penggunaan di komponen
<img src={kitchenDashboard} alt="Kitchen Dashboard" />
<CookingIcon className="cooking-icon" />
```

## Konvensi Penamaan
- Gunakan kebab-case untuk nama file
- Prefix dengan konteks: `kitchen-order-status.png`
- Format yang didukung: PNG, JPG, SVG, WebP
