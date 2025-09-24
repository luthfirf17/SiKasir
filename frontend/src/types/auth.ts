export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  KASIR = 'kasir',
  WAITER = 'waiter',
  KITCHEN = 'kitchen',
  OWNER = 'owner',
  CUSTOMER = 'customer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
  address?: string;
}
