import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
// import { OrderNew } from './OrderNew'; // Commented to avoid circular imports

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  DIGITAL_WALLET = 'digital_wallet',
  BANK_TRANSFER = 'bank_transfer',
  QRIS = 'qris',
  CREDIT = 'credit'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIAL_REFUND = 'partial_refund'
}

@Entity('payments')
@Index(['status', 'createdAt'])
@Index(['paymentMethod', 'createdAt'])
@Index(['orderId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orderId!: string;

  @ManyToOne('Order', 'payments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: any;

  @Column({
    type: 'varchar', length: 50,
    
    default: PaymentMethod.CASH
  })
  paymentMethod!: PaymentMethod;

  @Column({
    type: 'varchar', length: 50,
    
    default: PaymentStatus.PENDING
  })
  @Index()
  status!: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  changeAmount!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  providerName?: string; // Bank name, e-wallet provider, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  accountNumber?: string; // Last 4 digits of card, account number, etc.

  @Column({ type: 'text', nullable: true })
  paymentDetails?: string; // JSON string for additional payment details

  @Column({ type: 'text', nullable: true })
  receiptData?: string; // JSON string for receipt information

  @Column({ type: 'varchar', length: 500, nullable: true })
  failureReason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false })
  isRefunded!: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refundedAmount!: number;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Computed properties
  get isPaid(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  get isPartiallyPaid(): boolean {
    return this.paidAmount > 0 && this.paidAmount < this.amount;
  }

  get remainingAmount(): number {
    return Math.max(0, this.amount - this.paidAmount);
  }

  get isOverpaid(): boolean {
    return this.paidAmount > this.amount;
  }

  get statusDisplayName(): string {
    const statusMap = {
      [PaymentStatus.PENDING]: 'Menunggu Pembayaran',
      [PaymentStatus.PROCESSING]: 'Memproses Pembayaran',
      [PaymentStatus.COMPLETED]: 'Pembayaran Berhasil',
      [PaymentStatus.FAILED]: 'Pembayaran Gagal',
      [PaymentStatus.CANCELLED]: 'Pembayaran Dibatalkan',
      [PaymentStatus.REFUNDED]: 'Telah Dikembalikan',
      [PaymentStatus.PARTIAL_REFUND]: 'Dikembalikan Sebagian'
    };
    return statusMap[this.status] || this.status;
  }

  get methodDisplayName(): string {
    const methodMap = {
      [PaymentMethod.CASH]: 'Tunai',
      [PaymentMethod.CARD]: 'Kartu',
      [PaymentMethod.DIGITAL_WALLET]: 'Dompet Digital',
      [PaymentMethod.BANK_TRANSFER]: 'Transfer Bank',
      [PaymentMethod.QRIS]: 'QRIS',
      [PaymentMethod.CREDIT]: 'Kredit'
    };
    return methodMap[this.paymentMethod] || this.paymentMethod;
  }

  // Helper methods
  getParsedPaymentDetails(): any {
    try {
      return this.paymentDetails ? JSON.parse(this.paymentDetails) : {};
    } catch {
      return {};
    }
  }

  setParsedPaymentDetails(details: any): void {
    this.paymentDetails = JSON.stringify(details);
  }

  getParsedReceiptData(): any {
    try {
      return this.receiptData ? JSON.parse(this.receiptData) : {};
    } catch {
      return {};
    }
  }

  setParsedReceiptData(data: any): void {
    this.receiptData = JSON.stringify(data);
  }

  markAsCompleted(paidAmount?: number): void {
    this.status = PaymentStatus.COMPLETED;
    this.completedAt = new Date();
    this.processedAt = this.processedAt || new Date();
    
    if (paidAmount !== undefined) {
      this.paidAmount = paidAmount;
      this.changeAmount = Math.max(0, paidAmount - this.amount);
    }
  }

  markAsFailed(reason?: string): void {
    this.status = PaymentStatus.FAILED;
    if (reason) {
      this.failureReason = reason;
    }
  }

  processRefund(refundAmount: number): void {
    const maxRefundAmount = this.paidAmount - this.refundedAmount;
    const actualRefundAmount = Math.min(refundAmount, maxRefundAmount);
    
    this.refundedAmount += actualRefundAmount;
    this.refundedAt = new Date();
    
    if (this.refundedAmount >= this.paidAmount) {
      this.status = PaymentStatus.REFUNDED;
      this.isRefunded = true;
    } else if (this.refundedAmount > 0) {
      this.status = PaymentStatus.PARTIAL_REFUND;
      this.isRefunded = true;
    }
  }

  canBeRefunded(): boolean {
    return this.status === PaymentStatus.COMPLETED && this.refundedAmount < this.paidAmount;
  }

  getAvailableRefundAmount(): number {
    return Math.max(0, this.paidAmount - this.refundedAmount);
  }
}
