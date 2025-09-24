import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Pagination,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Table } from '../../../services/tableService';

interface TableUsageHistory {
  usage_id: string;
  table_id: string;
  customer_name?: string;
  customer_phone?: string;
  guest_count: number;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  order_total?: number;
  total_order_amount: number;
  total_payment_amount: number;
  usage_type?: string;
  status: string;
  created_at: string;
}

interface TableHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  table: Table | null;
}

const TableHistoryDialog: React.FC<TableHistoryDialogProps> = ({
  open,
  onClose,
  table
}) => {
  const [history, setHistory] = useState<TableUsageHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (open && table) {
      fetchHistory();
    }
  }, [open, table, page, dateFilter]);

  const fetchHistory = async () => {
    if (!table) return;

    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        page,
        limit: 10,
        ...(dateFilter.start_date && { start_date: dateFilter.start_date }),
        ...(dateFilter.end_date && { end_date: dateFilter.end_date })
      };

      // Mock data for now - replace with actual API call later
      const response = {
        success: true,
        data: [],
        total_pages: 1
      };
      setHistory(response.data);
      setTotalPages(response.total_pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch usage history');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (field: string, value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateStats = () => {
    if (history.length === 0) return null;

    const totalSessions = history.length;
    const completedSessions = history.filter(h => h.end_time).length;
    const totalDuration = history.reduce((sum, h) => sum + (h.duration_minutes || 0), 0);
    const totalRevenue = history.reduce((sum, h) => sum + h.total_order_amount, 0);
    const averageDuration = completedSessions > 0 ? totalDuration / completedSessions : 0;
    const averageRevenue = totalSessions > 0 ? totalRevenue / totalSessions : 0;

    return {
      totalSessions,
      completedSessions,
      totalDuration,
      totalRevenue,
      averageDuration,
      averageRevenue
    };
  };

  const stats = calculateStats();

  if (!table) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Table {table.table_number} - Usage History & Analytics
      </DialogTitle>

      <DialogContent>
        {/* Summary Statistics */}
        {stats && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Summary Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="primary">
                      {stats.totalSessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Sessions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TimeIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="info.main">
                      {formatDuration(stats.averageDuration)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Duration
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <MoneyIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="warning.main">
                      {formatCurrency(stats.averageRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Revenue
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Date Filters */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Filter History
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Start Date"
                type="date"
                value={dateFilter.start_date}
                onChange={(e) => handleDateFilterChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="End Date"
                type="date"
                value={dateFilter.end_date}
                onChange={(e) => handleDateFilterChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setDateFilter({ start_date: '', end_date: '' });
                  setPage(1);
                }}
                fullWidth
              >
                Clear Filter
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* History Table */}
        {!loading && !error && (
          <>
            <Typography variant="h6" gutterBottom>
              Usage History ({history.length} records)
            </Typography>
            
            {history.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No usage history found for the selected period.
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <MuiTable size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Guests</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Order Amount</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((record) => (
                        <TableRow key={record.usage_id}>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(record.start_time).toLocaleString()}
                            </Typography>
                            {record.end_time && (
                              <Typography variant="caption" color="text.secondary">
                                to {new Date(record.end_time).toLocaleString()}
                              </Typography>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            {record.customer_name ? (
                              <Box>
                                <Typography variant="body2">
                                  {record.customer_name}
                                </Typography>
                                {record.customer_phone && (
                                  <Typography variant="caption" color="text.secondary">
                                    {record.customer_phone}
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Walk-in
                              </Typography>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <Chip 
                              label={`${record.guest_count} ${record.guest_count === 1 ? 'guest' : 'guests'}`}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {formatDuration(record.duration_minutes)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2" color={record.total_order_amount > 0 ? 'success.main' : 'text.secondary'}>
                              {formatCurrency(record.total_order_amount)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2" color={record.total_payment_amount > 0 ? 'success.main' : 'text.secondary'}>
                              {formatCurrency(record.total_payment_amount)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={record.usage_type || 'Unknown'}
                              size="small"
                              color={
                                record.usage_type === 'reservation' ? 'warning' :
                                record.usage_type === 'walk_in' ? 'info' : 'default'
                              }
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={record.end_time ? 'Completed' : 'Active'}
                              size="small"
                              color={record.end_time ? 'success' : 'primary'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </MuiTable>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, newPage) => setPage(newPage)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {/* Overall Table Statistics */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Table Performance Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lifetime Usage
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {table.total_usage_count} times
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total times this table has been used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lifetime Revenue
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(table.total_revenue || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total revenue generated from this table
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {table.average_usage_duration_minutes && (
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Average Session Duration
                    </Typography>
                    <Typography variant="h5" color="info.main">
                      {formatDuration(table.average_usage_duration_minutes)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average time customers spend at this table
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Revenue per Use
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {(table.total_usage_count || 0) > 0
                      ? formatCurrency((table.total_revenue || 0) / (table.total_usage_count || 1))
                      : formatCurrency(0)
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average revenue per table usage
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {table.last_occupied_at && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Occupied
                    </Typography>
                    <Typography variant="h6">
                      {new Date(table.last_occupied_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Most recent time this table was occupied
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button variant="outlined" onClick={fetchHistory}>
          Refresh Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableHistoryDialog;
