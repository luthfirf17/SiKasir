import { MenuItemAPI, MenuCategoryAPI } from '../services/MenuService';

// Interface MenuItem untuk frontend (existing)
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  hpp: number; // Harga Pokok Penjualan (cost_price)
  category: string;
  description: string;
  image?: string;
  allergens: string[];
  isAvailable: boolean;
  stock: number;
  lowStockThreshold: number;
  estimatedPrepTime: number; // dalam menit
  promoPrice?: number; // harga promo jika ada
  promoDescription?: string; // deskripsi promo
  isPromoActive: boolean;
  // Financial data fields
  profitMarginPercentage?: number;
  profitAmount?: number;
  lossAmount?: number;
  promoMarginPercentage?: number;
  promoProfitAmount?: number;
  marginReductionAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface MenuCategory untuk frontend (existing)
export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  parentCategory: 'makanan' | 'minuman';
  createdAt: Date;
}

// Convert API MenuItem to Frontend MenuItem
export const convertAPIMenuToFrontend = (apiMenu: MenuItemAPI): MenuItem => {
  return {
    id: apiMenu.menu_id,
    name: apiMenu.name,
    price: Number(apiMenu.price),
    hpp: Number(apiMenu.cost_price || 0),
    category: apiMenu.category,
    description: apiMenu.description || '',
    image: apiMenu.image_url,
    allergens: apiMenu.allergens || [],
    isAvailable: apiMenu.is_available,
    stock: apiMenu.stock || 50,
    lowStockThreshold: apiMenu.low_stock_threshold || 10,
    estimatedPrepTime: apiMenu.prep_time_minutes || 15,
    promoPrice: apiMenu.promo_price,
    promoDescription: apiMenu.promo_description,
    isPromoActive: apiMenu.is_promo_active || false,
    // Financial data conversion
    profitMarginPercentage: apiMenu.profit_margin_percentage,
    profitAmount: apiMenu.profit_amount,
    lossAmount: apiMenu.loss_amount,
    promoMarginPercentage: apiMenu.promo_margin_percentage,
    promoProfitAmount: apiMenu.promo_profit_amount,
    marginReductionAmount: apiMenu.margin_reduction_amount,
    createdAt: new Date(apiMenu.created_at),
    updatedAt: new Date(apiMenu.updated_at),
  };
};

// Convert Frontend MenuItem to API CreateMenuRequest
export const convertFrontendMenuToAPI = (frontendMenu: Partial<MenuItem>) => {
  return {
    name: frontendMenu.name,
    description: frontendMenu.description,
    price: frontendMenu.price,
    cost_price: frontendMenu.hpp,
    category: frontendMenu.category,
    is_available: frontendMenu.isAvailable,
    prep_time_minutes: frontendMenu.estimatedPrepTime,
    allergens: frontendMenu.allergens,
    image_url: frontendMenu.image,
    stock: frontendMenu.stock,
    low_stock_threshold: frontendMenu.lowStockThreshold,
    promo_price: frontendMenu.promoPrice,
    promo_description: frontendMenu.promoDescription,
    is_promo_active: frontendMenu.isPromoActive,
    // Default values untuk field yang tidak ada di frontend
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
  };
};

// Convert API MenuCategory to Frontend MenuCategory
export const convertAPICategoryToFrontend = (apiCategory: MenuCategoryAPI): MenuCategory => {
  // Map parentId ke parentCategory string
  let parentCategory: 'makanan' | 'minuman' = 'makanan';
  
  // Logika sederhana: jika category name mengandung kata 'minuman', 'drink', 'jus', dll
  const categoryName = apiCategory.name.toLowerCase();
  if (categoryName.includes('minuman') || 
      categoryName.includes('drink') || 
      categoryName.includes('jus') || 
      categoryName.includes('teh') || 
      categoryName.includes('kopi') || 
      categoryName.includes('es')) {
    parentCategory = 'minuman';
  }

  return {
    id: apiCategory.id,
    name: apiCategory.name,
    description: apiCategory.description || '',
    icon: apiCategory.icon || 'RestaurantIcon',
    parentCategory,
    createdAt: new Date(apiCategory.createdAt),
  };
};

// Convert Frontend MenuCategory to API CreateCategoryRequest
export const convertFrontendCategoryToAPI = (frontendCategory: Partial<MenuCategory>) => {
  return {
    name: frontendCategory.name,
    description: frontendCategory.description,
    icon: frontendCategory.icon,
    parent_category: frontendCategory.parentCategory === 'minuman' ? 'beverage' : 'food',
  };
};

// Map frontend category strings to backend enum values
export const mapCategoryToBackendEnum = (frontendCategory: string): string => {
  const categoryMapping: { [key: string]: string } = {
    'nasi-goreng': 'main_course',
    'mie': 'main_course',
    'ayam': 'main_course',
    'jus': 'beverage',
    'es-teh': 'beverage',
    'makanan-utama': 'main_course',
    'appetizer': 'appetizer',
    'dessert': 'dessert',
    'snack': 'snack',
    'side-dish': 'side_dish',
  };

  return categoryMapping[frontendCategory] || 'food';
};

// Map backend enum values to frontend category strings
export const mapBackendEnumToCategory = (backendEnum: string): string => {
  const enumMapping: { [key: string]: string } = {
    'main_course': 'makanan-utama',
    'appetizer': 'appetizer',
    'dessert': 'dessert',
    'beverage': 'minuman',
    'snack': 'snack',
    'side_dish': 'side-dish',
    'food': 'makanan-utama',
  };

  return enumMapping[backendEnum] || 'makanan-utama';
};
