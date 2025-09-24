import axios from 'axios';

// Base URL untuk API backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Axios instance dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token authentication jika diperlukan
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interface untuk Menu data
export interface MenuItemAPI {
  menu_id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  category: string;
  is_available: boolean;
  prep_time_minutes?: number;
  allergens?: string[];
  image_url?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level?: string;
  ingredients?: string;
  rating: number;
  review_count: number;
  order_count: number;
  is_featured: boolean;
  is_new: boolean;
  stock: number;
  low_stock_threshold: number;
  promo_price?: number;
  promo_description?: string;
  is_promo_active: boolean;
  // Financial data fields
  profit_margin_percentage?: number;
  profit_amount?: number;
  loss_amount?: number;
  promo_margin_percentage?: number;
  promo_profit_amount?: number;
  margin_reduction_amount?: number;
  created_at: Date;
  updated_at: Date;
}

// Interface untuk Category data
export interface MenuCategoryAPI {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk Create/Update Menu
export interface CreateMenuRequest {
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  category: string;
  is_available?: boolean;
  prep_time_minutes?: number;
  allergens?: string[];
  image_url?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: string;
  ingredients?: string;
}

// Interface untuk Create Category
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  parent_category?: string;
}

// Interface untuk API response
export interface APIResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Menu Service Class
export class MenuService {
  // Get all menus with optional filters
  static async getAllMenus(params?: {
    category?: string;
    available?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<APIResponse<MenuItemAPI[]>> {
    const response = await apiClient.get('/menus', { params });
    return response.data;
  }

  // Get menu by ID
  static async getMenuById(id: string): Promise<APIResponse<MenuItemAPI>> {
    const response = await apiClient.get(`/menus/${id}`);
    return response.data;
  }

  // Create new menu
  static async createMenu(menuData: CreateMenuRequest): Promise<APIResponse<MenuItemAPI>> {
    const response = await apiClient.post('/menus', menuData);
    return response.data;
  }

  // Update existing menu
  static async updateMenu(id: string, menuData: Partial<CreateMenuRequest>): Promise<APIResponse<MenuItemAPI>> {
    const response = await apiClient.put(`/menus/${id}`, menuData);
    return response.data;
  }

  // Delete menu
  static async deleteMenu(id: string): Promise<APIResponse<void>> {
    const response = await apiClient.delete(`/menus/${id}`);
    return response.data;
  }

  // Toggle menu availability
  static async toggleMenuAvailability(id: string): Promise<APIResponse<MenuItemAPI>> {
    const response = await apiClient.patch(`/menus/${id}/toggle-availability`);
    return response.data;
  }

  // Get all categories
  static async getCategories(): Promise<APIResponse<MenuCategoryAPI[]>> {
    const response = await apiClient.get('/menus/categories/all');
    return response.data;
  }

  // Create new category
  static async createCategory(categoryData: CreateCategoryRequest): Promise<APIResponse<MenuCategoryAPI>> {
    const response = await apiClient.post('/menus/categories', categoryData);
    return response.data;
  }

  // Delete category
  static async deleteCategory(id: string): Promise<APIResponse<void>> {
    const response = await apiClient.delete(`/menus/categories/${id}`);
    return response.data;
  }

  // Get menu statistics
  static async getMenuStats(): Promise<APIResponse<{
    total: number;
    available: number;
    unavailable: number;
    byCategory: Array<{ category: string; count: string }>;
  }>> {
    const response = await apiClient.get('/menus/stats');
    return response.data;
  }
}

export default MenuService;
