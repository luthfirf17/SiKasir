import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem, MenuCategory, MenuFormData } from '../../types/menu';
import { LoadingState, QueryParams, PaginationInfo } from '../../types/common';

interface MenuState extends LoadingState {
  items: MenuItem[];
  categories: MenuCategory[];
  selectedItem: MenuItem | null;
  selectedCategory: MenuCategory | null;
  pagination: PaginationInfo | null;
  filters: {
    search: string;
    categoryId: string;
    isAvailable: boolean | null;
    isPopular: boolean | null;
  };
}

const initialState: MenuState = {
  items: [],
  categories: [],
  selectedItem: null,
  selectedCategory: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    categoryId: '',
    isAvailable: null,
    isPopular: null,
  },
};

// Async thunks would go here
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchItems',
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      // Implementation would call menuService.getItems(params)
      return { items: [], pagination: null };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu items');
    }
  }
);

export const fetchMenuCategories = createAsyncThunk(
  'menu/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      // Implementation would call menuService.getCategories()
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<MenuItem | null>) => {
      state.selectedItem = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<MenuCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<MenuState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMenuCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { setSelectedItem, setSelectedCategory, updateFilters, clearError } = menuSlice.actions;
export default menuSlice.reducer;
