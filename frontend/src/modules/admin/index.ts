/**
 * Admin Module Index
 * 
 * Export semua komponen dan utilities yang diperlukan untuk modul admin
 */

// Pages
export { default as AdminDashboard } from './pages/DashboardPage';
export { default as AdminReports } from './pages/ReportsPage';
export { default as AdminUsers } from './pages/UsersPage';
export { default as AdminTables } from './pages/TablesPage';
export { default as AdminMenu } from './pages/MenuPage';
export { default as AdminConfig } from './pages/SystemConfigPage';

// Components
export { default as ModernAdminNavigation } from './components/ModernAdminNavigation';
export { default as AdminLayout } from './layouts/AdminLayout';

// Types
export * from './types';

// Services  
export { adminService } from './services';
export type { AdminUser, AdminStats, AdminReport } from './services';

// Hooks
export * from './hooks';
