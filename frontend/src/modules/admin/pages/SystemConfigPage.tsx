import React from 'react';
import { Box, Typography } from '@mui/material';

const SystemConfigPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        System Configuration
      </Typography>
      <Typography variant="body1" color="textSecondary">
        System configuration functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default SystemConfigPage;
