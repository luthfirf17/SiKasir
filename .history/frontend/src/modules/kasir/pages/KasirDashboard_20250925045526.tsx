/**
 * KasirDashboard.tsx
 * 
 * Dashboard utama untuk kasir yang berfungsi sebagai:
 * - Interface pembayaran untuk pesanan yang masuk
 * - Manajemen transaksi dan metode pembayaran (tunai, kartu, e-wallet, QRIS)
 * - Monitoring shift kerja dan rekonsiliasi kas
 * - Riwayat transaksi dan laporan penjualan harian
 * - Fitur split bill dan print receipt
 */

import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Chip,
  Paper
} from '@mui/material';
import {
  PointOfSale,
  Payment,
  Receipt,
  History
} from '@mui/icons-material';

const KasirDashboard: React.FC = () => {
  return (
    <Grid container spacing={3}>
        {/* POS Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<PointOfSale />}
                  sx={{ py: 2 }}
                >
                  New Transaction
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<Payment />}
                  sx={{ py: 2 }}
                >
                  Process Payment
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Receipt />}
                  sx={{ py: 2 }}
                >
                  Print Receipt
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<History />}
                  sx={{ py: 2 }}
                >
                  View History
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Current Shift Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Shift Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Shift Start:</Typography>
                <Chip label="08:00 AM" color="info" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Sales:</Typography>
                <Chip label="Rp 2,450,000" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Transactions:</Typography>
                <Chip label="47" color="primary" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Cash in Register:</Typography>
                <Chip label="Rp 1,250,000" color="warning" size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
  );
};

export default KasirDashboard;
