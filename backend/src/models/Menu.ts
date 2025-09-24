import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
// import { OrderDetail } from './OrderDetail'; // Commented to avoid circular imports
// import { MenuInventory } from './MenuInventory'; // Commented to avoid circular imports

export enum MenuCategory {
  FOOD = 'food',
  BEVERAGE = 'beverage',
  DESSERT = 'dessert',
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  SIDE_DISH = 'side_dish',
  SNACK = 'snack'
}

@Entity('menus')
@Index(['name'])
@Index(['category'])
@Index(['is_available'])
@Index(['price'])
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  menu_id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: MenuCategory.FOOD
  })
  category!: MenuCategory;

  @Column({ type: 'boolean', default: true })
  is_available!: boolean;

  @Column({ type: 'integer', nullable: true })
  prep_time_minutes?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  spice_level?: string;

  @Column({ type: 'boolean', default: false })
  is_vegetarian!: boolean;

  @Column({ type: 'boolean', default: false })
  is_vegan!: boolean;

  @Column({ type: 'boolean', default: false })
  is_gluten_free!: boolean;

  @Column({ type: 'json', nullable: true })
  allergens?: string[];

  @Column({ type: 'text', nullable: true })
  ingredients?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  calories?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ type: 'integer', default: 0 })
  review_count!: number;

  @Column({ type: 'integer', default: 0 })
  order_count!: number;

  @Column({ type: 'boolean', default: false })
  is_featured!: boolean;

  @Column({ type: 'boolean', default: false })
  is_new!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost_price?: number;

  @Column({ type: 'integer', default: 0 })
  stock!: number;

  @Column({ type: 'integer', default: 10 })
  low_stock_threshold!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  promo_price?: number;

  @Column({ type: 'text', nullable: true })
  promo_description?: string;

  @Column({ type: 'boolean', default: false })
  is_promo_active!: boolean;

  // Financial Analysis Fields
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  profit_margin_percentage?: number; // Persentase margin keuntungan

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  profit_amount?: number; // Nominal keuntungan per item (price - cost_price)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  loss_amount?: number; // Nominal kerugian jika ada (untuk promo)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promo_margin_percentage?: number; // Persentase margin saat promo aktif

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  promo_profit_amount?: number; // Keuntungan saat promo aktif

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  margin_reduction_amount?: number; // Pengurangan margin karena promo

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations using string literals to avoid circular imports
  @OneToMany('OrderDetail', 'menu')
  order_details!: any[];

  @OneToMany('MenuInventory', 'menu')
  menu_inventories!: any[];
}
