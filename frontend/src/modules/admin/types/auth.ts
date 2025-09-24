/**
 * Auth Types untuk Admin Module
 * 
 * Re-export types dari main types folder dan tambahan untuk admin
 */

// Re-export dari main types
export * from '../../../types/auth';
export * from '../../../types/common';

// Additional admin-specific types
export interface AdminUser extends Omit<User, 'permissions'> {
  permissions: AdminPermission[];
  lastLoginAt: Date;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

export interface SystemStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
}

export interface UserActivity {
  userId: string;
  action: string;
  timestamp: Date;
  details: string;
}

// Import base types from main types folder
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRoleType;
  status: UserStatusType;
  fullName: string;
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
  lastLogin?: Date;
}

export type UserRoleType = 'admin' | 'kasir' | 'owner' | 'kitchen' | 'customer';
export type UserStatusType = 'active' | 'inactive' | 'suspended';

// Enum-like objects untuk kompatibilitas dengan kode yang menggunakan enum
export const UserRole = {
  ADMIN: 'admin' as const,
  KASIR: 'kasir' as const,
  OWNER: 'owner' as const,
  KITCHEN: 'kitchen' as const,
  WAITER: 'kitchen' as const, // alias untuk kitchen
  CUSTOMER: 'customer' as const
} as const;

export const UserStatus = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  SUSPENDED: 'suspended' as const,
  PENDING: 'inactive' as const // alias untuk inactive
} as const;
