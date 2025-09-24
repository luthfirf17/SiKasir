import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Table } from './Table';
import { Customer } from './Customer';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  reservation_id!: string;

  @Column({ type: 'varchar', length: 255 })
  customer_name!: string;

  @Column({ type: 'varchar', length: 20 })
  customer_phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customer_email?: string;

  @Column({ type: 'integer' })
  guest_count!: number;

  @Column({ type: 'timestamp' })
  reservation_date!: Date;

  @Column({ type: 'timestamp' })
  reservation_time!: Date;

  @Column({ type: 'integer', default: 2 })
  duration_hours!: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: string; // pending, confirmed, cancelled, completed

  @Column({ type: 'text', nullable: true })
  special_requests?: string;

  @Column({ type: 'uuid', nullable: true })
  table_id?: string;

  @ManyToOne(() => Table, table => table.reservations, { nullable: true })
  @JoinColumn({ name: 'table_id' })
  table?: Table;

  @Column({ type: 'uuid', nullable: true })
  customer_id?: string;

  @ManyToOne(() => Customer, customer => customer.reservations, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
