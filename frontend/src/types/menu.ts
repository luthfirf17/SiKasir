export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category: MenuCategory;
  image?: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens: string[];
  nutritionInfo?: NutritionInfo;
  variants?: MenuVariant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  parentId?: string;
  children?: MenuCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuVariant {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface MenuFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: File;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  nutritionInfo?: NutritionInfo;
  variants?: MenuVariant[];
  tags: string[];
}
