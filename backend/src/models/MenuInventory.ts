import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index, Unique } from 'typeorm';
import { Menu } from './Menu';
import { Inventory } from './Inventory';

export enum UsageType {
  PRIMARY = 'primary', // Main ingredient
  SECONDARY = 'secondary', // Supporting ingredient
  GARNISH = 'garnish', // Garnish or decoration
  OPTIONAL = 'optional', // Optional ingredient
  SUBSTITUTE = 'substitute' // Substitute ingredient
}

@Entity('menu_inventory')
@Unique(['menuId', 'inventoryId'])
@Index(['menuId'])
@Index(['inventoryId'])
@Index(['usageType'])
export class MenuInventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  menuId!: string;

  @ManyToOne(() => Menu, menu => menu.menu_inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuId' })
  menu!: Menu;

  @Column({ type: 'uuid' })
  inventoryId!: string;

  @ManyToOne(() => Inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory!: Inventory;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantityRequired!: number; // Amount needed for one serving

  @Column({
    type: 'varchar', length: 50,
    
    default: UsageType.PRIMARY
  })
  usageType!: UsageType;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  wastagePercentage!: number; // Expected wastage percentage

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPerServing?: number; // Calculated cost per serving

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: true })
  isRequired!: boolean; // Is this ingredient required for the menu item

  @Column({ type: 'int', default: 1 })
  priority!: number; // Priority order for ingredient usage

  @Column({ type: 'text', nullable: true })
  preparationNotes?: string; // Special preparation instructions

  @Column({ type: 'text', nullable: true })
  alternativeIngredients?: string; // JSON array of alternative ingredient IDs

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  nutritionalContribution?: number; // Percentage contribution to total nutrition

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Computed properties
  get effectiveQuantityNeeded(): number {
    return this.quantityRequired * (1 + this.wastagePercentage / 100);
  }

  get usageTypeDisplayName(): string {
    const typeMap = {
      [UsageType.PRIMARY]: 'Bahan Utama',
      [UsageType.SECONDARY]: 'Bahan Pendukung',
      [UsageType.GARNISH]: 'Hiasan',
      [UsageType.OPTIONAL]: 'Opsional',
      [UsageType.SUBSTITUTE]: 'Pengganti'
    };
    return typeMap[this.usageType] || this.usageType;
  }

  get isAvailable(): boolean {
    if (!this.inventory) return false;
    return this.inventory.currentStock >= this.effectiveQuantityNeeded;
  }

  get availableServings(): number {
    if (!this.inventory || this.effectiveQuantityNeeded <= 0) return 0;
    return Math.floor(this.inventory.currentStock / this.effectiveQuantityNeeded);
  }

  // Helper methods
  getParsedAlternativeIngredients(): string[] {
    try {
      return this.alternativeIngredients ? JSON.parse(this.alternativeIngredients) : [];
    } catch {
      return [];
    }
  }

  setParsedAlternativeIngredients(alternatives: string[]): void {
    this.alternativeIngredients = JSON.stringify(alternatives);
  }

  calculateCostPerServing(): number {
    if (!this.inventory) return 0;
    return this.effectiveQuantityNeeded * this.inventory.averageCost;
  }

  updateCostPerServing(): void {
    this.costPerServing = this.calculateCostPerServing();
  }

  canFulfillOrder(servings: number): boolean {
    if (!this.inventory) return false;
    const totalNeeded = this.effectiveQuantityNeeded * servings;
    return this.inventory.currentStock >= totalNeeded;
  }

  getShortageForOrder(servings: number): number {
    if (!this.inventory) return this.effectiveQuantityNeeded * servings;
    const totalNeeded = this.effectiveQuantityNeeded * servings;
    return Math.max(0, totalNeeded - this.inventory.currentStock);
  }

  consumeForOrder(servings: number): boolean {
    if (!this.canFulfillOrder(servings)) return false;
    
    const totalNeeded = this.effectiveQuantityNeeded * servings;
    return this.inventory.removeStock(totalNeeded);
  }

  getUsageImpact(servings: number): {
    totalUsed: number;
    remainingStock: number;
    willRunOut: boolean;
    willBeLowStock: boolean;
  } {
    const totalNeeded = this.effectiveQuantityNeeded * servings;
    const remainingStock = Math.max(0, this.inventory.currentStock - totalNeeded);
    
    return {
      totalUsed: totalNeeded,
      remainingStock,
      willRunOut: remainingStock <= 0,
      willBeLowStock: remainingStock <= this.inventory.minStock
    };
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.quantityRequired <= 0) {
      errors.push('Jumlah yang dibutuhkan harus lebih dari 0');
    }

    if (this.wastagePercentage < 0 || this.wastagePercentage > 100) {
      errors.push('Persentase pemborosan harus antara 0-100%');
    }

    if (this.priority < 1) {
      errors.push('Prioritas harus minimal 1');
    }

    if (this.nutritionalContribution !== null && this.nutritionalContribution !== undefined && 
        (this.nutritionalContribution < 0 || this.nutritionalContribution > 100)) {
      errors.push('Kontribusi nutrisi harus antara 0-100%');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  clone(): Partial<MenuInventory> {
    return {
      inventoryId: this.inventoryId,
      quantityRequired: this.quantityRequired,
      usageType: this.usageType,
      wastagePercentage: this.wastagePercentage,
      isActive: this.isActive,
      isRequired: this.isRequired,
      priority: this.priority,
      preparationNotes: this.preparationNotes,
      alternativeIngredients: this.alternativeIngredients,
      nutritionalContribution: this.nutritionalContribution
    };
  }
}
