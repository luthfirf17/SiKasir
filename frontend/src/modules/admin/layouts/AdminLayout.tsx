/**
 * AdminLayout.tsx
 * 
 * DESKRIPSI SINGKAT:
 * - Layout wrapper utama untuk seluruh halaman admin
 * - Menyediakan sidebar navigasi yang dapat di-toggle
 * - Mengatur responsive behavior untuk mobile/desktop
 * - Menggunakan React Router Outlet untuk render halaman child
 * - Mengelola state sidebar (buka/tutup) dan navigation handling
 */

import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ModernAdminNavigation from '../components/ModernAdminNavigation';
import AdminNavbar from '../components/AdminNavbar';

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Start with sidebar closed on mobile

  // Handler untuk navigation - menangani logout dan routing biasa
  const handleNavigation = (path: string) => {
    if (path === '/logout') {
      console.log('Logging out...');
      // Implement logout logic here
      // localStorage.removeItem('token');
      // navigate('/login');
      return;
    }
    navigate(path);
  };

  // Handler untuk toggle sidebar (buka/tutup)
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <AdminNavbar 
        onMenuToggle={handleSidebarToggle} 
        isMobile={isMobile} 
        sidebarOpen={sidebarOpen}
      />
      
      {/* Sidebar Navigation */}
      <ModernAdminNavigation
        open={sidebarOpen}
        currentPath={location.pathname}
        onItemClick={handleNavigation}
        onToggle={handleSidebarToggle}
      />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 0.5 : 0.5,
          mt: 10, // Lebih dekat ke navbar
          ml: isMobile ? 0 : (sidebarOpen ? '0px' : '70px'), // Optimized margin for consistent spacing
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
export default AdminLayout;
