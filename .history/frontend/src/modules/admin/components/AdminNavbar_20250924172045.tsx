/**
 * AdminNavbar.tsx
 * 
 * DESKRIPSI SINGKAT:
 * - Top navigation bar untuk admin dengan profile dropdown dan notifikasi
 * - Menampilkan logo/brand di kiri, profile dan notifikasi di kanan
 * - Profile dropdown dengan logout functionality
 * - Notification icon dengan badge count
 * - Responsive design untuk mobile dan desktop
 */

import React, { useState } from 'react';
import {
  AppBar, Toolbar, Box, IconButton, Badge, Avatar, Menu, MenuItem,
  Typography, Divider, ListItemIcon, ListItemText, useTheme, CircularProgress
} from '@mui/material';
import {
  Notifications, Logout, Settings, Person,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../store';
import { logoutUser, clearAuth } from '../../../store/slices/authSlice';

interface AdminNavbarProps {
  onMenuToggle: () => void;
  isMobile: boolean;
  sidebarOpen: boolean; // Add this prop
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onMenuToggle, isMobile, sidebarOpen }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Get user data from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Default user data if not available from store
  const currentUser = {
    fullName: user?.fullName || 'Administrator',
    email: user?.email || 'admin@kasirku.com',
    avatar: user?.avatar || null,
    role: user?.role || 'admin'
  };

  // Mock notifications count
  const notificationCount = 3;

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileClose();
    setIsLoggingOut(true);

    try {
      // Immediately clear Redux state and localStorage
      dispatch(clearAuth());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // Try to call logout API in background (don't wait for it)
      dispatch(logoutUser() as any).catch((error: any) => {
        console.error('Logout API failed:', error);
        // API failure doesn't matter since we've already cleared local state
      });

      // Navigate immediately
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure state is cleared even if something goes wrong
      dispatch(clearAuth());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfile = () => {
    handleProfileClose();
    console.log('Navigate to profile page');
  };

  const handleSettings = () => {
    handleProfileClose();
    console.log('Navigate to settings page');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        color: '#374151',
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Desktop Menu Button - Show when sidebar is closed */}
        {!isMobile && !sidebarOpen && (
          <IconButton
            edge="start"
            onClick={onMenuToggle}
            sx={{ 
              mr: 2, 
              color: '#374151',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 2, color: '#374151' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Brand/Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#6366f1',
            }}
          >
            KasirKu
          </Typography>
          <Typography
            variant="caption"
            sx={{ ml: 1, color: '#6b7280' }}
          >
            Admin Panel
          </Typography>
        </Box>

        {/* Right Side - Notifications & Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            onClick={handleNotificationClick}
            sx={{
              color: '#374151',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <Badge
              badgeContent={notificationCount}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: 18,
                  minWidth: 18,
                },
              }}
            >
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile */}
          <IconButton
            onClick={handleProfileClick}
            sx={{
              p: 0.5,
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#6366f1',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.fullName} style={{ width: '100%', height: '100%' }} />
              ) : (
                currentUser.fullName.charAt(0).toUpperCase()
              )}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileClose}
          onClick={handleProfileClose}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          {/* User Info Header */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {currentUser.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentUser.email}
            </Typography>
            <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
              {currentUser.role}
            </Typography>
          </Box>

          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }} disabled={isLoggingOut}>
            <ListItemIcon>
              {isLoggingOut ? (
                <CircularProgress size={16} sx={{ color: '#ef4444' }} />
              ) : (
                <Logout fontSize="small" sx={{ color: '#ef4444' }} />
              )}
            </ListItemIcon>
            <ListItemText>{isLoggingOut ? 'Logging out...' : 'Logout'}</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notification Dropdown Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          onClick={handleNotificationClose}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 300,
              maxWidth: 400,
              borderRadius: 2,
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          {/* Notification Header */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Notifications ({notificationCount})
            </Typography>
          </Box>

          {/* Mock Notifications */}
          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Low Stock Alert
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Beef stock is running low (5 portions left)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                5 mins ago
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Order Completed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Table 15 order has been served successfully
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                10 mins ago
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                New Staff Check-in
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maria Rodriguez checked in for evening shift
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                15 mins ago
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
