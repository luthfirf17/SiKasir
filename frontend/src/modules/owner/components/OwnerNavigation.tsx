/**
 * OwnerNavigation.tsx
 * 
 * Komponen navigasi khusus untuk owner yang berisi:
 * - Business overview dan analytics
 * - Financial reports dan profit analysis
 * - Strategic planning dan growth metrics
 * - Branch management dan expansion planning
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
  Dashboard,
  TrendingUp,
  AccountBalance,
  Store,
  PieChart,
  Timeline,
  BusinessCenter,
  Settings,
  Notifications,
  ExitToApp,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface OwnerNavigationProps {
  open: boolean;
  onItemClick: (path: string) => void;
  currentPath: string;
}

const OwnerNavigation: React.FC<OwnerNavigationProps> = ({ 
  open, 
  onItemClick, 
  currentPath 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Menu items untuk owner
  const ownerMenuItems = [
    {
      text: 'Business Overview',
      icon: <Dashboard />,
      path: '/owner/dashboard',
      color: 'primary'
    },
    {
      text: 'Financial Reports',
      icon: <AccountBalance />,
      path: '/owner/financial',
      color: 'success'
    },
    {
      text: 'Sales Analytics',
      icon: <TrendingUp />,
      path: '/owner/analytics',
      color: 'info'
    },
    {
      text: 'Profit Analysis',
      icon: <PieChart />,
      path: '/owner/profit',
      color: 'warning'
    },
    {
      text: 'Growth Metrics',
      icon: <Timeline />,
      path: '/owner/growth',
      color: 'secondary'
    },
    {
      text: 'Branch Management',
      icon: <Store />,
      path: '/owner/branches',
      color: 'error'
    },
    {
      text: 'Strategic Planning',
      icon: <BusinessCenter />,
      path: '/owner/planning',
      color: 'primary'
    },
    {
      text: 'Business Settings',
      icon: <Settings />,
      path: '/owner/settings',
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
          background: 'linear-gradient(145deg, #2d1b69 0%, #8b5cf6 100%)',
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
            bgcolor: 'secondary.main',
            margin: '0 auto',
            mb: 2,
          }}
        >
          {user?.fullName?.charAt(0) || 'O'}
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {user?.fullName || 'Owner'}
        </Typography>
        <Chip
          label="Business Owner"
          color="secondary"
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {ownerMenuItems.map((item) => (
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
            <ListItemIcon sx={{ color: currentPath === item.path ? 'secondary.main' : 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: currentPath === item.path ? 'bold' : 'normal',
                color: currentPath === item.path ? 'secondary.main' : 'white',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 'auto' }} />

      {/* Footer actions */}
      <List sx={{ px: 2, py: 1 }}>
        <ListItem
          onClick={() => onItemClick('/owner/notifications')}
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
          <Chip label="5" color="error" size="small" />
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

export default OwnerNavigation;
