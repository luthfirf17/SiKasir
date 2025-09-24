# Menu Management System - Backend Integration

## Overview
Sistem manajemen menu restoran yang terintegrasi dengan backend API dan database. Fitur ini memungkinkan admin untuk mengelola menu secara real-time dengan sinkronisasi database.

## Features
- ✅ **CRUD Operations**: Create, Read, Update, Delete menu items
- ✅ **Real-time Sync**: Perubahan langsung tersinkronisasi dengan database
- ✅ **Category Management**: Manajemen kategori menu dengan hierarki
- ✅ **Stock Management**: Tracking stok dan notifikasi stok rendah
- ✅ **Pricing & Margin**: Kalkulasi HPP, margin, dan analisis promosi
- ✅ **Search & Filter**: Pencarian dan filter berdasarkan kategori, status, dll
- ✅ **Image Upload**: Upload dan manajemen gambar menu
- ✅ **Error Handling**: Comprehensive error handling dan user feedback

## Architecture

### Backend Components
```
backend/src/
├── controllers/MenuController.ts     # API endpoints logic
├── routes/menuRoutes.ts             # Route definitions
├── models/Menu.ts                   # Database entity model
├── models/MenuCategory.ts           # Category entity model
└── services/MenuService.ts          # Business logic layer
```

### Frontend Components
```
frontend/src/
├── modules/admin/pages/
│   ├── MenuPage.tsx                 # Original component (static data)
│   └── MenuPageIntegrated.tsx       # New integrated component
├── hooks/useMenuData.ts             # Custom hook for API calls
├── services/MenuService.ts          # API service layer
└── utils/menuDataConverter.ts       # Data transformation utilities
```

## API Endpoints

### Menu Management
- `GET /api/menus` - Get all menus with filters
- `GET /api/menus/:id` - Get menu by ID
- `POST /api/menus` - Create new menu
- `PUT /api/menus/:id` - Update menu
- `DELETE /api/menus/:id` - Delete menu
- `PATCH /api/menus/:id/toggle-availability` - Toggle menu availability

### Category Management
- `GET /api/menus/categories/all` - Get all categories
- `POST /api/menus/categories` - Create new category

### Statistics
- `GET /api/menus/stats` - Get menu statistics

## Database Schema

### Menu Table
```sql
CREATE TABLE menus (
  menu_id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  category VARCHAR(50) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  prep_time_minutes INTEGER,
  image_url VARCHAR(255),
  allergens JSON,
  stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  promo_price DECIMAL(10,2),
  promo_description TEXT,
  is_promo_active BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  spice_level VARCHAR(50),
  ingredients TEXT,
  calories DECIMAL(8,2),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Menu Category Table
```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES menu_categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Configuration**
   - Ensure your database is running
   - Update connection settings in `src/config/database.ts`

3. **Run Database Migrations**
   ```bash
   npm run migration:run
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3001`

### 2. Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Update `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_API_BASE_URL=http://localhost:3001
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```
   Application will run on `http://localhost:3000`

### 3. Using the Integrated Component

Replace the existing MenuPage component with MenuPageIntegrated:

```tsx
// In your router or app component
import MenuPageIntegrated from './modules/admin/pages/MenuPageIntegrated';

// Replace MenuPage with MenuPageIntegrated
<Route path="/admin/menu" component={MenuPageIntegrated} />
```

## Data Flow

### Create Menu Flow
1. User fills form in `MenuPageIntegrated`
2. `handleSaveItem()` calls `createMenu()` from `useMenuData` hook
3. Hook calls `MenuService.createMenu()` with converted data
4. API creates menu in database via `MenuController.createMenu()`
5. Response data is converted back to frontend format
6. UI updates with new menu item

### Update Menu Flow
1. User edits menu and saves
2. `handleSaveItem()` calls `updateMenu()` with menu ID
3. API updates database record
4. Local state updates with response data
5. UI reflects changes immediately

### Delete Menu Flow
1. User confirms deletion
2. `handleDeleteItem()` calls `deleteMenu()` with menu ID
3. API removes record from database
4. Local state removes item from array
5. UI updates to hide deleted item

## Error Handling

### Frontend Error Handling
- API errors are caught and displayed as notifications
- Loading states prevent multiple submissions
- Form validation before API calls
- Optimistic UI updates with rollback on failure

### Backend Error Handling
- Input validation with detailed error messages
- Database constraint checking
- Proper HTTP status codes
- Consistent error response format

## Performance Optimizations

### Backend
- Database indexing on frequently queried fields
- Pagination for large datasets
- Query optimization with proper joins
- Caching strategies for static data

### Frontend
- React hooks for efficient re-renders
- Debounced search input
- Optimistic UI updates
- Image lazy loading
- Memoized calculations

## Security Considerations

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control
- API endpoint protection
- Input sanitization and validation

### Data Protection
- SQL injection prevention with TypeORM
- XSS protection with input validation
- File upload security (image validation)
- Rate limiting on API endpoints

## Testing

### Backend Testing
```bash
npm run test
npm run test:e2e
```

### Frontend Testing
```bash
npm run test
npm run test:coverage
```

## Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Run database migrations: `npm run migration:run`
4. Start production server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy build folder to web server
3. Configure API URL for production

## Troubleshooting

### Common Issues

1. **CORS Error**
   - Ensure backend CORS is configured for frontend domain
   - Check API URL in frontend environment variables

2. **Database Connection Error**
   - Verify database server is running
   - Check connection credentials in backend config

3. **API 404 Errors**
   - Ensure backend server is running on correct port
   - Verify API routes are properly registered

4. **Authentication Issues**
   - Check JWT token in localStorage
   - Verify token expiration and refresh logic

### Debug Mode
Enable debug mode by setting:
```env
REACT_APP_DEBUG=true
```

This will log API requests and responses to browser console.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/menu-integration`
3. Commit changes: `git commit -am 'Add menu integration'`
4. Push to branch: `git push origin feature/menu-integration`
5. Create Pull Request

## License

MIT License - see LICENSE file for details
