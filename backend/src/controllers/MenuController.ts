import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Menu, MenuCategory } from '../models/Menu';
import { MenuCategory as CategoryEntity } from '../models/MenuCategory';
import fs from 'fs';
import path from 'path';

export class MenuController {
  private menuRepository: Repository<Menu>;
  private categoryRepository: Repository<CategoryEntity>;

  constructor() {
    this.menuRepository = AppDataSource.getRepository(Menu);
    this.categoryRepository = AppDataSource.getRepository(CategoryEntity);
  }

  // Helper function to calculate financial data
  private calculateFinancialData(price: number, costPrice?: number, promoPrice?: number, isPromoActive: boolean = false) {
    const financialData: any = {};

    if (costPrice !== undefined && costPrice !== null) {
      // Calculate regular profit
      financialData.profit_amount = price - costPrice;
      financialData.profit_margin_percentage = ((price - costPrice) / price) * 100;

      // Calculate promo financial data if promo is active
      if (isPromoActive && promoPrice !== undefined && promoPrice !== null) {
        financialData.promo_profit_amount = promoPrice - costPrice;
        financialData.promo_margin_percentage = ((promoPrice - costPrice) / promoPrice) * 100;
        financialData.margin_reduction_amount = (price - costPrice) - (promoPrice - costPrice);
        
        // Calculate loss if promo price is less than cost price
        if (promoPrice < costPrice) {
          financialData.loss_amount = costPrice - promoPrice;
        } else {
          financialData.loss_amount = null;
        }
      } else {
        // Reset promo data if promo is not active
        financialData.promo_profit_amount = null;
        financialData.promo_margin_percentage = null;
        financialData.margin_reduction_amount = null;
        financialData.loss_amount = null;
      }
    } else {
      // If no cost price, reset all financial data
      financialData.profit_amount = null;
      financialData.profit_margin_percentage = null;
      financialData.promo_profit_amount = null;
      financialData.promo_margin_percentage = null;
      financialData.margin_reduction_amount = null;
      financialData.loss_amount = null;
    }

    return financialData;
  }

