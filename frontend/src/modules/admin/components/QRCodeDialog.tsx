import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { TableService, QRCodeData } from '../../../services/tableService';

interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  tableId: string;
  tableNumber: string;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  onClose,
  tableId,
  tableNumber
}) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tableId) {
      fetchQRCode();
    }
  }, [open, tableId]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TableService.getTableQRCode(tableId);
      setQrData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrData?.additional_data?.qr_image) return;

    const link = document.createElement('a');
    link.href = qrData.additional_data.qr_image;
    link.download = `table-${tableNumber}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!qrData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${tableNumber} QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              margin: 20px auto;
              padding: 20px;
              border: 2px solid #000;
              max-width: 400px;
            }
            .qr-code {
              margin: 20px 0;
            }
            h1 {
              margin-bottom: 10px;
            }
            .instructions {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Table ${tableNumber}</h1>
            <div class="qr-code">
              ${qrData.additional_data?.qr_image ? 
                `<img src="${qrData.additional_data.qr_image}" alt="QR Code" style="max-width: 200px; max-height: 200px;" />` : 
                '<div style="width: 200px; height: 200px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; margin: 0 auto;">QR Code</div>'
              }
            </div>
            <div class="instructions">
              <p>Scan this QR code with your smartphone to:</p>
              <ul style="list-style: none; padding: 0;">
                <li>• View our digital menu</li>
                <li>• Place your order directly</li>
                <li>• Call for service</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyLink = async () => {
    if (!qrData?.qr_code_value) return;

    try {
      await navigator.clipboard.writeText(qrData.qr_code_value);
      // You might want to show a success message here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatScanCount = (count: number): string => {
    if (count === 0) return 'Never scanned';
    if (count === 1) return '1 scan';
    return `${count} scans`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Table {tableNumber} - QR Code
          <IconButton onClick={fetchQRCode} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {qrData && !loading && (
          <Box>
            {/* QR Code Display */}
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Scan to Order
              </Typography>
              
              <Box 
                sx={{ 
                  width: 250, 
                  height: 250, 
                  mx: 'auto', 
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  backgroundColor: '#f9f9f9'
                }}
              >
                {qrData.additional_data?.qr_image ? (
                  <img 
                    src={qrData.additional_data.qr_image} 
                    alt="QR Code"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                      borderRadius: 4
                    }}
                  />
                ) : (
                  <Typography color="text.secondary">
                    QR Code Preview
                  </Typography>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary">
                Customers can scan this code to access the digital menu
              </Typography>
            </Paper>

            {/* QR Code Information */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Usage Statistics
                  </Typography>
                  <Typography variant="h6">
                    {formatScanCount(qrData.scan_count)}
                  </Typography>
                  {qrData.last_scanned_at && (
                    <Typography variant="body2" color="text.secondary">
                      Last: {new Date(qrData.last_scanned_at).toLocaleDateString()}
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="h6" color={qrData.is_active ? 'success.main' : 'error.main'}>
                    {qrData.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generated: {new Date(qrData.generated_at).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Instructions */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Customer Instructions:
              </Typography>
              <Typography variant="body2" component="div">
                <ol style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Scan the QR code with your smartphone camera</li>
                  <li>Open the menu link that appears</li>
                  <li>Browse menu items and add to cart</li>
                  <li>Place your order and specify this table number</li>
                  <li>Wait for your order to be served</li>
                </ol>
              </Typography>
            </Box>

            {/* QR Code Link */}
            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Direct Link:
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    wordBreak: 'break-all',
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem'
                  }}
                >
                  {qrData.qr_code_value}
                </Typography>
                <IconButton size="small" onClick={handleCopyLink}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {qrData && (
          <>
            <Button 
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              variant="outlined"
            >
              Print
            </Button>
            <Button 
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              variant="contained"
              disabled={!qrData.additional_data?.qr_image}
            >
              Download
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDialog;
