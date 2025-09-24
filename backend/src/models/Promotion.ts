import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_X_GET_Y = 'buy_x_get_y',
  FREE_DELIVERY = 'free_delivery',
  CASHBACK = 'cashback',
  LOYALTY_POINTS = 'loyalty_points'
}

export enum PromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum PromotionScope {
  ALL_ITEMS = 'all_items',
  SPECIFIC_ITEMS = 'specific_items',
  CATEGORY = 'category',
  MINIMUM_ORDER = 'minimum_order',
  FIRST_ORDER = 'first_order',
  LOYALTY_TIER = 'loyalty_tier'
}

@Entity('promotions')
@Index(['status', 'validFrom', 'validTo'])
@Index(['promotionType'])
@Index(['isActive'])
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  code!: string; // Promotion code for customers to use

  @Column({
    type: 'varchar', length: 50,
    
    default: PromotionType.PERCENTAGE
  })
  promotionType!: PromotionType;

  @Column({
    type: 'varchar', length: 50,
    
    default: PromotionScope.ALL_ITEMS
  })
  scope!: PromotionScope;

  @Column({
    type: 'varchar', length: 50,
    
    default: PromotionStatus.DRAFT
  })
  @Index()
  status!: PromotionStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountValue!: number; // Percentage (0-100) or fixed amount

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxDiscountAmount?: number; // Maximum discount for percentage type

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minOrderAmount?: number; // Minimum order amount to qualify

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxOrderAmount?: number; // Maximum order amount to qualify

  @Column({ type: 'int', nullable: true })
  usageLimit?: number; // Total usage limit for this promotion

  @Column({ type: 'int', default: 0 })
  usageCount!: number; // Current usage count

  @Column({ type: 'int', nullable: true })
  usageLimitPerCustomer?: number; // Usage limit per customer

  @Column({ type: 'timestamp' })
  @Index()
  validFrom!: Date;

  @Column({ type: 'timestamp' })
  @Index()
  validTo!: Date;

  @Column({ type: 'text', nullable: true })
  applicableItems?: string; // JSON array of applicable menu item IDs

  @Column({ type: 'text', nullable: true })
  applicableCategories?: string; // JSON array of applicable categories

  @Column({ type: 'text', nullable: true })
  excludedItems?: string; // JSON array of excluded menu item IDs

  @Column({ type: 'text', nullable: true })
  customerSegments?: string; // JSON array of applicable customer segments

  @Column({ type: 'text', nullable: true })
  dayOfWeek?: string; // JSON array of applicable days (0=Sunday, 6=Saturday)

  @Column({ type: 'time', nullable: true })
  validFromTime?: string; // Start time of day

  @Column({ type: 'time', nullable: true })
  validToTime?: string; // End time of day

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isAutoApply!: boolean; // Auto-apply without code

  @Column({ type: 'boolean', default: false })
  isStackable!: boolean; // Can be combined with other promotions

  @Column({ type: 'boolean', default: false })
  requiresLoyaltyMembership!: boolean;

  @Column({ type: 'int', nullable: true })
  minLoyaltyPoints?: number; // Minimum loyalty points required

  @Column({ type: 'int', nullable: true })
  buyQuantity?: number; // For buy X get Y promotions

  @Column({ type: 'int', nullable: true })
  getQuantity?: number; // For buy X get Y promotions

  @Column({ type: 'uuid', nullable: true })
  freeItemId?: string; // Free item for buy X get Y promotions

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cashbackPercentage?: number; // Cashback percentage

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxCashback?: number; // Maximum cashback amount

  @Column({ type: 'int', nullable: true })
  loyaltyPointsAwarded?: number; // Extra loyalty points to award

  @Column({ type: 'int', default: 0 })
  priority!: number; // Priority for stacking promotions

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  terms?: string; // Terms and conditions

  @Column({ type: 'text', nullable: true })
  internalNotes?: string; // Internal notes for staff

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy?: string; // User ID who created this promotion

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Computed properties
  get isCurrentlyValid(): boolean {
    const now = new Date();
    return this.isActive && 
           this.status === PromotionStatus.ACTIVE &&
           now >= this.validFrom && 
           now <= this.validTo;
  }

  get isExpired(): boolean {
    return new Date() > this.validTo;
  }

  get isUsageLimitReached(): boolean {
    return this.usageLimit !== null && this.usageLimit !== undefined && this.usageCount >= this.usageLimit;
  }

  get remainingUsage(): number | null {
    return this.usageLimit ? Math.max(0, this.usageLimit - this.usageCount) : null;
  }

  get statusDisplayName(): string {
    const statusMap = {
      [PromotionStatus.DRAFT]: 'Draft',
      [PromotionStatus.ACTIVE]: 'Aktif',
      [PromotionStatus.SCHEDULED]: 'Terjadwal',
      [PromotionStatus.PAUSED]: 'Dihentikan Sementara',
      [PromotionStatus.EXPIRED]: 'Kedaluwarsa',
      [PromotionStatus.CANCELLED]: 'Dibatalkan'
    };
    return statusMap[this.status] || this.status;
  }

  get typeDisplayName(): string {
    const typeMap = {
      [PromotionType.PERCENTAGE]: 'Diskon Persentase',
      [PromotionType.FIXED_AMOUNT]: 'Diskon Nominal',
      [PromotionType.BUY_X_GET_Y]: 'Beli X Dapat Y',
      [PromotionType.FREE_DELIVERY]: 'Gratis Ongkir',
      [PromotionType.CASHBACK]: 'Cashback',
      [PromotionType.LOYALTY_POINTS]: 'Poin Loyalty'
    };
    return typeMap[this.promotionType] || this.promotionType;
  }

  get scopeDisplayName(): string {
    const scopeMap = {
      [PromotionScope.ALL_ITEMS]: 'Semua Item',
      [PromotionScope.SPECIFIC_ITEMS]: 'Item Tertentu',
      [PromotionScope.CATEGORY]: 'Kategori',
      [PromotionScope.MINIMUM_ORDER]: 'Minimum Pembelian',
      [PromotionScope.FIRST_ORDER]: 'Pembelian Pertama',
      [PromotionScope.LOYALTY_TIER]: 'Tier Loyalty'
    };
    return scopeMap[this.scope] || this.scope;
  }

  // Helper methods
  getParsedApplicableItems(): string[] {
    try {
      return this.applicableItems ? JSON.parse(this.applicableItems) : [];
    } catch {
      return [];
    }
  }

  setParsedApplicableItems(items: string[]): void {
    this.applicableItems = JSON.stringify(items);
  }

  getParsedApplicableCategories(): string[] {
    try {
      return this.applicableCategories ? JSON.parse(this.applicableCategories) : [];
    } catch {
      return [];
    }
  }

  setParsedApplicableCategories(categories: string[]): void {
    this.applicableCategories = JSON.stringify(categories);
  }

  getParsedExcludedItems(): string[] {
    try {
      return this.excludedItems ? JSON.parse(this.excludedItems) : [];
    } catch {
      return [];
    }
  }

  setParsedExcludedItems(items: string[]): void {
    this.excludedItems = JSON.stringify(items);
  }

  getParsedCustomerSegments(): string[] {
    try {
      return this.customerSegments ? JSON.parse(this.customerSegments) : [];
    } catch {
      return [];
    }
  }

  setParsedCustomerSegments(segments: string[]): void {
    this.customerSegments = JSON.stringify(segments);
  }

  getParsedDayOfWeek(): number[] {
    try {
      return this.dayOfWeek ? JSON.parse(this.dayOfWeek) : [];
    } catch {
      return [];
    }
  }

  setParsedDayOfWeek(days: number[]): void {
    this.dayOfWeek = JSON.stringify(days);
  }

  // Business logic methods
  canBeUsed(orderAmount?: number, customerId?: string, customerUsageCount?: number): {
    canUse: boolean;
    reason?: string;
  } {
    if (!this.isCurrentlyValid) {
      return { canUse: false, reason: 'Promosi tidak berlaku' };
    }

    if (this.isUsageLimitReached) {
      return { canUse: false, reason: 'Batas penggunaan promosi telah tercapai' };
    }

    if (this.usageLimitPerCustomer && customerUsageCount && customerUsageCount >= this.usageLimitPerCustomer) {
      return { canUse: false, reason: 'Batas penggunaan per pelanggan telah tercapai' };
    }

    if (orderAmount !== undefined) {
      if (this.minOrderAmount && orderAmount < this.minOrderAmount) {
        return { canUse: false, reason: `Minimum pembelian Rp ${this.minOrderAmount.toLocaleString()}` };
      }

      if (this.maxOrderAmount && orderAmount > this.maxOrderAmount) {
        return { canUse: false, reason: `Maksimum pembelian Rp ${this.maxOrderAmount.toLocaleString()}` };
      }
    }

    // Check time restrictions
    if (this.validFromTime && this.validToTime) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8);
      if (currentTime < this.validFromTime || currentTime > this.validToTime) {
        return { canUse: false, reason: `Promosi berlaku ${this.validFromTime} - ${this.validToTime}` };
      }
    }

    // Check day of week restrictions
    const applicableDays = this.getParsedDayOfWeek();
    if (applicableDays.length > 0) {
      const currentDay = new Date().getDay();
      if (!applicableDays.includes(currentDay)) {
        return { canUse: false, reason: 'Promosi tidak berlaku pada hari ini' };
      }
    }

    return { canUse: true };
  }

  calculateDiscount(orderAmount: number, applicableAmount?: number): {
    discountAmount: number;
    finalAmount: number;
    details: any;
  } {
    const baseAmount = applicableAmount || orderAmount;
    let discountAmount = 0;

    switch (this.promotionType) {
      case PromotionType.PERCENTAGE:
        discountAmount = (baseAmount * this.discountValue) / 100;
        if (this.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, this.maxDiscountAmount);
        }
        break;

      case PromotionType.FIXED_AMOUNT:
        discountAmount = Math.min(this.discountValue, baseAmount);
        break;

      case PromotionType.CASHBACK:
        if (this.cashbackPercentage) {
          discountAmount = (baseAmount * this.cashbackPercentage) / 100;
          if (this.maxCashback) {
            discountAmount = Math.min(discountAmount, this.maxCashback);
          }
        }
        break;

      default:
        discountAmount = 0;
    }

    return {
      discountAmount: Math.round(discountAmount),
      finalAmount: orderAmount - Math.round(discountAmount),
      details: {
        promotionType: this.promotionType,
        discountValue: this.discountValue,
        baseAmount,
        calculatedDiscount: discountAmount
      }
    };
  }

  incrementUsage(): void {
    this.usageCount += 1;
  }

  activate(): void {
    this.status = PromotionStatus.ACTIVE;
    this.isActive = true;
  }

  deactivate(): void {
    this.status = PromotionStatus.PAUSED;
    this.isActive = false;
  }

  cancel(): void {
    this.status = PromotionStatus.CANCELLED;
    this.isActive = false;
  }

  updateStatus(): void {
    const now = new Date();
    
    if (this.status === PromotionStatus.CANCELLED) {
      return;
    }

    if (now > this.validTo) {
      this.status = PromotionStatus.EXPIRED;
      this.isActive = false;
    } else if (now < this.validFrom && this.status === PromotionStatus.ACTIVE) {
      this.status = PromotionStatus.SCHEDULED;
    } else if (now >= this.validFrom && now <= this.validTo && this.status === PromotionStatus.SCHEDULED) {
      this.status = PromotionStatus.ACTIVE;
      this.isActive = true;
    }

    if (this.isUsageLimitReached && this.status === PromotionStatus.ACTIVE) {
      this.status = PromotionStatus.EXPIRED;
      this.isActive = false;
    }
  }

  clone(): Partial<Promotion> {
    return {
      name: `${this.name} (Copy)`,
      description: this.description,
      promotionType: this.promotionType,
      scope: this.scope,
      discountValue: this.discountValue,
      maxDiscountAmount: this.maxDiscountAmount,
      minOrderAmount: this.minOrderAmount,
      maxOrderAmount: this.maxOrderAmount,
      usageLimit: this.usageLimit,
      usageLimitPerCustomer: this.usageLimitPerCustomer,
      applicableItems: this.applicableItems,
      applicableCategories: this.applicableCategories,
      excludedItems: this.excludedItems,
      customerSegments: this.customerSegments,
      dayOfWeek: this.dayOfWeek,
      validFromTime: this.validFromTime,
      validToTime: this.validToTime,
      isAutoApply: this.isAutoApply,
      isStackable: this.isStackable,
      requiresLoyaltyMembership: this.requiresLoyaltyMembership,
      minLoyaltyPoints: this.minLoyaltyPoints,
      buyQuantity: this.buyQuantity,
      getQuantity: this.getQuantity,
      freeItemId: this.freeItemId,
      cashbackPercentage: this.cashbackPercentage,
      maxCashback: this.maxCashback,
      loyaltyPointsAwarded: this.loyaltyPointsAwarded,
      priority: this.priority,
      imageUrl: this.imageUrl,
      terms: this.terms
    };
  }
}
