// Placeholder models to complete the structure
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './Customer';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  status!: string;

  @Column()
  total!: number;

  @Column({ nullable: true })
  customer_id?: string;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  user!: any; // Placeholder
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  quantity!: number;

  @Column()
  price!: number;
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  amount!: number;

  @Column()
  method!: string;
}

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  key!: string;

  @Column()
  value!: string;
}
