// Update this in your main server file (src/server.ts or src/index.ts)

import { tableRoutes } from './routes/tableRoutes';

// Add this to your routes setup
app.use('/api/tables', tableRoutes);

// Example of complete route setup:
/*
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';

// Import routes
import { authRoutes } from './routes/authRoutes';
import { menuRoutes } from './routes/menuRoutes';
import { tableRoutes } from './routes/tableRoutes'; // New table routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/tables', tableRoutes); // Add table management routes

// Database connection
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
  });
*/
