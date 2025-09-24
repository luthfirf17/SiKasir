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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Rating,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  People,
  Restaurant,
  AttachMoney,
  Inventory,
  Star,
  Timeline,
  PieChart,
  BarChart,
  Download,
  Print,
  Refresh,
  LocationOn,
  Campaign,
  Feedback,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';

interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  avgOrderValue: number;
  avgOrderGrowth: number;
  customerSatisfaction: number;
  satisfactionGrowth: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface StaffPerformance {
  id: string;
  name: string;
  role: string;
  ordersServed: number;
  avgServiceTime: number;
  customerRating: number;
  revenue: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  cost: number;
  usage: number;
  status: 'ok' | 'low' | 'critical';
}

interface CustomerFeedback {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: Date;
  orderValue: number;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  discount: number;
  type: 'percentage' | 'fixed';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usage: number;
}

const OwnerDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('today');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [customerFeedback, setCustomerFeedback] = useState<CustomerFeedback[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionDialog, setPromotionDialog] = useState(false);

  // Mock data
  const mockMetrics: DashboardMetrics = {
    totalRevenue: 75000000,
    revenueGrowth: 12.5,
    totalOrders: 1245,
    ordersGrowth: 8.3,
    avgOrderValue: 65000,
    avgOrderGrowth: 4.2,
    customerSatisfaction: 4.6,
    satisfactionGrowth: 0.3,
  };

  const mockSalesData: SalesData[] = [
    { date: '2024-01-01', revenue: 2500000, orders: 45, customers: 38 },
    { date: '2024-01-02', revenue: 3200000, orders: 52, customers: 44 },
    { date: '2024-01-03', revenue: 2800000, orders: 48, customers: 41 },
    { date: '2024-01-04', revenue: 3500000, orders: 58, customers: 49 },
    { date: '2024-01-05', revenue: 4100000, orders: 65, customers: 55 },
    { date: '2024-01-06', revenue: 3900000, orders: 62, customers: 53 },
    { date: '2024-01-07', revenue: 4500000, orders: 72, customers: 61 },
  ];

  const mockStaffPerformance: StaffPerformance[] = [
    {
      id: '1',
      name: 'Sari Dewi',
      role: 'Waiter',
      ordersServed: 145,
      avgServiceTime: 12.5,
      customerRating: 4.8,
      revenue: 8500000,
    },
    {
      id: '2',
      name: 'Budi Santoso',
      role: 'Waiter',
      ordersServed: 132,
      avgServiceTime: 14.2,
      customerRating: 4.6,
      revenue: 7800000,
    },
    {
      id: '3',
      name: 'Maya Putri',
      role: 'Kasir',
      ordersServed: 289,
      avgServiceTime: 3.8,
      customerRating: 4.9,
      revenue: 15200000,
    },
  ];

  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      name: 'Beras Premium',
      category: 'Bahan Pokok',
      currentStock: 25,
      minStock: 20,
      cost: 15000,
      usage: 85,
      status: 'ok',
    },
    {
      id: '2',
      name: 'Ayam Segar',
      category: 'Protein',
      currentStock: 8,
      minStock: 15,
      cost: 35000,
      usage: 92,
      status: 'low',
    },
    {
      id: '3',
      name: 'Minyak Goreng',
      category: 'Bahan Masak',
      currentStock: 3,
      minStock: 10,
      cost: 25000,
      usage: 78,
      status: 'critical',
    },
  ];

  const mockFeedback: CustomerFeedback[] = [
    {
      id: '1',
      customerName: 'Ahmad Wijaya',
      rating: 5,
      comment: 'Makanan enak, pelayanan cepat!',
      date: new Date('2024-01-15'),
      orderValue: 125000,
    },
    {
      id: '2',
      customerName: 'Siti Nurhaliza',
      rating: 4,
      comment: 'Tempat nyaman, tapi agak lama menunggu.',
      date: new Date('2024-01-14'),
      orderValue: 89000,
    },
    {
      id: '3',
      customerName: 'Rudi Habibie',
      rating: 5,
      comment: 'Sangat puas dengan menu baru!',
      date: new Date('2024-01-13'),
      orderValue: 156000,
    },
  ];

  const mockPromotions: Promotion[] = [
    {
      id: '1',
      name: 'Diskon Weekend',
      description: 'Diskon 20% untuk semua menu utama',
      discount: 20,
      type: 'percentage',
      startDate: new Date('2024-01-13'),
      endDate: new Date('2024-01-21'),
      isActive: true,
      usage: 234,
    },
    {
      id: '2',
      name: 'Happy Hour',
      description: 'Diskon Rp 10.000 untuk minuman',
      discount: 10000,
      type: 'fixed',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-31'),
      isActive: true,
      usage: 89,
    },
  ];

  useEffect(() => {
    setDashboardMetrics(mockMetrics);
    setSalesData(mockSalesData);
    setStaffPerformance(mockStaffPerformance);
    setInventoryData(mockInventory);
    setCustomerFeedback(mockFeedback);
    setPromotions(mockPromotions);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'success' : 'error';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'success';
      case 'low':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const pieChartData = [
    { name: 'Makanan Utama', value: 45, color: '#8884d8' },
    { name: 'Minuman', value: 30, color: '#82ca9d' },
    { name: 'Dessert', value: 25, color: '#ffc658' },
  ];

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Owner Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Periode</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Periode"
            >
              <MenuItem value="today">Hari Ini</MenuItem>
              <MenuItem value="week">Minggu Ini</MenuItem>
              <MenuItem value="month">Bulan Ini</MenuItem>
              <MenuItem value="year">Tahun Ini</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Lokasi</InputLabel>
            <Select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              label="Lokasi"
            >
              <MenuItem value="all">Semua Cabang</MenuItem>
              <MenuItem value="main">Cabang Utama</MenuItem>
              <MenuItem value="mall">Cabang Mall</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Analytics" />
          <Tab label="Staff Performance" />
          <Tab label="Inventory" />
          <Tab label="Customer Insights" />
          <Tab label="Promotions" />
          <Tab label="Forecasting" />
        </Tabs>
      </Box>

      {/* Tab 1: Analytics */}
      <TabPanel value={tabValue} index={0}>
        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(dashboardMetrics?.totalRevenue || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getGrowthIcon(dashboardMetrics?.revenueGrowth || 0)}
                      <Typography
                        variant="body2"
                        color={getGrowthColor(dashboardMetrics?.revenueGrowth || 0)}
                        sx={{ ml: 0.5 }}
                      >
                        {dashboardMetrics?.revenueGrowth}%
                      </Typography>
                    </Box>
                  </Box>
                  <AttachMoney color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Orders
                    </Typography>
                    <Typography variant="h5">
                      {dashboardMetrics?.totalOrders.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getGrowthIcon(dashboardMetrics?.ordersGrowth || 0)}
                      <Typography
                        variant="body2"
                        color={getGrowthColor(dashboardMetrics?.ordersGrowth || 0)}
                        sx={{ ml: 0.5 }}
                      >
                        {dashboardMetrics?.ordersGrowth}%
                      </Typography>
                    </Box>
                  </Box>
                  <Restaurant color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Avg Order Value
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(dashboardMetrics?.avgOrderValue || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getGrowthIcon(dashboardMetrics?.avgOrderGrowth || 0)}
                      <Typography
                        variant="body2"
                        color={getGrowthColor(dashboardMetrics?.avgOrderGrowth || 0)}
                        sx={{ ml: 0.5 }}
                      >
                        {dashboardMetrics?.avgOrderGrowth}%
                      </Typography>
                    </Box>
                  </Box>
                  <Assessment color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Customer Satisfaction
                    </Typography>
                    <Typography variant="h5">
                      {dashboardMetrics?.customerSatisfaction}/5.0
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getGrowthIcon(dashboardMetrics?.satisfactionGrowth || 0)}
                      <Typography
                        variant="body2"
                        color={getGrowthColor(dashboardMetrics?.satisfactionGrowth || 0)}
                        sx={{ ml: 0.5 }}
                      >
                        +{dashboardMetrics?.satisfactionGrowth}
                      </Typography>
                    </Box>
                  </Box>
                  <Star color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Revenue Trends
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Sales by Category
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Staff Performance */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Staff Performance Overview
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Orders Served</TableCell>
                  <TableCell align="right">Avg Service Time</TableCell>
                  <TableCell align="right">Customer Rating</TableCell>
                  <TableCell align="right">Revenue Generated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffPerformance.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={staff.role}
                        color={staff.role === 'Waiter' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{staff.ordersServed}</TableCell>
                    <TableCell align="right">{staff.avgServiceTime} min</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Rating value={staff.customerRating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {staff.customerRating}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(staff.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Tab 3: Inventory */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Inventory Status
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Min Stock</TableCell>
                      <TableCell align="right">Usage %</TableCell>
                      <TableCell align="right">Cost</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">{item.currentStock}</TableCell>
                        <TableCell align="right">{item.minStock}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={item.usage}
                              sx={{ flex: 1, mr: 1 }}
                            />
                            {item.usage}%
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.cost)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.status.toUpperCase()}
                            color={getInventoryStatusColor(item.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: Customer Insights */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Customer Feedback
              </Typography>
              <List>
                {customerFeedback.map((feedback) => (
                  <ListItem key={feedback.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{feedback.customerName}</Typography>
                          <Rating value={feedback.rating} readOnly size="small" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            "{feedback.comment}"
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {feedback.date.toLocaleDateString()} • {formatCurrency(feedback.orderValue)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Metrics
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Average Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={4.6} readOnly />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    4.6/5.0
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Customer Retention Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={78}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  78% customers return within 30 days
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Net Promoter Score (NPS)
                </Typography>
                <Typography variant="h4" color="success.main" sx={{ mt: 1 }}>
                  +52
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Excellent score (Above 50)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 5: Promotions */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Active Promotions</Typography>
          <Button
            variant="contained"
            startIcon={<Campaign />}
            onClick={() => setPromotionDialog(true)}
          >
            Create Promotion
          </Button>
        </Box>

        <Grid container spacing={3}>
          {promotions.map((promotion) => (
            <Grid item xs={12} md={6} key={promotion.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6">{promotion.name}</Typography>
                    <Chip
                      label={promotion.isActive ? 'Active' : 'Inactive'}
                      color={promotion.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {promotion.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Discount:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {promotion.type === 'percentage' ? `${promotion.discount}%` : formatCurrency(promotion.discount)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Period:</Typography>
                    <Typography variant="body2">
                      {promotion.startDate.toLocaleDateString()} - {promotion.endDate.toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Usage:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {promotion.usage} times
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 6: Forecasting */}
      <TabPanel value={tabValue} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Sales Forecast (Next 30 Days)
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                AI-powered prediction based on historical data, seasonality, and trends
              </Alert>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeDasharray="5 5"
                    name="Forecasted Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUp color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Key Predictions</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Predicted Revenue (Next Month)
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {formatCurrency(95000000)}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +15% vs last month
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Peak Days
                      </Typography>
                      <Typography variant="body1">
                        Weekends & Friday nights
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Recommended Actions
                      </Typography>
                      <Typography variant="body2">
                        • Increase weekend staff<br/>
                        • Promote weekday specials<br/>
                        • Stock up on popular items
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Promotion Dialog */}
      <Dialog open={promotionDialog} onClose={() => setPromotionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Promotion</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Promotion Name" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select label="Discount Type" defaultValue="percentage">
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Discount Value" type="number" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="End Date" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromotionDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Promotion</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OwnerDashboard;
