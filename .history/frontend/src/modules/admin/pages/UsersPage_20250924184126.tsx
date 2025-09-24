/*
  UsersPage.tsx

  Deskripsi singkat:
  - Komponen halaman administrasi untuk mengelola pengguna (Users Management).
  - Menggunakan Material UI untuk layout dan komponen antarmuka.
  - Menyediakan daftar pengguna dari database, filter, pagination, dan dialog untuk
    menambah / mengedit pengguna.
  - Menggunakan API backend untuk semua operasi CRUD pengguna.
*/

import React, { useState, useEffect } from 'react';
// Import komponen Material UI dan ikon yang digunakan
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
// Ikon yang digunakan di UI (tombol dan aksi)
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  PhotoCamera,
  CloudUpload,
} from '@mui/icons-material';
// Form handling dan validasi
import { useFormik } from 'formik';
import * as yup from 'yup';
// Tipe-tipe data yang digunakan pada halaman user
import { userService, User as ApiUser, CreateUserData, UpdateUserData } from '../../../services/userService';
import { UserRole, UserStatus } from '../../../types/auth';

// Skema validasi untuk form tambah/edit user (menggunakan Yup)
const getValidationSchema = (isEditing: boolean) => yup.object({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  fullName: yup.string().required('Full name is required'),
  password: isEditing ? yup.string() : yup.string().required('Password is required'),
  role: yup.string().required('Role is required'),
  phone: yup.string(),
  address: yup.string(),
});

// Struktur data yang digunakan oleh form tambah / edit user
interface UserFormData extends CreateUserData {
  id?: string;
}

// Komponen utama halaman Users Management
const UsersPage: React.FC = () => {
  // State: daftar pengguna yang ditampilkan dari database
  const [users, setUsers] = useState<ApiUser[]>([]);
  // State: pengaturan pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  // State: filter dan pencarian
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  // State: kontrol dialog tambah/edit
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  // State: loading saat menyimpan data (disable tombol sementara)
  const [loading, setLoading] = useState(false);
  // State: image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // State: loading untuk fetch data
  const [loadingUsers, setLoadingUsers] = useState(false);
  // State: newly created password to show to admin
  const [newlyCreatedPassword, setNewlyCreatedPassword] = useState<string>('');

  // Load users from API
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userService.getUsers({
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        search: searchTerm,
        role: selectedRole,
        status: selectedStatus,
      });

      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setTotalUsers(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Efek inisialisasi: muat data dari API saat komponen dipasang
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, searchTerm, selectedRole, selectedStatus]);

  // Formik: konfigurasi form untuk membuat atau mengedit user
  const formik = useFormik<UserFormData>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: UserRole.KASIR,
      status: UserStatus.ACTIVE,
      phone: '',
      address: '',
      avatar: '',
      isActive: true,
    },
    validationSchema: getValidationSchema(!!editingUser),
    onSubmit: (values) => {
      handleSaveUser(values);
    },
  });

  // Handler: simpan user baru atau perbarui user yang ada
  const handleSaveUser = async (values: UserFormData) => {
    setLoading(true);
    try {
      // Handle image upload (simulasi - dalam implementasi nyata, upload ke server)
      let avatarUrl = values.avatar;
      if (selectedImage) {
        // Dalam implementasi nyata, upload file ke server dan dapatkan URL
        // Untuk sekarang, gunakan data URL sebagai simulasi
        avatarUrl = imagePreview;
      }

      const userData = { ...values, avatar: avatarUrl };

      if (editingUser) {
        // Update user via API - don't send password when editing
        const { password, ...updateData } = userData;
        const response = await userService.updateUser(editingUser.id, updateData as UpdateUserData);
        if (response.success) {
          // Clear newly created password display when editing
          setNewlyCreatedPassword('');
          // Reload users to get updated data
          await loadUsers();
        }
      } else {
        // Create new user via API
        const response = await userService.createUser(userData as CreateUserData);
        if (response.success) {
          // Store the newly created password to show to admin
          setNewlyCreatedPassword(values.password);
          // Reload users to include the new user
          await loadUsers();
        }
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler: buka dialog edit dan isi nilai form dengan data user yang dipilih
  const handleEditUser = (user: ApiUser) => {
    setEditingUser(user);
    formik.setValues({
      id: user.id,
      username: user.username,
      email: user.email,
      password: '', // Password is not populated when editing
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar || '',
      isActive: user.isActive,
    });
    setImagePreview(user.avatar || '');
    setSelectedImage(null);
    setOpenDialog(true);
  };

  // Handler: handle image file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler: remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    formik.setFieldValue('avatar', '');
  };

  // Handler: hapus user dari daftar
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userService.deleteUser(userId);
        if (response.success) {
          // Reload users to reflect the deletion
          await loadUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Tutup dialog dan reset form
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setSelectedImage(null);
    setImagePreview('');
    formik.resetForm();
  };

  // Filter daftar pengguna berdasarkan search term, role, dan status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === '' || user.role === selectedRole;
    const matchesStatus = selectedStatus === '' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Utility: peta warna untuk peran pengguna (digunakan pada Chip)
  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.OWNER:
        return 'secondary';
      case UserRole.KASIR:
        return 'primary';
      case UserRole.WAITER:
        return 'info';
      case UserRole.KITCHEN:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Utility: peta warna untuk status pengguna (digunakan pada Chip)
  const getStatusColor = (status: string) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'success';
      case UserStatus.INACTIVE:
        return 'default';
      case UserStatus.SUSPENDED:
        return 'error';
      case UserStatus.PENDING:
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header: Judul halaman dan tombol tambah user */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add User
        </Button>
      </Box>

      {/* Statistics Cards: ringkasan singkat jumlah pengguna */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{users.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4">
                {users.filter(u => u.status === UserStatus.ACTIVE).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Admins
              </Typography>
              <Typography variant="h4">
                {users.filter(u => u.role === UserRole.ADMIN).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Staff
              </Typography>
              <Typography variant="h4">
                {users.filter(u => u.role !== UserRole.ADMIN && u.role !== UserRole.CUSTOMER).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters: pencarian, filter berdasarkan role dan status */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as string)}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                {Object.values(UserRole).map(role => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as string)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.values(UserStatus).map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table: daftar pengguna yang difilter dan aksi (view, edit, delete) */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatar} sx={{ mr: 2 }}>
                          {user.fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.fullName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => {}}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditUser(user)}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* User Dialog: form untuk menambah atau mengedit user */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="username"
                  label="Username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="fullName"
                  label="Full Name"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  margin="normal"
                />
              </Grid>

              {/* Password field - only show when creating new user */}
              {!editingUser && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    margin="normal"
                    required={!editingUser}
                  />
                </Grid>
              )}

              {/* Image Upload Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
                  Profile Picture
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={imagePreview}
                    sx={{ width: 80, height: 80 }}
                  >
                    {formik.values.fullName.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="user-avatar-upload"
                      type="file"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="user-avatar-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCamera />}
                        sx={{ mr: 1 }}
                      >
                        Upload Photo
                      </Button>
                    </label>
                    {imagePreview && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleRemoveImage}
                        size="small"
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    label="Role"
                  >
                    {Object.values(UserRole).map(role => (
                      <MenuItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    label="Status"
                  >
                    {Object.values(UserStatus).map(status => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isActive}
                      onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                      name="isActive"
                    />
                  }
                  label="Active"
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={3}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
