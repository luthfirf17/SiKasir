/**
 * AdminNavigation.styles.ts
 * 
 * Styled components dan theme untuk modern navigation
 */

import { styled } from '@mui/material/styles';
import { Box, ListItem } from '@mui/material';

export const NavigationContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
  borderRight: '1px solid #e5e7eb',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
}));

export const LogoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderBottom: '1px solid #f1f3f4',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}));

export const UserProfile = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  textAlign: 'center',
  background: 'rgba(99, 102, 241, 0.05)',
  borderBottom: '1px solid #f1f3f4',
}));

export const MenuSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#d1d5db',
    borderRadius: '4px',
  },
}));

export const NavigationItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ theme, isActive }) => ({
  borderRadius: theme.spacing(1.5),
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1.5, 2),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  ...(isActive && {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
    transform: 'translateX(4px)',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      width: '4px',
      height: '100%',
      background: 'white',
      opacity: 0.8,
    },
  }),
  
  ...(!isActive && {
    '&:hover': {
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      transform: 'translateX(2px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  }),
}));

export const FooterSection = styled(Box)(({ theme }) => ({
  borderTop: '1px solid #f1f3f4',
  padding: theme.spacing(1),
  background: 'rgba(249, 250, 251, 0.8)',
}));

export const NotificationBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  background: '#ef4444',
  color: 'white',
  borderRadius: '50%',
  width: '18px',
  height: '18px',
  fontSize: '11px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid white',
}));
