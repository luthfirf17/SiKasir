/**
 * navigationConfig.ts
 * 
 * DESKRIPSI SINGKAT:
 * - Konfigurasi sentral untuk semua menu dan navigasi admin
 * - Mengatur routing, icons, permissions, dan grouping menu
 * - Mendukung nested menus dan conditional display
 * - Icon names untuk Material-UI icons
 * - Simple navigation config yang sesuai dengan screenshot
 */

// Interface untuk menu item configuration
export interface NavigationItem {
  id: string;
  text: string;
  iconName: string;
  path: string;
  badge?: number | string;
  disabled?: boolean;
  roles?: string[];
  children?: NavigationItem[];
  divider?: boolean;
}

// Navigation config yang disesuaikan dengan pages yang tersedia
export const simpleNavigationConfig: NavigationItem[] = [
  {
    id: 'dashboard',
    text: 'Dashboard',
    iconName: 'Dashboard',
    path: '/admin/dashboard',
  },
  {
    id: 'menu',
    text: 'Menu Management',
    iconName: 'Restaurant',
    path: '/admin/menu',
  },
  {
    id: 'tables',
    text: 'Tables',
    iconName: 'TableChart',
    path: '/admin/tables',
  },
  {
    id: 'users',
    text: 'User Management',
    iconName: 'Group',
    path: '/admin/users',
  },
  {
    id: 'reports',
    text: 'Reports',
    iconName: 'BarChart',
    path: '/admin/reports',
  },
  {
    id: 'system-config',
    text: 'System Config',
    iconName: 'Settings',
    path: '/admin/system-config',
  },
];

// Helper function untuk find navigation item by path
export const findNavigationItemByPath = (path: string): NavigationItem | undefined => {
  return simpleNavigationConfig.find(item => item.path === path);
};
