/**
 * TablesPageEnhanced - Advanced Table Management Component
 * 
 * Fitur utama:
 * - Grid/List/Floor plan view untuk meja
 * - Real-time status tracking (available, occupied, reserved, cleaning, out_of_order)
 * - QR code generation untuk setiap meja
 * - History tracking dan analytics
 * - Filter dan search functionality
 * - CRUD operations untuk table management
 * - Statistics dashboard dengan utilization rate
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, IconButton, Grid, Paper, Chip,
  TextField, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, List, ListItem,
  ListItemText, ListItemSecondaryAction, Menu, Stack, Alert, Divider, Badge,
  Tooltip, Table as MuiTable, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, QrCode as QrCodeIcon, History as HistoryIcon,
  MoreVert as MoreVertIcon, ViewModule as GridViewIcon, ViewList as ListViewIcon,
  Map as FloorPlanIcon, Refresh as RefreshIcon, FilterList as FilterIcon,
  TableRestaurant as TableIcon, EventSeat as ChairIcon, People as PeopleIcon,
  Schedule as ScheduleIcon, CleaningServices as CleaningIcon, Warning as WarningIcon,
  CheckCircle as AvailableIcon, Cancel as OccupiedIcon, Bookmark as ReservedIcon,
  Build as MaintenanceIcon, Delete as DeleteIcon, Settings as SettingsIcon
} from '@mui/icons-material';

import { TableService, Table } from '../../../services/tableService';
import QRCodeDialog from '../components/QRCodeDialog';
import TableHistoryDialog from '../components/TableHistoryDialog';
import { 
  getStatusColor, getStatusIcon, 
  formatCurrency, formatDuration, areaOptions, statusOptions 
} from '../../../data/mockTableData';

const TablesPage: React.FC = () => {
  // State untuk data tables - akan diisi dari database
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk view management (grid/list/floor plan)
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'floor'>('grid');
  const [currentTab, setCurrentTab] = useState(0);
  
  // State untuk filtering dan search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  
  // State untuk dialog management
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrTableId, setQrTableId] = useState<string>('');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyTableId, setHistoryTableId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  
  // State untuk form data (add/edit table)
  const [formData, setFormData] = useState({
    table_number: '', capacity: 2, area: 'indoor',
    location_description: ''
  });

  // Load data from database
  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const response = await TableService.getAllTables();
        
        // Extract data array from paginated response
        const data = response.data || [];
        
        // Ensure all required properties exist with default values
        const tablesWithDefaults: Table[] = data.map(table => ({
          ...table,
          total_usage_count: table.total_usage_count || 0,
          total_revenue: table.total_revenue || 0,
          average_usage_duration_minutes: table.average_usage_duration_minutes || 0,
          is_active: table.is_active ?? true,
          created_at: table.created_at || new Date().toISOString(),
          updated_at: table.updated_at || new Date().toISOString()
        }));
        
        setTables(tablesWithDefaults);
        setError(null);
      } catch (err) {
        setError('Failed to load tables from database');
        console.error('Error loading tables:', err);
        // Fallback to empty array instead of mock data
        setTables([]);
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, []);

  // Effect untuk filtering tables berdasarkan search term dan filter criteria
  useEffect(() => {
    let filtered = tables;

    if (searchTerm) {
      filtered = filtered.filter(table =>
        table.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.location_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.reserved_customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') filtered = filtered.filter(table => table.status === statusFilter);
    if (areaFilter !== 'all') filtered = filtered.filter(table => table.area === areaFilter);

    setFilteredTables(filtered);
  }, [tables, searchTerm, statusFilter, areaFilter]);

  // Handler untuk perubahan view (grid/list/floor)
  const handleViewChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const views: ('grid' | 'list' | 'floor')[] = ['grid', 'list', 'floor'];
    setCurrentView(views[newValue]);
  };

  // Handler untuk membuka dialog tambah table baru
  const handleAddTable = () => {
    setEditingTable(null);
    setFormData({
      table_number: '', capacity: 2, area: 'indoor',
      location_description: ''
    });
    setDialogOpen(true);
  };

  // Handler untuk membuka dialog edit table
  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number, capacity: table.capacity, area: table.area,
      location_description: table.location_description || ''
    });
    setDialogOpen(true);
  };

  // Handler untuk save table (create/update)
  const handleSaveTable = async () => {
    try {
      if (editingTable) {
        // Update existing table
        const updatedTableData = { ...editingTable, ...formData };
        await TableService.updateTable(editingTable.table_id, updatedTableData);
        
        const updatedTables = tables.map(table =>
          table.table_id === editingTable.table_id ? { ...table, ...formData } : table
        );
        setTables(updatedTables);
      } else {
        // Create new table
        const newTableData = {
          ...formData,
          status: 'available' as const,
          total_usage_count: 0,
          total_revenue: 0,
          average_usage_duration_minutes: 0,
          is_active: true
        };
        
        const response = await TableService.createTable(newTableData);
        
        // Extract table from API response
        const createdTable = response.data;
        
        // Ensure the created table has all required properties
        const tableWithDefaults: Table = {
          ...createdTable,
          total_usage_count: createdTable.total_usage_count || 0,
          total_revenue: createdTable.total_revenue || 0,
          average_usage_duration_minutes: createdTable.average_usage_duration_minutes || 0
        };
        
        setTables([...tables, tableWithDefaults]);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving table:', error);
      setError('Failed to save table');
    }
  };

  // Handler untuk mengubah status table
  const handleStatusChange = async (tableId: string, newStatus: Table['status']) => {
    try {
      const table = tables.find(t => t.table_id === tableId);
      if (!table) return;
      
      await TableService.updateTableStatus(tableId, { status: newStatus });
      
      const updatedTables = tables.map(table =>
        table.table_id === tableId ? { ...table, status: newStatus } : table
      );
      setTables(updatedTables);
      setAnchorEl(null);
    } catch (error) {
      console.error('Error updating table status:', error);
      setError('Failed to update table status');
    }
  };

  // Handlers untuk context menu
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, tableId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTableId(tableId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTableId('');
  };

  // Handlers untuk dialog QR Code dan History
  const handleQRCode = (tableId: string) => {
    setQrTableId(tableId);
    setQrDialogOpen(true);
    handleMenuClose();
  };

  const handleHistory = (tableId: string) => {
    setHistoryTableId(tableId);
    setHistoryDialogOpen(true);
    handleMenuClose();
  };

  // Utility function untuk mendapatkan icon berdasarkan status table
  const getTableIcon = (status: string) => {
    const iconMap = {
      'available': <AvailableIcon color="success" />,
      'occupied': <OccupiedIcon color="error" />,
      'reserved': <ReservedIcon color="warning" />,
      'cleaning': <CleaningIcon color="info" />,
      'out_of_order': <WarningIcon color="disabled" />
    };
    return iconMap[status as keyof typeof iconMap] || <TableIcon />;
  };

  const renderTableCard = (table: Table) => (
    <Card 
      key={table.table_id}
      sx={{ 
        height: '100%',
        position: 'relative',
        '&:hover': { 
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {getTableIcon(table.status)}
            <Typography variant="h6" component="div">{table.table_number}</Typography>
          </Box>
          <IconButton size="small" onClick={(e) => handleMenuClick(e, table.table_id)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box mb={2}>
          <Chip label={table.status.replace('_', ' ').toUpperCase()} 
                color={getStatusColor(table.status) as any} size="small" sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Kapasitas: {table.capacity} orang</Typography>
          <Typography variant="body2" color="text.secondary">Area: {table.area}</Typography>
          {table.location_description && (
            <Typography variant="body2" color="text.secondary">Lokasi: {table.location_description}</Typography>
          )}
        </Box>

        {table.status === 'occupied' && table.current_guest_count && (
          <Box mb={1}>
            <Typography variant="body2" color="primary">
              <PeopleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              {table.current_guest_count} tamu sedang duduk
            </Typography>
            {table.occupied_since && (
              <Typography variant="caption" color="text.secondary">
                Sejak: {new Date(table.occupied_since).toLocaleTimeString('id-ID')}
              </Typography>
            )}
          </Box>
        )}

        {table.status === 'reserved' && table.reserved_customer_name && (
          <Box mb={1}>
            <Typography variant="body2" color="warning.main">
              <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              Dipesan: {table.reserved_customer_name}
            </Typography>
            {table.reserved_from && (
              <Typography variant="caption" color="text.secondary">
                {new Date(table.reserved_from).toLocaleTimeString('id-ID')} - {' '}
                {table.reserved_until && new Date(table.reserved_until).toLocaleTimeString('id-ID')}
              </Typography>
            )}
          </Box>
        )}

        {table.status === 'cleaning' && table.last_cleaned_by && (
          <Box mb={1}>
            <Typography variant="body2" color="info.main">
              <CleaningIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              Dibersihkan oleh: {table.last_cleaned_by}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Penggunaan: {table.total_usage_count}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              Revenue: {formatCurrency(table.total_revenue || 0)}
            </Typography>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => handleQRCode(table.table_id)}><QrCodeIcon /></IconButton>
            <IconButton size="small" onClick={() => handleHistory(table.table_id)}><HistoryIcon /></IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderTableList = () => (
    <Paper>
      <TableContainer>
        <MuiTable>
          <TableHead>
            <TableRow>
              <TableCell>Meja</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Kapasitas</TableCell>
              <TableCell>Area</TableCell>
              <TableCell>Informasi</TableCell>
              <TableCell>Statistik</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTables.map((table) => (
              <TableRow key={table.table_id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getTableIcon(table.status)}
                    <Typography variant="subtitle2">{table.table_number}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={table.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(table.status) as any} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{table.capacity} orang</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{table.area}</Typography>
                </TableCell>
                <TableCell>
                  {table.status === 'occupied' && table.current_guest_count && (
                    <Typography variant="body2" color="primary">{table.current_guest_count} tamu</Typography>
                  )}
                  {table.status === 'reserved' && table.reserved_customer_name && (
                    <Typography variant="body2" color="warning.main">{table.reserved_customer_name}</Typography>
                  )}
                  {table.location_description && (
                    <Typography variant="caption" color="text.secondary">{table.location_description}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{table.total_usage_count} kali</Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">{formatCurrency(table.total_revenue || 0)}</Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditTable(table)}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleQRCode(table.table_id)}><QrCodeIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleHistory(table.table_id)}><HistoryIcon /></IconButton>
                  <IconButton size="small" onClick={(e) => handleMenuClick(e, table.table_id)}><MoreVertIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Paper>
  );

  // Component untuk menampilkan statistics cards menggunakan data real
  const renderStatsCards = () => {
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const reservedTables = tables.filter(t => t.status === 'reserved').length;
    const utilizationRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

    return (
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TableIcon color="primary" />
                <Box>
                  <Typography variant="h4">{totalTables}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Meja</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AvailableIcon color="success" />
                <Box>
                  <Typography variant="h4">{availableTables}</Typography>
                  <Typography variant="body2" color="text.secondary">Tersedia</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <OccupiedIcon color="error" />
                <Box>
                  <Typography variant="h4">{occupiedTables}</Typography>
                  <Typography variant="body2" color="text.secondary">Terisi</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <ReservedIcon color="warning" />
                <Box>
                  <Typography variant="h4">{reservedTables}</Typography>
                  <Typography variant="body2" color="text.secondary">Dipesan</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: '50%', bgcolor: 'info.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '12px'
                }}>
                  %
                </Box>
                <Box>
                  <Typography variant="h4">{utilizationRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Utilisasi</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading tables...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Manajemen Meja
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddTable}>
          Tambah Meja
        </Button>
      </Box>

      {renderStatsCards()}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Cari meja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Semua Status</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Area</InputLabel>
              <Select
                value={areaFilter}
                label="Area"
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <MenuItem value="all">Semua Area</MenuItem>
                {areaOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" startIcon={<RefreshIcon />}
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); setAreaFilter('all'); }}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* View Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleViewChange}>
          <Tab icon={<GridViewIcon />} label="Grid" />
          <Tab icon={<ListViewIcon />} label="List" />
        </Tabs>
      </Paper>

      {/* Content based on current view */}
      {currentView === 'grid' && (
        <Grid container spacing={3}>
          {filteredTables.map((table) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={table.table_id}>
              {renderTableCard(table)}
            </Grid>
          ))}
        </Grid>
      )}

      {currentView === 'list' && renderTableList()}

      {/* Floor plan view removed per user request */}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditTable(tables.find(t => t.table_id === selectedTableId)!)}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleQRCode(selectedTableId)}>
          <QrCodeIcon sx={{ mr: 1 }} /> QR Code
        </MenuItem>
        <MenuItem onClick={() => handleHistory(selectedTableId)}>
          <HistoryIcon sx={{ mr: 1 }} /> Riwayat
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleStatusChange(selectedTableId, 'available')}>
          <AvailableIcon sx={{ mr: 1 }} color="success" /> Set Tersedia
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedTableId, 'occupied')}>
          <OccupiedIcon sx={{ mr: 1 }} color="error" /> Set Terisi
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedTableId, 'cleaning')}>
          <CleaningIcon sx={{ mr: 1 }} color="info" /> Set Cleaning
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedTableId, 'out_of_order')}>
          <WarningIcon sx={{ mr: 1 }} color="disabled" /> Set Rusak
        </MenuItem>
      </Menu>

      {/* Dialog untuk Add/Edit Table */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md">
        <DialogTitle>{editingTable ? 'Edit Meja' : 'Tambah Meja Baru'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nomor Meja"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Kapasitas"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Area</InputLabel>
                <Select
                  value={formData.area}
                  label="Area"
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                >
                  {areaOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deskripsi Lokasi"
                value={formData.location_description}
                onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
              />
            </Grid>
            {/* Floor plan position inputs removed */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Batal</Button>
          <Button onClick={handleSaveTable} variant="contained">
            {editingTable ? 'Update' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        tableId={qrTableId}
        tableNumber={tables.find(t => t.table_id === qrTableId)?.table_number || ''}
      />

      {/* History Dialog */}
      <TableHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        table={tables.find(t => t.table_id === historyTableId) || null}
      />
    </Box>
  );
};

export default TablesPage;
