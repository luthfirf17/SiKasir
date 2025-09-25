import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Order } from './Order';

export enum UserRole {
  ADMIN = 'admin',
  KASIR = 'kasir',
  WAITER = 'waiter',
  KITCHEN = 'kitchen',
  OWNER = 'owner',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true })
  passwordResetExpires?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Order, order => order.user)
  orders!: Order[];

  @BeforeInsert()
  async hashPassword() {
    // Disabled: Password hashing is handled in UserController to avoid double hashing
    // if (this.password) {
    //   this.password = await bcrypt.hash(this.password, 12);
    // }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Disabled: Password hashing is handled in UserController to avoid double hashing
    // if (this.password) {
    //   this.password = await bcrypt.hash(this.password, 12);
    // }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
