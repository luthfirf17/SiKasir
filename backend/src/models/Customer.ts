import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { User } from './User';
import { Order } from './Order';

@Entity('customers')
@Index(['phone'])
@Index(['email'])
@Index(['created_at'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  customer_id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  membership_tier?: string;

  @Column({ type: 'integer', default: 0 })
  total_visits!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_spent!: number;

  @Column({ type: 'integer', default: 0 })
  loyalty_points_balance!: number;

  @Column({ type: 'timestamp', nullable: true })
  last_visit?: Date;

  @Column({ type: 'json', nullable: true })
  preferences?: any;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => Order, order => order.customer)
  orders!: Order[];

  @OneToMany('Reservation', 'customer')
  reservations!: any[];

  @OneToMany('Feedback', 'customer')
  feedbacks!: any[];

  @OneToMany('LoyaltyPoint', 'customer')
  loyalty_points!: any[];
}
