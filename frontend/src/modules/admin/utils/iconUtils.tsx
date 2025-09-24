/**
 * iconUtils.tsx
 * 
 * DESKRIPSI SINGKAT:
 * - Utility functions untuk mengkonversi icon names ke JSX elements
 * - Centralized icon mapping untuk konsistensi
 * - Support untuk dynamic icon loading
 */

import React from 'react';
import {
  // Core Navigation Icons
  Dashboard, Settings, ExitToApp, Notifications, People, Group, Navigation,
  // Business Icons  
  Assessment, Analytics, TrendingUp, MonetizationOn, AttachMoney, Payment, Receipt,
  // Content Icons
  MenuBook, TableChart, TableRestaurant, Restaurant, Inventory, Storage,
  // Action Icons
  Favorite, Inbox, List, CheckCircle, CalendarToday, Contacts, Tune,
  // Chart Icons
  BarChart, PieChart, Widgets,
  // System Icons
  Security, AdminPanelSettings, HelpOutline
} from '@mui/icons-material';

// Icon mapping object
const iconMap: Record<string, React.ReactElement> = {
  Dashboard: <Dashboard />,
  Assessment: <Assessment />,
  People: <People />,
  Settings: <Settings />,
  TableRestaurant: <TableRestaurant />,
  Restaurant: <Restaurant />,
  Notifications: <Notifications />,
  ExitToApp: <ExitToApp />,
  Inventory: <Inventory />,
  Payment: <Payment />,
  Analytics: <Analytics />,
  Security: <Security />,
  Storage: <Storage />,
  AdminPanelSettings: <AdminPanelSettings />,
  MonetizationOn: <MonetizationOn />,
  TrendingUp: <TrendingUp />,
  Group: <Group />,
  MenuBook: <MenuBook />,
  TableChart: <TableChart />,
  Tune: <Tune />,
  BarChart: <BarChart />,
  PieChart: <PieChart />,
  Favorite: <Favorite />,
  Inbox: <Inbox />,
  List: <List />,
  AttachMoney: <AttachMoney />,
  CalendarToday: <CalendarToday />,
  CheckCircle: <CheckCircle />,
  Contacts: <Contacts />,
  Receipt: <Receipt />,
  Widgets: <Widgets />,
  Navigation: <Navigation />,
};

// Function untuk get icon by name
export const getIconByName = (iconName: string): React.ReactElement => {
  return iconMap[iconName] || <HelpOutline />;
};

// Function untuk check if icon exists
export const iconExists = (iconName: string): boolean => {
  return iconName in iconMap;
};

// Get all available icon names
export const getAvailableIcons = (): string[] => {
  return Object.keys(iconMap);
};
