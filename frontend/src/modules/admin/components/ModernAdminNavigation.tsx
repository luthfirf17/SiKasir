/**
 * ModernAdminNavigation.tsx
 * 
 * DESKRIPSI SINGKAT:
 * - Ultra modern navigation component untuk admin dashboard dengan premium design
 * - Glassmorphism effects dengan backdrop blur dan smooth animations
 * - Advanced visual effects termasuk gradient backgrounds dan micro-interactions
 * - Enhanced typography dengan modern spacing dan color schemes
 * - Premium user experience dengan tooltip dan hover effects
 * - Integration dengan Redux store dan Material-UI theme system
 */

import React from 'react';
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, 
  Box, Avatar, IconButton, Tooltip, useTheme, alpha 
} from '@mui/material';
import { Settings, ExitToApp, ChevronLeft, Circle } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { simpleNavigationConfig } from '../config/navigationConfig';
import { getIconByName } from '../utils/iconUtils';

// Interface untuk props component dengan fitur navigasi premium
interface ModernAdminNavigationProps {
  open: boolean;           // Status visibilitas drawer untuk efek glassmorphism
  onItemClick: (path: string) => void;  // Fungsi callback untuk navigasi premium
  onToggle: () => void;    // Fungsi callback untuk toggle drawer modern
  currentPath: string;     // Path aktif untuk highlighting yang ditingkatkan
}

// Komponen fungsional premium dengan efek visual canggih
const ModernAdminNavigation: React.FC<ModernAdminNavigationProps> = ({ open, onItemClick, onToggle, currentPath }) => {
  // Hook tema Material-UI untuk styling premium yang konsisten
  const theme = useTheme();
  
  // Selector Redux untuk data user dengan presentasi yang ditingkatkan
  const { user } = useSelector((state: RootState) => state.auth);

  // Item menu premium dari konfigurasi (sesuai UI screenshot)
  const menuItems = simpleNavigationConfig;

  // Lebar drawer premium untuk spacing optimal
  // Konstanta konfigurasi
  const drawerWidth = 260; // Disesuaikan untuk margin AdminLayout agar spacing konsisten
  const miniDrawerWidth = 60; // Disesuaikan untuk margin AdminLayout agar spacing lebih baik
  
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={true} // Selalu terbuka, tapi lebar berubah
      sx={{
        width: open ? drawerWidth : miniDrawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : miniDrawerWidth,
          boxSizing: 'border-box',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderLeft: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginTop: '64px', // Tambah margin atas untuk navbar
          height: 'calc(100vh - 64px)', // Sesuaikan tinggi untuk navbar
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      {/* Header - Hanya tampil ketika terbuka */}
      {open && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #e5e7eb',
            background: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#6366f1',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                K
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#111827' }}>
                KasirKu
              </Typography>
            </Box>
            <IconButton 
              onClick={onToggle} 
              size="small"
              sx={{ 
                color: '#6b7280',
                '&:hover': { 
                  backgroundColor: '#f3f4f6',
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Profil User - Hanya tampil ketika terbuka */}
      {open && (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            borderBottom: '1px solid #e5e7eb',
            background: '#ffffff',
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              margin: '0 auto',
              mb: 1,
              backgroundColor: '#10b981',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            {user?.fullName?.charAt(0) || 'A'}
          </Avatar>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              color: '#111827',
              mb: 0.5
            }}
          >
            {user?.fullName || 'Administrator'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Circle sx={{ color: '#10b981', fontSize: '6px' }} />
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
              Online
            </Typography>
          </Box>
        </Box>
      )}

      {/* Menu Navigasi */}
      <Box 
        sx={{ 
          flex: 1, 
          p: open ? 2 : 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          },
        }}
      >
        <List sx={{ padding: 0 }}>
          {menuItems.map((item) => {
            // Menangani item divider (header section) - hanya tampil ketika terbuka
            if (item.divider) {
              if (!open) return null; // Sembunyikan divider dalam mode mini
              return (
                <Box key={item.id} sx={{ mt: 3, mb: 1, mx: 2 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      fontSize: '0.75rem'
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              );
            }

            const isActive = currentPath === item.path;
            return (
              <Tooltip 
                key={item.path}
                title={open ? '' : item.text} 
                placement="right"
                arrow
              >
                <ListItem
                  onClick={() => onItemClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    mx: open ? 1 : 0.5,
                    cursor: 'pointer',
                    minHeight: 44,
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 2 : 1,
                    background: isActive ? '#6366f1' : 'transparent',
                    color: isActive ? 'white' : '#374151',
                    '&:hover': {
                      backgroundColor: isActive ? '#6366f1' : '#f3f4f6',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive ? 'white' : '#374151',
                      minWidth: open ? 44 : 0,
                      mr: open ? 0 : 'auto',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {getIconByName(item.iconName)}
                  </ListItemIcon>
                  {open && (
                    <>
                      <ListItemText
                        primary={item.text}
                        sx={{ 
                          opacity: open ? 1 : 0,
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.875rem',
                            color: isActive ? 'white' : '#374151',
                          }
                        }}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.9rem',
                          letterSpacing: '-0.2px'
                        }}
                      />
                      {item.badge && (
                        <Box
                          sx={{
                            bgcolor: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            ml: 1,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </>
                  )}
                </ListItem>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: '1px solid #e5e7eb',
          background: '#ffffff',
          p: open ? 2 : 1,
        }}
      >
        <List sx={{ padding: 0 }}>
          <Tooltip title={open ? '' : 'Settings'} placement="right" arrow>
            <ListItem
              onClick={() => onItemClick('/admin/settings')}
              sx={{
                borderRadius: 2,
                cursor: 'pointer',
                minHeight: 44,
                mb: 0.5,
                justifyContent: open ? 'initial' : 'center',
                px: open ? 2 : 1,
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ 
                color: '#6b7280', 
                minWidth: open ? 44 : 0,
                mr: open ? 0 : 'auto',
                justifyContent: 'center'
              }}>
                <Settings />
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    color: '#374151'
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
          
          <Tooltip title={open ? '' : 'Logout'} placement="right" arrow>
            <ListItem
              onClick={() => onItemClick('/logout')}
              sx={{
                borderRadius: 2,
                cursor: 'pointer',
                minHeight: 44,
                justifyContent: open ? 'initial' : 'center',
                px: open ? 2 : 1,
                '&:hover': {
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ 
                color: '#6b7280', 
                minWidth: open ? 44 : 0,
                mr: open ? 0 : 'auto',
                justifyContent: 'center'
              }}>
                <ExitToApp />
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    color: '#374151'
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
        </List>
      </Box>
    </Drawer>
  );
};

// Ekspor komponen premium default untuk pengalaman admin yang ditingkatkan
export default ModernAdminNavigation;
