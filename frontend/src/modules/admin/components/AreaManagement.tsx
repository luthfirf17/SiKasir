import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  TableRestaurant as TableIcon
} from '@mui/icons-material';
import { Table, TableArea } from '../../../services/tableService';

interface AreaManagementProps {
  tables: Table[];
  onAreaCreate: (area: AreaData) => void;
  onAreaUpdate: (areaId: string, area: AreaData) => void;
  onAreaDelete: (areaId: string) => void;
}

interface AreaData {
  id?: string;
  name: string;
  type: TableArea;
  description: string;
  capacity_limit?: number;
  is_smoking_allowed: boolean;
  special_features: string[];
}

interface AreaStats {
  area: TableArea;
  total_tables: number;
  available_tables: number;
  occupied_tables: number;
  reserved_tables: number;
  total_capacity: number;
  utilization_rate: number;
}

const AreaManagement: React.FC<AreaManagementProps> = ({
  tables,
  onAreaCreate,
  onAreaUpdate,
  onAreaDelete
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaData | null>(null);
  const [formData, setFormData] = useState<AreaData>({
    name: '',
    type: TableArea.INDOOR,
    description: '',
    capacity_limit: undefined,
    is_smoking_allowed: false,
    special_features: []
  });

  const predefinedAreas: AreaData[] = [
    {
      id: 'indoor',
      name: 'Indoor Dining',
      type: TableArea.INDOOR,
      description: 'Main indoor dining area with air conditioning',
      is_smoking_allowed: false,
      special_features: ['Air Conditioning', 'Background Music', 'WiFi']
    },
    {
      id: 'outdoor',
      name: 'Outdoor Terrace',
      type: TableArea.OUTDOOR,
      description: 'Beautiful outdoor terrace with garden view',
      is_smoking_allowed: true,
      special_features: ['Garden View', 'Natural Light', 'Pet Friendly']
    },
    {
      id: 'vip',
      name: 'VIP Section',
      type: TableArea.VIP,
      description: 'Exclusive VIP area with premium service',
      capacity_limit: 20,
      is_smoking_allowed: false,
      special_features: ['Premium Service', 'Private Space', 'Wine Selection']
    },
    {
      id: 'smoking',
      name: 'Smoking Area',
      type: TableArea.SMOKING,
      description: 'Designated smoking area with proper ventilation',
      is_smoking_allowed: true,
      special_features: ['Ventilation System', 'Ashtrays', 'Outdoor Access']
    },
    {
      id: 'non_smoking',
      name: 'Non-Smoking Zone',
      type: TableArea.NON_SMOKING,
      description: 'Smoke-free zone for family dining',
      is_smoking_allowed: false,
      special_features: ['Family Friendly', 'High Chairs Available', 'Kids Menu']
    },
    {
      id: 'second_floor',
      name: 'Second Floor',
      type: TableArea.SECOND_FLOOR,
      description: 'Upper level dining with city view',
      is_smoking_allowed: false,
      special_features: ['City View', 'Quiet Ambiance', 'Meeting Rooms']
    },
    {
      id: 'terrace',
      name: 'Rooftop Terrace',
      type: TableArea.TERRACE,
      description: 'Rooftop dining with panoramic views',
      is_smoking_allowed: true,
      special_features: ['Panoramic View', 'Stars View', 'Romantic Setting']
    }
  ];

  const calculateAreaStats = (area: TableArea): AreaStats => {
    const areaTables = tables.filter(table => table.area === area);
    const availableTables = areaTables.filter(table => table.status === 'available').length;
    const occupiedTables = areaTables.filter(table => table.status === 'occupied').length;
    const reservedTables = areaTables.filter(table => table.status === 'reserved').length;
    const totalCapacity = areaTables.reduce((sum, table) => sum + table.capacity, 0);
    const utilization = areaTables.length > 0 ? ((occupiedTables + reservedTables) / areaTables.length) * 100 : 0;

    return {
      area,
      total_tables: areaTables.length,
      available_tables: availableTables,
      occupied_tables: occupiedTables,
      reserved_tables: reservedTables,
      total_capacity: totalCapacity,
      utilization_rate: Math.round(utilization)
    };
  };

  const getAreaDisplayName = (area: TableArea): string => {
    const areaInfo = predefinedAreas.find(a => a.type === area);
    return areaInfo?.name || area.replace('_', ' ').toUpperCase();
  };

  const handleOpenDialog = (area?: AreaData) => {
    if (area) {
      setEditingArea(area);
      setFormData(area);
    } else {
      setEditingArea(null);
      setFormData({
        name: '',
        type: TableArea.INDOOR,
        description: '',
        capacity_limit: undefined,
        is_smoking_allowed: false,
        special_features: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingArea(null);
  };

  const handleSave = () => {
    if (editingArea) {
      onAreaUpdate(editingArea.id!, formData);
    } else {
      onAreaCreate(formData);
    }
    handleCloseDialog();
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      special_features: prev.special_features.includes(feature)
        ? prev.special_features.filter(f => f !== feature)
        : [...prev.special_features, feature]
    }));
  };

  const availableFeatures = [
    'Air Conditioning', 'Background Music', 'WiFi', 'Garden View', 
    'Natural Light', 'Pet Friendly', 'Premium Service', 'Private Space',
    'Wine Selection', 'Ventilation System', 'Ashtrays', 'Outdoor Access',
    'Family Friendly', 'High Chairs Available', 'Kids Menu', 'City View',
    'Quiet Ambiance', 'Meeting Rooms', 'Panoramic View', 'Stars View',
    'Romantic Setting', 'Live Music', 'Dance Floor', 'Bar Service'
  ];

  const uniqueAreas = Array.from(new Set(tables.map(table => table.area)));
  const areaStats = uniqueAreas.map(area => calculateAreaStats(area as TableArea));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Area Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Area
        </Button>
      </Box>

      {/* Area Overview Cards */}
      <Grid container spacing={3} mb={4}>
        {areaStats.map((stats) => {
          const areaInfo = predefinedAreas.find(a => a.type === stats.area);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={stats.area}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {getAreaDisplayName(stats.area)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {areaInfo?.description || 'No description available'}
                  </Typography>

                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <TableIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {stats.total_tables} Tables
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <PeopleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {stats.total_capacity} Capacity
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip 
                      label={`${stats.available_tables} Available`}
                      color="success"
                      size="small"
                    />
                    <Chip 
                      label={`${stats.occupied_tables} Occupied`}
                      color="error"
                      size="small"
                    />
                    {stats.reserved_tables > 0 && (
                      <Chip 
                        label={`${stats.reserved_tables} Reserved`}
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Utilization: {stats.utilization_rate}%
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(areaInfo)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => areaInfo?.id && onAreaDelete(areaInfo.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Special Features */}
                  {areaInfo?.special_features && areaInfo.special_features.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Features:
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {areaInfo.special_features.slice(0, 3).map((feature) => (
                          <Chip 
                            key={feature}
                            label={feature}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {areaInfo.special_features.length > 3 && (
                          <Chip 
                            label={`+${areaInfo.special_features.length - 3} more`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Smoking/Non-smoking indicator */}
                  <Box mt={1}>
                    <Chip
                      label={areaInfo?.is_smoking_allowed ? 'Smoking Allowed' : 'No Smoking'}
                      size="small"
                      color={areaInfo?.is_smoking_allowed ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Area Configuration List */}
      <Paper>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Area Configurations
          </Typography>
          
          <List>
            {predefinedAreas.map((area, index) => (
              <React.Fragment key={area.id}>
                <ListItem>
                  <ListItemText
                    primary={area.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {area.description}
                        </Typography>
                        {area.capacity_limit && (
                          <Typography variant="caption" color="primary">
                            Capacity Limit: {area.capacity_limit} guests
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={area.is_smoking_allowed ? 'Smoking' : 'No Smoking'}
                        size="small"
                        color={area.is_smoking_allowed ? 'warning' : 'success'}
                        variant="outlined"
                      />
                      <IconButton 
                        edge="end" 
                        onClick={() => handleOpenDialog(area)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < predefinedAreas.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Paper>

      {/* Add/Edit Area Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingArea ? 'Edit Area' : 'Add New Area'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Area Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Area Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TableArea }))}
                  label="Area Type"
                >
                  {Object.values(TableArea).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Capacity Limit (Optional)"
                type="number"
                value={formData.capacity_limit || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  capacity_limit: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Smoking Policy</InputLabel>
                <Select
                  value={formData.is_smoking_allowed ? "true" : "false"}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_smoking_allowed: e.target.value === "true" }))}
                  label="Smoking Policy"
                >
                  <MenuItem value="false">No Smoking</MenuItem>
                  <MenuItem value="true">Smoking Allowed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Special Features
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {availableFeatures.map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    onClick={() => handleFeatureToggle(feature)}
                    color={formData.special_features.includes(feature) ? 'primary' : 'default'}
                    clickable
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
          
          {formData.special_features.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Selected features will be displayed to customers and can help them choose the right dining area.
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || !formData.description}
          >
            {editingArea ? 'Update' : 'Create'} Area
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AreaManagement;
