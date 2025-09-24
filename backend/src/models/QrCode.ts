import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Table } from './Table';

@Entity('qr_codes')
@Index(['qr_code_value'], { unique: true })
@Index(['table_id'])
@Index(['expires_at'])
export class QrCode {
  @PrimaryGeneratedColumn('uuid')
  qr_id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  qr_code_value!: string;

  @Column({ type: 'uuid' })
  table_id!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  qr_type?: string;

  @Column({ type: 'json', nullable: true })
  additional_data?: any;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date;

  @Column({ type: 'integer', default: 0 })
  scan_count!: number;

  @Column({ type: 'timestamp', nullable: true })
  last_scanned_at?: Date;

  @CreateDateColumn()
  generated_at!: Date;

  // Relations using string literal to avoid dependency issues
  @ManyToOne('Table', 'qrCodes')
  @JoinColumn({ name: 'table_id' })
  table!: any;
}
