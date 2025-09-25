/**
 * TablesPage.tsx - Komponen Manajemen Meja Restoran
 *
 * Deskripsi:
 * Komponen ini menyediakan antarmuka lengkap untuk mengelola meja di sebuah restoran.
 * Komponen ini menangani operasi CRUD, manajemen status real-time, visualisasi data,
 * dan fitur operasional lainnya untuk alur kerja yang efisien.
 *
 * Fitur Utama:
 * - Operasi CRUD (Create, Read, Update, Delete) untuk data meja.
 * - Tampilan data dalam mode Grid dan List.
 * - Manajemen status meja (Tersedia, Dipesan, Dibersihkan, Rusak).
 * - Dashboard statistik dengan ringkasan status dan data area.
 * - Fungsionalitas pencarian dan filter berdasarkan status serta area.
 * - Dialog terpisah untuk manajemen Area, Status, QR Code, dan Riwayat.
 * - Sistem notifikasi untuk memberikan umpan balik (feedback) kepada pengguna.
 *
 * Arsitektur:
 * - Menggunakan React Hooks (useState, useEffect, useCallback) untuk state dan lifecycle.
 * - Berinteraksi dengan backend melalui lapisan layanan API (api.ts).
 * - Menggunakan Material UI untuk semua komponen antarmuka pengguna.
 * - State dialog dikelola secara terpusat untuk kejelasan.
 * - Logika form dan validasi ditangani di dalam komponen dialog masing-masing.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Table as MuiTable, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Alert,
  CircularProgress, Tooltip, SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, QrCode as QrCodeIcon,
  History as HistoryIcon, TableRestaurant as TableIcon, People as PeopleIcon,
  Schedule as ScheduleIcon, CleaningServices as CleaningIcon, CheckCircle as AvailableIcon,
  Warning as OutOfOrderIcon, Category as CategoryIcon,
} from '@mui/icons-material';

import QRCodeDialog from '../components/QRCodeDialog';
import TableHistoryDialog from '../components/TableHistoryDialog';
import { api, apiConfig } from '../../../services/api';

// --- Definisi Tipe Data ---
interface Table {
  table_id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order';
  area: string;
  location_description?: string;
  notes?: string;
  is_active: boolean;
  // Tambahkan properti lain jika ada
  [key: string]: any;
}

interface TableStats {
  total: number;
  available: number;
  reserved: number;
  occupied: number;
  cleaning: number;
  by_area: Array<{ area: string; count: number }>;
}

interface AreaOption {
  value: string;
  label: string;
}

// --- Konfigurasi dan Helper ---
const statusConfig = {
  available: { label: 'Available', color: 'success', icon: <AvailableIcon /> },
  occupied: { label: 'Occupied', color: 'error', icon: <PeopleIcon /> },
  reserved: { label: 'Reserved', color: 'warning', icon: <ScheduleIcon /> },
  cleaning: { label: 'Cleaning', color: 'info', icon: <CleaningIcon /> },
  out_of_order: { label: 'Out of Order', color: 'default', icon: <OutOfOrderIcon /> },
} as const;


// --- Komponen Utama ---
const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const didMountRef = useRef(false);

  // --- State Management ---
  const [tables, setTables] = useState<Table[]>([]);
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // UI State
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState({ status: 'all', area: 'all', query: '' });
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  
  // State terpusat untuk semua dialog
  const [dialogState, setDialogState] = useState<{
    type: 'CREATE' | 'EDIT' | 'STATUS' | 'QR' | 'HISTORY' | 'AREA' | null;
    data?: Table | null;
  }>({ type: null, data: null });

  // --- Fungsi Pengambilan Data ---
  const loadData = useCallback(async () => {
    try {
      const [tablesResponse, statsResponse] = await Promise.all([
        api.get(apiConfig.endpoints.tables),
        api.get(apiConfig.endpoints.tableStats),
      ]);
      if (tablesResponse.data && Array.isArray(tablesResponse.data)) {
        // PERBAIKAN: Menambahkan tipe eksplisit '(t: Table)' untuk mengatasi error ts(7006)
        setTables(tablesResponse.data.filter((t: Table) => t && t.table_id));
      }
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setNotification({ message: 'Gagal terhubung ke server.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // --- Efek Samping (Side Effects) ---
  useEffect(() => {
    // Memuat opsi area dari localStorage saat komponen pertama kali dimuat
    const savedAreas = localStorage.getItem('tableAreas');
    if (savedAreas) {
      setAreaOptions(JSON.parse(savedAreas));
    } else {
      // Opsi default jika tidak ada di localStorage
      setAreaOptions([
        { value: 'indoor', label: 'Indoor' },
        { value: 'outdoor', label: 'Outdoor' },
        { value: 'vip', label: 'VIP' },
      ]);
    }

    if (!didMountRef.current) {
      didMountRef.current = true;
      loadData();
    }
  }, [loadData]);
  
  // Menyimpan opsi area ke localStorage setiap kali berubah
  useEffect(() => {
    if (areaOptions.length > 0) {
      localStorage.setItem('tableAreas', JSON.stringify(areaOptions));
    }
  }, [areaOptions]);

  // --- Handlers ---
  const handleDialog = (type: typeof dialogState.type, data: Table | null = null) => {
    setDialogState({ type, data });
  };

  const handleDelete = async (tableId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus meja ini?')) {
      try {
        await api.delete(apiConfig.endpoints.tableById(tableId));
        setNotification({ message: 'Meja berhasil dihapus.', type: 'success' });
        loadData();
      } catch (error) {
        setNotification({ message: 'Gagal menghapus meja.', type: 'error' });
      }
    }
  };

  // --- Logika Filter ---
  const filteredTables = tables.filter(table =>
    (filters.status === 'all' || table.status === filters.status) &&
    (filters.area === 'all' || table.area === filters.area) &&
    (table.table_number.toLowerCase().includes(filters.query.toLowerCase()) ||
     table.location_description?.toLowerCase().includes(filters.query.toLowerCase()))
  );
  
  // --- Render Functions ---
  const renderStatsCards = () => {
    if (!stats) return null;
    const statsCardsConfig = [
      { label: 'Total Meja', value: stats.total, icon: <TableIcon /> },
      { label: 'Tersedia', value: stats.available, icon: <AvailableIcon /> },
      { label: 'Terisi', value: stats.occupied, icon: <PeopleIcon /> },
      { label: 'Dipesan', value: stats.reserved, icon: <ScheduleIcon /> },
      { label: 'Area', value: stats.by_area.length, icon: <CategoryIcon /> },
    ];

    return (
      <Grid container spacing={2} mb={3}>
        {statsCardsConfig.map(stat => (
          <Grid item xs={12} sm={6} md={2.4} key={stat.label}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Tooltip title={stat.label}>{stat.icon}</Tooltip>
                  <Box>
                    <Typography variant="h5">{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  const renderTableCard = (table: Table) => {
    const status = statusConfig[table.status] || { label: 'Unknown', color: 'default', icon: <TableIcon /> };
    return (
      <Card key={table.table_id} sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Typography variant="h6">{table.table_number}</Typography>
            <Box>
              <Tooltip title="Edit Meja"><IconButton size="small" onClick={() => handleDialog('EDIT', table)}><EditIcon /></IconButton></Tooltip>
              <Tooltip title="Hapus Meja"><IconButton size="small" color="error" onClick={() => handleDelete(table.table_id)}><DeleteIcon /></IconButton></Tooltip>
            </Box>
          </Box>
          <Chip icon={status.icon} label={status.label} color={status.color as any} size="small" sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Kapasitas: {table.capacity}</Typography>
          <Typography variant="body2" color="text.secondary">Area: {areaOptions.find(a => a.value === table.area)?.label || table.area}</Typography>
          {table.notes && <Typography variant="caption" color="text.secondary">Catatan: {table.notes}</Typography>}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Button variant="outlined" size="small" onClick={() => handleDialog('STATUS', table)}>Update Status</Button>
            <Box>
              <Tooltip title="Lihat QR Code"><IconButton size="small" onClick={() => handleDialog('QR', table)}><QrCodeIcon /></IconButton></Tooltip>
              <Tooltip title="Lihat Riwayat"><IconButton size="small" onClick={() => handleDialog('HISTORY', table)}><HistoryIcon /></IconButton></Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  const renderTableList = () => (
    <TableContainer component={Paper}>
      <MuiTable>
        <TableHead>
          <TableRow>
            <TableCell>Nomor Meja</TableCell><TableCell>Status</TableCell><TableCell>Kapasitas</TableCell>
            <TableCell>Area</TableCell><TableCell>Info</TableCell><TableCell>Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTables.map(table => {
            const status = statusConfig[table.status] || { label: 'Unknown', color: 'default' };
            return (
              <TableRow key={table.table_id} hover>
                <TableCell><Typography variant="subtitle2">{table.table_number}</Typography></TableCell>
                <TableCell><Chip label={status.label} color={status.color as any} size="small" /></TableCell>
                <TableCell>{table.capacity}</TableCell>
                <TableCell>{areaOptions.find(a => a.value === table.area)?.label || table.area}</TableCell>
                <TableCell>{table.notes || '-'}</TableCell>
                <TableCell>
                  <Tooltip title="Update Status"><IconButton size="small" onClick={() => handleDialog('STATUS', table)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Lihat QR"><IconButton size="small" onClick={() => handleDialog('QR', table)}><QrCodeIcon /></IconButton></Tooltip>
                  <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => handleDelete(table.table_id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

  return (
    <Box p={3}>
      {notification && <Alert severity={notification.type} sx={{ mb: 2 }} onClose={() => setNotification(null)}>{notification.message}</Alert>}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Manajemen Meja</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<CategoryIcon />} onClick={() => handleDialog('AREA')}>Kelola Area</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleDialog('CREATE')}>Tambah Meja</Button>
        </Box>
      </Box>

      {renderStatsCards()}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Cari Meja" value={filters.query} onChange={(e) => setFilters(p => ({ ...p, query: e.target.value }))} /></Grid>
          <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select value={filters.status} label="Status" onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}><MenuItem value="all">Semua Status</MenuItem>{Object.entries(statusConfig).map(([key, { label }]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Area</InputLabel><Select value={filters.area} label="Area" onChange={(e) => setFilters(p => ({ ...p, area: e.target.value }))}><MenuItem value="all">Semua Area</MenuItem>{areaOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}</Select></FormControl></Grid>
        </Grid>
      </Paper>

      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} sx={{ mb: 3 }}>
        <Tab label="Tampilan Grid" />
        <Tab label="Tampilan Daftar" />
      </Tabs>

      {selectedTab === 0 ? <Grid container spacing={3}>{filteredTables.map(renderTableCard)}</Grid> : renderTableList()}

      {/* --- Dialogs --- */}
      {(dialogState.type === 'CREATE' || dialogState.type === 'EDIT') && (
        <TableFormDialog
          open={true}
          onClose={() => handleDialog(null)}
          onSave={loadData}
          setNotification={setNotification}
          table={dialogState.data}
          areaOptions={areaOptions}
        />
      )}
      {dialogState.type === 'STATUS' && dialogState.data && (
        <StatusUpdateDialog
          open={true}
          onClose={() => handleDialog(null)}
          onUpdate={loadData}
          setNotification={setNotification}
          table={dialogState.data}
        />
      )}
      {dialogState.type === 'AREA' && (
        <AreaManagementDialog
          open={true}
          onClose={() => handleDialog(null)}
          setNotification={setNotification}
          areaOptions={areaOptions}
          setAreaOptions={setAreaOptions}
          tables={tables}
        />
      )}
      <QRCodeDialog open={dialogState.type === 'QR'} onClose={() => handleDialog(null)} tableId={dialogState.data?.table_id || ''} tableNumber={dialogState.data?.table_number || ''} />
      <TableHistoryDialog open={dialogState.type === 'HISTORY'} onClose={() => handleDialog(null)} table={dialogState.data || null} />
    </Box>
  );
};

