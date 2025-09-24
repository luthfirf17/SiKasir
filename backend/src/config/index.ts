import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'kasirku_user',
    password: process.env.DB_PASSWORD || 'kasirku_password',
    database: process.env.DB_DATABASE || 'kasirku_db',
    ssl: process.env.DB_SSL === 'true',
  },
  
  // TimescaleDB Configuration for Analytics
  analyticsDatabase: {
    enabled: process.env.TIMESCALEDB_ENABLED === 'true',
    host: process.env.ANALYTICS_DB_HOST || 'localhost',
    port: parseInt(process.env.ANALYTICS_DB_PORT || '5432', 10),
    username: process.env.ANALYTICS_DB_USERNAME || 'kasirku_analytics',
    password: process.env.ANALYTICS_DB_PASSWORD || 'kasirku_analytics_password',
    database: process.env.ANALYTICS_DB_DATABASE || 'kasirku_analytics_db',
    ssl: process.env.DB_SSL === 'true',
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  
  // Elasticsearch Configuration
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
    apiKey: process.env.ELASTICSEARCH_API_KEY || '',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: {
      email: process.env.FROM_EMAIL || 'noreply@kasirku.com',
      name: process.env.FROM_NAME || 'KasirKu',
    },
  },
  
  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  // App Configuration
  app: {
    name: process.env.APP_NAME || 'KasirKu',
    url: process.env.APP_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
  },
  
  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};
