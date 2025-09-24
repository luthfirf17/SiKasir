import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum InventoryUnit {
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'liter',
  ML = 'ml',
  PIECE = 'piece',
  PACK = 'pack',
  BOX = 'box',
  BOTTLE = 'bottle',
  CAN = 'can',
  SACHET = 'sachet'
}

export enum InventoryCategory {
  RAW_MATERIALS = 'raw_materials',
  BEVERAGES = 'beverages',
  CONDIMENTS = 'condiments',
  PACKAGING = 'packaging',
  CLEANING_SUPPLIES = 'cleaning_supplies',
  EQUIPMENT = 'equipment',
  OTHER = 'other'
}

export enum InventoryStatus {
  AVAILABLE = 'available',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXPIRED = 'expired',
  DISCONTINUED = 'discontinued'
}

@Entity('inventory')
@Index(['category'])
@Index(['currentStock'])
@Index(['expiryDate'])
@Index(['name'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku?: string; // Stock Keeping Unit

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode?: string;

  @Column({
    type: 'varchar', length: 50,
    
    default: InventoryCategory.RAW_MATERIALS
  })
  category!: InventoryCategory;

  @Column({
    type: 'varchar', length: 50,
    
    default: InventoryUnit.PIECE
  })
  unit!: InventoryUnit;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  currentStock!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  minStock!: number; // Minimum stock level for alerts

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  maxStock!: number; // Maximum stock level

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  reorderPoint!: number; // Stock level to trigger reorder

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  reorderQuantity!: number; // Standard reorder quantity

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitCost!: number; // Cost per unit

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  averageCost!: number; // Weighted average cost

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  lastPurchaseCost!: number; // Last purchase cost per unit

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier?: string; // Primary supplier name

  @Column({ type: 'text', nullable: true })
  supplierContacts?: string; // JSON string for supplier contact details

  @Column({ type: 'varchar', length: 255, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string; // Storage location

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'date', nullable: true })
  lastRestocked?: Date;

  @Column({ type: 'date', nullable: true })
  lastUsed?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isPerishable!: boolean;

  @Column({ type: 'boolean', default: false })
  requiresTemperatureControl!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureMin?: number; // Minimum storage temperature

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureMax?: number; // Maximum storage temperature

  @Column({ type: 'int', default: 0 })
  shelfLife?: number; // Shelf life in days

  @Column({ type: 'text', nullable: true })
  allergens?: string; // JSON array of allergens

  @Column({ type: 'text', nullable: true })
  nutritionalInfo?: string; // JSON object with nutritional information

  @Column({ type: 'text', nullable: true })
  customFields?: string; // JSON object for additional fields

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Computed properties
  get status(): InventoryStatus {
    if (!this.isActive) {
      return InventoryStatus.DISCONTINUED;
    }
    
    if (this.isExpired) {
      return InventoryStatus.EXPIRED;
    }
    
    if (this.currentStock <= 0) {
      return InventoryStatus.OUT_OF_STOCK;
    }
    
    if (this.currentStock <= this.minStock) {
      return InventoryStatus.LOW_STOCK;
    }
    
    return InventoryStatus.AVAILABLE;
  }

  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  get isLowStock(): boolean {
    return this.currentStock <= this.minStock && this.currentStock > 0;
  }

  get isOutOfStock(): boolean {
    return this.currentStock <= 0;
  }

  get needsReorder(): boolean {
    return this.currentStock <= this.reorderPoint;
  }

  get totalValue(): number {
    return this.currentStock * this.averageCost;
  }

  get daysUntilExpiry(): number | null {
    if (!this.expiryDate) return null;
    const today = new Date();
    const diffTime = this.expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get categoryDisplayName(): string {
    const categoryMap = {
      [InventoryCategory.RAW_MATERIALS]: 'Bahan Baku',
      [InventoryCategory.BEVERAGES]: 'Minuman',
      [InventoryCategory.CONDIMENTS]: 'Bumbu & Rempah',
      [InventoryCategory.PACKAGING]: 'Kemasan',
      [InventoryCategory.CLEANING_SUPPLIES]: 'Perlengkapan Kebersihan',
      [InventoryCategory.EQUIPMENT]: 'Peralatan',
      [InventoryCategory.OTHER]: 'Lainnya'
    };
    return categoryMap[this.category] || this.category;
  }

  get unitDisplayName(): string {
    const unitMap = {
      [InventoryUnit.KG]: 'Kilogram',
      [InventoryUnit.GRAM]: 'Gram',
      [InventoryUnit.LITER]: 'Liter',
      [InventoryUnit.ML]: 'Mililiter',
      [InventoryUnit.PIECE]: 'Buah',
      [InventoryUnit.PACK]: 'Kemasan',
      [InventoryUnit.BOX]: 'Kotak',
      [InventoryUnit.BOTTLE]: 'Botol',
      [InventoryUnit.CAN]: 'Kaleng',
      [InventoryUnit.SACHET]: 'Sachet'
    };
    return unitMap[this.unit] || this.unit;
  }

  get statusDisplayName(): string {
    const statusMap = {
      [InventoryStatus.AVAILABLE]: 'Tersedia',
      [InventoryStatus.LOW_STOCK]: 'Stok Rendah',
      [InventoryStatus.OUT_OF_STOCK]: 'Habis',
      [InventoryStatus.EXPIRED]: 'Kadaluarsa',
      [InventoryStatus.DISCONTINUED]: 'Dihentikan'
    };
    return statusMap[this.status] || this.status;
  }

  // Helper methods
  getParsedSupplierContacts(): any {
    try {
      return this.supplierContacts ? JSON.parse(this.supplierContacts) : {};
    } catch {
      return {};
    }
  }

  setParsedSupplierContacts(contacts: any): void {
    this.supplierContacts = JSON.stringify(contacts);
  }

  getParsedAllergens(): string[] {
    try {
      return this.allergens ? JSON.parse(this.allergens) : [];
    } catch {
      return [];
    }
  }

  setParsedAllergens(allergens: string[]): void {
    this.allergens = JSON.stringify(allergens);
  }

  getParsedNutritionalInfo(): any {
    try {
      return this.nutritionalInfo ? JSON.parse(this.nutritionalInfo) : {};
    } catch {
      return {};
    }
  }

  setParsedNutritionalInfo(info: any): void {
    this.nutritionalInfo = JSON.stringify(info);
  }

  getParsedCustomFields(): any {
    try {
      return this.customFields ? JSON.parse(this.customFields) : {};
    } catch {
      return {};
    }
  }

  setParsedCustomFields(fields: any): void {
    this.customFields = JSON.stringify(fields);
  }

  // Stock management methods
  addStock(quantity: number, cost?: number): void {
    if (quantity <= 0) return;
    
    // Update average cost using weighted average
    if (cost && cost > 0) {
      const totalValue = (this.currentStock * this.averageCost) + (quantity * cost);
      const totalQuantity = this.currentStock + quantity;
      this.averageCost = totalValue / totalQuantity;
      this.lastPurchaseCost = cost;
    }
    
    this.currentStock += quantity;
    this.lastRestocked = new Date();
  }

  removeStock(quantity: number): boolean {
    if (quantity <= 0 || quantity > this.currentStock) {
      return false;
    }
    
    this.currentStock -= quantity;
    this.lastUsed = new Date();
    return true;
  }

  setStock(quantity: number): void {
    this.currentStock = Math.max(0, quantity);
  }

  calculateReorderQuantity(): number {
    if (this.reorderQuantity > 0) {
      return this.reorderQuantity;
    }
    
    // Calculate based on max stock - current stock
    return Math.max(0, this.maxStock - this.currentStock);
  }

  markAsExpired(): void {
    this.isActive = false;
  }

  markAsDiscontinued(): void {
    this.isActive = false;
  }

  updateCosts(newCost: number): void {
    if (newCost > 0) {
      this.lastPurchaseCost = newCost;
      
      // Update average cost if we have stock
      if (this.currentStock > 0) {
        // Simple moving average for cost updates
        this.averageCost = (this.averageCost + newCost) / 2;
      } else {
        this.averageCost = newCost;
      }
      
      this.unitCost = newCost;
    }
  }

  validateTemperatureRange(): boolean {
    if (!this.requiresTemperatureControl) return true;
    if (this.temperatureMin === undefined || this.temperatureMax === undefined) return false;
    return this.temperatureMin < this.temperatureMax;
  }

  getStockAlerts(): string[] {
    const alerts: string[] = [];
    
    if (this.isExpired) {
      alerts.push('Item telah kadaluarsa');
    } else if (this.daysUntilExpiry !== null && this.daysUntilExpiry <= 7) {
      alerts.push(`Akan kadaluarsa dalam ${this.daysUntilExpiry} hari`);
    }
    
    if (this.isOutOfStock) {
      alerts.push('Stok habis');
    } else if (this.isLowStock) {
      alerts.push('Stok rendah');
    }
    
    if (this.needsReorder) {
      alerts.push('Perlu pemesanan ulang');
    }
    
    return alerts;
  }
}
