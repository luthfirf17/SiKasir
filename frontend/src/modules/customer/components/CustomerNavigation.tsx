/**
 * CustomerNavigation.tsx
 * 
 * Komponen navigasi khusus untuk customer yang berisi:
 * - Menu browsing dan food selection
 * - Order tracking dan status monitoring
 * - Payment options dan digital wallet integration
 * - Loyalty program dan rewards
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
  MenuBook,
  ShoppingCart,
  TrackChanges,
  Payment,
  Star,
  History,
  QrCode,
  Support,
  Notifications,
  ExitToApp,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface CustomerNavigationProps {
  open: boolean;
  onItemClick: (path: string) => void;
  currentPath: string;
}

const CustomerNavigation: React.FC<CustomerNavigationProps> = ({ 
  open, 
  onItemClick, 
  currentPath 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Menu items untuk customer
  const customerMenuItems = [
    {
      text: 'Browse Menu',
      icon: <MenuBook />,
      path: '/customer/menu',
      color: 'primary'
    },
    {
      text: 'My Cart',
      icon: <ShoppingCart />,
      path: '/customer/cart',
      color: 'success'
    },
    {
      text: 'Track Order',
      icon: <TrackChanges />,
      path: '/customer/track',
      color: 'info'
    },
    {
      text: 'Payment Options',
      icon: <Payment />,
      path: '/customer/payment',
      color: 'warning'
    },
    {
      text: 'QR Scanner',
      icon: <QrCode />,
      path: '/customer/qr-scanner',
      color: 'secondary'
    },
    {
      text: 'Loyalty Rewards',
      icon: <Star />,
      path: '/customer/rewards',
      color: 'error'
    },
    {
      text: 'Order History',
      icon: <History />,
      path: '/customer/history',
      color: 'primary'
    },
    {
      text: 'Help & Support',
      icon: <Support />,
      path: '/customer/support',
      color: 'info'
    },
  ];

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
          background: 'linear-gradient(145deg, #059669 0%, #10b981 100%)',
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
            bgcolor: 'info.main',
            margin: '0 auto',
            mb: 2,
          }}
        >
          {user?.fullName?.charAt(0) || 'C'}
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {user?.fullName || 'Customer'}
        </Typography>
        <Chip
          label="Valued Customer"
          color="info"
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {customerMenuItems.map((item) => (
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
            <ListItemIcon sx={{ color: currentPath === item.path ? 'info.main' : 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: currentPath === item.path ? 'bold' : 'normal',
                color: currentPath === item.path ? 'info.main' : 'white',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 'auto' }} />

      {/* Footer actions */}
      <List sx={{ px: 2, py: 1 }}>
        <ListItem
          onClick={() => onItemClick('/customer/notifications')}
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
          <Chip label="1" color="error" size="small" />
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

export default CustomerNavigation;
