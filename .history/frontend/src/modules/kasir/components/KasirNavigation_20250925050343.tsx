/**
 * KasirNavigation.tsx
 *
 * Komponen navigasi khusus untuk kasir yang berisi:
 * - Quick access untuk POS system
 * - Payment processing dan transaction history
 * - Cash register management
 * - Daily reports dan shift management
 */

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  PointOfSale,
  Payment,
  Receipt,
  History,
  AccountBalance,
  TrendingUp,
  Schedule,
  ExitToApp,
  Notifications,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface KasirNavigationProps {
  open: boolean;
  onItemClick: (path: string) => void;
  currentPath: string;
}

// ========== KONSTANTA MENU ITEMS ==========
// Array menu navigasi untuk kasir dengan icon dan path
const KASIR_MENU_ITEMS = [
  { text: 'POS Dashboard', icon: <PointOfSale />, path: '/kasir/dashboard', color: 'primary' },
  { text: 'Process Payment', icon: <Payment />, path: '/kasir/payment', color: 'success' },
  { text: 'Print Receipt', icon: <Receipt />, path: '/kasir/receipt', color: 'info' },
  { text: 'Transaction History', icon: <History />, path: '/kasir/history', color: 'secondary' },
  { text: 'Cash Register', icon: <AccountBalance />, path: '/kasir/cash-register', color: 'warning' },
  { text: 'Daily Reports', icon: <TrendingUp />, path: '/kasir/reports', color: 'error' },
  { text: 'Shift Management', icon: <Schedule />, path: '/kasir/shift', color: 'primary' },
];

// ========== KONSTANTA STYLING ==========
// Styling untuk drawer navigation
const DRAWER_STYLES = {
  width: 280,
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    background: 'linear-gradient(145deg, #0d4377 0%, #14a085 100%)',
    color: 'white',
  },
};

// Styling untuk list item
const LIST_ITEM_STYLES = {
  borderRadius: 2,
  mb: 1,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
};

// Styling untuk active state
const ACTIVE_ITEM_STYLES = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  '& .MuiListItemIcon-root': { color: 'success.main' },
  '& .MuiListItemText-primary': { color: 'success.main', fontWeight: 'bold' },
};

const KasirNavigation: React.FC<KasirNavigationProps> = ({
  open,
  onItemClick,
  currentPath
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: 'linear-gradient(145deg, #0d4377 0%, #14a085 100%)',
          color: 'white',
        },
      }}
    >
      {/* Header dengan user info */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'success.main',
            margin: '0 auto',
            mb: 2,
          }}
        >
          {user?.fullName?.charAt(0) || 'K'}
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {user?.fullName || 'Kasir'}
        </Typography>
        <Chip
          label="Cashier"
          color="success"
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {kasirMenuItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => onItemClick(item.path)}
            sx={{
              borderRadius: 2,
              mb: 1,
              cursor: 'pointer',
              backgroundColor: currentPath === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ListItemIcon sx={{ color: currentPath === item.path ? 'success.main' : 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: currentPath === item.path ? 'bold' : 'normal',
                color: currentPath === item.path ? 'success.main' : 'white',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 'auto' }} />

      {/* Footer actions */}
      <List sx={{ px: 2, py: 1 }}>
        <ListItem
          onClick={() => onItemClick('/kasir/notifications')}
          sx={{
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <Notifications />
          </ListItemIcon>
          <ListItemText
            primary="Notifications"
            primaryTypographyProps={{ color: 'white' }}
          />
          <Chip label="2" color="error" size="small" />
        </ListItem>
        
        <ListItem
          onClick={() => onItemClick('/logout')}
          sx={{
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ color: 'white' }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default KasirNavigation;