  // Get all menus with optional filters
  public getAllMenus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        category, 
        available, 
        search, 
        sortBy = 'name', 
        sortOrder = 'asc',
        page = 1,
        limit = 50 
      } = req.query;

      const queryBuilder = this.menuRepository.createQueryBuilder('menu');

      // Apply filters
      if (category && category !== 'all') {
        queryBuilder.andWhere('menu.category = :category', { category });
      }

      if (available !== undefined) {
        queryBuilder.andWhere('menu.is_available = :available', { 
          available: available === 'true' 
        });
      }

      if (search) {
        queryBuilder.andWhere(
          '(LOWER(menu.name) LIKE LOWER(:search) OR LOWER(menu.description) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }

      // Apply sorting
      const validSortFields = ['name', 'price', 'cost_price', 'created_at', 'prep_time_minutes'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'name';
      const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
      
      queryBuilder.orderBy(`menu.${sortField}`, order);

      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip).take(Number(limit));

      const [menus, total] = await queryBuilder.getManyAndCount();

      res.json({
        data: menus,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching menus:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get menu by ID
  public getMenuById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const menu = await this.menuRepository.findOne({ where: { menu_id: id } });

      if (!menu) {
        res.status(404).json({ message: 'Menu not found' });
        return;
      }

      res.json({ data: menu });
    } catch (error) {
      console.error('Error fetching menu by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Create new menu
  public createMenu = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        description,
        price,
        cost_price,
        category,
        is_available = true,
        prep_time_minutes,
        allergens,
        image_url,
        is_vegetarian = false,
        is_vegan = false,
        is_gluten_free = false,
        spice_level,
        ingredients,
        stock = 0,
        low_stock_threshold = 10,
        promo_price,
        promo_description,
        is_promo_active = false
      } = req.body;

      // Validation
      if (!name || !price || !category) {
        res.status(400).json({ 
          message: 'Name, price, and category are required' 
        });
        return;
      }

      if (cost_price && cost_price >= price) {
        res.status(400).json({ 
          message: 'Cost price must be less than selling price' 
        });
        return;
      }

      // Check if menu with same name already exists
      const existingMenu = await this.menuRepository.findOne({ 
        where: { name } 
      });

      if (existingMenu) {
        res.status(400).json({ 
          message: 'Menu with this name already exists' 
        });
        return;
      }

      // Calculate financial data
      const priceNum = Number(price);
      const costPriceNum = cost_price ? Number(cost_price) : undefined;
      const promoPriceNum = promo_price ? Number(promo_price) : undefined;
      const financialData = this.calculateFinancialData(priceNum, costPriceNum, promoPriceNum, is_promo_active);

      const menu = this.menuRepository.create({
        name,
        description,
        price: priceNum,
        cost_price: costPriceNum,
        category,
        is_available,
        prep_time_minutes: prep_time_minutes ? Number(prep_time_minutes) : undefined,
        allergens,
        image_url,
        is_vegetarian,
        is_vegan,
        is_gluten_free,
        spice_level,
        ingredients,
        stock: Number(stock),
        low_stock_threshold: Number(low_stock_threshold),
        promo_price: promoPriceNum,
        promo_description,
        is_promo_active,
        // Add financial data
        ...financialData
      });

      const savedMenu = await this.menuRepository.save(menu);
      res.status(201).json({ 
        message: 'Menu created successfully', 
        data: savedMenu 
      });
    } catch (error) {
      console.error('Error creating menu:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Update menu
  public updateMenu = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const menu = await this.menuRepository.findOne({ 
        where: { menu_id: id } 
      });

      if (!menu) {
        res.status(404).json({ message: 'Menu not found' });
        return;
      }

      // Validation for price and cost_price
      const newPrice = updates.price ? Number(updates.price) : menu.price;
      const newCostPrice = updates.cost_price !== undefined ? Number(updates.cost_price) : menu.cost_price;

      if (newCostPrice && newCostPrice >= newPrice) {
        res.status(400).json({ 
          message: 'Cost price must be less than selling price' 
        });
        return;
      }

      // Check if new name conflicts with existing menu
      if (updates.name && updates.name !== menu.name) {
        const existingMenu = await this.menuRepository.findOne({ 
          where: { name: updates.name } 
        });

        if (existingMenu) {
          res.status(400).json({ 
            message: 'Menu with this name already exists' 
          });
          return;
        }
      }

      // Handle image_url update - delete old image if changing
      if (updates.image_url !== undefined) {
        const oldImageUrl = menu.image_url;
        const newImageUrl = updates.image_url;
        
        // If image is being changed or removed, delete the old one
        if (oldImageUrl && oldImageUrl !== newImageUrl) {
          try {
            const filePath = path.join(process.cwd(), oldImageUrl);
            
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Old image file deleted: ${filePath}`);
            }
          } catch (imageError) {
            console.warn('Failed to delete old image file:', imageError);
            // Continue with update even if image deletion fails
          }
        }
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          (menu as any)[key] = updates[key];
        }
      });

      // Recalculate financial data if price, cost_price, promo_price, or is_promo_active changed
      if (updates.price !== undefined || updates.cost_price !== undefined || 
          updates.promo_price !== undefined || updates.is_promo_active !== undefined) {
        
        const finalPrice = updates.price ? Number(updates.price) : menu.price;
        const finalCostPrice = updates.cost_price !== undefined ? 
          (updates.cost_price ? Number(updates.cost_price) : undefined) : menu.cost_price;
        const finalPromoPrice = updates.promo_price !== undefined ? 
          (updates.promo_price ? Number(updates.promo_price) : undefined) : menu.promo_price;
        const finalIsPromoActive = updates.is_promo_active !== undefined ? 
          updates.is_promo_active : menu.is_promo_active;

        const financialData = this.calculateFinancialData(
          finalPrice, 
          finalCostPrice, 
          finalPromoPrice, 
          finalIsPromoActive
        );

        // Update financial fields
        Object.keys(financialData).forEach(key => {
          (menu as any)[key] = financialData[key];
        });
      }

      const updatedMenu = await this.menuRepository.save(menu);
      res.json({ 
        message: 'Menu updated successfully', 
        data: updatedMenu 
      });
    } catch (error) {
      console.error('Error updating menu:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Delete menu
  public deleteMenu = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const menu = await this.menuRepository.findOne({ 
        where: { menu_id: id } 
      });

      if (!menu) {
        res.status(404).json({ message: 'Menu not found' });
        return;
      }

      // Delete image file if exists
      if (menu.image_url) {
        try {
          const filePath = path.join(process.cwd(), menu.image_url);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Image file deleted: ${filePath}`);
          }
        } catch (imageError) {
          console.warn('Failed to delete image file:', imageError);
          // Continue with menu deletion even if image deletion fails
        }
      }

      await this.menuRepository.remove(menu);
      res.json({ message: 'Menu deleted successfully' });
    } catch (error) {
      console.error('Error deleting menu:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Toggle menu availability
  public toggleAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const menu = await this.menuRepository.findOne({ 
        where: { menu_id: id } 
      });

      if (!menu) {
        res.status(404).json({ message: 'Menu not found' });
        return;
      }

      menu.is_available = !menu.is_available;
      const updatedMenu = await this.menuRepository.save(menu);

      res.json({ 
        message: `Menu ${menu.is_available ? 'enabled' : 'disabled'} successfully`, 
        data: updatedMenu 
      });
    } catch (error) {
      console.error('Error toggling menu availability:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get menu categories
  public getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryRepository.find({
        order: { name: 'ASC' }
      });

      res.json({ data: categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Create new category
  public createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, icon, parent_category } = req.body;

      if (!name) {
        res.status(400).json({ message: 'Category name is required' });
        return;
      }

      // Check if category already exists
      const existingCategory = await this.categoryRepository.findOne({ 
        where: { name } 
      });

      if (existingCategory) {
        res.status(400).json({ 
          message: 'Category with this name already exists' 
        });
        return;
      }

      const category = this.categoryRepository.create({
        name,
        description,
        icon,
        parentId: parent_category
      });

      const savedCategory = await this.categoryRepository.save(category);
      res.status(201).json({ 
        message: 'Category created successfully', 
        data: savedCategory 
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Delete category
  public deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const category = await this.categoryRepository.findOne({ 
        where: { id } 
      });

      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }

      // Check if any menus are using this category
      const menuCount = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.category = :categoryId', { categoryId: id })
        .getCount();

      if (menuCount > 0) {
        res.status(400).json({ 
          message: `Cannot delete category. ${menuCount} menu(s) are still using this category.` 
        });
        return;
      }

      await this.categoryRepository.remove(category);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get menu statistics
  public getMenuStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalMenus = await this.menuRepository.count();
      const availableMenus = await this.menuRepository.count({ 
        where: { is_available: true } 
      });
      const unavailableMenus = totalMenus - availableMenus;

      const categoryStats = await this.menuRepository
        .createQueryBuilder('menu')
        .select('menu.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('menu.category')
        .getRawMany();

      res.json({
        data: {
          total: totalMenus,
          available: availableMenus,
          unavailable: unavailableMenus,
          byCategory: categoryStats
        }
      });
    } catch (error) {
      console.error('Error fetching menu stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
