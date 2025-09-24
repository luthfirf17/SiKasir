import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from './config/database';
import { User, UserRole, UserStatus } from './models/User';

const app = express();
const PORT = 5001;

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'kasirku-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

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

      await userRepository.save(user); // Normal save
      console.log(`✅ Created default user: ${userData.username}`);
    }
  }
}

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Body:', { username, role });
    
    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    
    // Cari user berdasarkan username
    const user = await userRepository.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Cek status user
    if (user.status !== UserStatus.ACTIVE || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak aktif atau ditangguhkan'
      });
    }

    // Validasi role jika diberikan
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: 'Role tidak sesuai'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await userRepository.save(user);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
        refreshToken
      },
      message: `Login berhasil sebagai ${user.fullName}`
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout berhasil'
  });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'Connected' : 'Disconnected'
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Create default users
    console.log('👥 Creating default users...');
    await createDefaultUsers();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log('\n=== Available Login Credentials ===');
      console.log('Admin: username=admin, password=admin123');
      console.log('Owner: username=owner, password=owner123');
      console.log('Kasir: username=kasir, password=kasir123');
      console.log('Kitchen: username=kitchen, password=kitchen123');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
