import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, Index } from 'typeorm';
import { Customer } from './Customer';

export enum PointTransactionType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ADJUSTED = 'adjusted',
  BONUS = 'bonus',
  REFUND = 'refund',
  TRANSFERRED = 'transferred'
}

export enum PointSource {
  ORDER = 'order',
  PROMOTION = 'promotion',
  REFERRAL = 'referral',
  BIRTHDAY = 'birthday',
  REVIEW = 'review',
  SOCIAL_MEDIA = 'social_media',
  EVENT = 'event',
  MANUAL = 'manual',
  WELCOME_BONUS = 'welcome_bonus',
  ANNIVERSARY = 'anniversary'
}

export enum PointStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

@Entity('loyalty_points')
@Index(['customerId', 'createdAt'])
@Index(['transactionType', 'createdAt'])
@Index(['status'])
@Index(['expiryDate'])
@Index(['orderId'])
export class LoyaltyPoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => Customer, customer => customer.loyalty_points, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ type: 'uuid', nullable: true })
  orderId?: string;

  @Column({
    type: 'varchar', length: 50,
    
    default: PointTransactionType.EARNED
  })
  transactionType!: PointTransactionType;

  @Column({
    type: 'varchar', length: 50,
    
    default: PointSource.ORDER
  })
  source!: PointSource;

  @Column({ type: 'int' })
  points!: number; // Can be negative for redemptions

  @Column({ type: 'int', default: 0 })
  runningBalance!: number; // Running balance after this transaction

  @Column({
    type: 'varchar', length: 50,
    
    default: PointStatus.ACTIVE
  })
  status!: PointStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId?: string; // Reference to promotion, event, etc.

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  orderAmount?: number; // Order amount that earned these points

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  multiplier?: number; // Points multiplier applied

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  redeemedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  processedBy?: string; // User ID who processed this transaction

  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON object for additional data

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Computed properties
  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  get daysUntilExpiry(): number | null {
    if (!this.expiryDate) return null;
    const today = new Date();
    const diffTime = this.expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isExpiringSoon(): boolean {
    const days = this.daysUntilExpiry;
    return days !== null && days <= 30 && days > 0;
  }

  get typeDisplayName(): string {
    const typeMap = {
      [PointTransactionType.EARNED]: 'Diperoleh',
      [PointTransactionType.REDEEMED]: 'Ditukar',
      [PointTransactionType.EXPIRED]: 'Kadaluarsa',
      [PointTransactionType.ADJUSTED]: 'Disesuaikan',
      [PointTransactionType.BONUS]: 'Bonus',
      [PointTransactionType.REFUND]: 'Dikembalikan',
      [PointTransactionType.TRANSFERRED]: 'Ditransfer'
    };
    return typeMap[this.transactionType] || this.transactionType;
  }

  get sourceDisplayName(): string {
    const sourceMap = {
      [PointSource.ORDER]: 'Pembelian',
      [PointSource.PROMOTION]: 'Promosi',
      [PointSource.REFERRAL]: 'Referral',
      [PointSource.BIRTHDAY]: 'Ulang Tahun',
      [PointSource.REVIEW]: 'Review',
      [PointSource.SOCIAL_MEDIA]: 'Media Sosial',
      [PointSource.EVENT]: 'Event',
      [PointSource.MANUAL]: 'Manual',
      [PointSource.WELCOME_BONUS]: 'Bonus Selamat Datang',
      [PointSource.ANNIVERSARY]: 'Anniversary'
    };
    return sourceMap[this.source] || this.source;
  }

  get statusDisplayName(): string {
    const statusMap = {
      [PointStatus.ACTIVE]: 'Aktif',
      [PointStatus.EXPIRED]: 'Kadaluarsa',
      [PointStatus.PENDING]: 'Menunggu',
      [PointStatus.CANCELLED]: 'Dibatalkan'
    };
    return statusMap[this.status] || this.status;
  }

  get isEarning(): boolean {
    return this.points > 0;
  }

  get isRedemption(): boolean {
    return this.points < 0;
  }

  get absolutePoints(): number {
    return Math.abs(this.points);
  }

  // Helper methods
  getParsedMetadata(): any {
    try {
      return this.metadata ? JSON.parse(this.metadata) : {};
    } catch {
      return {};
    }
  }

  setParsedMetadata(data: any): void {
    this.metadata = JSON.stringify(data);
  }

  // Business logic methods
  markAsExpired(): void {
    this.status = PointStatus.EXPIRED;
    this.expiredAt = new Date();
  }

  markAsRedeemed(): void {
    this.redeemedAt = new Date();
    if (this.transactionType !== PointTransactionType.REDEEMED) {
      this.transactionType = PointTransactionType.REDEEMED;
    }
  }

  cancel(): void {
    this.status = PointStatus.CANCELLED;
  }

  activate(): void {
    this.status = PointStatus.ACTIVE;
  }

  // Static factory methods
  static createEarningTransaction(
    customerId: string,
    points: number,
    source: PointSource,
    description?: string,
    orderId?: string,
    orderAmount?: number,
    expiryDate?: Date
  ): Partial<LoyaltyPoint> {
    return {
      customerId,
      orderId,
      transactionType: PointTransactionType.EARNED,
      source,
      points: Math.abs(points), // Ensure positive for earning
      description,
      orderAmount,
      expiryDate: expiryDate || this.calculateDefaultExpiryDate(),
      status: PointStatus.ACTIVE
    };
  }

  static createRedemptionTransaction(
    customerId: string,
    points: number,
    description?: string,
    referenceId?: string
  ): Partial<LoyaltyPoint> {
    return {
      customerId,
      transactionType: PointTransactionType.REDEEMED,
      source: PointSource.MANUAL,
      points: -Math.abs(points), // Ensure negative for redemption
      description,
      referenceId,
      status: PointStatus.ACTIVE,
      redeemedAt: new Date()
    };
  }

  static createAdjustmentTransaction(
    customerId: string,
    points: number,
    description: string,
    processedBy: string
  ): Partial<LoyaltyPoint> {
    return {
      customerId,
      transactionType: PointTransactionType.ADJUSTED,
      source: PointSource.MANUAL,
      points,
      description,
      processedBy,
      status: PointStatus.ACTIVE
    };
  }

  static createBonusTransaction(
    customerId: string,
    points: number,
    source: PointSource,
    description: string,
    expiryDate?: Date
  ): Partial<LoyaltyPoint> {
    return {
      customerId,
      transactionType: PointTransactionType.BONUS,
      source,
      points: Math.abs(points),
      description,
      expiryDate: expiryDate || this.calculateDefaultExpiryDate(),
      status: PointStatus.ACTIVE
    };
  }

  static createRefundTransaction(
    customerId: string,
    points: number,
    orderId: string,
    description?: string
  ): Partial<LoyaltyPoint> {
    return {
      customerId,
      orderId,
      transactionType: PointTransactionType.REFUND,
      source: PointSource.ORDER,
      points: Math.abs(points),
      description: description || 'Pengembalian poin dari pesanan yang dibatalkan',
      status: PointStatus.ACTIVE
    };
  }

  // Utility methods
  static calculateDefaultExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now
    return expiryDate;
  }

  static calculatePointsFromOrder(orderAmount: number, multiplier: number = 1): number {
    // Default: 1 point per 10,000 rupiah
    const basePoints = Math.floor(orderAmount / 10000);
    return Math.floor(basePoints * multiplier);
  }

  // Validation
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.points === 0) {
      errors.push('Jumlah poin tidak boleh nol');
    }

    if (this.transactionType === PointTransactionType.EARNED && this.points < 0) {
      errors.push('Poin yang diperoleh harus positif');
    }

    if (this.transactionType === PointTransactionType.REDEEMED && this.points > 0) {
      errors.push('Poin yang ditukar harus negatif');
    }

    if (this.expiryDate && this.expiryDate <= new Date()) {
      errors.push('Tanggal kadaluarsa harus di masa depan');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Deskripsi harus diisi');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Update running balance
  updateRunningBalance(previousBalance: number): void {
    this.runningBalance = previousBalance + this.points;
  }

  // Check if transaction can be processed
  canBeProcessed(currentBalance: number): boolean {
    if (this.transactionType === PointTransactionType.REDEEMED) {
      return currentBalance >= Math.abs(this.points);
    }
    return true;
  }

  // Create expiry transaction
  static createExpiryTransaction(originalTransaction: LoyaltyPoint): Partial<LoyaltyPoint> {
    return {
      customerId: originalTransaction.customerId,
      transactionType: PointTransactionType.EXPIRED,
      source: originalTransaction.source,
      points: -originalTransaction.points, // Negative to remove the points
      description: `Poin kadaluarsa: ${originalTransaction.description}`,
      referenceId: originalTransaction.id,
      status: PointStatus.ACTIVE,
      expiredAt: new Date()
    };
  }
}
