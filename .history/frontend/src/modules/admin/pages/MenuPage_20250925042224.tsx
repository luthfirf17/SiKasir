/**
 * MenuPage.tsx
 * 
 * DESKRIPSI SINGKAT:
 * - Halaman admin untuk manajemen menu restoran dengan CRUD operations
 * - Fitur: tambah/edit/hapus menu, upload foto, filter kategori, pencarian
 * - UI responsive dengan Material-UI components dan grid layout
 * - State management lokal untuk data menu dan form handling
 * - Validasi form, notifikasi success/error, dan konfirmasi delete
 * - Format harga Rupiah, status ketersediaan, dan informasi alergen
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Switch, FormControlLabel, Chip, IconButton,
  Paper, Alert, Snackbar, InputAdornment, Checkbox, FormGroup,
  Fab, Tooltip, CircularProgress, Backdrop, LinearProgress,
} from '@mui/material';
import { useMenuData } from '../../../hooks/useMenuData';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PhotoCamera as PhotoIcon,
  Search as SearchIcon, Restaurant as RestaurantIcon,
  LocalDrink as DrinkIcon, Category as CategoryIcon, AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
  CloudUpload as UploadIcon, Close as CloseIcon,
  Cake as CakeIcon, LocalPizza as PizzaIcon, Fastfood as FastfoodIcon,
  Coffee as CoffeeIcon, Icecream as IcecreamIcon, LocalBar as LocalBarIcon,
  Save as SaveIcon, Clear as ClearIcon, FilterList as FilterListIcon,
  Sort as SortIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon,
  Inventory as InventoryIcon, Schedule as ScheduleIcon, LocalOffer as LocalOfferIcon,
  Warning as WarningIcon, Timer as TimerIcon,
} from '@mui/icons-material';

// ===================== TYPES & INTERFACES =====================
// Interface untuk struktur data menu item
interface MenuItem {
  id: string;
  name: string;
  price: number;
  hpp: number; // Harga Pokok Penjualan
  category: string;
  description: string;
  image?: string;
  allergens: string[];
  isAvailable: boolean;
  // New fields
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

// Interface untuk form data menu
interface MenuFormData {
  name: string;
  price: string;
  hpp: string; // Harga Pokok Penjualan
  category: string;
  description: string;
  image?: string;
  allergens: string[];
  isAvailable: boolean;
  // New fields
  stock: string;
  lowStockThreshold: string;
  estimatedPrepTime: string; // dalam menit
  promoPrice: string; // harga promo jika ada
  promoDescription: string; // deskripsi promo
  isPromoActive: boolean;
}

// Interface untuk kategori menu
interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  parentCategory: 'makanan' | 'minuman';
  createdAt: Date;
}


// Opsi alergen default yang tersedia
const DEFAULT_ALLERGEN_OPTIONS = [
  'gluten', 'kacang-kacangan', 'susu', 'telur', 'ikan', 'kerang', 'kedelai', 'madu', 'msg',
];

// Opsi icon untuk kategori
const CATEGORY_ICONS = [
  { value: 'RestaurantIcon', label: 'Restaurant', icon: RestaurantIcon },
  { value: 'DrinkIcon', label: 'Minuman', icon: DrinkIcon },
  { value: 'CakeIcon', label: 'Kue/Dessert', icon: CakeIcon },
  { value: 'PizzaIcon', label: 'Pizza/Pasta', icon: PizzaIcon },
  { value: 'FastfoodIcon', label: 'Fast Food', icon: FastfoodIcon },
  { value: 'CoffeeIcon', label: 'Kopi', icon: CoffeeIcon },
  { value: 'IcecreamIcon', label: 'Ice Cream', icon: IcecreamIcon },
  { value: 'LocalBarIcon', label: 'Bar/Cocktail', icon: LocalBarIcon },
];

// ===================== MAIN COMPONENT =====================
const MenuPage: React.FC = () => {
  // ===== HOOKS - Menu data from API =====
  const {
    menuItems,
    categories,
    loading,
    error,
    fetchMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    toggleMenuAvailability,
    createCategory,
    deleteCategory,
    setError,
  } = useMenuData();

  // ===== STATE MANAGEMENT - UI state =====
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'margin' | 'hpp' | 'promo'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  
  // State untuk custom allergens
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);
  const [newAllergen, setNewAllergen] = useState('');
  
  // State untuk loading image operations
  const [imageLoading, setImageLoading] = useState(false);
  
  // Combined allergen options (default + custom)
  const getAllergenOptions = () => [...DEFAULT_ALLERGEN_OPTIONS, ...customAllergens];

  // ===== EFFECTS - Load data dan filtering =====
  useEffect(() => {
    // Load data when component mounts
    fetchMenus();
  }, [fetchMenus]);

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
      setError(null);
    }
  }, [error, setError]);
  
  // Form state - Data untuk add/edit menu
  const [formData, setFormData] = useState<MenuFormData>({
    name: '', price: '', hpp: '', category: 'makanan-utama', description: '',
    image: '', allergens: [], isAvailable: true,
    stock: '50', lowStockThreshold: '10', estimatedPrepTime: '15',
    promoPrice: '', promoDescription: '', isPromoActive: false,
  });

  // Category form state - Data untuk add kategori baru
  const [categoryFormData, setCategoryFormData] = useState({
    name: '', icon: 'RestaurantIcon', parentCategory: 'makanan' as 'makanan' | 'minuman',
  });

  // ===== UTILITY FUNCTIONS - Helper functions =====
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function untuk mengatur image URL
  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) {
      // Gunakan data URL untuk placeholder agar tidak ada network request
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjY2NjY2NjIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
    }
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    // Pastikan path dimulai dengan slash
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:3002${cleanPath}`;
  };

  // Safe number formatting
  const safeToFixed = (value: any, decimals: number = 1): string => {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return '0';
    return num.toFixed(decimals);
  };

  const calculateMargin = (price: number, hpp: number): number => {
    // Convert to numbers and handle NaN/undefined
    const numPrice = Number(price) || 0;
    const numHpp = Number(hpp) || 0;
    
    // Safety checks
    if (numPrice <= 0 || numHpp < 0 || numPrice < numHpp) return 0;
    if (isNaN(numPrice) || isNaN(numHpp)) return 0;
    
    return ((numPrice - numHpp) / numPrice) * 100;
  };

  // Get margin from database or calculate if not available
  const getMarginPercentage = (item: MenuItem): number => {
    // Ensure we have valid numbers and check for database field
    if (item.profitMarginPercentage !== undefined && 
        item.profitMarginPercentage !== null && 
        typeof item.profitMarginPercentage === 'number' &&
        !isNaN(item.profitMarginPercentage)) {
      return item.profitMarginPercentage;
    }
    
    // Fallback to calculation with safety checks
    const price = Number(item.price) || 0;
    const hpp = Number(item.hpp) || 0;
    return calculateMargin(price, hpp);
  };

  // Get profit amount from database or calculate if not available
  const getProfitAmount = (item: MenuItem): number => {
    // Ensure we have valid numbers and check for database field
    if (item.profitAmount !== undefined && 
        item.profitAmount !== null && 
        typeof item.profitAmount === 'number' &&
        !isNaN(item.profitAmount)) {
      return item.profitAmount;
    }
    
    // Fallback to calculation with safety checks
    const price = Number(item.price) || 0;
    const hpp = Number(item.hpp) || 0;
    return price - hpp;
  };

  const calculatePromoMargin = (originalPrice: number, promoPrice: number, hpp: number): { 
    originalMargin: number; 
    promoMargin: number; 
    marginReduction: number;
    profitLoss: number;
  } => {
    const originalMargin = calculateMargin(originalPrice, hpp);
    const promoMargin = calculateMargin(promoPrice, hpp);
    const marginReduction = originalMargin - promoMargin;
    const profitLoss = originalPrice - promoPrice;
    
    return {
      originalMargin,
      promoMargin,
      marginReduction,
      profitLoss
    };
  };

  const getMarginColor = (marginPercent: number): string => {
    if (marginPercent >= 50) return 'success';
    if (marginPercent >= 30) return 'warning';
    return 'error';
  };

  const isLowStock = (stock: number, threshold: number): boolean => {
    return stock <= threshold;
  };

  const getStockColor = (stock: number, threshold: number): 'success' | 'warning' | 'error' => {
    if (stock === 0) return 'error';
    if (stock <= threshold) return 'warning';
    return 'success';
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}j ${remainingMinutes}m` : `${hours} jam`;
  };

  const resetForm = () => {
    setFormData({
      name: '', price: '', hpp: '', category: categories[0]?.id || 'nasi-goreng', description: '',
      image: '', allergens: [], isAvailable: true,
      stock: '50', lowStockThreshold: '10', estimatedPrepTime: '15',
      promoPrice: '', promoDescription: '', isPromoActive: false,
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', icon: 'RestaurantIcon', parentCategory: 'makanan' });
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // ===== ALLERGEN MANAGEMENT - Functions untuk mengelola alergen =====
  const addCustomAllergen = () => {
    const trimmedAllergen = newAllergen.trim().toLowerCase();
    
    if (!trimmedAllergen) {
      showNotification('Nama alergen tidak boleh kosong!');
      return;
    }
    
    if (getAllergenOptions().includes(trimmedAllergen)) {
      showNotification('Alergen tersebut sudah ada!');
      return;
    }
    
    setCustomAllergens(prev => [...prev, trimmedAllergen]);
    setNewAllergen('');
    showNotification(`Alergen "${trimmedAllergen}" berhasil ditambahkan!`);
  };

  const removeCustomAllergen = (allergen: string) => {
    setCustomAllergens(prev => prev.filter(item => item !== allergen));
    
    // Remove from all menu items that use this allergen
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(item => item !== allergen)
    }));
    
    showNotification(`Alergen "${allergen}" berhasil dihapus!`);
  };

  const isCustomAllergen = (allergen: string) => {
    return customAllergens.includes(allergen);
  };

  // ===== CATEGORY CRUD OPERATIONS =====
  const handleOpenCategoryDialog = () => {
    resetCategoryForm();
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    resetCategoryForm();
  };

  const handleCategoryFormChange = (field: string, value: string) => {
    setCategoryFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      showNotification('Nama kategori harus diisi!'); return;
    }

    // Check if category already exists
    const categoryExists = categories.some(cat => 
      cat.name.toLowerCase() === categoryFormData.name.toLowerCase()
    );
    
    if (categoryExists) {
      showNotification('Kategori dengan nama tersebut sudah ada!'); return;
    }

    const newCategoryData: Partial<MenuCategory> = {
      name: categoryFormData.name,
      description: '',
      icon: categoryFormData.icon,
      parentCategory: categoryFormData.parentCategory,
    };

    // Call API to create category
    const success = await createCategory(newCategoryData);
    
    if (success) {
      showNotification(`Kategori "${categoryFormData.name}" berhasil ditambahkan ke ${categoryFormData.parentCategory}!`);
      handleCloseCategoryDialog();
    }
  };

  // Handle delete category
  const handleOpenDeleteCategoryDialog = (categoryId: string) => {
    setDeleteCategoryId(categoryId);
    setOpenDeleteCategoryDialog(true);
  };

  const handleCloseDeleteCategoryDialog = () => {
    setOpenDeleteCategoryDialog(false);
    setDeleteCategoryId(null);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    const success = await deleteCategory(deleteCategoryId);
    
    if (success) {
      showNotification('Kategori berhasil dihapus!');
      handleCloseDeleteCategoryDialog();
      
      // Update filter if deleted category was selected
      if (categoryFilter !== 'all') {
        const deletedCategory = categories.find(cat => cat.id === deleteCategoryId);
        if (deletedCategory) {
          setCategoryFilter('all');
          setSelectedSubCategories([]);
        }
      }
    }
  };

  // Get categories by parent
  const getCategoriesByParent = (parent: 'makanan' | 'minuman') => {
    return categories.filter(cat => cat.parentCategory === parent);
  };

  // ===== MENU CRUD OPERATIONS =====

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconObj = CATEGORY_ICONS.find(icon => icon.value === iconName);
    return iconObj ? iconObj.icon : RestaurantIcon;
  };

  // Get category name by id
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Get category icon by id
  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      const IconComponent = getIconComponent(category.icon);
      return <IconComponent />;
    }
    return <RestaurantIcon />;
  };

  // ===== FILTERING & SEARCH - Real-time filter berdasarkan search dan kategori =====
  useEffect(() => {
    let filtered = menuItems;

    // Filter berdasarkan search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter berdasarkan kategori utama dan sub-kategori
    if (categoryFilter !== 'all') {
      if (selectedSubCategories.length > 0) {
        // Jika ada sub-kategori yang dipilih, filter berdasarkan sub-kategori
        filtered = filtered.filter(item => selectedSubCategories.includes(item.category));
      } else {
        // Jika tidak ada sub-kategori dipilih, filter berdasarkan kategori utama
        if (categoryFilter === 'makanan') {
          const makananCategories = categories.filter(cat => cat.parentCategory === 'makanan').map(cat => cat.id);
          filtered = filtered.filter(item => makananCategories.includes(item.category));
        } else if (categoryFilter === 'minuman') {
          const minumanCategories = categories.filter(cat => cat.parentCategory === 'minuman').map(cat => cat.id);
          filtered = filtered.filter(item => minumanCategories.includes(item.category));
        }
      }
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * multiplier;
        case 'price':
          return (a.price - b.price) * multiplier;
        case 'hpp':
          return (a.hpp - b.hpp) * multiplier;
        case 'margin':
          const marginA = a.price > 0 ? ((a.price - a.hpp) / a.price) * 100 : 0;
          const marginB = b.price > 0 ? ((b.price - b.hpp) / b.price) * 100 : 0;
          return (marginA - marginB) * multiplier;
        case 'promo':
          // Sort by promo status: active promos first, then by discount amount
          if (a.isPromoActive !== b.isPromoActive) {
            // Active promos first when ascending, last when descending
            return (b.isPromoActive ? 1 : 0) - (a.isPromoActive ? 1 : 0) * multiplier;
          }
          // If both have same promo status, sort by discount amount
          if (a.isPromoActive && b.isPromoActive) {
            const discountA = a.promoPrice ? (a.price - a.promoPrice) : 0;
            const discountB = b.promoPrice ? (b.price - b.promoPrice) : 0;
            return (discountA - discountB) * multiplier;
          }
          // If neither has promo, sort by name as fallback
          return a.name.localeCompare(b.name) * multiplier;
        default:
          return 0;
      }
    });

    setFilteredItems(sorted);
  }, [menuItems, searchQuery, categoryFilter, selectedSubCategories, categories, sortBy, sortOrder]);

  // Handle category filter change
  const handleCategoryFilterChange = (newCategory: string) => {
    setCategoryFilter(newCategory);
    setSelectedSubCategories([]); // Reset sub-categories when main category changes
  };

  // Handle sub-category selection
  const handleSubCategoryToggle = (subCategoryId: string) => {
    setSelectedSubCategories(prev => {
      if (prev.includes(subCategoryId)) {
        return prev.filter(id => id !== subCategoryId);
      } else {
        return [...prev, subCategoryId];
      }
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setCategoryFilter('all');
    setSelectedSubCategories([]);
    setSearchQuery('');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Handle sorting
  const handleSort = (field: 'name' | 'price' | 'margin' | 'hpp' | 'promo') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // ===== DIALOG HANDLERS - Mengatur buka/tutup dialog =====
  const handleOpenAddDialog = () => {
    setEditingItem(null); 
    resetForm(); 
    setSelectedParentCategory('makanan'); // Reset to default
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name, price: item.price.toString(), hpp: item.hpp.toString(), category: item.category,
      description: item.description, image: item.image || '', allergens: item.allergens,
      isAvailable: item.isAvailable,
      stock: item.stock.toString(),
      lowStockThreshold: item.lowStockThreshold.toString(),
      estimatedPrepTime: item.estimatedPrepTime.toString(),
      promoPrice: item.promoPrice?.toString() || '',
      promoDescription: item.promoDescription || '',
      isPromoActive: item.isPromoActive,
    });
    
    // Set parent category based on item's category
    const category = categories.find(cat => cat.id === item.category);
    if (category) {
      setSelectedParentCategory(category.parentCategory);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); setEditingItem(null); resetForm();
  };

  const handleOpenDeleteDialog = (itemId: string) => {
    setDeleteItemId(itemId); setOpenDeleteDialog(true);
  };

  // ===== FORM HANDLERS - Mengatur perubahan form data =====
  const [selectedParentCategory, setSelectedParentCategory] = useState<'makanan' | 'minuman'>('makanan');

  const handleFormChange = (field: keyof MenuFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleParentCategoryChange = (parentCategory: 'makanan' | 'minuman') => {
    setSelectedParentCategory(parentCategory);
    // Reset category selection when parent changes
    const firstCategoryInParent = categories.find(cat => cat.parentCategory === parentCategory);
    if (firstCategoryInParent) {
      setFormData(prev => ({ ...prev, category: firstCategoryInParent.id }));
    }
  };

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allergens: checked ? [...prev.allergens, allergen] : prev.allergens.filter(a => a !== allergen),
    }));
  };

  // Upload foto - PERBAIKAN: Upload ke server storage yang permanent
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (file.size > 5 * 1024 * 1024) { // Max 5MB
      showNotification('Ukuran file terlalu besar! Maksimal 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification('File harus berupa gambar!');
      return;
    }

    setImageLoading(true);
    try {
      // Membuat FormData untuk upload
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('folder', 'menu'); // Folder khusus untuk menu images

      // Upload ke server backend
      const response = await fetch('/api/v1/upload/image', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Upload gagal');
      }

      const result = await response.json();
      
      // Update form data dengan URL permanent dari server
      setFormData(prev => ({ 
        ...prev, 
        image: result.imageURL // URL permanent seperti: /uploads/menu/filename.jpg
      }));
      
      showNotification('Foto berhasil diunggah!');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Gagal mengunggah foto. Silakan coba lagi.');
    } finally {
      setImageLoading(false);
    }
  };

  // Hapus foto dari server dan form - PERBAIKAN: Integrasi dengan database
  const handleImageDelete = async (imagePath: string, showLoadingState: boolean = true, menuId?: string) => {
    if (!imagePath) {
      setFormData(prev => ({ ...prev, image: '' }));
      if (showLoadingState) showNotification('Foto dihapus dari form');
      return;
    }

    if (showLoadingState) setImageLoading(true);
    try {
      // Jika ada menuId (untuk menu yang sudah ada), update database terlebih dahulu
      if (menuId && editingItem) {
        const updateData = {
          image_url: null // Set ke null untuk menghapus referensi di database
        };
        
        // Update database untuk hapus referensi foto
        const dbResponse = await fetch(`/api/v1/menus/${menuId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!dbResponse.ok) {
          throw new Error('Gagal menghapus referensi foto dari database');
        }
      }

      // Hapus file dari server backend
      const response = await fetch('/api/v1/upload/image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageURL: imagePath }),
      });

      if (!response.ok) {
        // Jika gagal hapus dari server, tetap hapus dari form
        console.warn('Failed to delete from server, removing from form only');
        setFormData(prev => ({ ...prev, image: '' }));
        if (showLoadingState) showNotification('Foto dihapus dari form (peringatan: file mungkin masih ada di server)');
        return;
      }

      // Hapus dari form data jika berhasil
      setFormData(prev => ({ ...prev, image: '' }));
      
      // Update local state jika menu sudah ada
      if (menuId && editingItem) {
        // Refresh data menu untuk sinkronisasi
        fetchMenus();
      }
      
      if (showLoadingState) showNotification('Foto berhasil dihapus dari server, database, dan form!');
      
    } catch (error) {
      console.error('Delete error:', error);
      // Tetap hapus dari form meskipun gagal hapus dari server
      setFormData(prev => ({ ...prev, image: '' }));
      if (showLoadingState) showNotification('Foto dihapus dari form (peringatan: mungkin masih ada di server/database)');
    } finally {
      if (showLoadingState) setImageLoading(false);
    }
  };

  // Hapus foto dari menu yang sudah ada (update database + hapus file)
  const handleRemoveMenuImage = async (menuId: string, imagePath: string) => {
    setImageLoading(true);
    try {
      // Update database untuk hapus referensi foto (backend akan auto-delete file)
      const updateData = {
        image_url: null // Set ke null untuk menghapus referensi di database
      };
      
      const response = await fetch(`/api/v1/menus/${menuId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus foto dari database');
      }

      // Hapus dari form data dan refresh data
      setFormData(prev => ({ ...prev, image: '' }));
      fetchMenus(); // Refresh data menu
      showNotification('Foto berhasil dihapus dari database dan server!');
      
    } catch (error) {
      console.error('Remove image error:', error);
      showNotification('Gagal menghapus foto. Silakan coba lagi.');
    } finally {
      setImageLoading(false);
    }
  };

  // ===== CRUD OPERATIONS - Create, Read, Update, Delete =====
  const handleSaveItem = async () => {
    // Validasi form
    if (!formData.name.trim() || !formData.price.trim() || !formData.hpp.trim() || 
        !formData.stock.trim() || !formData.lowStockThreshold.trim() || !formData.estimatedPrepTime.trim()) {
      showNotification('Nama, harga, HPP, stok, batas stok rendah, dan waktu penyajian harus diisi!'); 
      return;
    }

    const price = parseFloat(formData.price);
    const hpp = parseFloat(formData.hpp);
    const stock = parseInt(formData.stock);
    const lowStockThreshold = parseInt(formData.lowStockThreshold);
    const estimatedPrepTime = parseInt(formData.estimatedPrepTime);
    const promoPrice = formData.promoPrice ? parseFloat(formData.promoPrice) : undefined;
    
    if (isNaN(price) || price <= 0) {
      showNotification('Harga harus berupa angka yang valid!'); 
      return;
    }
    
    if (isNaN(hpp) || hpp < 0) {
      showNotification('HPP harus berupa angka yang valid!'); 
      return;
    }
    
    if (hpp >= price) {
      showNotification('HPP tidak boleh lebih besar atau sama dengan harga jual!'); 
      return;
    }

    if (isNaN(stock) || stock < 0) {
      showNotification('Stok harus berupa angka yang valid!'); 
      return;
    }

    if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
      showNotification('Batas stok rendah harus berupa angka yang valid!'); 
      return;
    }

    if (isNaN(estimatedPrepTime) || estimatedPrepTime <= 0) {
      showNotification('Waktu penyajian harus berupa angka yang valid!'); 
      return;
    }

    if (promoPrice && (isNaN(promoPrice) || promoPrice <= 0 || promoPrice >= price)) {
      showNotification('Harga promo harus berupa angka yang valid dan lebih kecil dari harga normal!'); 
      return;
    }

    // Validasi tambahan untuk memastikan promosi tidak merugikan
    if (promoPrice && promoPrice <= hpp) {
      showNotification('Harga promo tidak boleh lebih kecil atau sama dengan HPP! Ini akan menyebabkan kerugian.'); 
      return;
    }

    // Peringatan jika margin promosi terlalu rendah
    if (promoPrice && calculateMargin(promoPrice, hpp) < 10) {
      const userConfirm = window.confirm(
        `Margin promosi sangat rendah (${calculateMargin(promoPrice, hpp).toFixed(1)}%). ` +
        'Ini berisiko merugikan bisnis. Apakah Anda yakin ingin melanjutkan?'
      );
      if (!userConfirm) return;
    }

    let success = false;
    
    if (editingItem) {
      // Update existing item using API dengan field mapping yang benar
      const updateData = {
        name: formData.name,
        price: price,
        hpp: hpp, // Use hpp instead of cost_price for consistency
        category: formData.category,
        description: formData.description,
        image: formData.image || undefined, // Use image instead of image_url
        allergens: formData.allergens,
        isAvailable: formData.isAvailable,
        stock: stock,
        lowStockThreshold: lowStockThreshold,
        estimatedPrepTime: estimatedPrepTime,
        promoPrice: promoPrice,
        promoDescription: formData.promoDescription || undefined,
        isPromoActive: formData.isPromoActive,
      };
      
      success = await updateMenu(editingItem.id, updateData);
      if (success) {
        showNotification('Item menu berhasil diperbarui!');
      }
    } else {
      // Add new item using API dengan field mapping yang benar
      const newItemData = {
        name: formData.name,
        price: price,
        hpp: hpp, // Use hpp instead of cost_price for consistency
        category: formData.category,
        description: formData.description,
        image: formData.image || undefined, // Use image instead of image_url
        allergens: formData.allergens,
        isAvailable: formData.isAvailable,
        stock: stock,
        lowStockThreshold: lowStockThreshold,
        estimatedPrepTime: estimatedPrepTime,
        promoPrice: promoPrice,
        promoDescription: formData.promoDescription || undefined,
        isPromoActive: formData.isPromoActive,
      };
      
      success = await createMenu(newItemData);
      if (success) {
        showNotification('Item menu baru berhasil ditambahkan!');
      }
    }

    if (success) {
      handleCloseDialog();
    }
  };

  const handleDeleteItem = async () => {
    if (deleteItemId) {
      const success = await deleteMenu(deleteItemId);
      if (success) {
        showNotification('Item menu berhasil dihapus!');
        setOpenDeleteDialog(false); 
        setDeleteItemId(null);
      }
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const success = await toggleMenuAvailability(itemId);
      if (success) {
        showNotification('Status menu berhasil diubah!', 'success');
      } else {
        showNotification('Gagal mengubah status menu!', 'error');
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      showNotification('Terjadi kesalahan saat mengubah status menu!', 'error');
    }
  };

  // ===== RENDER JSX - UI Component =====
  return (
    <Box sx={{ p: 3 }}>
      {/* Loading State */}
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Error Snackbar */}
      {error && (
        <Snackbar 
          open={true} 
          autoHideDuration={6000} 
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
      {/* ===== HEADER SECTION - Judul dan deskripsi halaman ===== */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <RestaurantIcon sx={{ mr: 2, fontSize: 40, verticalAlign: 'middle' }} />
          Manajemen Menu
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Kelola semua item menu restoran Anda dengan mudah. Tambah, edit, atau hapus menu sesuai kebutuhan.
        </Typography>

        {/* ===== SEARCH & FILTER BAR - Pencarian dan filter kategori ===== */}
        <Paper elevation={2} sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3, overflow: 'hidden'
        }}>
          {/* Top Row - Search and Main Actions */}
          <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <TextField
              placeholder="Cari menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ 
                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                sx: { borderRadius: 2 }
              }}
              sx={{ flex: 1, minWidth: 250 }}
              size="small"
            />

            {/* Main Category Filter */}
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Kategori Utama</InputLabel>
              <Select 
                value={categoryFilter} 
                label="Kategori Utama" 
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterListIcon sx={{ fontSize: 18 }} />
                    Semua Kategori
                  </Box>
                </MenuItem>
                <MenuItem value="makanan">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon sx={{ fontSize: 18 }} />
                    Makanan
                  </Box>
                </MenuItem>
                <MenuItem value="minuman">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DrinkIcon sx={{ fontSize: 18 }} />
                    Minuman
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Sort Controls */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Urutkan</InputLabel>
              <Select
                value={sortBy}
                label="Urutkan"
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'margin' | 'hpp' | 'promo')}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="name">Nama A-Z</MenuItem>
                <MenuItem value="price">Harga</MenuItem>
                <MenuItem value="hpp">HPP</MenuItem>
                <MenuItem value="margin">Margin %</MenuItem>
                <MenuItem value="promo">Status Promo</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              size="small"
              sx={{ 
                border: 1, 
                borderColor: 'primary.main',
                borderRadius: 2,
                color: 'primary.main'
              }}
            >
              {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>

            {/* Clear Filters Button */}
            {(categoryFilter !== 'all' || selectedSubCategories.length > 0 || searchQuery || sortBy !== 'name' || sortOrder !== 'asc') && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{ borderRadius: 2 }}
              >
                Reset
              </Button>
            )}

            {/* Add Category Button */}
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenCategoryDialog}
              sx={{ borderRadius: 2 }}
            >
              Kategori
            </Button>
          </Box>

          {/* Sub-Categories Filter Row */}
          {categoryFilter !== 'all' && (
            <Box sx={{ 
              px: 2, pb: 2,
              borderTop: '1px solid rgba(255,255,255,0.3)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  Filter Sub-Kategori {categoryFilter === 'makanan' ? 'Makanan' : 'Minuman'}:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      const allSubCategories = getCategoriesByParent(categoryFilter as 'makanan' | 'minuman').map(cat => cat.id);
                      setSelectedSubCategories(allSubCategories);
                    }}
                    sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                  >
                    Pilih Semua
                  </Button>
                  {selectedSubCategories.length > 0 && (
                    <Button
                      size="small"
                      variant="text"
                      color="warning"
                      onClick={() => setSelectedSubCategories([])}
                      sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                    >
                      Hapus Pilihan
                    </Button>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getCategoriesByParent(categoryFilter as 'makanan' | 'minuman').map((category) => {
                  const menuCount = menuItems.filter(item => item.category === category.id).length;
                  return (
                    <Box key={category.id} sx={{ position: 'relative', display: 'inline-block' }}>
                      <Chip
                        icon={getCategoryIcon(category.id)}
                        label={`${category.name} (${menuCount})`}
                        clickable
                        color={selectedSubCategories.includes(category.id) ? 'primary' : 'default'}
                        variant={selectedSubCategories.includes(category.id) ? 'filled' : 'outlined'}
                        onClick={() => handleSubCategoryToggle(category.id)}
                        sx={{ 
                          borderRadius: 2,
                          '&:hover': { 
                            transform: 'translateY(-1px)',
                            boxShadow: 2 
                          },
                          transition: 'all 0.2s ease',
                          pr: menuCount === 0 ? 5 : 1 // Extra space for delete button when no menus
                        }}
                      />
                      {menuCount === 0 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteCategoryDialog(category.id);
                          }}
                          sx={{
                            position: 'absolute',
                            right: 4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 16,
                            height: 16,
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': { backgroundColor: 'error.dark' }
                          }}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Stats Row */}
          <Box sx={{ 
            px: 2, py: 1.5, 
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Total: ${filteredItems.length}/${menuItems.length}`} 
                color="primary" 
                variant="outlined" 
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip 
                label={`Tersedia: ${filteredItems.filter(item => item.isAvailable).length}`} 
                color="success" 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Tidak Tersedia: ${filteredItems.filter(item => !item.isAvailable).length}`} 
                color="error" 
                variant="outlined" 
                size="small" 
              />
            </Box>
            
            {/* Active Filters Display */}
            {(categoryFilter !== 'all' || selectedSubCategories.length > 0 || sortBy !== 'name' || sortOrder !== 'asc') && (
              <Typography variant="caption" sx={{ 
                color: 'text.secondary', 
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <FilterListIcon sx={{ fontSize: 14 }} />
                {categoryFilter !== 'all' && `Kategori: ${categoryFilter}`}
                {selectedSubCategories.length > 0 && ` • Sub: ${selectedSubCategories.length} dipilih`}
                {(sortBy !== 'name' || sortOrder !== 'asc') && ` • Urut: ${
                  sortBy === 'name' ? 'Nama A-Z' :
                  sortBy === 'price' ? 'Harga' :
                  sortBy === 'hpp' ? 'HPP' :
                  sortBy === 'margin' ? 'Margin %' : 
                  sortBy === 'promo' ? 'Status Promo' : sortBy
                } ${sortOrder === 'asc' ? '↑' : '↓'}`}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      {/* ===== MENU GRID - Grid display semua menu item ===== */}
      <Grid container spacing={3}>
        {filteredItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card elevation={3} sx={{
              height: '100%', display: 'flex', flexDirection: 'column',
              transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6, },
            }}>
              {/* Menu Image - Gambar menu dengan badges */}
              <Box sx={{ position: 'relative' }}>
                <CardMedia component="img" height="200" 
                  image={getImageUrl(item.image)}
                  alt={item.name} sx={{ objectFit: 'cover' }}
                />
                
                {/* Status Badge */}
                <Chip label={item.isAvailable ? 'Tersedia' : 'Habis'} color={item.isAvailable ? 'success' : 'error'}
                  size="small" sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 'bold', }}
                />

                {/* Category Badge */}
                <Chip icon={getCategoryIcon(item.category)}
                  color="primary" size="small" sx={{ position: 'absolute', top: 8, left: 8, }}
                />
              </Box>

              {/* Menu Content - Informasi detail menu */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                
                {/* Pricing Section */}
                <Box sx={{ mb: 1 }}>
                  {item.isPromoActive && item.promoPrice ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h5" color="error" sx={{ fontWeight: 'bold' }}>
                          {formatPrice(item.promoPrice)}
                        </Typography>
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                          {formatPrice(item.price)}
                        </Typography>
                        <Chip label="PROMO" color="error" size="small" />
                      </Box>
                      {item.promoDescription && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', fontStyle: 'italic' }}>
                          {item.promoDescription}
                        </Typography>
                      )}
                      {/* Financial Analysis untuk Promosi */}
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Margin Normal: ${safeToFixed(getMarginPercentage(item))}%`}
                          color="info"
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          label={`Margin Promo: ${safeToFixed(item.promoMarginPercentage || calculateMargin(item.promoPrice, item.hpp))}%`}
                          color={getMarginColor(item.promoMarginPercentage || calculateMargin(item.promoPrice, item.hpp)) as any}
                          size="small"
                        />
                        {item.lossAmount && item.lossAmount > 0 ? (
                          <Chip 
                            label={`Kerugian: ${formatPrice(item.lossAmount)}`}
                            color="error"
                            size="small"
                            variant="filled"
                          />
                        ) : (
                          <Chip 
                            label={`Profit: ${formatPrice(item.promoProfitAmount || (item.promoPrice - item.hpp))}`}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {item.marginReductionAmount && (
                          <Chip 
                            label={`Reduksi: ${formatPrice(item.marginReductionAmount)}`}
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(item.price)}
                      </Typography>
                      <Chip 
                        label={`Margin: ${safeToFixed(getMarginPercentage(item))}%`}
                        color={getMarginColor(getMarginPercentage(item)) as any}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                      <Chip 
                        label={`Keuntungan: ${formatPrice(getProfitAmount(item))}`}
                        color="success"
                        size="small"
                        sx={{ mt: 0.5, ml: 0.5 }}
                      />
                    </Box>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    HPP: {formatPrice(item.hpp)}
                  </Typography>
                </Box>

                {/* Stock and Time Info */}
                <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<InventoryIcon />}
                    label={`Stok: ${item.stock}`}
                    color={getStockColor(item.stock, item.lowStockThreshold)}
                    size="small"
                    variant="outlined"
                  />
                  {isLowStock(item.stock, item.lowStockThreshold) && (
                    <Chip
                      icon={<WarningIcon />}
                      label="Stok Rendah!"
                      color="warning"
                      size="small"
                    />
                  )}
                  <Chip
                    icon={<TimerIcon />}
                    label={formatTime(item.estimatedPrepTime)}
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{
                  mb: 2, display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {item.description}
                </Typography>

                {/* Allergens - Informasi alergen */}
                {item.allergens.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Alergen:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {item.allergens.map((allergen) => (
                        <Chip key={allergen} label={allergen} size="small" color="warning" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>

              {/* Menu Actions - Tombol aksi untuk menu */}
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Tooltip title="Edit Menu">
                  <IconButton color="primary" onClick={() => handleOpenEditDialog(item)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Hapus Menu">
                  <IconButton color="error" onClick={() => handleOpenDeleteDialog(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>

                <Box sx={{ flexGrow: 1 }} />

                <Tooltip title={item.isAvailable ? 'Tandai Habis' : 'Tandai Tersedia'}>
                  <IconButton color={item.isAvailable ? 'success' : 'error'} onClick={() => handleToggleAvailability(item.id)}>
                    {item.isAvailable ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ===== EMPTY STATE - Tampilan saat tidak ada data ===== */}
      {filteredItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary', }}>
          <RestaurantIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" gutterBottom>
            {menuItems.length === 0 ? 'Belum ada menu' : 'Tidak ada menu ditemukan'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {searchQuery || categoryFilter !== 'all' || selectedSubCategories.length > 0
              ? 'Tidak ada menu yang sesuai dengan filter yang dipilih'
              : 'Mulai dengan menambahkan menu pertama Anda'}
          </Typography>
          
          {/* Active Filter Summary */}
          {(searchQuery || categoryFilter !== 'all' || selectedSubCategories.length > 0) && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 2, display: 'inline-block' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Filter Aktif:</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                {searchQuery && (
                  <Typography variant="caption">🔍 Pencarian: "{searchQuery}"</Typography>
                )}
                {categoryFilter !== 'all' && (
                  <Typography variant="caption">📂 Kategori: {categoryFilter}</Typography>
                )}
                {selectedSubCategories.length > 0 && (
                  <Typography variant="caption">🏷️ Sub-kategori: {selectedSubCategories.length} dipilih</Typography>
                )}
              </Box>
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{ mt: 1 }}
              >
                Hapus Semua Filter
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* ===== FLOATING ADD BUTTON - Tombol tambah menu ===== */}
      <Fab color="primary" aria-label="add menu" onClick={handleOpenAddDialog} sx={{
        position: 'fixed', bottom: 24, right: 24,
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        '&:hover': { background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)', },
      }}>
        <AddIcon />
      </Fab>

      {/* ===== ADD/EDIT DIALOG - Modal untuk tambah/edit menu ===== */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh', } }}>
        <DialogTitle sx={{ pb: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CategoryIcon sx={{ mr: 1 }} />
              {editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}
            </Box>
            <IconButton color="inherit" onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Image Upload Section - Area upload gambar */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, border: '2px dashed #ddd', textAlign: 'center', background: '#fafafa', }}>
                {formData.image ? (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Preview Foto Menu
                    </Typography>
                    <img src={getImageUrl(formData.image)} alt="Preview" style={{
                      width: '100%', maxWidth: '300px', height: '200px', objectFit: 'cover',
                      borderRadius: '8px', marginBottom: '16px', border: '2px solid #e0e0e0',
                    }} />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {/* Input file tersembunyi */}
                      <input 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        id="image-upload-replace" 
                        type="file" 
                        onChange={handleImageUpload}
                        disabled={imageLoading}
                      />
                      <label htmlFor="image-upload-replace">
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          component="span" 
                          startIcon={imageLoading ? <CircularProgress size={16} /> : <PhotoIcon />}
                          size="small"
                          disabled={imageLoading}
                        >
                          {imageLoading ? 'Mengunggah...' : 'Ganti Foto'}
                        </Button>
                      </label>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={imageLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
                        size="small"
                        onClick={() => {
                          // Jika sedang edit menu yang sudah ada dan foto dari database
                          if (editingItem && editingItem.image && formData.image === editingItem.image) {
                            handleRemoveMenuImage(editingItem.id, formData.image);
                          } else {
                            // Foto baru yang belum disimpan, hapus dari form saja
                            handleImageDelete(formData.image || '');
                          }
                        }}
                        disabled={imageLoading}
                      >
                        {imageLoading ? 'Menghapus...' : 'Hapus Foto'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <PhotoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Unggah foto menu
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Format: JPG, PNG. Maksimal 5MB
                    </Typography>
                    <input 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      id="image-upload" 
                      type="file" 
                      onChange={handleImageUpload}
                      disabled={imageLoading}
                    />
                    <label htmlFor="image-upload">
                      <Button 
                        variant="contained" 
                        component="span" 
                        startIcon={imageLoading ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
                        disabled={imageLoading}
                        sx={{
                          background: imageLoading 
                            ? 'linear-gradient(45deg, #9E9E9E 30%, #BDBDBD 90%)' 
                            : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          '&:hover': { 
                            background: imageLoading 
                              ? 'linear-gradient(45deg, #9E9E9E 30%, #BDBDBD 90%)'
                              : 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)' 
                          }
                        }}
                      >
                        {imageLoading ? 'Mengunggah...' : 'Pilih Foto'}
                      </Button>
                    </label>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Basic Information - Informasi dasar menu */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nama Menu" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="contoh: Nasi Goreng Spesial" required />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Harga Jual" value={formData.price} onChange={(e) => handleFormChange('price', e.target.value)}
                placeholder="contoh: 25000" type="number" required
                InputProps={{ startAdornment: (<InputAdornment position="start"><MoneyIcon /></InputAdornment>) }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="HPP (Harga Pokok Penjualan)" 
                value={formData.hpp} 
                onChange={(e) => handleFormChange('hpp', e.target.value)}
                placeholder="contoh: 12000" 
                type="number" 
                required
                InputProps={{ startAdornment: (<InputAdornment position="start"><MoneyIcon /></InputAdornment>) }}
                helperText={formData.price && formData.hpp ? 
                  `Margin: ${calculateMargin(parseFloat(formData.price) || 0, parseFloat(formData.hpp) || 0).toFixed(1)}%` : 
                  'Masukkan harga pokok penjualan'
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Jenis Kategori</InputLabel>
                <Select 
                  value={selectedParentCategory} 
                  label="Jenis Kategori" 
                  onChange={(e) => handleParentCategoryChange(e.target.value as 'makanan' | 'minuman')}
                >
                  <MenuItem value="makanan">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RestaurantIcon sx={{ fontSize: 20 }} />
                      Makanan
                    </Box>
                  </MenuItem>
                  <MenuItem value="minuman">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DrinkIcon sx={{ fontSize: 20 }} />
                      Minuman
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori Spesifik</InputLabel>
                <Select value={formData.category} label="Kategori Spesifik" onChange={(e) => handleFormChange('category', e.target.value)}>
                  {getCategoriesByParent(selectedParentCategory).map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCategoryIcon(category.id)}
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel control={
                <Switch checked={formData.isAvailable} onChange={(e) => handleFormChange('isAvailable', e.target.checked)} color="success" />
              } label="Tersedia" />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Deskripsi" value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Deskripsikan menu ini..." multiline rows={3}
              />
            </Grid>

            {/* Stock & Time Information - Informasi stok dan waktu */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Manajemen Stok & Waktu Penyajian
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Jumlah Stok" 
                value={formData.stock} 
                onChange={(e) => handleFormChange('stock', e.target.value)}
                placeholder="contoh: 50" 
                type="number" 
                required
                InputProps={{ startAdornment: (<InputAdornment position="start"><InventoryIcon /></InputAdornment>) }}
                helperText="Jumlah porsi yang tersedia"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Peringatan Stok Rendah" 
                value={formData.lowStockThreshold} 
                onChange={(e) => handleFormChange('lowStockThreshold', e.target.value)}
                placeholder="contoh: 10" 
                type="number" 
                required
                InputProps={{ startAdornment: (<InputAdornment position="start"><WarningIcon /></InputAdornment>) }}
                helperText="Ambang batas untuk notifikasi stok rendah"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Estimasi Waktu Penyajian (menit)" 
                value={formData.estimatedPrepTime} 
                onChange={(e) => handleFormChange('estimatedPrepTime', e.target.value)}
                placeholder="contoh: 15" 
                type="number" 
                required
                InputProps={{ startAdornment: (<InputAdornment position="start"><TimerIcon /></InputAdornment>) }}
                helperText="Perkiraan waktu memasak dalam menit"
              />
            </Grid>

            {/* Promotion Section - Informasi promosi */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                <LocalOfferIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Promosi & Diskon
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel control={
                <Switch 
                  checked={formData.isPromoActive} 
                  onChange={(e) => handleFormChange('isPromoActive', e.target.checked)} 
                  color="secondary" 
                />
              } label="Aktifkan Promosi" />
            </Grid>

            {formData.isPromoActive && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Harga Promosi" 
                    value={formData.promoPrice} 
                    onChange={(e) => handleFormChange('promoPrice', e.target.value)}
                    placeholder="contoh: 20000" 
                    type="number"
                    InputProps={{ startAdornment: (<InputAdornment position="start"><LocalOfferIcon /></InputAdornment>) }}
                    helperText={formData.price && formData.promoPrice ? 
                      `Diskon: ${(((parseFloat(formData.price) - parseFloat(formData.promoPrice)) / parseFloat(formData.price)) * 100).toFixed(1)}%` : 
                      'Harga setelah diskon'
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Deskripsi Promosi" 
                    value={formData.promoDescription} 
                    onChange={(e) => handleFormChange('promoDescription', e.target.value)}
                    placeholder="contoh: Diskon Spesial Hari Senin!" 
                    helperText="Keterangan promo yang akan ditampilkan"
                  />
                </Grid>

                {/* Financial Impact Analysis */}
                {formData.price && formData.hpp && formData.promoPrice && (
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        📊 Analisis Dampak Keuangan (Data akan disimpan ke database)
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Margin Normal</Typography>
                            <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                              {calculateMargin(parseFloat(formData.price), parseFloat(formData.hpp)).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Keuntungan: {formatPrice(parseFloat(formData.price) - parseFloat(formData.hpp))}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Margin Promo</Typography>
                            <Typography variant="h6" color={
                              calculateMargin(parseFloat(formData.promoPrice), parseFloat(formData.hpp)) >= 30 ? 'warning.main' : 'error.main'
                            } sx={{ fontWeight: 'bold' }}>
                              {calculateMargin(parseFloat(formData.promoPrice), parseFloat(formData.hpp)).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Keuntungan: {formatPrice(parseFloat(formData.promoPrice) - parseFloat(formData.hpp))}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Pengurangan Margin</Typography>
                            <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                              -{(calculateMargin(parseFloat(formData.price), parseFloat(formData.hpp)) - 
                                 calculateMargin(parseFloat(formData.promoPrice), parseFloat(formData.hpp))).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {parseFloat(formData.promoPrice) < parseFloat(formData.hpp) ? 'Kerugian per Unit' : 'Kehilangan Profit per Unit'}
                            </Typography>
                            <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                              {parseFloat(formData.promoPrice) < parseFloat(formData.hpp) 
                                ? formatPrice(parseFloat(formData.hpp) - parseFloat(formData.promoPrice))
                                : formatPrice(parseFloat(formData.price) - parseFloat(formData.promoPrice))
                              }
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Alert untuk kerugian */}
                      {parseFloat(formData.promoPrice) < parseFloat(formData.hpp) && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          🚨 <strong>BAHAYA:</strong> Harga promosi lebih rendah dari HPP! Ini akan menyebabkan kerugian sebesar {formatPrice(parseFloat(formData.hpp) - parseFloat(formData.promoPrice))} per unit.
                        </Alert>
                      )}

                      {/* Warning jika margin terlalu rendah tapi masih untung */}
                      {parseFloat(formData.promoPrice) >= parseFloat(formData.hpp) && calculateMargin(parseFloat(formData.promoPrice), parseFloat(formData.hpp)) < 20 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          ⚠️ <strong>Peringatan:</strong> Margin promosi sangat rendah ({calculateMargin(parseFloat(formData.promoPrice), parseFloat(formData.hpp)).toFixed(1)}%). Pastikan promosi ini strategis untuk menarik pelanggan.
                        </Alert>
                      )}

                      {/* Info jika masih menguntungkan */}
                      {parseFloat(formData.promoPrice) >= parseFloat(formData.hpp) && calculateMargin(parseFloat(formData.promoPrice), parseFloat(formData.hpp)) >= 20 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          ✅ <strong>Baik:</strong> Margin promosi masih dalam rentang yang sehat untuk bisnis ({calculateMargin(parseFloat(formData.promoPrice), parseFloat(formData.hpp)).toFixed(1)}%).
                        </Alert>
                      )}

                      {/* Business Impact Calculator */}
                      <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          💡 Simulasi Dampak Bisnis:
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • Jika terjual 10 porsi: Kehilangan profit <strong>{formatPrice((parseFloat(formData.price) - parseFloat(formData.promoPrice)) * 10)}</strong><br/>
                          • Jika terjual 50 porsi: Kehilangan profit <strong>{formatPrice((parseFloat(formData.price) - parseFloat(formData.promoPrice)) * 50)}</strong><br/>
                          • Break-even jika peningkatan penjualan: <strong>{Math.ceil((parseFloat(formData.price) - parseFloat(formData.promoPrice)) / (parseFloat(formData.promoPrice) - parseFloat(formData.hpp)))} porsi ekstra</strong>
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </>
            )}

            {/* Allergens Section - Pilihan alergen */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Informasi Alergen</Typography>
              
              {/* Add Custom Allergen Input */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Tambah alergen baru..."
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomAllergen()}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={addCustomAllergen}
                  startIcon={<AddIcon />}
                >
                  Tambah
                </Button>
              </Box>

              {/* Allergen Checkboxes */}
              <FormGroup row>
                {getAllergenOptions().map((allergen) => (
                  <Box key={allergen} sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <FormControlLabel 
                      control={
                        <Checkbox 
                          checked={formData.allergens.includes(allergen)}
                          onChange={(e) => handleAllergenChange(allergen, e.target.checked)} 
                        />
                      } 
                      label={allergen.charAt(0).toUpperCase() + allergen.slice(1)} 
                    />
                    {isCustomAllergen(allergen) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeCustomAllergen(allergen)}
                        sx={{ ml: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, background: '#f5f5f5' }}>
          <Button onClick={handleCloseDialog} color="inherit">Batal</Button>
          <Button onClick={handleSaveItem} variant="contained" sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': { background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)', },
          }}>
            {editingItem ? 'Perbarui' : 'Tambah'} Menu
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG - Modal konfirmasi hapus ===== */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1 }} />Konfirmasi Hapus
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Batal</Button>
          <Button onClick={handleDeleteItem} color="error" variant="contained">Hapus</Button>
        </DialogActions>
      </Dialog>

      {/* ===== ADD CATEGORY DIALOG - Modal tambah kategori baru ===== */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'primary.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon sx={{ mr: 1 }} />Tambah Kategori Baru
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Category Name */}
            <TextField
              label="Nama Kategori"
              value={categoryFormData.name}
              onChange={(e) => handleCategoryFormChange('name', e.target.value)}
              fullWidth
              required
              placeholder="Contoh: Dessert, Pasta, Appetizer"
            />

            {/* Parent Category Selection */}
            <FormControl fullWidth required>
              <InputLabel>Masukkan ke Kategori</InputLabel>
              <Select
                value={categoryFormData.parentCategory}
                label="Masukkan ke Kategori"
                onChange={(e) => handleCategoryFormChange('parentCategory', e.target.value)}
              >
                <MenuItem value="makanan">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon sx={{ fontSize: 20 }} />
                    Makanan
                  </Box>
                </MenuItem>
                <MenuItem value="minuman">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DrinkIcon sx={{ fontSize: 20 }} />
                    Minuman
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Icon Selection */}
            <FormControl fullWidth>
              <InputLabel>Icon Kategori</InputLabel>
              <Select
                value={categoryFormData.icon}
                label="Icon Kategori"
                onChange={(e) => handleCategoryFormChange('icon', e.target.value)}
              >
                {CATEGORY_ICONS.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  return (
                    <MenuItem key={iconOption.value} value={iconOption.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconComponent sx={{ fontSize: 20 }} />
                        {iconOption.label}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog} color="inherit">
            Batal
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Simpan Kategori
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DELETE CATEGORY CONFIRMATION DIALOG - Modal konfirmasi hapus kategori ===== */}
      <Dialog open={openDeleteCategoryDialog} onClose={handleCloseDeleteCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1 }} />Konfirmasi Hapus Kategori
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus kategori ini? 
            Kategori hanya bisa dihapus jika tidak ada menu yang menggunakannya.
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteCategoryDialog} color="inherit">Batal</Button>
          <Button onClick={handleDeleteCategory} color="error" variant="contained">Hapus</Button>
        </DialogActions>
      </Dialog>

      {/* ===== NOTIFICATION SNACKBAR - Notifikasi sukses/error ===== */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuPage;
