/**
 * DashboardPage.tsx
 * 
 * Dashboard admin utama dengan fitur:
 * - Statistik real-time (revenue, orders, tables, staff) dalam kartu glassmorphism
 * - Tabel pesanan interaktif dengan filter status dan action buttons
 * - Quick actions, notifikasi live, top menu items, dan system status
 * - Layout responsive dengan grid system dan floating action button
 */

import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, LinearProgress, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, Avatar, List, ListItem, ListItemText, ListItemAvatar,
  Divider, Fab, Tab, Tabs
} from '@mui/material';
import {
  TrendingUp, TrendingDown, People, TableRestaurant, AttachMoney,
  Visibility, Edit, ShoppingCart, MoreVert, Add, Assessment, Schedule,
  Warning, CheckCircle
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

// Interface untuk props kartu statistik
interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

// Komponen kartu statistik dengan glassmorphism effect dan trend indicator
const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, subtitle }) => {
  const isPositive = change >= 0;
  
  return (
    <Card sx={{ 
      height: '100%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4, transition: 'all 0.3s ease-in-out' }
    }}>
      <CardContent>
        {/* Header: Icon dan trend indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{
            backgroundColor: `${color}.light`, borderRadius: '12px', p: 1.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {icon}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isPositive ? <TrendingUp color="success" fontSize="small" /> : <TrendingDown color="error" fontSize="small" />}
            <Typography variant="body2" color={isPositive ? 'success.main' : 'error.main'} sx={{ ml: 0.5, fontWeight: 'bold' }}>
              {Math.abs(change)}%
            </Typography>
          </Box>
        </Box>
        {/* Content: Title, value, subtitle */}
        <Typography color="textSecondary" gutterBottom variant="body2" fontWeight="medium">{title}</Typography>
        <Typography variant="h4" component="div" fontWeight="bold" color="text.primary">{value}</Typography>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          {subtitle || 'Updated just now'}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Komponen utama Dashboard Page
const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth); // Redux state user
  const [tabValue, setTabValue] = useState(0); // State untuk tab filter orders

  // Mock data statistik dashboard (akan diganti dengan API call)
  const stats = [
    { title: 'Total Revenue Today', value: 'Rp 15,450,000', change: 12.5, icon: <AttachMoney sx={{ color: 'primary.main' }} />, color: 'primary' as const, subtitle: 'vs yesterday Rp 13,750,000' },
    { title: 'Orders Today', value: '247', change: 8.2, icon: <ShoppingCart sx={{ color: 'success.main' }} />, color: 'success' as const, subtitle: 'Completed: 198 | Pending: 49' },
    { title: 'Active Tables', value: '28/32', change: 15.1, icon: <TableRestaurant sx={{ color: 'warning.main' }} />, color: 'warning' as const, subtitle: '87.5% occupancy rate' },
    { title: 'Staff Online', value: '24/30', change: -2.1, icon: <People sx={{ color: 'info.main' }} />, color: 'info' as const, subtitle: 'Kitchen: 8 | Service: 16' }
  ];

  // Mock data pesanan terbaru dengan informasi lengkap
  const recentOrders = [
    { id: 'KSR-001', table: 'Table 12', customer: 'John Doe', items: 3, amount: 'Rp 245,000', status: 'Completed', time: '2 mins ago', waiter: 'Sarah' },
    { id: 'KSR-002', table: 'Table 8', customer: 'Jane Smith', items: 5, amount: 'Rp 387,500', status: 'In Progress', time: '5 mins ago', waiter: 'Mike' },
    { id: 'KSR-003', table: 'Table 15', customer: 'Bob Johnson', items: 2, amount: 'Rp 167,000', status: 'Pending', time: '8 mins ago', waiter: 'Lisa' },
    { id: 'KSR-004', table: 'Table 3', customer: 'Alice Brown', items: 4, amount: 'Rp 298,000', status: 'Completed', time: '12 mins ago', waiter: 'Tom' },
    { id: 'KSR-005', table: 'Table 7', customer: 'Charlie Wilson', items: 1, amount: 'Rp 89,000', status: 'Cancelled', time: '15 mins ago', waiter: 'Emma' }
  ];

  // Mock data notifikasi real-time sistem
  const notifications = [
    { id: 1, type: 'warning', title: 'Low Stock Alert', message: 'Beef stock is running low (5 portions left)', time: '5 mins ago', icon: <Warning color="warning" /> },
    { id: 2, type: 'success', title: 'Order Completed', message: 'Table 15 order has been served successfully', time: '10 mins ago', icon: <CheckCircle color="success" /> },
    { id: 3, type: 'info', title: 'New Staff Check-in', message: 'Maria Rodriguez checked in for evening shift', time: '1 hour ago', icon: <People color="info" /> }
  ];

  // Data quick action buttons
  const quickActions = [
    { label: 'Add New Order', icon: <Add />, color: 'primary' as const },
    { label: 'Manage Tables', icon: <TableRestaurant />, color: 'success' as const },
    { label: 'View Reports', icon: <Assessment />, color: 'info' as const },
    { label: 'Staff Schedule', icon: <Schedule />, color: 'warning' as const }
  ];

  // Data menu items terpopuler hari ini
  const topMenuItems = [
    { name: 'Nasi Goreng Spesial', orders: 45, revenue: 'Rp 1,350,000' },
    { name: 'Ayam Bakar Madu', orders: 38, revenue: 'Rp 1,520,000' },
    { name: 'Gado-Gado', orders: 32, revenue: 'Rp 800,000' },
    { name: 'Sate Ayam', orders: 29, revenue: 'Rp 870,000' },
    { name: 'Es Campur', orders: 24, revenue: 'Rp 360,000' }
  ];

  // Utility function untuk warna status chip
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Pending': return 'info';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  useEffect(() => {
    // Load dashboard data - akan diganti dengan API call
  }, []);

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Statistics Cards - 4 kartu statistik utama */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Orders Table - Tabel pesanan di tengah halaman */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, height: 'fit-content' }}>
            {/* Header: title dan tab filter */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Recent Orders</Typography>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ minHeight: 'auto' }}>
                <Tab label="All" sx={{ minHeight: 'auto', py: 1 }} />
                <Tab label="Pending" sx={{ minHeight: 'auto', py: 1 }} />
                <Tab label="Completed" sx={{ minHeight: 'auto', py: 1 }} />
              </Tabs>
            </Box>
            {/* Table data pesanan dengan scroll */}
            <TableContainer sx={{ 
              maxHeight: 450, 
              overflowY: 'auto',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '10px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#a8a8a8'
                }
              }
            }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', zIndex: 1 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', zIndex: 1 }}>Table</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', zIndex: 1 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', zIndex: 1 }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', zIndex: 1 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', zIndex: 1 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', zIndex: 1 }}>Waiter</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', zIndex: 1 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">#{order.id}</Typography>
                      </TableCell>
                      <TableCell>{order.table}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {order.customer.charAt(0)}
                          </Avatar>
                          {order.customer}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${order.items} items`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{order.amount}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={order.status} color={getStatusColor(order.status) as any} 
                              size="small" sx={{ fontWeight: 'medium' }} />
                      </TableCell>
                      <TableCell>{order.waiter}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" color="primary"><Visibility fontSize="small" /></IconButton>
                          <IconButton size="small" color="secondary"><Edit fontSize="small" /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Section - Widget cards di bagian bawah */}
      <Grid container spacing={2}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Quick Actions</Typography>
            <Grid container spacing={1}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} key={index}>
                  <Button variant="outlined" color={action.color} startIcon={action.icon} fullWidth
                    sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '0.875rem', justifyContent: 'flex-start' }}>
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Live Notifications */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Live Notifications</Typography>
              <IconButton size="small"><MoreVert /></IconButton>
            </Box>
            <List dense>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: 'transparent' }}>{notification.icon}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight="medium">{notification.title}</Typography>}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">{notification.message}</Typography>
                          <Typography variant="caption" color="textSecondary" display="block">{notification.time}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Top Menu Items */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Top Menu Items</Typography>
            <List dense>
              {topMenuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight="medium">{item.name}</Typography>}
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="textSecondary">{item.orders} orders</Typography>
                          <Typography variant="caption" color="primary" fontWeight="medium">{item.revenue}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < topMenuItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6} lg={2}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">System Status</Typography>
            {/* Progress bars untuk monitoring sistem */}
            {[
              { label: 'Server Load', value: 45, color: 'success' as const },
              { label: 'Memory Usage', value: 68, color: 'warning' as const },
              { label: 'Storage', value: 23, color: 'primary' as const }
            ].map((item, index) => (
              <Box key={index} sx={{ mb: index < 2 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.label}</Typography>
                  <Typography variant="body2" fontWeight="medium">{item.value}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={item.value} color={item.color} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }}>
        <Add />
      </Fab>
    </Box>
  );
};

export default DashboardPage;
