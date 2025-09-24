/**
 * Admin Types
 * 
 * Type definitions untuk modul admin
 */

// Export auth types
export * from './auth';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  permissions: string[];
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  activeTables: number;
  onlineStaff: number;
}

export interface AdminReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  data: any;
  createdAt: Date;
}
