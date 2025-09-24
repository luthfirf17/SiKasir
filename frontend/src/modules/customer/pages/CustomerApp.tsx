import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
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
  Divider,
  Tab,
  Tabs,
  Badge,
  Rating,
  Fab,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Send,
  QrCode,
  Receipt,
  Star,
  History,
  Loyalty,
  Payment,
  CheckCircle,
  Restaurant,
  Fastfood,
  LocalDrink,
  Cake,
  FilterList,
  Search,
  Call,
} from '@mui/icons-material';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  isAvailable: boolean;
  preparationTime: number;
  allergens?: string[];
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface Order {
  id: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
  total: number;
  timestamp: Date;
  estimatedTime: number;
}

interface CustomerProfile {
  id: string;
  name: string;
  loyaltyPoints: number;
  totalVisits: number;
  favoriteItems: string[];
}

const CustomerApp: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartDialog, setCartDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const categories = [
    { id: 'all', name: 'Semua', icon: <Restaurant /> },
    { id: 'main', name: 'Makanan Utama', icon: <Fastfood /> },
    { id: 'drinks', name: 'Minuman', icon: <LocalDrink /> },
    { id: 'dessert', name: 'Dessert', icon: <Cake /> },
  ];

  // Mock data
  const mockMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Nasi Goreng Spesial',
      description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
      price: 35000,
      category: 'main',
      image: '/images/nasi-goreng.jpg',
      rating: 4.5,
      reviews: 128,
      isAvailable: true,
      preparationTime: 15,
      isSpicy: true,
    },
    {
      id: '2',
      name: 'Ayam Bakar Bumbu Kecap',
      description: 'Ayam bakar dengan bumbu kecap manis dan sambal',
      price: 45000,
      category: 'main',
      image: '/images/ayam-bakar.jpg',
      rating: 4.7,
      reviews: 95,
      isAvailable: true,
      preparationTime: 25,
    },
    {
      id: '3',
      name: 'Es Teh Manis',
      description: 'Teh manis segar dengan es batu',
      price: 8000,
      category: 'drinks',
      image: '/images/es-teh.jpg',
      rating: 4.2,
      reviews: 203,
      isAvailable: true,
      preparationTime: 5,
    },
    {
      id: '4',
      name: 'Jus Jeruk Segar',
      description: 'Jus jeruk asli tanpa pengawet',
      price: 15000,
      category: 'drinks',
      image: '/images/jus-jeruk.jpg',
      rating: 4.6,
      reviews: 87,
      isAvailable: true,
      preparationTime: 5,
    },
    {
      id: '5',
      name: 'Es Krim Vanila',
      description: 'Es krim vanila dengan topping coklat',
      price: 20000,
      category: 'dessert',
      image: '/images/es-krim.jpg',
      rating: 4.4,
      reviews: 156,
      isAvailable: false,
      preparationTime: 3,
    },
  ];

  const mockCustomer: CustomerProfile = {
    id: 'cust-001',
    name: 'Ahmad Wahyu',
    loyaltyPoints: 1250,
    totalVisits: 23,
    favoriteItems: ['1', '3'],
  };

  useEffect(() => {
    setMenuItems(mockMenuItems);
    setCustomerProfile(mockCustomer);
  }, []);

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const updateCartQuantity = (menuItemId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.menuItem.id !== menuItemId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const submitOrder = () => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      items: cart,
      status: 'pending',
      total: getCartTotal(),
      timestamp: new Date(),
      estimatedTime: Math.max(...cart.map(item => item.menuItem.preparationTime)),
    };

    setCurrentOrder(newOrder);
    setCart([]);
    setCartDialog(false);
    setTabValue(1); // Switch to order tracking tab
  };

  const callWaiter = () => {
    console.log('Calling waiter...');
    // This would send a notification to the waiter's tablet
  };

  const requestBill = () => {
    console.log('Requesting bill...');
    // This would notify the cashier
  };

  const filteredMenuItems = menuItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getOrderStatusStep = (status: string) => {
    const steps = ['confirmed', 'preparing', 'ready', 'served'];
    return steps.indexOf(status);
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ mb: 2 }}>
        <Toolbar>
          <QrCode sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meja 05 - Restoran Nusantara
          </Typography>
          <IconButton color="inherit" onClick={callWaiter}>
            <Call />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Customer Info */}
      {customerProfile && (
        <Paper sx={{ mx: 2, p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Selamat datang, {customerProfile.name}!</Typography>
              <Typography variant="body2" color="textSecondary">
                Kunjungan ke-{customerProfile.totalVisits}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                icon={<Loyalty />}
                label={`${customerProfile.loyaltyPoints} Points`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
        </Paper>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
          <Tab label="Menu" />
          <Tab label="Pesanan" />
          <Tab label="Riwayat" />
        </Tabs>
      </Box>

      {/* Tab 1: Menu */}
      <TabPanel value={tabValue} index={0}>
        {/* Search */}
        <Paper sx={{ mx: 2, p: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Paper>

        {/* Categories */}
        <Paper sx={{ mx: 2, p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                icon={category.icon}
                label={category.name}
                onClick={() => setSelectedCategory(category.id)}
                color={selectedCategory === category.id ? 'primary' : 'default'}
                clickable
              />
            ))}
          </Box>
        </Paper>

        {/* Menu Items */}
        <Grid container spacing={2} sx={{ px: 2 }}>
          {filteredMenuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  opacity: item.isAvailable ? 1 : 0.6,
                  position: 'relative',
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image}
                  alt={item.name}
                  sx={{ backgroundColor: '#f5f5f5' }}
                />
                
                {!item.isAvailable && (
                  <Chip
                    label="Habis"
                    color="error"
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  />
                )}

                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {item.name}
                    {customerProfile?.favoriteItems.includes(item.id) && (
                      <Star sx={{ color: 'gold', ml: 1, fontSize: 16 }} />
                    )}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={item.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      ({item.reviews})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {item.isSpicy && <Chip label="Pedas" size="small" color="error" />}
                    {item.isVegetarian && <Chip label="Vegetarian" size="small" color="success" />}
                    <Chip label={`${item.preparationTime} min`} size="small" />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6" color="primary">
                      Rp {item.price.toLocaleString()}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => addToCart(item)}
                      disabled={!item.isAvailable}
                    >
                      Tambah
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 2: Order Tracking */}
      <TabPanel value={tabValue} index={1}>
        {currentOrder ? (
          <Paper sx={{ mx: 2, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pesanan #{currentOrder.id.slice(-6)}
            </Typography>
            
            <Stepper activeStep={getOrderStatusStep(currentOrder.status)} sx={{ mb: 3 }}>
              <Step>
                <StepLabel>Konfirmasi</StepLabel>
              </Step>
              <Step>
                <StepLabel>Sedang Dimasak</StepLabel>
              </Step>
              <Step>
                <StepLabel>Siap Diantar</StepLabel>
              </Step>
              <Step>
                <StepLabel>Selesai</StepLabel>
              </Step>
            </Stepper>

            <Alert severity="info" sx={{ mb: 2 }}>
              Estimasi waktu: {currentOrder.estimatedTime} menit
            </Alert>

            <Typography variant="h6" gutterBottom>
              Item Pesanan
            </Typography>
            <List>
              {currentOrder.items.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`${item.quantity}x ${item.menuItem.name}`}
                      secondary={item.notes}
                    />
                    <Typography variant="body2">
                      Rp {(item.menuItem.price * item.quantity).toLocaleString()}
                    </Typography>
                  </ListItem>
                  {index < currentOrder.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                Rp {currentOrder.total.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Receipt />}
                onClick={requestBill}
              >
                Minta Tagihan
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Payment />}
                onClick={() => {/* Handle payment */}}
              >
                Bayar Sekarang
              </Button>
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ mx: 2, p: 3, textAlign: 'center' }}>
            <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Belum ada pesanan
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Pilih menu favorit Anda untuk mulai memesan
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Tab 3: Order History */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ mx: 2, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Riwayat Pesanan
          </Typography>
          {orderHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <History sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Belum ada riwayat pesanan
              </Typography>
            </Box>
          ) : (
            <List>
              {orderHistory.map((order) => (
                <ListItem key={order.id}>
                  <ListItemText
                    primary={`Pesanan #${order.id.slice(-6)}`}
                    secondary={`${order.timestamp.toLocaleDateString()} • Rp ${order.total.toLocaleString()}`}
                  />
                  <Button
                    size="small"
                    onClick={() => setFeedbackDialog(true)}
                  >
                    Beri Rating
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </TabPanel>

      {/* Cart FAB */}
      {cart.length > 0 && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setCartDialog(true)}
        >
          <Badge badgeContent={getCartItemCount()} color="error">
            <ShoppingCart />
          </Badge>
        </Fab>
      )}

      {/* Cart Dialog */}
      <Dialog open={cartDialog} onClose={() => setCartDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Keranjang Belanja</DialogTitle>
        <DialogContent>
          <List>
            {cart.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={item.menuItem.name}
                    secondary={`Rp ${item.menuItem.price.toLocaleString()}`}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                    >
                      <Remove />
                    </IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < cart.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6" color="primary">
              Rp {getCartTotal().toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartDialog(false)}>Tutup</Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={submitOrder}
            disabled={cart.length === 0}
          >
            Pesan Sekarang
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Berikan Rating & Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bagaimana pengalaman Anda?
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue || 0)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Berikan feedback Anda..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Batal</Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log('Feedback submitted:', { rating, feedback });
              setFeedbackDialog(false);
              setRating(0);
              setFeedback('');
            }}
          >
            Kirim Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerApp;
