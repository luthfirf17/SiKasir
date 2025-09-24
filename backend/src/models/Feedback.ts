import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { Customer } from './Customer';

export enum FeedbackType {
  ORDER = 'order',
  MENU_ITEM = 'menu_item',
  SERVICE = 'service',
  AMBIANCE = 'ambiance',
  CLEANLINESS = 'cleanliness',
  VALUE_FOR_MONEY = 'value_for_money',
  DELIVERY = 'delivery',
  GENERAL = 'general',
  COMPLAINT = 'complaint',
  SUGGESTION = 'suggestion'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESPONDED = 'responded',
  RESOLVED = 'resolved',
  ARCHIVED = 'archived'
}

export enum SentimentType {
  VERY_POSITIVE = 'very_positive',
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  VERY_NEGATIVE = 'very_negative'
}

@Entity('feedback')
@Index(['feedbackType', 'createdAt'])
@Index(['rating', 'createdAt'])
@Index(['status'])
@Index(['sentiment'])
@Index(['isPublic'])
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @ManyToOne(() => Customer, customer => customer.feedbacks, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @Column({ type: 'uuid', nullable: true })
  orderId?: string;

  @Column({ type: 'uuid', nullable: true })
  menuItemId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName?: string; // For anonymous feedback

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerEmail?: string; // For anonymous feedback

  @Column({ type: 'varchar', length: 20, nullable: true })
  customerPhone?: string; // For anonymous feedback

  @Column({
    type: 'varchar', length: 50,
    
    default: FeedbackType.GENERAL
  })
  feedbackType!: FeedbackType;

  @Column({ type: 'smallint', unsigned: true })
  rating!: number; // 1-5 rating scale

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text' })
  comment!: string;

  @Column({
    type: 'varchar', length: 50,
    
    default: SentimentType.NEUTRAL
  })
  sentiment!: SentimentType;

  @Column({
    type: 'varchar', length: 50,
    
    default: FeedbackStatus.PENDING
  })
  status!: FeedbackStatus;

  @Column({ type: 'boolean', default: true })
  isPublic!: boolean; // Can be displayed publicly

  @Column({ type: 'boolean', default: false })
  isAnonymous!: boolean; // Anonymous feedback

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean; // Verified purchase feedback

  @Column({ type: 'text', nullable: true })
  tags?: string; // JSON array of tags

  @Column({ type: 'text', nullable: true })
  attachments?: string; // JSON array of attachment URLs

  @Column({ type: 'text', nullable: true })
  response?: string; // Management response

  @Column({ type: 'varchar', length: 255, nullable: true })
  respondedBy?: string; // User ID who responded

  @Column({ type: 'timestamp', nullable: true })
  respondedAt?: Date;

  @Column({ type: 'text', nullable: true })
  internalNotes?: string; // Internal notes for staff

  @Column({ type: 'varchar', length: 255, nullable: true })
  source?: string; // Source of feedback (website, app, phone, etc.)

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceInfo?: string; // Device information

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string; // IP address of the feedback submitter

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number; // Location where feedback was given

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'int', default: 0 })
  helpfulCount!: number; // Number of people who found this helpful

  @Column({ type: 'int', default: 0 })
  notHelpfulCount!: number; // Number of people who found this not helpful

  @Column({ type: 'boolean', default: false })
  isResolved!: boolean; // Issue has been resolved

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Computed properties
  get ratingDisplayName(): string {
    const ratingMap: { [key: number]: string } = {
      1: 'Sangat Buruk',
      2: 'Buruk',
      3: 'Cukup',
      4: 'Baik',
      5: 'Sangat Baik'
    };
    return ratingMap[this.rating] || 'Tidak Diketahui';
  }

  get typeDisplayName(): string {
    const typeMap = {
      [FeedbackType.ORDER]: 'Pesanan',
      [FeedbackType.MENU_ITEM]: 'Menu',
      [FeedbackType.SERVICE]: 'Pelayanan',
      [FeedbackType.AMBIANCE]: 'Suasana',
      [FeedbackType.CLEANLINESS]: 'Kebersihan',
      [FeedbackType.VALUE_FOR_MONEY]: 'Nilai Uang',
      [FeedbackType.DELIVERY]: 'Pengiriman',
      [FeedbackType.GENERAL]: 'Umum',
      [FeedbackType.COMPLAINT]: 'Keluhan',
      [FeedbackType.SUGGESTION]: 'Saran'
    };
    return typeMap[this.feedbackType] || this.feedbackType;
  }

  get statusDisplayName(): string {
    const statusMap = {
      [FeedbackStatus.PENDING]: 'Menunggu',
      [FeedbackStatus.REVIEWED]: 'Ditinjau',
      [FeedbackStatus.RESPONDED]: 'Direspons',
      [FeedbackStatus.RESOLVED]: 'Diselesaikan',
      [FeedbackStatus.ARCHIVED]: 'Diarsipkan'
    };
    return statusMap[this.status] || this.status;
  }

  get sentimentDisplayName(): string {
    const sentimentMap = {
      [SentimentType.VERY_POSITIVE]: 'Sangat Positif',
      [SentimentType.POSITIVE]: 'Positif',
      [SentimentType.NEUTRAL]: 'Netral',
      [SentimentType.NEGATIVE]: 'Negatif',
      [SentimentType.VERY_NEGATIVE]: 'Sangat Negatif'
    };
    return sentimentMap[this.sentiment] || this.sentiment;
  }

  get helpfulnessScore(): number {
    const total = this.helpfulCount + this.notHelpfulCount;
    return total === 0 ? 0 : (this.helpfulCount / total) * 100;
  }

  get isPositive(): boolean {
    return this.sentiment === SentimentType.POSITIVE || this.sentiment === SentimentType.VERY_POSITIVE;
  }

  get isNegative(): boolean {
    return this.sentiment === SentimentType.NEGATIVE || this.sentiment === SentimentType.VERY_NEGATIVE;
  }

  get responseTime(): number | null {
    if (!this.respondedAt) return null;
    return Math.floor((this.respondedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60)); // Hours
  }

  get resolutionTime(): number | null {
    if (!this.resolvedAt) return null;
    return Math.floor((this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60)); // Hours
  }

  // Helper methods
  getParsedTags(): string[] {
    try {
      return this.tags ? JSON.parse(this.tags) : [];
    } catch {
      return [];
    }
  }

  setParsedTags(tags: string[]): void {
    this.tags = JSON.stringify(tags);
  }

  getParsedAttachments(): string[] {
    try {
      return this.attachments ? JSON.parse(this.attachments) : [];
    } catch {
      return [];
    }
  }

  setParsedAttachments(attachments: string[]): void {
    this.attachments = JSON.stringify(attachments);
  }

  addTag(tag: string): void {
    const tags = this.getParsedTags();
    if (!tags.includes(tag)) {
      tags.push(tag);
      this.setParsedTags(tags);
    }
  }

  removeTag(tag: string): void {
    const tags = this.getParsedTags();
    const index = tags.indexOf(tag);
    if (index > -1) {
      tags.splice(index, 1);
      this.setParsedTags(tags);
    }
  }

  addAttachment(url: string): void {
    const attachments = this.getParsedAttachments();
    if (!attachments.includes(url)) {
      attachments.push(url);
      this.setParsedAttachments(attachments);
    }
  }

  removeAttachment(url: string): void {
    const attachments = this.getParsedAttachments();
    const index = attachments.indexOf(url);
    if (index > -1) {
      attachments.splice(index, 1);
      this.setParsedAttachments(attachments);
    }
  }

  // Business logic methods
  respond(responseText: string, responderId: string): void {
    this.response = responseText;
    this.respondedBy = responderId;
    this.respondedAt = new Date();
    this.status = FeedbackStatus.RESPONDED;
  }

  markAsResolved(resolverId?: string): void {
    this.isResolved = true;
    this.resolvedAt = new Date();
    this.status = FeedbackStatus.RESOLVED;
    
    if (resolverId && !this.respondedBy) {
      this.respondedBy = resolverId;
    }
  }

  markAsReviewed(): void {
    this.status = FeedbackStatus.REVIEWED;
  }

  archive(): void {
    this.status = FeedbackStatus.ARCHIVED;
  }

  markAsHelpful(): void {
    this.helpfulCount += 1;
  }

  markAsNotHelpful(): void {
    this.notHelpfulCount += 1;
  }

  updateSentiment(newSentiment: SentimentType): void {
    this.sentiment = newSentiment;
  }

  // Auto-detect sentiment based on rating
  autoDetectSentiment(): void {
    if (this.rating === 5) {
      this.sentiment = SentimentType.VERY_POSITIVE;
    } else if (this.rating === 4) {
      this.sentiment = SentimentType.POSITIVE;
    } else if (this.rating === 3) {
      this.sentiment = SentimentType.NEUTRAL;
    } else if (this.rating === 2) {
      this.sentiment = SentimentType.NEGATIVE;
    } else if (this.rating === 1) {
      this.sentiment = SentimentType.VERY_NEGATIVE;
    }
  }

  // Validate feedback data
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.comment || this.comment.trim().length === 0) {
      errors.push('Komentar harus diisi');
    }

    if (this.comment && this.comment.length > 2000) {
      errors.push('Komentar maksimal 2000 karakter');
    }

    if (this.rating < 1 || this.rating > 5) {
      errors.push('Rating harus antara 1-5');
    }

    if (!this.customerId && !this.customerName && !this.isAnonymous) {
      errors.push('Nama pelanggan harus diisi untuk feedback non-anonim');
    }

    if (this.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.customerEmail)) {
      errors.push('Format email tidak valid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get customer display name
  getCustomerDisplayName(): string {
    if (this.isAnonymous) {
      return 'Anonim';
    }
    
    if (this.customer) {
      return this.customer.name;
    }
    
    return this.customerName || 'Tidak diketahui';
  }

  // Clone feedback (for creating similar feedback)
  clone(): Partial<Feedback> {
    return {
      feedbackType: this.feedbackType,
      title: this.title,
      tags: this.tags,
      isPublic: this.isPublic,
      source: this.source
    };
  }
}
