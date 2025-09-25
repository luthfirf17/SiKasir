/**
 * KasirLayout.tsx
 * 
 * Layout wrapper khusus untuk halaman kasir yang berisi:
 * - KasirNavigation sidebar dengan POS menu
 * - Header dengan shift info dan transaction summary
 * - Main content area untuk POS operations
 * - Quick access buttons untuk payment methods
 */

import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Button, Chip, Avatar, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Notifications, AccountCircle, Timer, AttachMoney } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Outlet } from 'react-router-dom';
import KasirNavigation from '../components/KasirNavigation';

// ========== KONSTANTA STYLING ==========
// Styling untuk main content area
const MAIN_CONTENT_STYLES = {
  flexGrow: 1,
  transition: 'margin 0.3s ease',
  minHeight: '100vh',
  backgroundColor: '#f0f9ff',
};

// Styling untuk app bar header
const APP_BAR_STYLES = {
  backgroundColor: 'white',
  color: 'text.primary',
  borderBottom: '1px solid #e5e7eb',
};

// Styling untuk page content container
const PAGE_CONTENT_STYLES = { p: 3 };

const KasirLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // ========== DATA SHIFT INFO ==========
  // Informasi shift kerja kasir saat ini
  const shiftInfo = {
    startTime: '08:00',
    currentTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    totalSales: 'Rp 2,450,000',
    transactionCount: 47
  };

  // ========== EVENT HANDLERS ==========
  // Handler untuk toggle sidebar
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  // Handler untuk membuka menu user
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);

  // Handler untuk menutup menu user
  const handleUserMenuClose = () => setAnchorEl(null);

  // Handler untuk navigasi menu item
  const handleNavigationClick = (path: string) => {
    console.log('Navigate to:', path); // TODO: Implement navigation logic
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ========== SIDEBAR NAVIGATION ========== */}
      {/* Komponen navigasi sidebar untuk menu kasir */}
      <KasirNavigation
        open={sidebarOpen}
        onItemClick={handleNavigationClick}
        currentPath={window.location.pathname}
      />

      {/* ========== MAIN CONTENT AREA ========== */}
      {/* Area konten utama dengan header dan outlet untuk halaman */}
      <Box component="main" sx={{ ...MAIN_CONTENT_STYLES, marginLeft: sidebarOpen ? 0 : '-280px' }}>
        {/* ========== TOP HEADER ========== */}
        {/* Header aplikasi dengan informasi shift dan aksi cepat */}
        <AppBar position="static" elevation={0} sx={APP_BAR_STYLES}>
          <Toolbar>
            {/* ========== MENU TOGGLE BUTTON ========== */}
            {/* Tombol untuk toggle sidebar navigation */}
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleSidebarToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>

            {/* ========== PAGE TITLE & SHIFT INFO ========== */}
            {/* Judul halaman dan informasi shift kerja */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h1" fontWeight="bold">POS Dashboard</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Chip icon={<Timer />} label={`Shift: ${shiftInfo.startTime} - ${shiftInfo.currentTime}`} color="success" size="small" />
                <Chip icon={<AttachMoney />} label={`Sales: ${shiftInfo.totalSales}`} color="primary" size="small" />
                <Chip label={`${shiftInfo.transactionCount} Transactions`} color="info" size="small" />
              </Box>
            </Box>

            {/* ========== HEADER ACTIONS ========== */}
            {/* Tombol aksi cepat, notifikasi, dan menu user */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="contained" color="success" size="small" sx={{ mr: 1 }}>New Transaction</Button>
              <IconButton color="inherit">
                <Badge badgeContent={2} color="error"><Notifications /></Badge>
              </IconButton>
              <IconButton onClick={handleUserMenuOpen} color="inherit" sx={{ ml: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                  {user?.fullName?.charAt(0) || 'K'}
                </Avatar>
              </IconButton>

              {/* ========== USER MENU DROPDOWN ========== */}
              {/* Menu dropdown untuk profile, end shift, dan logout */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleUserMenuClose}><AccountCircle sx={{ mr: 1 }} />Profile</MenuItem>
                <MenuItem onClick={handleUserMenuClose}>End Shift</MenuItem>
                <MenuItem onClick={handleUserMenuClose}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* ========== PAGE CONTENT ========== */}
        {/* Container untuk konten halaman yang di-render melalui Outlet */}
        <Box sx={PAGE_CONTENT_STYLES}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default KasirLayout;
