import { useState, useEffect, useCallback } from 'react';
import { MenuService, MenuItemAPI, MenuCategoryAPI } from '../services/MenuService';
import { 
  convertAPIMenuToFrontend, 
  convertAPICategoryToFrontend,
  convertFrontendMenuToAPI,
  convertFrontendCategoryToAPI,
  mapCategoryToBackendEnum,
  MenuItem,
  MenuCategory 
} from '../utils/menuDataConverter';

// Custom hook untuk mengelola menu data
export const useMenuData = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all menus from API
  const fetchMenus = useCallback(async (filters?: {
    category?: string;
    available?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Map frontend category to backend enum if needed
      const apiFilters = {
        ...filters,
        category: filters?.category && filters.category !== 'all' 
          ? mapCategoryToBackendEnum(filters.category) 
          : filters?.category
      };

      const response = await MenuService.getAllMenus(apiFilters);
      const frontendMenus = response.data.map(convertAPIMenuToFrontend);
      setMenuItems(frontendMenus);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch menus');
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await MenuService.getCategories();
      const frontendCategories = response.data.map(convertAPICategoryToFrontend);
      setCategories(frontendCategories);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Create new menu
  const createMenu = useCallback(async (menuData: Partial<MenuItem>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!menuData.name || !menuData.price || !menuData.category) {
        throw new Error('Name, price, and category are required');
      }

      const apiMenuData = convertFrontendMenuToAPI(menuData);
      const response = await MenuService.createMenu(apiMenuData as any);
      const newMenu = convertAPIMenuToFrontend(response.data);
      
      setMenuItems(prev => [...prev, newMenu]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create menu');
      console.error('Error creating menu:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing menu
  const updateMenu = useCallback(async (id: string, menuData: Partial<MenuItem>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const apiMenuData = convertFrontendMenuToAPI(menuData);
      const response = await MenuService.updateMenu(id, apiMenuData);
      const updatedMenu = convertAPIMenuToFrontend(response.data);
      
      setMenuItems(prev => prev.map(item => 
        item.id === id ? updatedMenu : item
      ));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update menu');
      console.error('Error updating menu:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete menu
  const deleteMenu = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await MenuService.deleteMenu(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete menu');
      console.error('Error deleting menu:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle menu availability
  const toggleMenuAvailability = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await MenuService.toggleMenuAvailability(id);
      const updatedMenu = convertAPIMenuToFrontend(response.data);
      
      setMenuItems(prev => prev.map(item => 
        item.id === id ? updatedMenu : item
      ));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle menu availability');
      console.error('Error toggling menu availability:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new category
  const createCategory = useCallback(async (categoryData: Partial<MenuCategory>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!categoryData.name) {
        throw new Error('Category name is required');
      }

      const apiCategoryData = convertFrontendCategoryToAPI(categoryData);
      const response = await MenuService.createCategory(apiCategoryData as any);
      const newCategory = convertAPICategoryToFrontend(response.data);
      
      setCategories(prev => [...prev, newCategory]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create category');
      console.error('Error creating category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await MenuService.deleteCategory(id);
      setCategories(prev => prev.filter(category => category.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, [fetchMenus, fetchCategories]);

  return {
    menuItems,
    categories,
    loading,
    error,
    fetchMenus,
    fetchCategories,
    createMenu,
    updateMenu,
    deleteMenu,
    toggleMenuAvailability,
    createCategory,
    deleteCategory,
    setError, // Untuk clear error dari component
  };
};

export default useMenuData;
