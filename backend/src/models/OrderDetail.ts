import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
// import { OrderNew } from './OrderNew'; // Commented to avoid circular imports
import { Menu } from './Menu';

@Entity('order_details')
@Index(['order_id'])
@Index(['menu_id'])
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  order_detail_id!: string;

  @Column({ type: 'uuid' })
  order_id!: string;

  @Column({ type: 'uuid' })
  menu_id!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_at_time!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price!: number;

  @Column({ type: 'text', nullable: true })
  preparation_notes?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customization?: string;

  @Column({ type: 'json', nullable: true })
  modifiers?: any;

  @CreateDateColumn()
  created_at!: Date;

  // Relations using string literals to avoid circular imports
  @ManyToOne('Order', 'order_details')
  @JoinColumn({ name: 'order_id' })
  order!: any;

  @ManyToOne(() => Menu, menu => menu.order_details)
  @JoinColumn({ name: 'menu_id' })
  menu!: Menu;
}
