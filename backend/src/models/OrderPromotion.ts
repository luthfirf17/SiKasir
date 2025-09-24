import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, Index, Unique } from 'typeorm';
import { Promotion } from './Promotion';

@Entity('order_promotions')
@Unique(['orderId', 'promotionId'])
@Index(['orderId'])
@Index(['promotionId'])
export class OrderPromotion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'uuid' })
  promotionId!: string;

  @ManyToOne(() => Promotion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotionId' })
  promotion!: Promotion;

  @Column({ type: 'varchar', length: 100 })
  promotionCode!: string; // Snapshot of promotion code used

  @Column({ type: 'varchar', length: 255 })
  promotionName!: string; // Snapshot of promotion name

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  originalOrderAmount!: number; // Order amount before this promotion

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  applicableAmount!: number; // Amount this promotion was applied to

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discountAmount!: number; // Actual discount amount given

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  finalOrderAmount!: number; // Order amount after this promotion

  @Column({ type: 'text', nullable: true })
  calculationDetails?: string; // JSON object with calculation details

  @Column({ type: 'boolean', default: false })
  isAutoApplied!: boolean; // Was this promotion auto-applied

  @Column({ type: 'int', default: 1 })
  applicationOrder!: number; // Order in which this promotion was applied

  @Column({ type: 'text', nullable: true })
  notes?: string; // Additional notes about the promotion application

  @CreateDateColumn()
  appliedAt!: Date;

  // Computed properties
  get discountPercentage(): number {
    if (this.applicableAmount === 0) return 0;
    return (this.discountAmount / this.applicableAmount) * 100;
  }

  get effectivenessRatio(): number {
    if (this.originalOrderAmount === 0) return 0;
    return (this.discountAmount / this.originalOrderAmount) * 100;
  }

  // Helper methods
  getParsedCalculationDetails(): any {
    try {
      return this.calculationDetails ? JSON.parse(this.calculationDetails) : {};
    } catch {
      return {};
    }
  }

  setParsedCalculationDetails(details: any): void {
    this.calculationDetails = JSON.stringify(details);
  }

  static createFromPromotion(
    orderId: string, 
    promotion: Promotion, 
    orderAmount: number, 
    discountCalculation: any,
    applicationOrder: number = 1
  ): Partial<OrderPromotion> {
    return {
      orderId,
      promotionId: promotion.id,
      promotionCode: promotion.code,
      promotionName: promotion.name,
      originalOrderAmount: orderAmount,
      applicableAmount: discountCalculation.baseAmount || orderAmount,
      discountAmount: discountCalculation.discountAmount,
      finalOrderAmount: discountCalculation.finalAmount,
      calculationDetails: JSON.stringify(discountCalculation.details),
      isAutoApplied: promotion.isAutoApply,
      applicationOrder
    };
  }
}
