import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';

@Entity('table_usage_history')
@Index(['table_id'])
@Index(['start_time'])
@Index(['end_time'])
export class TableUsageHistory {
  @PrimaryGeneratedColumn('uuid')
  usage_id!: string;

  @Column({ type: 'uuid' })
  table_id!: string;

  @Column({ type: 'uuid', nullable: true })
  order_id?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customer_name?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  customer_phone?: string;

  @Column({ type: 'integer' })
  guest_count!: number;

  @Column({ type: 'timestamp' })
  start_time!: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time?: Date;

  @Column({ type: 'integer', nullable: true })
  duration_minutes?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_order_amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_payment_amount!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  usage_type?: string; // 'dine_in', 'reservation', 'walk_in'

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  waiter_assigned?: string;

  @Column({ type: 'timestamp', nullable: true })
  order_placed_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  food_served_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  payment_completed_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  // Relations using string literals
  @ManyToOne('Table', 'usage_history')
  @JoinColumn({ name: 'table_id' })
  table!: any;

  @ManyToOne('Order', 'table_usage')
  @JoinColumn({ name: 'order_id' })
  order!: any;
}
