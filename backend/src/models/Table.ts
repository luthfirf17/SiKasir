import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_ORDER = 'out_of_order'
}

export enum TableArea {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  VIP = 'vip',
  SMOKING = 'smoking',
  NON_SMOKING = 'non_smoking',
  SECOND_FLOOR = 'second_floor',
  TERRACE = 'terrace'
}

@Entity('tables')
@Index(['table_number'])
@Index(['status'])
@Index(['location'])
@Index(['capacity'])
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', name: 'number' })
  table_number!: string;

  @Column({ type: 'integer' })
  capacity!: number;

  @Column({ type: 'varchar' })
  status!: string;

  @Column({ type: 'varchar', name: 'location' })
  location!: string;

  // Getter for frontend compatibility - maps 'location' to 'area'
  get area(): string {
    return this.location;
  }

  set area(value: string) {
    this.location = value;
  }

  // Persisted columns
  @Column({ type: 'text', name: 'location_description', nullable: true })
  location_description?: string | null;

  @Column({ type: 'text', name: 'notes', nullable: true })
  notes?: string | null;

  // Virtual properties for frontend compatibility (not in database)
  position_x?: number;
  position_y?: number;
  is_active?: boolean;
  // Removed duplicate virtual notes declaration
  reserved_customer_name?: string;
  reserved_customer_phone?: string;
  reserved_from?: Date;
  reserved_until?: Date;
  reserved_guest_count?: number;
  occupied_since?: Date;
  current_guest_count?: number;
  current_order_id?: string;

  // Virtual fields for frontend compatibility (not in database)
  total_usage_count?: number = 0;
  total_revenue?: number = 0;
  last_occupied_at?: Date;
  average_usage_duration_minutes?: number = 0;
  last_cleaned_at?: Date;
  last_cleaned_by?: string;
  next_maintenance_date?: Date;
  created_at?: Date;
  updated_at?: Date;

  // Virtual relations
  qr_codes?: any[];
  orders?: any[];
  reservations?: any[];
}
