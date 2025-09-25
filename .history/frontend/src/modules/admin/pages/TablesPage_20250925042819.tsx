/**
 * TablesPage Component - Restaurant Table Management System
 * 
 * This component provides comprehensive table management functionality including:
 * - Table CRUD operations (Create, Read, Update, Delete)
 * - Real-time status management (Available, Occupied, Reserved, Cleaning, Out of Order)
 * - Multiple view modes (Grid, List, Floor Plan)
 * - QR code generation for table ordering
 * - Usage history and analytics tracking
 * - Reservation management with customer details
 * - Area-based table organization
 * - Advanced filtering and search capabilities
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Table as MuiTable, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Alert,
  CircularProgress, Tooltip, Badge
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, QrCode as QrCodeIcon,
  Visibility as ViewIcon, TableRestaurant as TableIcon, People as PeopleIcon,
  Schedule as ScheduleIcon, History as HistoryIcon, CleaningServices as CleaningIcon,
  PersonAdd as ReserveIcon, CheckCircle as AvailableIcon,
  Warning as OutOfOrderIcon, Category as CategoryIcon
} from '@mui/icons-material';

import QRCodeDialog from '../components/QRCodeDialog';
import TableHistoryDialog from '../components/TableHistoryDialog';
import { api, apiConfig } from '../../../services/api';

// Interface definitions for type safety
interface Table {
  table_id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order';
  area: string;
  location_description?: string;
  position_x?: number;
  position_y?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Status specific fields
  current_guest_count?: number;
  occupied_since?: string;
  reserved_customer_name?: string;
  reserved_customer_phone?: string;
  reserved_from?: string;
  reserved_until?: string;
  last_cleaned_at?: string;
  last_cleaned_by?: string;
  // Analytics fields
  total_usage_count?: number;
  total_revenue?: number;
  average_usage_duration_minutes?: number;
  notes?: string;
}
interface TableStats {
  total: number; available: number; reserved: number; 
  cleaning: number; utilization_rate: string;
  by_area: Array<{ area: string; count: number }>;
  by_capacity: Array<{ capacity: number; count: number }>;
}

interface TableFormData {
  table_number: string; capacity: number; area: string;
  location_description: string; notes: string;
}

const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Main state management
  const [tables, setTables] = useState<Table[]>([]);
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openAreaDialog, setOpenAreaDialog] = useState(false);
  
  // Form data management
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<TableFormData>({
    table_number: '', capacity: 2, area: 'indoor',
    location_description: '', notes: ''
  });
  const [statusFormData, setStatusFormData] = useState({
    status: '', customer_name: '', customer_phone: '', guest_count: 1,
    notes: '', reserved_from: '', reserved_until: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [editing, setEditing] = useState(false);

  // Area management state
  const [areaOptions, setAreaOptions] = useState([
    { value: 'indoor', label: 'Indoor' }, { value: 'outdoor', label: 'Outdoor' }, { value: 'vip', label: 'VIP' },
    { value: 'smoking', label: 'Smoking Area' }, { value: 'non_smoking', label: 'Non-Smoking Area' },
    { value: 'second_floor', label: 'Second Floor' }, { value: 'terrace', label: 'Terrace' }
  ]);
  const [newAreaValue, setNewAreaValue] = useState('');
  const [newAreaLabel, setNewAreaLabel] = useState('');

  // Configuration objects for status and area management
  const statusColors = { available: 'success', reserved: 'warning', cleaning: 'info', out_of_order: 'default' } as const;
  const statusIcons = { available: <AvailableIcon />, reserved: <ScheduleIcon />, cleaning: <CleaningIcon />, out_of_order: <OutOfOrderIcon /> };

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // initial fetching is done in a guarded didMount effect to avoid duplicate calls
    loadAreaOptions();
  }, [navigate]);

  // Prevent duplicate data fetches in React StrictMode / Fast Refresh during development
  const didMountRef = React.useRef(false);
  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    // Safe single-time fetch (prevents double-call in StrictMode / Fast Refresh)
    (async () => {
      try {
        fetchTables();
        fetchStats();
      } catch (e) {
        console.error('Initial data fetch failed', e);
      }
    })();

    return () => { /* noop cleanup */ };
  }, []);

  // Load area options from localStorage
  const loadAreaOptions = () => {
    try {
      const savedAreas = localStorage.getItem('tableAreas');
      if (savedAreas) {
        setAreaOptions(JSON.parse(savedAreas));
      }
    } catch (error) {
      console.error('Error loading area options:', error);
    }
  };

  // Save area options to localStorage
  useEffect(() => {
    localStorage.setItem('tableAreas', JSON.stringify(areaOptions));
  }, [areaOptions]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await api.get(apiConfig.endpoints.tables);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter out tables that don't have a valid table_id to prevent key errors
        const validTables = response.data.filter((table: any) => table && table.table_id);
        setTables(validTables);
      } else {
        setTables([]); // Ensure tables is always an array
        console.error('Failed to fetch tables:', response.message);
        setNotification({ message: 'Failed to fetch tables from database', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error: any) {
      console.error('Error fetching tables:', error);
      
      // If unauthorized, clear token and redirect to login
      if (error?.response?.status === 401 || error?.status === 401) {
        try { localStorage.removeItem('token'); } catch (e) { /* ignore */ }
        navigate('/login');
        return;
      }

      // Handle 401 Unauthorized - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      setNotification({ message: 'Error connecting to database', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(apiConfig.endpoints.tableStats);
      
      if (response.data) {
        setStats(response.data);
      } else {
        console.error('Failed to fetch table stats:', response.message);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      
      // If unauthorized, clear token and redirect to login
      if (error?.response?.status === 401 || error?.status === 401) {
        try { localStorage.removeItem('token'); } catch (e) { /* ignore */ }
        navigate('/login');
        return;
      }

      // Handle 401 Unauthorized - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
    }
  };

  const handleCreateTable = async () => {
    try {
      // Validate form before submission
      if (!validateForm()) {
        return;
      }


      // Hanya kirim field yang tidak undefined/null
      const payload: any = {
        table_number: formData.table_number,
        capacity: formData.capacity,
        area: formData.area
      };
      if (formData.location_description) payload.location_description = formData.location_description;
      if (formData.notes) payload.notes = formData.notes;

      const response = await api.post(apiConfig.endpoints.tables, payload);

      if (response.data || response.message) {
        // Refresh tables list
        fetchTables();
        fetchStats();

        setOpenCreateDialog(false);
        resetForm();

        // Show success notification
        setNotification({ message: `Table ${formData.table_number} created successfully!`, type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({ message: response.message || 'Failed to create table', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error creating table:', error);
      // If the server returns a clear message, surface it to the user
      const serverMessage = (error as any)?.message || (error as any)?.toString();

      // Handle duplicate table number specifically: if our number was auto-generated, try generating a new one
      if (serverMessage && serverMessage.toLowerCase().includes('table number already exists')) {
        setFormErrors(prev => ({ ...prev, table_number: 'Table number already exists' }));

        // If the current table number looks like an auto-generated pattern (e.g. T001), suggest a new one
        if (/^T\d{3}$/.test(formData.table_number)) {
          const newNumber = generateTableNumber();
          setFormData(prev => ({ ...prev, table_number: newNumber }));
          setNotification({ message: `Table number already exists. Suggested ${newNumber}`, type: 'error' });
        } else {
          setNotification({ message: serverMessage, type: 'error' });
        }
      } else {
        setNotification({ message: 'Error creating table', type: 'error' });
      }
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleEditTable = async () => {
    console.debug('handleEditTable start', { selectedTable, formData });

    if (!selectedTable) {
      setNotification({ message: 'No table selected to update', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      console.debug('handleEditTable: validation failed', { formErrors });
      return;
    }

    setEditing(true);
    try {
      console.debug('handleEditTable: sending PUT', apiConfig.endpoints.tableById(selectedTable.table_id), formData);
      const response = await api.put(apiConfig.endpoints.tableById(selectedTable.table_id), formData);

      if (response && (response.data || response.message)) {
        // Try to update local state immediately so UI reflects the change without waiting for refetch
        try {
          const updatedEntity = response.data || response;
          const mapped = {
            table_id: updatedEntity.id || updatedEntity.table_id || selectedTable.table_id,
            table_number: updatedEntity.table_number || selectedTable.table_number,
            capacity: updatedEntity.capacity !== undefined ? updatedEntity.capacity : selectedTable.capacity,
            status: updatedEntity.status || selectedTable.status,
            area: updatedEntity.location || updatedEntity.area || selectedTable.area,
            location_description: updatedEntity.location_description || selectedTable.location_description,
            // position fields removed as floor plan feature is deprecated
            notes: updatedEntity.notes || selectedTable.notes,
            created_at: updatedEntity.created_at || selectedTable.created_at,
            updated_at: updatedEntity.updated_at || new Date().toISOString()
          } as any;

          setTables(prev => {
            const next = prev.map(t => t.table_id === mapped.table_id ? { ...t, ...mapped } : t);
            console.debug('Updated tables state (after mapping):', next);
            return next;
          });
        } catch (mapErr) {
          console.warn('Could not map updated table into state', mapErr);
        }

        // Refresh stats (keep) and attempt background refetch to keep server-of-truth in sync
        fetchStats();
        fetchTables();

  // Blur currently focused element to avoid stuck focus inside dialog (prevents aria-hidden warnings)
    handleCloseEditDialog();

        // Show success notification
        setNotification({ message: `Table ${formData.table_number} updated successfully!`, type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({ message: (response && response.message) || 'Failed to update table', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating table:', err);
      // Try to surface server message when available
      const serverMessage = err?.data?.message || err?.message || (err && err.toString()) || 'Error updating table';
      setNotification({ message: serverMessage, type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      const response = await api.delete(apiConfig.endpoints.tableById(tableId));

      // Some backends return null or empty body for delete (204). Treat null as success.
      const success = response === null || response === undefined || response.data || response.message;

      if (success) {
        // Refresh tables list
        fetchTables();
        fetchStats();
        
        setNotification({ message: 'Table deleted successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({ message: response.message || 'Failed to delete table', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      setNotification({ message: 'Error deleting table', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      if (!selectedTable) return;
      
      const updateData = {
        status: statusFormData.status,
        ...(statusFormData.status === 'reserved' && {
          reserved_customer_name: statusFormData.customer_name,
          reserved_customer_phone: statusFormData.customer_phone,
          reserved_from: statusFormData.reserved_from,
          reserved_until: statusFormData.reserved_until
        }),
        ...(statusFormData.status === 'occupied' && {
          current_guest_count: statusFormData.guest_count,
          occupied_since: new Date().toISOString()
        }),
        ...(statusFormData.notes && {
          notes: statusFormData.notes
        })
      };
      
  const response = await api.patch(apiConfig.endpoints.tableStatus(selectedTable.table_id), updateData);
      
      if (response.data || response.message) {
        // Refresh tables list
        fetchTables();
        fetchStats();
        
        setOpenStatusDialog(false);
        setSelectedTable(null);
        resetStatusForm();
        
        setNotification({ message: 'Table status updated successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({ message: response.message || 'Failed to update status', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({ message: 'Error updating table status', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Form reset utility functions
  const resetForm = () => {
    setFormData({ table_number: '', capacity: 2, area: 'indoor', location_description: '', notes: '' });
    setFormErrors({});
  };
  const resetStatusForm = () => setStatusFormData({ status: '', customer_name: '', customer_phone: '', guest_count: 1, notes: '', reserved_from: '', reserved_until: '' });

  // Area management functions
  const handleAddArea = () => {
    if (!newAreaValue.trim() || !newAreaLabel.trim()) {
      setNotification({ message: 'Please fill in both area value and label', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Check if area value already exists
    const existingArea = areaOptions.find(area => area.value === newAreaValue.toLowerCase().replace(/\s+/g, '_'));
    if (existingArea) {
      setNotification({ message: 'Area value already exists', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const newArea = {
      value: newAreaValue.toLowerCase().replace(/\s+/g, '_'),
      label: newAreaLabel
    };

    setAreaOptions(prev => [...prev, newArea]);
    setNewAreaValue('');
    setNewAreaLabel('');
    setNotification({ message: `Area "${newAreaLabel}" added successfully!`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteArea = (areaValue: string) => {
    // Check if any table is using this area
    const tablesUsingArea = tables.filter(table => table.area === areaValue);
    if (tablesUsingArea.length > 0) {
      setNotification({ 
        message: `Cannot delete area. ${tablesUsingArea.length} table(s) are still using this area.`, 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this area?')) return;

    setAreaOptions(prev => prev.filter(area => area.value !== areaValue));
    setNotification({ message: 'Area deleted successfully!', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle table position update from drag and drop
  // Floor plan move handler removed (feature deprecated)

  // Utility functions
  const generateTableNumber = () => {
    const existingNumbers = tables.map(t => t.table_number);
    let counter = 1;
    let newNumber = '';
    
    // Try T001, T002, etc.
    do {
      newNumber = `T${counter.toString().padStart(3, '0')}`;
      counter++;
    } while (existingNumbers.includes(newNumber) && counter <= 999);
    
    return newNumber;
  };

  const findAvailablePosition = () => {
    // Floor plan positioning removed — keep function for compatibility but return null position
    return null as any;
  };

  const handleAddTableClick = () => {
    const suggestedNumber = generateTableNumber();
    setFormData({
      table_number: suggestedNumber,
      capacity: 2,
      area: 'indoor',
      location_description: '',
      notes: '',
      // position fields removed
    });
    setFormErrors({});
    setOpenCreateDialog(true);
  };

  // Validation functions
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.table_number.trim()) {
      errors.table_number = 'Table number is required';
    }
    
    if (formData.capacity < 1 || formData.capacity > 20) {
      errors.capacity = 'Capacity must be between 1 and 20';
    }
    
    // Check for duplicate table number
    const duplicateTable = selectedTable 
      ? tables.find(t => t.table_id !== selectedTable.table_id && t.table_number.toLowerCase() === formData.table_number.toLowerCase())
      : tables.find(t => t.table_number.toLowerCase() === formData.table_number.toLowerCase());
    
    if (duplicateTable) {
      errors.table_number = 'Table number already exists';
    }
    
    // Floor plan position validation removed
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Dialog handler functions
  const handleOpenEditDialog = (table: Table) => {
    try { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } catch (e) { /* ignore */ }
    setSelectedTable(table);
    setFormData({ table_number: table.table_number, capacity: table.capacity, area: table.area,
      location_description: table.location_description || '', notes: table.notes || '' });
    setOpenEditDialog(true);
  };

  const handleOpenStatusDialog = (table: Table) => {
    try { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } catch (e) { /* ignore */ }
    setSelectedTable(table);
    setStatusFormData({ status: table.status, customer_name: table.reserved_customer_name || '',
      customer_phone: table.reserved_customer_phone || '', guest_count: table.current_guest_count || 1,
      notes: table.notes || '', 
      reserved_from: table.reserved_from ? new Date(table.reserved_from).toISOString().slice(0, 16) : '',
      reserved_until: table.reserved_until ? new Date(table.reserved_until).toISOString().slice(0, 16) : '' });
    setOpenStatusDialog(true);
  };

  const handleCloseCreateDialog = () => {
    try { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } catch (e) { /* ignore */ }
    setOpenCreateDialog(false);
    resetForm();
  };

  const handleCloseStatusDialog = () => {
    try { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } catch (e) { /* ignore */ }
    setOpenStatusDialog(false);
    setSelectedTable(null);
    resetStatusForm();
  };

  const handleCloseQrDialog = () => {
    try { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } catch (e) { /* ignore */ }
    setOpenQrDialog(false);
    setSelectedTable(null);
  };

  const handleCloseHistoryDialog = () => {
    try { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } catch (e) { /* ignore */ }
    setOpenHistoryDialog(false);
    setSelectedTable(null);
  };

  const handleCloseAreaDialog = () => {
    try { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } catch (e) { /* ignore */ }
    setOpenAreaDialog(false);
  };

  const handleCloseEditDialog = () => {
    try { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } catch (e) { /* ignore */ }
    setOpenEditDialog(false);
    setSelectedTable(null);
    resetForm();
  };

  // Filtered tables based on current filters and search query
  const filteredTables = tables.filter(table => {
    const matchesStatus = filterStatus === 'all' || table.status === filterStatus;
    const matchesArea = filterArea === 'all' || table.area === filterArea;
    const matchesSearch = table.table_number.toLowerCase().includes(searchQuery.toLowerCase()) || (table.location_description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesArea && matchesSearch;
  });

  const renderTableCard = (table: Table) => (
    <Card key={table.table_id} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box sx={{ pl: 1.5 }}>
            <Typography variant="h6" component="div">
              {table.table_number}
            </Typography>
            <Chip
              icon={statusIcons[table.status as keyof typeof statusIcons]}
              label={(table.status || 'unknown').replace('_', ' ').toUpperCase()}
              color={statusColors[table.status as keyof typeof statusColors] || 'default'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          <Box display="flex" gap={0.5}>
            <Tooltip title="View QR Code">
              <IconButton size="small" onClick={() => {
                setSelectedTable(table);
                setOpenQrDialog(true);
              }}>
                <QrCodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Table">
              <IconButton size="small" onClick={() => handleOpenEditDialog(table)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Table">
              <IconButton size="small" color="error" onClick={() => handleDeleteTable(table.table_id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={1} sx={{ pl: 1.25 }}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2">Capacity: {table.capacity}</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={1} sx={{ pl: 1.25 }}>
          <TableIcon fontSize="small" color="action" />
          <Typography variant="body2">Area: {(table.area || 'N/A').replace('_', ' ')}</Typography>
        </Box>

        {table.location_description && <Typography variant="body2" color="text.secondary" mb={1}>{table.location_description}</Typography>}

        {table.status === 'reserved' && table.reserved_customer_name && (
          <Box mb={1}>
            <Typography variant="body2" color="warning.main">Reserved for: {table.reserved_customer_name}</Typography>
            {table.reserved_from && table.reserved_until && (
              <Typography variant="caption" color="text.secondary">{new Date(table.reserved_from).toLocaleString()} - {new Date(table.reserved_until).toLocaleString()}</Typography>
            )}
          </Box>
        )}



        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Button variant="outlined" size="small" onClick={() => handleOpenStatusDialog(table)}>Update Status</Button>
          <Button variant="text" size="small" startIcon={<HistoryIcon />} onClick={() => { setSelectedTable(table); setOpenHistoryDialog(true); }}>History</Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Statistics cards rendering function
  const renderStatsCards = () => {
    if (!stats) return null;
    const statsData = [
      { 
        label: 'Total Tables', 
        value: stats.total, 
        color: 'primary.main',
        icon: <TableIcon />,
        bgGradient: 'linear-gradient(135deg, #4a60c4ff 0%, #764ba2 100%)'
      },
      { 
        label: 'Available', 
        value: stats.available, 
        color: 'success.main',
        icon: <AvailableIcon />,
        bgGradient: 'linear-gradient(135deg, #2b7bc1ff 0%, #00f2fe 100%)'
      },

      { 
        label: 'Reserved', 
        value: stats.reserved, 
        color: 'warning.main', 
        icon: <ScheduleIcon />, 
        bgGradient: 'linear-gradient(135deg, #8B0000 0%, #D32F2F 100%)'
      },
      // Utilization card removed as requested
    ];

    return (
      <Grid container spacing={3} mb={3}>
        {statsData.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card 
              sx={{ 
                height: '100%',
                background: stat.bgGradient,
                color: 'white',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      color="rgba(255,255,255,0.8)" 
                      gutterBottom 
                      variant="body2"
                      sx={{ fontWeight: 500 }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'white'
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {React.cloneElement(stat.icon, { 
                      sx: { 
                        fontSize: 32, 
                        color: 'white' 
                      } 
                    })}
                  </Box>
                </Box>
              </CardContent>
              {/* Decorative background pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  zIndex: 1
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Loading state
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="400px"><CircularProgress /></Box>;

  return (
    <Box>
      {/* Notification */}
      {notification && (
        <Alert severity={notification.type} sx={{ mb: 2 }} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Modern Header Section */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Table Management
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          Manage restaurant tables, track occupancy, and handle reservations
        </Typography>
      </Box>

      {renderStatsCards()}

      <Box mb={3}>
        <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
          <Tab label="Grid View" />
          <Tab label="List View" />
        </Tabs>
      </Box>

      {/* Modern Filter and Action Bar */}
      <Box 
        display="flex" 
        gap={2} 
        mb={3} 
        flexWrap="wrap" 
        alignItems="center"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Search and Filters */}
        <Box display="flex" gap={2} flexWrap="wrap" flex={1}>
          <TextField 
            label="Search Tables" 
            variant="outlined" 
            size="small" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            sx={{ minWidth: 200 }} 
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
              <MenuItem value="all">All Status</MenuItem>
              {['available', 'reserved', 'cleaning', 'out_of_order'].map(status => (
                <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Area</InputLabel>
            <Select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} label="Area">
              <MenuItem value="all">All Areas</MenuItem>
              {areaOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        
        {/* Modern Action Buttons */}
        <Box display="flex" gap={1}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddTableClick}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
              }
            }}
          >
            Add Table
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => setOpenAreaDialog(true)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Manage Areas
          </Button>
        </Box>
      </Box>

      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {filteredTables.map(table => (
            <Grid item xs={12} sm={6} md={4} key={table.table_id}>
              {renderTableCard(table)}
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 1 && (
        <TableContainer component={Paper}>
          <MuiTable>
            <TableHead>
              <TableRow>
                <TableCell>Table Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Current Info</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTables.map(table => (
                <TableRow key={table.table_id}>
                  <TableCell>{table.table_number}</TableCell>
                  <TableCell>
                    <Chip
                      icon={statusIcons[table.status as keyof typeof statusIcons]}
                      label={(table.status || 'unknown').replace('_', ' ').toUpperCase()}
                      color={statusColors[table.status as keyof typeof statusColors] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {table.capacity}
                  </TableCell>
                  <TableCell>{(table.area || 'N/A').replace('_', ' ')}</TableCell>
                  <TableCell>
                    {table.notes ? (
                      <Typography variant="body2">
                        {table.notes}
                      </Typography>
                    ) : null}

                    {table.status === 'reserved' && table.reserved_customer_name && (
                      <Typography variant="body2" sx={{ mt: table.notes ? 0.5 : 0 }}>
                        {table.reserved_customer_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton size="small" onClick={() => handleOpenStatusDialog(table)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => {
                        setSelectedTable(table);
                        setOpenQrDialog(true);
                      }}>
                        <QrCodeIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => {
                        setSelectedTable(table);
                        setOpenHistoryDialog(true);
                      }}>
                        <HistoryIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteTable(table.table_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
      )}

      {/* Floor plan view removed per user request */}

      {/* Create Table Dialog */}
  <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Table</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Table Number"
                value={formData.table_number}
                onChange={(e) => setFormData(prev => ({ ...prev, table_number: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                fullWidth
                required
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Area</InputLabel>
                <Select
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  label="Area"
                >
                  {areaOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location Description"
                value={formData.location_description}
                onChange={(e) => setFormData(prev => ({ ...prev, location_description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            {/* Floor plan position inputs removed */}
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button onClick={handleCreateTable} variant="contained">Add Table</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Table Dialog */}
  <Dialog
    open={openEditDialog}
    onClose={(event, reason) => {
      // keep dialog open when clicking outside or pressing Escape; only allow closing via explicit buttons
      if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
      handleCloseEditDialog();
    }}
    disableEscapeKeyDown
    maxWidth="sm"
    fullWidth
  >
        <DialogTitle>Edit Table</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Table Number"
                value={formData.table_number}
                onChange={(e) => setFormData(prev => ({ ...prev, table_number: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                fullWidth
                required
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Area</InputLabel>
                <Select
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  label="Area"
                >
                  {areaOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location Description"
                value={formData.location_description}
                onChange={(e) => setFormData(prev => ({ ...prev, location_description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            {/* Floor plan position inputs removed */}
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleCloseEditDialog} disabled={editing}>Cancel</Button>
          <Button type="button" onClick={handleEditTable} variant="contained" disabled={editing} startIcon={editing ? <CircularProgress size={18} /> : undefined}>
            {editing ? 'Updating...' : 'Update Table'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
  <Dialog
    open={openStatusDialog}
    onClose={(event, reason) => {
      // prevent closing on backdrop click or Escape — require Cancel or Update buttons
      if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
      handleCloseStatusDialog();
    }}
    disableEscapeKeyDown
    maxWidth="sm"
    fullWidth
  >
        <DialogTitle>Update Table Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="reserved">Reserved</MenuItem>
                  <MenuItem value="cleaning">Cleaning</MenuItem>
                  <MenuItem value="out_of_order">Out of Order</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {statusFormData.status === 'reserved' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Name"
                    value={statusFormData.customer_name}
                    onChange={(e) => setStatusFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Phone"
                    value={statusFormData.customer_phone}
                    onChange={(e) => {
                      // Only allow digits in the phone input — strip any non-digit characters
                      const digits = e.target.value.replace(/\D/g, '');
                      setStatusFormData(prev => ({ ...prev, customer_phone: digits }));
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Guest Count"
                    type="number"
                    value={statusFormData.guest_count}
                    onChange={(e) => setStatusFormData(prev => ({ ...prev, guest_count: parseInt(e.target.value) }))}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Reserved From"
                    type="datetime-local"
                    value={statusFormData.reserved_from}
                    onChange={(e) => setStatusFormData(prev => ({ ...prev, reserved_from: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Reserved Until"
                    type="datetime-local"
                    value={statusFormData.reserved_until}
                    onChange={(e) => setStatusFormData(prev => ({ ...prev, reserved_until: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={statusFormData.notes}
                onChange={(e) => setStatusFormData(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Update Status</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={openQrDialog}
  onClose={handleCloseQrDialog}
        tableId={selectedTable?.table_id || ''}
        tableNumber={selectedTable?.table_number || ''}
      />

      {/* Usage History Dialog */}
      <TableHistoryDialog
        open={openHistoryDialog}
  onClose={handleCloseHistoryDialog}
        table={selectedTable}
      />

      {/* Area Management Dialog */}
  <Dialog open={openAreaDialog} onClose={handleCloseAreaDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon />
          Manage Area Categories
        </DialogTitle>
        <DialogContent>
          {/* Add New Area Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Add New Area</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Area Value"
                  value={newAreaValue}
                  onChange={(e) => setNewAreaValue(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Lowercase, use underscores (e.g., main_hall)"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Area Label"
                  value={newAreaLabel}
                  onChange={(e) => setNewAreaLabel(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Display name (e.g., Main Hall)"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="contained"
                  onClick={handleAddArea}
                  fullWidth
                  sx={{ height: '40px' }}
                  startIcon={<AddIcon />}
                >
                  Add Area
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Existing Areas List */}
          <Box>
            <Typography variant="h6" gutterBottom>Existing Areas</Typography>
            <Grid container spacing={2}>
              {areaOptions.map((area) => {
                const tablesCount = tables.filter(table => table.area === area.value).length;
                return (
                  <Grid item xs={12} sm={6} md={4} key={area.value}>
                    <Card 
                      sx={{ 
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 1
                        }
                      }}
                    >
                      <Box display="flex" justifyContent="between" alignItems="start">
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {area.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Value: {area.value}
                          </Typography>
                          <Chip 
                            label={`${tablesCount} table(s)`}
                            size="small"
                            color={tablesCount > 0 ? "primary" : "default"}
                          />
                        </Box>
                        <Tooltip title={tablesCount > 0 ? `Cannot delete - ${tablesCount} table(s) using this area` : "Delete area"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteArea(area.value)}
                              disabled={tablesCount > 0}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAreaDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default TablesPage;
