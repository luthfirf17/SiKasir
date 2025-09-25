/**
 * App.tsx
 * 
 * DESKRIPSI SINGKAT:
 * - Root component aplikasi POS (Point of Sale) modern
 * - Mengatur routing utama untuk semua modul (Admin, Kasir, Customer, Owner, Kitchen)
 * - Menyediakan wrapper global: Redux store, Material-UI theme, dan authentication
 * - Mengelola protected routes dengan middleware authentication
 * - Mendukung multi-role system dengan layout terpisah per role
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { theme } from './theme';

// Core components
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './modules/admin/layouts/AdminLayout';
import LoginPage from './pages/LoginPage';

// Module imports - grouped by functionality
import DashboardPage from './modules/admin/pages/DashboardPage';
import MenuPage from './modules/admin/pages/MenuPage';
import TablesPage from './modules/admin/pages/TablesPage';
import UsersPage from './modules/admin/pages/UsersPage';
import ReportsPage from './modules/admin/pages/ReportsPage';
import SystemConfigPage from './modules/admin/pages/SystemConfigPage';
import { KasirDashboard } from './modules/kasir';
import { CustomerApp } from './modules/customer';
import { OwnerDashboard } from './modules/owner';
import { KitchenDashboard } from './modules/kitchen';
import KasirLayout from './modules/kasir/components/KasirLayout';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes - Tidak memerlukan authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/customer/:tableId" element={<CustomerApp />} />
            
            {/* Protected Routes - Memerlukan authentication */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="tables" element={<TablesPage />} />
              <Route path="system-config" element={<SystemConfigPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* Redirect root to admin */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Other module routes */}
            <Route path="/kasir" element={<ProtectedRoute><KasirLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/kasir/dashboard" replace />} />
              <Route path="dashboard" element={<KasirDashboard />} />
            </Route>
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/kitchen" element={<KitchenDashboard />} />

            {/* Catch all route - Redirect ke admin dashboard untuk path tidak dikenali */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
