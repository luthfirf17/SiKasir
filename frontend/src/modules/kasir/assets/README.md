# Kasir Assets

Folder ini berisi semua asset yang digunakan khusus untuk modul Kasir (POS).

## Struktur Folder

### `/images`
- POS interface backgrounds
- Product thumbnails
- Payment method logos
- Receipt templates
- Cash register images

### `/icons`
- POS operation icons
- Calculator icons
- Payment type icons
- Transaction status icons
- Product category icons

## Panduan Penggunaan

```typescript
// Import image
import posBackground from './images/pos-background.jpg';

// Import icon
import { ReactComponent as CashIcon } from './icons/cash-icon.svg';

// Penggunaan di komponen
<img src={posBackground} alt="POS Background" />
<CashIcon className="cash-icon" />
```

## Konvensi Penamaan
- Gunakan kebab-case untuk nama file
- Prefix dengan konteks: `kasir-payment-method.png`
- Format yang didukung: PNG, JPG, SVG, WebP
