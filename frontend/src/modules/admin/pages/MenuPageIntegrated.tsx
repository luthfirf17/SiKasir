/**
 * MenuPageIntegrated.tsx
 * 
 * DESKRIPSI SINGKAT:
 * - Halaman admin untuk manajemen menu restoran dengan CRUD operations
 * - Terintegrasi dengan backend API dan database
 * - Fitur: tambah/edit/hapus menu, upload foto, filter kategori, pencarian
 * - UI responsive dengan Material-UI components dan grid layout
 * - Real-time sinkronisasi dengan database
 * - Validasi form, notifikasi success/error, dan konfirmasi delete
 * - Format harga Rupiah, status ketersediaan, dan informasi alergen
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem as MuiMenuItem, FormControlLabel,
  Switch, Checkbox, FormGroup, IconButton, Chip, Paper, Snackbar, Alert,
  Tooltip, InputAdornment, Divider, CircularProgress, LinearProgress
} from '@mui/material';

// Import Material-UI Icons
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Photo as PhotoIcon,
  Restaurant as RestaurantIcon, LocalDrink as DrinkIcon, Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon, Search as SearchIcon, FilterList as FilterListIcon,
  Category as CategoryIcon, Close as CloseIcon, Save as SaveIcon,
  AttachMoney as MoneyIcon, Inventory as InventoryIcon, Timer as TimerIcon,
  Warning as WarningIcon, LocalOffer as LocalOfferIcon, Clear as ClearIcon,
  ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon,
  // Category Icons
  Cake as CakeIcon, LocalPizza as PizzaIcon, Fastfood as FastfoodIcon,
  Coffee as CoffeeIcon, Icecream as IcecreamIcon, LocalBar as LocalBarIcon
} from '@mui/icons-material';

// Import custom hooks and services
import useMenuData from '../../../hooks/useMenuData';
import { MenuItem, MenuCategory } from '../../../utils/menuDataConverter';

// ===================== INTERFACES =====================
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

// Opsi alergen yang tersedia
const ALLERGEN_OPTIONS = [
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
const MenuPageIntegrated: React.FC = () => {
  // ===== CUSTOM HOOKS - Data management dengan API =====
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
    setError
  } = useMenuData();

  // ===== STATE MANAGEMENT - UI state =====
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'margin' | 'hpp' | 'created' | 'promo'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form state - Data untuk add/edit menu
  const [formData, setFormData] = useState<MenuFormData>({
    name: '', price: '', hpp: '', category: '', description: '',
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

  const calculateMargin = (price: number, hpp: number): number => {
    if (price <= 0 || hpp < 0) return 0;
    return ((price - hpp) / price) * 100;
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
      name: '', price: '', hpp: '', category: categories[0]?.id || '', description: '',
      image: '', allergens: [], isAvailable: true,
      stock: '50', lowStockThreshold: '10', estimatedPrepTime: '15',
      promoPrice: '', promoDescription: '', isPromoActive: false,
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', icon: 'RestaurantIcon', parentCategory: 'makanan' });
  };

  const showNotification = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      showNotification(error);
      setError(null);
    }
  }, [error, setError]);

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
      showNotification('Nama kategori harus diisi!'); 
      return;
    }

    const success = await createCategory({
      name: categoryFormData.name,
      description: '',
      icon: categoryFormData.icon,
      parentCategory: categoryFormData.parentCategory,
      id: '', // Will be generated by backend
      createdAt: new Date()
    });

    if (success) {
      showNotification(`Kategori "${categoryFormData.name}" berhasil ditambahkan!`);
      handleCloseCategoryDialog();
    }
  };

  // Get categories by parent
  const getCategoriesByParent = (parent: 'makanan' | 'minuman') => {
    return categories.filter(cat => cat.parentCategory === parent);
  };

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
          // Sort by promo status: active promos first (desc) or last (asc)
          const promoA = a.isPromoActive ? 1 : 0;
          const promoB = b.isPromoActive ? 1 : 0;
          return (promoA - promoB) * multiplier;
        case 'created':
          return a.createdAt.getTime() - b.createdAt.getTime() * multiplier;
        default:
          return 0;
      }
    });

    setFilteredItems(sorted);
  }, [menuItems, searchQuery, categoryFilter, selectedSubCategories, categories, sortBy, sortOrder]);

  // Refetch data when filters change (for backend filtering)
  useEffect(() => {
    const filters: any = {};
    
    if (searchQuery) filters.search = searchQuery;
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    if (sortBy !== 'name' || sortOrder !== 'asc') {
      filters.sortBy = sortBy;
      filters.sortOrder = sortOrder;
    }

    fetchMenus(filters);
  }, [searchQuery, categoryFilter, sortBy, sortOrder, fetchMenus]);

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
  const handleSort = (field: 'name' | 'price' | 'margin' | 'hpp' | 'created' | 'promo') => {
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
      name: item.name, 
      price: item.price.toString(), 
      hpp: item.hpp.toString(), 
      category: item.category,
      description: item.description, 
      image: item.image || '', 
      allergens: item.allergens,
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
    setOpenDialog(false); 
    setEditingItem(null); 
    resetForm();
  };

  const handleOpenDeleteDialog = (itemId: string) => {
    setDeleteItemId(itemId); 
    setOpenDeleteDialog(true);
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

  // Upload foto (simulasi untuk demo)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
      showNotification('Foto berhasil diunggah!');
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

    // Prepare menu data
    const menuData: Partial<MenuItem> = {
      name: formData.name,
      price: price,
      hpp: hpp,
      category: formData.category,
      description: formData.description,
      image: formData.image || undefined,
      allergens: formData.allergens,
      isAvailable: formData.isAvailable,
      stock: stock,
      lowStockThreshold: lowStockThreshold,
      estimatedPrepTime: estimatedPrepTime,
      promoPrice: promoPrice,
      promoDescription: formData.promoDescription || undefined,
      isPromoActive: formData.isPromoActive,
    };

    let success = false;
    if (editingItem) {
      // Update existing item
      success = await updateMenu(editingItem.id, menuData);
      if (success) {
        showNotification('Item menu berhasil diperbarui!');
      }
    } else {
      // Add new item
      success = await createMenu(menuData);
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
    const success = await toggleMenuAvailability(itemId);
    if (success) {
      showNotification('Status menu berhasil diubah!');
    }
  };

  // ===== RENDER JSX - UI Component =====
  return (
    <Box sx={{ p: 3 }}>
      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* ===== HEADER SECTION - Judul dan deskripsi halaman ===== */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <RestaurantIcon sx={{ mr: 2, fontSize: 40, verticalAlign: 'middle' }} />
          Manajemen Menu
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Kelola semua item menu restoran Anda dengan mudah. Tambah, edit, atau hapus menu sesuai kebutuhan.
          Data tersinkronisasi secara real-time dengan database.
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
              disabled={loading}
            />

            {/* Main Category Filter */}
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Kategori Utama</InputLabel>
              <Select 
                value={categoryFilter} 
                label="Kategori Utama" 
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                sx={{ borderRadius: 2 }}
                disabled={loading}
              >
                <MuiMenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterListIcon sx={{ fontSize: 18 }} />
                    Semua Kategori
                  </Box>
                </MuiMenuItem>
                <MuiMenuItem value="makanan">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon sx={{ fontSize: 18 }} />
                    Makanan
                  </Box>
                </MuiMenuItem>
                <MuiMenuItem value="minuman">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DrinkIcon sx={{ fontSize: 18 }} />
                    Minuman
                  </Box>
                </MuiMenuItem>
              </Select>
            </FormControl>

            {/* Sort Controls */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Urutkan</InputLabel>
              <Select
                value={sortBy}
                label="Urutkan"
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'margin' | 'hpp' | 'created' | 'promo')}
                sx={{ borderRadius: 2 }}
                disabled={loading}
              >
                <MuiMenuItem value="name">Nama A-Z</MuiMenuItem>
                <MuiMenuItem value="price">Harga</MuiMenuItem>
                <MuiMenuItem value="hpp">HPP</MuiMenuItem>
                <MuiMenuItem value="margin">Margin</MuiMenuItem>
                <MuiMenuItem value="promo">Promo</MuiMenuItem>
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
              disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
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
                    disabled={loading}
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
                      disabled={loading}
                    >
                      Hapus Pilihan
                    </Button>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getCategoriesByParent(categoryFilter as 'makanan' | 'minuman').map((category) => (
                  <Chip
                    key={category.id}
                    icon={getCategoryIcon(category.id)}
                    label={`${category.name} (${menuItems.filter(item => item.category === category.id).length})`}
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
                      transition: 'all 0.2s ease'
                    }}
                    disabled={loading}
                  />
                ))}
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
                  sortBy === 'name' ? 'Nama' :
                  sortBy === 'price' ? 'Harga' :
                  sortBy === 'hpp' ? 'HPP' :
                  sortBy === 'margin' ? 'Margin' : 
                  sortBy === 'promo' ? 'Promo' : sortBy
                } ${sortOrder === 'asc' ? '↑' : '↓'}`}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      {/* ===== MENU GRID - Grid display semua menu item ===== */}
      {loading && menuItems.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card elevation={3} sx={{
                height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'all 0.3s ease', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                opacity: loading ? 0.7 : 1,
              }}>
                {/* Menu Image - Gambar menu dengan badges */}
                <Box sx={{ position: 'relative' }}>
                  <CardMedia component="img" height="200" 
                    image={item.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={item.name} sx={{ objectFit: 'cover' }}
                  />
                  
                  {/* Status Badge */}
                  <Chip label={item.isAvailable ? 'Tersedia' : 'Habis'} color={item.isAvailable ? 'success' : 'error'}
                    size="small" sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 'bold', }}
                  />

                  {/* Category Badge */}
                  <Chip icon={getCategoryIcon(item.category)}
                    label={getCategoryName(item.category)}
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
                          <Typography variant="h5" color="error" sx={{ fontWeight: 'bold', textDecoration: 'line-through' }}>
                            {formatPrice(item.price)}
                          </Typography>
                          <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                            {formatPrice(item.promoPrice)}
                          </Typography>
                        </Box>
                        <Chip label="PROMO" color="error" size="small" />
                        {item.promoDescription && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', fontStyle: 'italic' }}>
                            {item.promoDescription}
                          </Typography>
                        )}
                        {/* Margin Analysis untuk Promosi */}
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`Margin Normal: ${calculateMargin(item.price, item.hpp).toFixed(1)}%`}
                            color="info"
                            size="small"
                            variant="outlined"
                          />
                          <Chip 
                            label={`Margin Promo: ${calculateMargin(item.promoPrice, item.hpp).toFixed(1)}%`}
                            color={getMarginColor(calculateMargin(item.promoPrice, item.hpp)) as any}
                            size="small"
                          />
                          <Chip 
                            label={`Rugi: ${formatPrice(item.price - item.promoPrice)}`}
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                          {formatPrice(item.price)}
                        </Typography>
                        <Chip 
                          label={`Margin: ${calculateMargin(item.price, item.hpp).toFixed(1)}%`}
                          color={getMarginColor(calculateMargin(item.price, item.hpp)) as any}
                          size="small"
                          sx={{ mt: 0.5 }}
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
                        {item.allergens.map((allergen: string) => (
                          <Chip key={allergen} label={allergen} size="small" variant="outlined" color="warning" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                {/* Menu Actions - Tombol aksi untuk menu */}
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Tooltip title="Edit Menu">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenEditDialog(item)} 
                      sx={{ mr: 1 }}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Hapus Menu">
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteDialog(item.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ flexGrow: 1 }} />

                  <Tooltip title={item.isAvailable ? 'Tandai Habis' : 'Tandai Tersedia'}>
                    <IconButton 
                      color={item.isAvailable ? 'success' : 'error'} 
                      onClick={() => handleToggleAvailability(item.id)}
                      disabled={loading}
                    >
                      {item.isAvailable ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ===== EMPTY STATE - Tampilan saat tidak ada data ===== */}
      {!loading && filteredItems.length === 0 && (
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
      <Fab 
        color="primary" 
        aria-label="add menu" 
        onClick={handleOpenAddDialog} 
        sx={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          '&:hover': { background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)', },
        }}
        disabled={loading}
      >
        <AddIcon />
      </Fab>

      {/* ===== ADD/EDIT MENU DIALOG - Dialog untuk tambah/edit menu ===== */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <RestaurantIcon />
          {editingItem ? `Edit Menu: ${editingItem.name}` : 'Tambah Menu Baru'}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RestaurantIcon />
                Informasi Dasar
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Menu Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nama Menu"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
                placeholder="Contoh: Nasi Goreng Spesial"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><RestaurantIcon /></InputAdornment>
                }}
              />
            </Grid>

            {/* Parent Category Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Jenis Menu</InputLabel>
                <Select
                  value={selectedParentCategory}
                  label="Jenis Menu"
                  onChange={(e) => handleParentCategoryChange(e.target.value as 'makanan' | 'minuman')}
                >
                  <MuiMenuItem value="makanan">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RestaurantIcon />
                      Makanan
                    </Box>
                  </MuiMenuItem>
                  <MuiMenuItem value="minuman">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DrinkIcon />
                      Minuman
                    </Box>
                  </MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Category Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={formData.category}
                  label="Kategori"
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  {getCategoriesByParent(selectedParentCategory).map((category) => (
                    <MuiMenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCategoryIcon(category.id)}
                        {category.name}
                      </Box>
                    </MuiMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Deskripsi"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={2}
                placeholder="Deskripsi menu yang menarik..."
              />
            </Grid>

            {/* Pricing Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon />
                Harga & Keuntungan
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Price */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Harga Jual"
                value={formData.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>
                }}
                placeholder="25000"
              />
            </Grid>

            {/* HPP */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="HPP (Harga Pokok Penjualan)"
                value={formData.hpp}
                onChange={(e) => handleFormChange('hpp', e.target.value)}
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>
                }}
                placeholder="15000"
              />
            </Grid>

            {/* Margin Display */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Margin Keuntungan</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {formData.price && formData.hpp ? 
                      `${calculateMargin(parseFloat(formData.price) || 0, parseFloat(formData.hpp) || 0).toFixed(1)}%` 
                      : '0%'
                    }
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Keuntungan: {formData.price && formData.hpp ? 
                      formatPrice((parseFloat(formData.price) || 0) - (parseFloat(formData.hpp) || 0))
                      : 'Rp 0'
                    }
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Inventory Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon />
                Stok & Operasional
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Stock */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stok Tersedia"
                value={formData.stock}
                onChange={(e) => handleFormChange('stock', e.target.value)}
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><InventoryIcon /></InputAdornment>
                }}
                placeholder="50"
              />
            </Grid>

            {/* Low Stock Threshold */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Batas Stok Rendah"
                value={formData.lowStockThreshold}
                onChange={(e) => handleFormChange('lowStockThreshold', e.target.value)}
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><WarningIcon /></InputAdornment>
                }}
                placeholder="10"
              />
            </Grid>

            {/* Prep Time */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Waktu Persiapan (menit)"
                value={formData.estimatedPrepTime}
                onChange={(e) => handleFormChange('estimatedPrepTime', e.target.value)}
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><TimerIcon /></InputAdornment>
                }}
                placeholder="15"
              />
            </Grid>

            {/* Promo Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon />
                Promosi (Opsional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Promo Active Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPromoActive}
                    onChange={(e) => handleFormChange('isPromoActive', e.target.checked)}
                    color="primary"
                  />
                }
                label="Aktifkan Promosi"
              />
            </Grid>

            {formData.isPromoActive && (
              <>
                {/* Promo Price */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Harga Promo"
                    value={formData.promoPrice}
                    onChange={(e) => handleFormChange('promoPrice', e.target.value)}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Rp</InputAdornment>
                    }}
                    placeholder="20000"
                  />
                </Grid>

                {/* Promo Description */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Deskripsi Promo"
                    value={formData.promoDescription}
                    onChange={(e) => handleFormChange('promoDescription', e.target.value)}
                    placeholder="Diskon spesial hari ini!"
                  />
                </Grid>

                {/* Promo Analysis */}
                {formData.promoPrice && formData.price && formData.hpp && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Analisis Promosi:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption">
                          Margin Normal: {calculateMargin(parseFloat(formData.price), parseFloat(formData.hpp)).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption">
                          Margin Promo: {calculateMargin(parseFloat(formData.promoPrice), parseFloat(formData.hpp)).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption">
                          Pengurangan Keuntungan: {formatPrice(parseFloat(formData.price) - parseFloat(formData.promoPrice))}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </>
            )}

            {/* Allergens */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Informasi Alergen
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormGroup row>
                {ALLERGEN_OPTIONS.map((allergen) => (
                  <FormControlLabel
                    key={allergen}
                    control={
                      <Checkbox
                        checked={formData.allergens.includes(allergen)}
                        onChange={(e) => handleAllergenChange(allergen, e.target.checked)}
                        size="small"
                      />
                    }
                    label={allergen}
                    sx={{ minWidth: 120 }}
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoIcon />
                Foto Menu
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Pilih Foto
                  </Button>
                </label>
                {formData.image && (
                  <Chip
                    label="Foto sudah dipilih"
                    onDelete={() => setFormData(prev => ({ ...prev, image: '' }))}
                    color="success"
                    icon={<PhotoIcon />}
                  />
                )}
              </Box>
            </Grid>

            {/* Availability */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(e) => handleFormChange('isAvailable', e.target.checked)}
                    color="success"
                  />
                }
                label="Menu Tersedia"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSaveItem} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
            }}
            disabled={loading}
          >
            {editingItem ? 'Update Menu' : 'Simpan Menu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG - Dialog konfirmasi hapus ===== */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon />
          Konfirmasi Hapus Menu
        </DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Batal
          </Button>
          <Button 
            onClick={handleDeleteItem} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
            disabled={loading}
          >
            Hapus Menu
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== ADD CATEGORY DIALOG - Dialog untuk tambah kategori ===== */}
      <Dialog 
        open={openCategoryDialog} 
        onClose={handleCloseCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CategoryIcon />
          Tambah Kategori Baru
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Kategori"
                value={categoryFormData.name}
                onChange={(e) => handleCategoryFormChange('name', e.target.value)}
                required
                placeholder="Contoh: Pizza & Pasta"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Jenis Kategori</InputLabel>
                <Select
                  value={categoryFormData.parentCategory}
                  label="Jenis Kategori"
                  onChange={(e) => handleCategoryFormChange('parentCategory', e.target.value)}
                >
                  <MuiMenuItem value="makanan">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RestaurantIcon />
                      Makanan
                    </Box>
                  </MuiMenuItem>
                  <MuiMenuItem value="minuman">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DrinkIcon />
                      Minuman
                    </Box>
                  </MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select
                  value={categoryFormData.icon}
                  label="Icon"
                  onChange={(e) => handleCategoryFormChange('icon', e.target.value)}
                >
                  {CATEGORY_ICONS.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <MuiMenuItem key={iconOption.value} value={iconOption.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconComponent />
                          {iconOption.label}
                        </Box>
                      </MuiMenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseCategoryDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
            }}
            disabled={loading}
          >
            Simpan Kategori
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== NOTIFICATION SNACKBAR - Notifikasi sukses/error ===== */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuPageIntegrated;