// --- Komponen Dialog Terpisah ---

// PERBAIKAN: Props diberi tipe yang jelas, tidak lagi 'any'
interface TableFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void;
  table?: Table | null;
  areaOptions: AreaOption[];
}

const TableFormDialog: React.FC<TableFormDialogProps> = ({ open, onClose, onSave, setNotification, table, areaOptions }) => {
  const [formData, setFormData] = useState({
    table_number: table?.table_number || '',
    capacity: table?.capacity || 2,
    area: table?.area || (areaOptions.length > 0 ? areaOptions[0].value : ''),
    location_description: table?.location_description || '',
    notes: table?.notes || '',
    is_active: table?.is_active ?? true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: name === 'capacity' ? parseInt(value) : value }));
  };
  
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (table) {
        await api.put(apiConfig.endpoints.tableById(table.table_id), formData);
        setNotification({ message: 'Meja berhasil diperbarui.', type: 'success' });
      } else {
        await api.post(apiConfig.endpoints.tables, formData);
        setNotification({ message: 'Meja baru berhasil ditambahkan.', type: 'success' });
      }
      onSave();
      onClose();
    } catch (error) {
      setNotification({ message: 'Gagal menyimpan meja.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{table ? 'Edit Meja' : 'Tambah Meja Baru'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}><TextField name="table_number" label="Nomor Meja" value={formData.table_number} onChange={handleChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}><TextField name="capacity" label="Kapasitas" type="number" value={formData.capacity} onChange={handleChange} fullWidth required inputProps={{ min: 1 }} /></Grid>
          <Grid item xs={12}><FormControl fullWidth><InputLabel>Area</InputLabel><Select name="area" label="Area" value={formData.area} onChange={handleChange}>{areaOptions.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12}><TextField name="location_description" label="Deskripsi Lokasi" value={formData.location_description} onChange={handleChange} fullWidth multiline rows={2} /></Grid>
          <Grid item xs={12}><TextField name="notes" label="Catatan" value={formData.notes} onChange={handleChange} fullWidth multiline rows={2} /></Grid>
          <Grid item xs={12}><FormControlLabel control={<Switch checked={formData.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} />} label="Meja Aktif" /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Batal</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={24} /> : (table ? 'Update' : 'Tambah')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface StatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void;
  table: Table;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({ open, onClose, onUpdate, setNotification, table }) => {
  const [statusData, setStatusData] = useState({ status: table.status, notes: table.notes || '' });
  const handleSubmit = async () => {
    try {
      await api.patch(apiConfig.endpoints.tableStatus(table.table_id), statusData);
      setNotification({ message: 'Status meja berhasil diperbarui.', type: 'success' });
      onUpdate();
      onClose();
    } catch (error) {
      setNotification({ message: 'Gagal memperbarui status.', type: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Update Status Meja {table.table_number}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}><FormControl fullWidth><InputLabel>Status</InputLabel><Select label="Status" value={statusData.status} onChange={(e) => setStatusData(p => ({ ...p, status: e.target.value }))}>{Object.entries(statusConfig).map(([key, { label }]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12}><TextField label="Catatan" value={statusData.notes} onChange={(e) => setStatusData(p => ({ ...p, notes: e.target.value }))} fullWidth multiline rows={3} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Batal</Button><Button onClick={handleSubmit} variant="contained">Update</Button></DialogActions>
    </Dialog>
  );
};

interface AreaManagementDialogProps {
  open: boolean;
  onClose: () => void;
  setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void;
  areaOptions: AreaOption[];
  setAreaOptions: React.Dispatch<React.SetStateAction<AreaOption[]>>;
  tables: Table[];
}

const AreaManagementDialog: React.FC<AreaManagementDialogProps> = ({ open, onClose, setNotification, areaOptions, setAreaOptions, tables }) => {
  const [newArea, setNewArea] = useState({ value: '', label: '' });

  const handleAddArea = () => {
    if (!newArea.value || !newArea.label) return setNotification({ message: 'Value dan Label area harus diisi.', type: 'error' });
    if (areaOptions.some((opt) => opt.value === newArea.value)) return setNotification({ message: 'Value area sudah ada.', type: 'error' });
    
    setAreaOptions([...areaOptions, newArea]);
    setNewArea({ value: '', label: '' });
    setNotification({ message: 'Area berhasil ditambahkan.', type: 'success' });
  };
  
  const handleDeleteArea = (value: string) => {
    if (tables.some((t) => t.area === value)) return setNotification({ message: 'Tidak bisa menghapus, area masih digunakan oleh meja.', type: 'error' });
    setAreaOptions(areaOptions.filter((opt) => opt.value !== value));
    setNotification({ message: 'Area berhasil dihapus.', type: 'success' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Kelola Area</DialogTitle>
      <DialogContent>
        <Box mb={2}><Typography variant="h6">Tambah Area Baru</Typography><Grid container spacing={1}><Grid item xs={5}><TextField label="Value" size="small" value={newArea.value} onChange={(e) => setNewArea(p => ({ ...p, value: e.target.value.toLowerCase().replace(/\s/g, '_') }))} fullWidth helperText="e.g., smoking_area" /></Grid><Grid item xs={5}><TextField label="Label" size="small" value={newArea.label} onChange={(e) => setNewArea(p => ({ ...p, label: e.target.value }))} fullWidth helperText="e.g., Smoking Area" /></Grid><Grid item xs={2}><Button variant="contained" onClick={handleAddArea} fullWidth><AddIcon /></Button></Grid></Grid></Box>
        <Typography variant="h6">Area yang Ada</Typography>
        {areaOptions.map((opt) => (
          <Paper key={opt.value} sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box><Typography fontWeight="bold">{opt.label}</Typography><Typography variant="caption">{opt.value}</Typography></Box>
            <Tooltip title={tables.some(t => t.area === opt.value) ? "Area sedang digunakan" : "Hapus Area"}>
              <span>
                <IconButton size="small" color="error" onClick={() => handleDeleteArea(opt.value)} disabled={tables.some(t => t.area === opt.value)}><DeleteIcon /></IconButton>
              </span>
            </Tooltip>
          </Paper>
        ))}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Tutup</Button></DialogActions>
    </Dialog>
  );
};

export default TablesPage;