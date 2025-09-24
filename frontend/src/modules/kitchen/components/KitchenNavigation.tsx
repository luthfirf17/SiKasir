/**
 * KitchenNavigation.tsx
 * 
 * Komponen navigasi khusus untuk kitchen/waiter yang berisi:
 * - Order management dan queue monitoring
 * - Recipe management dan inventory tracking
 * - Kitchen workflow dan preparation status
 * - Quality control dan timing management
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
  Restaurant,
  Assignment,
  Inventory,
  Timer,
  CheckCircle,
  Kitchen,
  LocalDining,
  Schedule,
  Notifications,
  ExitToApp,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface KitchenNavigationProps {
  open: boolean;
  onItemClick: (path: string) => void;
  currentPath: string;
}

const KitchenNavigation: React.FC<KitchenNavigationProps> = ({ 
  open, 
  onItemClick, 
  currentPath 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Menu items untuk kitchen
  const kitchenMenuItems = [
    {
      text: 'Kitchen Dashboard',
      icon: <Kitchen />,
      path: '/kitchen/dashboard',
      color: 'primary'
    },
    {
      text: 'Order Queue',
      icon: <Assignment />,
      path: '/kitchen/orders',
      color: 'warning'
    },
    {
      text: 'Recipe Management',
      icon: <Restaurant />,
      path: '/kitchen/recipes',
      color: 'info'
    },
    {
      text: 'Inventory Status',
      icon: <Inventory />,
      path: '/kitchen/inventory',
      color: 'success'
    },
    {
      text: 'Preparation Timer',
      icon: <Timer />,
      path: '/kitchen/timer',
      color: 'error'
    },
    {
      text: 'Quality Control',
      icon: <CheckCircle />,
      path: '/kitchen/quality',
      color: 'secondary'
    },
    {
      text: 'Service Schedule',
      icon: <Schedule />,
      path: '/kitchen/schedule',
      color: 'primary'
    },
    {
      text: 'Dining Service',
      icon: <LocalDining />,
      path: '/kitchen/service',
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
          background: 'linear-gradient(145deg, #dc2626 0%, #f97316 100%)',
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
            bgcolor: 'warning.main',
            margin: '0 auto',
            mb: 2,
          }}
        >
          {user?.fullName?.charAt(0) || 'K'}
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {user?.fullName || 'Kitchen Staff'}
        </Typography>
        <Chip
          label="Kitchen & Service"
          color="warning"
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {kitchenMenuItems.map((item) => (
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
            <ListItemIcon sx={{ color: currentPath === item.path ? 'warning.main' : 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: currentPath === item.path ? 'bold' : 'normal',
                color: currentPath === item.path ? 'warning.main' : 'white',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 'auto' }} />

      {/* Footer actions */}
      <List sx={{ px: 2, py: 1 }}>
        <ListItem
          onClick={() => onItemClick('/kitchen/notifications')}
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
          <Chip label="7" color="error" size="small" />
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

export default KitchenNavigation;
