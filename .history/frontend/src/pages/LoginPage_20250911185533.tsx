/**
 * LoginPage.tsx
 * 
 * Halaman login untuk sistem POS KasirKu yang berfungsi sebagai:
 * - Interface autentikasi pengguna dengan form login
 * - Validasi input menggunakan Formik dan Yup
 * - Integrasi dengan Redux untuk state management autentikasi
 * - Auto-redirect ke dashboard setelah login berhasil
 * - Error handling dan loading state
 * - Form dengan fitur "Remember Me" dan "Forgot Password"
 * - UI responsif dengan Material-UI dan gradient background
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { loginUser, clearError } from '../store/slices/authSlice';
import { LoginCredentials } from '../types/auth';

// ========== USER ROLES DEFINITION ==========
// Definisi role pengguna yang tersedia dalam sistem
interface UserRole {
  value: string;
  label: string;
  description: string;
}

const userRoles: UserRole[] = [
  { value: 'admin', label: 'Admin', description: 'Akses penuh ke semua fitur sistem' },
  { value: 'owner', label: 'Owner/Manajer', description: 'Manajemen restoran dan laporan' },
  { value: 'kasir', label: 'Kasir', description: 'Point of Sale dan transaksi' },
  { value: 'kitchen', label: 'Kitchen', description: 'Manajemen pesanan dan dapur' },
];

// ========== FORM VALIDATION SCHEMA ==========
// Schema validasi menggunakan Yup untuk memvalidasi input form termasuk role
const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
  role: yup.string().required('Please select your role'),
});

const LoginPage: React.FC = () => {
  // ========== REDUX HOOKS ==========
  // Dispatch untuk mengirim action ke Redux store
  const dispatch = useDispatch<AppDispatch>();
  // Navigate untuk routing setelah login berhasil
  const navigate = useNavigate();
  // Mengambil state autentikasi dari Redux store
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // ========== LIFECYCLE EFFECTS ==========
  // Effect untuk redirect ke dashboard jika sudah terautentikasi
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Effect untuk membersihkan error saat komponen unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // ========== FORM MANAGEMENT ==========
  // Konfigurasi Formik untuk mengelola form state dan validasi dengan role
  const formik = useFormik<LoginCredentials & { role: string }>({
    initialValues: {
      username: '',
      password: '',
      rememberMe: false,
      role: '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Kirim data login termasuk role yang dipilih
      dispatch(loginUser(values));
    },
  });

  // ========== MAIN RENDER ==========
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        {/* ========== LOGIN CARD CONTAINER ========== */}
        {/* Paper container dengan efek glassmorphism */}
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* ========== HEADER SECTION ========== */}
          {/* Judul dan deskripsi aplikasi */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              KasirKu Admin
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Modern Restaurant Point of Sale System
            </Typography>
          </Box>

          {/* ========== ERROR ALERT ========== */}
          {/* Menampilkan pesan error jika login gagal */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* ========== LOGIN FORM ========== */}
          {/* Form login dengan validasi */}
          <form onSubmit={formik.handleSubmit}>
            {/* ========== ROLE SELECTION ========== */}
            {/* Dropdown untuk memilih role pengguna */}
            <FormControl 
              fullWidth 
              margin="normal" 
              error={formik.touched.role && Boolean(formik.errors.role)}
            >
              <InputLabel id="role-select-label">Login sebagai</InputLabel>
              <Select
                labelId="role-select-label"
                id="role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Login sebagai"
              >
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {role.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {role.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.role && formik.errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {formik.errors.role}
                </Typography>
              )}
            </FormControl>

            {/* ========== USERNAME INPUT ========== */}
            {/* Input field untuk username dengan validasi */}
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              margin="normal"
              variant="outlined"
              autoComplete="username"
              autoFocus
            />

            {/* ========== PASSWORD INPUT ========== */}
            {/* Input field untuk password dengan validasi */}
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              margin="normal"
              variant="outlined"
              autoComplete="current-password"
            />

            {/* ========== REMEMBER ME CHECKBOX ========== */}
            {/* Checkbox untuk "Remember Me" functionality */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                  name="rememberMe"
                  color="primary"
                />
              }
              label="Remember me"
              sx={{ mt: 1, mb: 2 }}
            />

            {/* ========== SUBMIT BUTTON ========== */}
            {/* Tombol submit dengan loading state */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* ========== FORGOT PASSWORD LINK ========== */}
            {/* Link untuk reset password */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="#" variant="body2" color="primary">
                Forgot password?
              </Link>
            </Box>
          </form>

          {/* ========== DEMO CREDENTIALS SECTION ========== */}
          {/* Informasi kredensial demo untuk testing berdasarkan role */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Demo Credentials:
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                <strong>Admin:</strong> admin / admin123
              </Typography>
              <Typography variant="caption" color="textSecondary">
                <strong>Kasir:</strong> kasir1 / kasir123
              </Typography>
              <Typography variant="caption" color="textSecondary">
                <strong>Waiter:</strong> waiter1 / waiter123
              </Typography>
              <Typography variant="caption" color="textSecondary">
                <strong>Customer:</strong> customer1 / customer123
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
