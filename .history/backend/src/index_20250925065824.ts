import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { initializeDatabase, AppDataSource } from './config/database';
import { User, UserRole, UserStatus } from './models/User';
import routes from './routes';

console.log('🚀 STARTING EXPRESS APP...');

// Utility function to create default users
async function createDefaultUsers() {
  const userRepository = AppDataSource.getRepository(User);
  
  const defaultUsers = [
    {
      username: 'admin',
      email: 'admin@kasirku.com',
      password: 'admin123',
      fullName: 'Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: '081234567890',
      address: 'Jakarta, Indonesia'
    },
    {
      username: 'owner',
      email: 'owner@kasirku.com',
      password: 'owner123',
      fullName: 'Owner Manager',
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      phone: '081234567891',
      address: 'Jakarta, Indonesia'
    },
    // Commented out kasir user creation to avoid conflict
    /*
    {
      username: 'kasir',
      email: 'kasir@kasirku.com',
      password: 'kasir123',
      fullName: 'Kasir POS',
      role: UserRole.KASIR,
      status: UserStatus.ACTIVE,
      phone: '081234567892',
      address: 'Jakarta, Indonesia'
    },
    */
    {
      username: 'kitchen',
      email: 'kitchen@kasirku.com',
      password: 'kitchen123',
      fullName: 'Kitchen Staff',
      role: UserRole.KITCHEN,
      status: UserStatus.ACTIVE,
      phone: '081234567893',
      address: 'Jakarta, Indonesia'
    }
  ];

  for (const userData of defaultUsers) {
    try {
      const existingUser = await userRepository.findOne({
        where: { username: userData.username }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = userRepository.create({
          ...userData,
          password: hashedPassword,
          isActive: true
        });

        await userRepository.save(user);
        console.log(`✅ Created default user: ${userData.username}`);
      } else {
        console.log(`ℹ️  User ${userData.username} already exists, skipping...`);
      }
    } catch (error) {
      console.log(`⚠️  Error creating user ${userData.username}:`, error instanceof Error ? error.message : String(error));
    }
  }
}

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: true, // Allow all origins temporarily for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Logging middleware
app.use(morgan('combined'));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'KasirKu API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/v1', (req, res, next) => {
  console.log('🌐 API V1 REQUEST:', req.method, req.url);
  console.log('🌐 Request headers:', {
    'origin': req.headers.origin,
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']
  });
  next();
}, routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Create default users
    console.log('👥 Creating default users...');
    await createDefaultUsers();
    
    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Health check: http://localhost:${config.port}/health`);
      console.log('\n=== Available Login Credentials ===');
      console.log('Admin: username=admin, password=admin123');
      console.log('Owner: username=owner, password=owner123');
      console.log('Kasir: username=kasir, password=kasir123');
      console.log('Kitchen: username=kitchen, password=kitchen123');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;
