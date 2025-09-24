import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  TableRestaurant,
  Add,
  Remove,
  Notifications,
  ShoppingCart,
  Send,
  CheckCircle,
  AccessTime,
  Restaurant,
  PaymentOutlined,
  Wifi,
  WifiOff,
} from '@mui/icons-material';

interface Table {
  id: string;
  number: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: Order;
  position: { x: number; y: number };
}

interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'draft' | 'sent' | 'preparing' | 'ready' | 'served' | 'paid';
  total: number;
  timestamp: Date;
}

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

const WaiterDashboard: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orderDialog, setOrderDialog] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isOffline, setIsOffline] = useState(false);

  // Mock data for demonstration
  const mockTables: Table[] = [
    {
      id: '1',
      number: 'T01',
      seats: 4,
      status: 'available',
      position: { x: 100, y: 100 },
    },
    {
      id: '2',
      number: 'T02',
      seats: 2,
      status: 'occupied',
      position: { x: 250, y: 100 },
      currentOrder: {
        id: 'order1',
        tableId: '2',
        items: [],
        status: 'preparing',
        total: 125000,
        timestamp: new Date(),
      },
    },
    {
      id: '3',
      number: 'T03',
      seats: 6,
      status: 'reserved',
      position: { x: 400, y: 100 },
    },
    {
      id: '4',
      number: 'T04',
      seats: 4,
      status: 'cleaning',
      position: { x: 100, y: 250 },
    },
  ];

  useEffect(() => {
    setTables(mockTables);
  }, []);

  const getTableColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4caf50';
      case 'occupied':
        return '#ff9800';
      case 'reserved':
        return '#2196f3';
      case 'cleaning':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'occupied':
        return 'Terisi';
      case 'reserved':
        return 'Reservasi';
      case 'cleaning':
        return 'Dibersihkan';
      default:
        return 'Unknown';
    }
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'available' || table.status === 'occupied') {
      setOrderDialog(true);
    }
  };

  const handleOrderSubmit = () => {
    // Send order to kitchen and kasir
    console.log('Sending order:', currentOrder);
    setOrderDialog(false);
    setCurrentOrder([]);
    setSelectedTable(null);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <AppBar position="static" sx={{ mb: 3, borderRadius: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Waiter Dashboard
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={!isOffline}
                onChange={(e) => setIsOffline(!e.target.checked)}
                icon={<WifiOff />}
                checkedIcon={<Wifi />}
              />
            }
            label={isOffline ? 'Offline' : 'Online'}
            sx={{ mr: 2 }}
          />

          <IconButton color="inherit">
            <Badge badgeContent={notifications} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Grid container spacing={3}>
        {/* Floor Plan */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 600 }}>
            <Typography variant="h6" gutterBottom>
              Floor Plan Restaurant
            </Typography>
            <Box
              sx={{
                position: 'relative',
                height: 500,
                border: '2px dashed #ccc',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {tables.map((table) => (
                <Box
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  sx={{
                    position: 'absolute',
                    left: table.position.x,
                    top: table.position.y,
                    width: 80,
                    height: 80,
                    backgroundColor: getTableColor(table.status),
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <TableRestaurant sx={{ color: 'white', fontSize: 24 }} />
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {table.number}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'white', fontSize: 10 }}>
                    {table.seats} seats
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Status Panel */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Order Status */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status Pesanan
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Meja T02 - Nasi Goreng" secondary="Sedang dimasak" />
                      <ListItemSecondaryAction>
                        <Chip label="Preparing" color="warning" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Meja T05 - Ayam Bakar" secondary="Siap diantar" />
                      <ListItemSecondaryAction>
                        <Chip label="Ready" color="success" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Meja T03 - Es Teh" secondary="Sudah diantar" />
                      <ListItemSecondaryAction>
                        <Chip label="Served" color="info" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      fullWidth
                    >
                      Tambah Pesanan
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      fullWidth
                    >
                      Konfirmasi Antar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PaymentOutlined />}
                      fullWidth
                    >
                      Proses Pembayaran
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Stats */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performa Hari Ini
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Pesanan Dilayani:</Typography>
                    <Typography variant="body2" fontWeight="bold">24</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Rata-rata Waktu:</Typography>
                    <Typography variant="body2" fontWeight="bold">12 menit</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Rating Customer:</Typography>
                    <Typography variant="body2" fontWeight="bold">4.8/5</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Order Dialog */}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Pesanan - {selectedTable?.number}
          <Chip
            label={selectedTable ? getStatusLabel(selectedTable.status) : ''}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Menu Items
          </Typography>
          {/* Menu items would be loaded here */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1">Nasi Goreng Spesial</Typography>
                  <Typography variant="body2" color="textSecondary">Rp 35.000</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small">
                    <Remove />
                  </IconButton>
                  <Typography>1</Typography>
                  <IconButton size="small">
                    <Add />
                  </IconButton>
                </Box>
              </Box>
              <TextField
                fullWidth
                placeholder="Catatan khusus..."
                size="small"
                sx={{ mt: 1 }}
              />
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleOrderSubmit}
          >
            Kirim ke Kitchen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WaiterDashboard;
