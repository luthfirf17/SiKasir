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
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Button,
  Chip,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Timer,
  AttachMoney,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import KasirNavigation from '../components/KasirNavigation';

interface KasirLayoutProps {
  children: React.ReactNode;
  title: string;
}

const KasirLayout: React.FC<KasirLayoutProps> = ({ 
  children, 
  title 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data untuk shift info
  const shiftInfo = {
    startTime: '08:00',
    currentTime: new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    totalSales: 'Rp 2,450,000',
    transactionCount: 47
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle navigation item click
  const handleNavigationClick = (path: string) => {
    // TODO: Implement navigation logic
    console.log('Navigate to:', path);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <KasirNavigation
        open={sidebarOpen}
        onItemClick={handleNavigationClick}
        currentPath={window.location.pathname}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin 0.3s ease',
          marginLeft: sidebarOpen ? 0 : '-280px',
          minHeight: '100vh',
          backgroundColor: '#f0f9ff',
        }}
      >
        {/* Top Header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Toolbar>
            {/* Menu Toggle Button */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            {/* Page Title */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h1" fontWeight="bold">
                {title}
              </Typography>
              
              {/* Shift Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Chip
                  icon={<Timer />}
                  label={`Shift: ${shiftInfo.startTime} - ${shiftInfo.currentTime}`}
                  color="success"
                  size="small"
                />
                <Chip
                  icon={<AttachMoney />}
                  label={`Sales: ${shiftInfo.totalSales}`}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={`${shiftInfo.transactionCount} Transactions`}
                  color="info"
                  size="small"
                />
              </Box>
            </Box>

            {/* Header Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Quick Action Buttons */}
              <Button
                variant="contained"
                color="success"
                size="small"
                sx={{ mr: 1 }}
              >
                New Transaction
              </Button>

              {/* Notifications */}
              <IconButton color="inherit">
                <Badge badgeContent={2} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* User Profile Menu */}
              <IconButton
                onClick={handleUserMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: 'success.main' }}
                >
                  {user?.fullName?.charAt(0) || 'K'}
                </Avatar>
              </IconButton>

              {/* User Menu Dropdown */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleUserMenuClose}>
                  <AccountCircle sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleUserMenuClose}>
                  End Shift
                </MenuItem>
                <MenuItem onClick={handleUserMenuClose}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default KasirLayout;
