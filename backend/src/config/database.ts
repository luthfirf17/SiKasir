import { DataSource } from 'typeorm';
import { config } from './index';

// Import all entities
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import { Table } from '../models/Table';
import { Reservation } from '../models/Reservation';
import { QrCode } from '../models/QrCode';
import { Menu } from '../models/Menu';
import { MenuCategory } from '../models/MenuCategory';
import { Payment } from '../models/Payment';
import { Inventory } from '../models/Inventory';
import { MenuInventory } from '../models/MenuInventory';
import { Promotion } from '../models/Promotion';
import { OrderPromotion } from '../models/OrderPromotion';
import { Feedback } from '../models/Feedback';
import { LoyaltyPoint } from '../models/LoyaltyPoint';
import { SystemLog } from '../models/SystemLog';
import { Order } from '../models/Order';
import { OrderDetail } from '../models/OrderDetail';
import { TableUsageHistory } from '../models/TableUsageHistory';

// Create temporary InventoryLog entity reference
interface InventoryLogEntity {
  id: string;
  inventoryId: string;
  logType: string;
  quantityChange: number;
  createdAt: Date;
}

// Create temporary OrderNew entity reference  
interface OrderEntity {
  id: string;
  customerId?: string;
  status: string;
  finalAmount: number;
  createdAt: Date;
}

// Create temporary OrderDetail entity reference
interface OrderDetailEntity {
  id: string;
  orderId: string;
  menuId: string;
  quantity: number;
  createdAt: Date;
}

// Main application database (PostgreSQL)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  ssl: config.database.ssl,
  entities: [
    User,
    Customer,
    Table,
    Reservation,
    QrCode,
    Menu,
    MenuCategory,
    Payment,
    Inventory,
    MenuInventory,
    Promotion,
    OrderPromotion,
    Feedback,
    LoyaltyPoint,
    SystemLog,
    Order,
    OrderDetail,
    TableUsageHistory
  ],
  migrations: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod' || __dirname.includes('/dist'))
    ? ['dist/migrations/*.js']
    : ['src/migrations/*.ts'],
  synchronize: false, // Disabled to avoid constraint conflicts
  logging: config.nodeEnv === 'development',
  extra: {
    // PostgreSQL specific settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});

// Analytics database (TimescaleDB for time-series data)
export const AnalyticsDataSource = config.analyticsDatabase.enabled ? new DataSource({
  type: 'postgres',
  host: config.analyticsDatabase.host,
  port: config.analyticsDatabase.port,
  username: config.analyticsDatabase.username,
  password: config.analyticsDatabase.password,
  database: config.analyticsDatabase.database,
  ssl: config.analyticsDatabase.ssl,
  entities: [
    SystemLog,
    LoyaltyPoint,
    Payment
  ],
  migrations: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod' || __dirname.includes('/dist'))
    ? ['dist/migrations/analytics/*.js']
    : ['src/migrations/analytics/*.ts'],
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development',
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}) : null;

// Initialize databases
export const initializeDatabases = async () => {
  try {
    console.log('🔄 Connecting to databases...');
    
    // Initialize main database
    await AppDataSource.initialize();
    console.log('✅ Main database connected successfully');
    
    // Setup TimescaleDB extension and hypertables
    await setupTimescaleDB();
    
    // Initialize analytics database if enabled
    if (AnalyticsDataSource) {
      await AnalyticsDataSource.initialize();
      console.log('✅ Analytics database connected successfully');
      await setupAnalyticsHypertables();
    }
    
    console.log('✅ All databases initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Setup TimescaleDB extension and hypertables
const setupTimescaleDB = async () => {
  try {
    console.log('🔧 Setting up TimescaleDB...');
    
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Enable TimescaleDB extension (disabled for now)
    // await queryRunner.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;');
    
    console.log('⚠️  TimescaleDB extension skipped - not installed');
    
    // Create hypertables for time-series data
    const hypertables = [
      {
        table: 'system_logs',
        timeColumn: 'createdAt',
        chunkTimeInterval: '1 day'
      },
      {
        table: 'loyalty_points',
        timeColumn: 'createdAt',
        chunkTimeInterval: '1 week'
      },
      {
        table: 'payments',
        timeColumn: 'createdAt',
        chunkTimeInterval: '1 day'
      }
    ];
    
    // Skip hypertable creation since TimescaleDB is not installed
    console.log('⚠️  Hypertable creation skipped - TimescaleDB not available');
    
    /*
    for (const hypertable of hypertables) {
      try {
        // Check if hypertable already exists
        const result = await queryRunner.query(`
          SELECT * FROM timescaledb_information.hypertables 
          WHERE hypertable_name = $1
        `, [hypertable.table]);
        
        if (result.length === 0) {
          await queryRunner.query(`
            SELECT create_hypertable($1, $2, chunk_time_interval => INTERVAL $3)
          `, [hypertable.table, hypertable.timeColumn, hypertable.chunkTimeInterval]);
          
          console.log(`✅ Created hypertable: ${hypertable.table}`);
        } else {
          console.log(`📋 Hypertable already exists: ${hypertable.table}`);
        }
      } catch (error: any) {
        if (error.message.includes('already a hypertable')) {
          console.log(`📋 Table ${hypertable.table} is already a hypertable`);
        } else {
          console.error(`❌ Failed to create hypertable ${hypertable.table}:`, error.message);
        }
      }
    }
    
    // Create continuous aggregates for real-time analytics
    await setupContinuousAggregates(queryRunner);
    
    // Create indexes for better performance
    await setupTimescaleIndexes(queryRunner);
    */
    
    await queryRunner.release();
    console.log('✅ TimescaleDB setup skipped - not installed');
    
  } catch (error) {
    console.error('❌ TimescaleDB setup failed:', error);
    throw error;
  }
};

// Setup continuous aggregates for analytics
const setupContinuousAggregates = async (queryRunner: any) => {
  const aggregates = [
    {
      name: 'daily_system_errors',
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS daily_system_errors
        WITH (timescaledb.continuous) AS
        SELECT 
          time_bucket('1 day', "createdAt") AS day,
          category,
          level,
          COUNT(*) as error_count
        FROM system_logs
        WHERE level IN ('error', 'fatal')
        GROUP BY day, category, level
        WITH NO DATA;
      `
    },
    {
      name: 'monthly_loyalty_stats',
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_loyalty_stats
        WITH (timescaledb.continuous) AS
        SELECT 
          time_bucket('1 month', "createdAt") AS month,
          "customerId",
          SUM(points) as total_points,
          COUNT(*) as transaction_count
        FROM loyalty_points
        WHERE status = 'active'
        GROUP BY month, "customerId"
        WITH NO DATA;
      `
    }
  ];
  
  for (const aggregate of aggregates) {
    try {
      await queryRunner.query(aggregate.query);
      
      // Add refresh policy
      await queryRunner.query(`
        SELECT add_continuous_aggregate_policy('${aggregate.name}',
          start_offset => INTERVAL '3 days',
          end_offset => INTERVAL '1 hour',
          schedule_interval => INTERVAL '1 hour'
        );
      `);
      
      console.log(`✅ Created continuous aggregate: ${aggregate.name}`);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`📋 Continuous aggregate already exists: ${aggregate.name}`);
      } else {
        console.error(`❌ Failed to create continuous aggregate ${aggregate.name}:`, error.message);
      }
    }
  }
};

// Setup TimescaleDB-specific indexes
const setupTimescaleIndexes = async (queryRunner: any) => {
  const indexes = [
    // System logs indexes for better query performance
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_logs_level_time ON system_logs (level, "createdAt" DESC);',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_logs_category_time ON system_logs (category, "createdAt" DESC);',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_logs_user_time ON system_logs ("userId", "createdAt" DESC);',
    
    // Payment analytics indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_method_time ON payments ("paymentMethod", "createdAt" DESC);',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status_time ON payments (status, "createdAt" DESC);',
    
    // Loyalty points indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_points_customer_time ON loyalty_points ("customerId", "createdAt" DESC);',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_points_source_time ON loyalty_points (source, "createdAt" DESC);'
  ];
  
  for (const indexQuery of indexes) {
    try {
      await queryRunner.query(indexQuery);
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.error(`❌ Failed to create index:`, error.message);
      }
    }
  }
  
  console.log('✅ TimescaleDB indexes created');
};

// Setup analytics hypertables
const setupAnalyticsHypertables = async () => {
  if (!AnalyticsDataSource) return;
  
  try {
    console.log('🔧 Setting up Analytics TimescaleDB...');
    
    const queryRunner = AnalyticsDataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Enable TimescaleDB extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;');
    
    // Create analytics-specific hypertables with longer retention
    const analyticsHypertables = [
      {
        table: 'system_logs',
        timeColumn: 'createdAt',
        chunkTimeInterval: '1 week'
      },
      {
        table: 'loyalty_points',
        timeColumn: 'createdAt',
        chunkTimeInterval: '1 month'
      },
      {
        table: 'payments',
        timeColumn: 'createdAt',
        chunkTimeInterval: '1 week'
      }
    ];
    
    for (const hypertable of analyticsHypertables) {
      try {
        const result = await queryRunner.query(`
          SELECT * FROM timescaledb_information.hypertables 
          WHERE hypertable_name = $1
        `, [hypertable.table]);
        
        if (result.length === 0) {
          await queryRunner.query(`
            SELECT create_hypertable($1, $2, chunk_time_interval => INTERVAL $3)
          `, [hypertable.table, hypertable.timeColumn, hypertable.chunkTimeInterval]);
          
          console.log(`✅ Created analytics hypertable: ${hypertable.table}`);
        }
      } catch (error: any) {
        if (!error.message.includes('already a hypertable')) {
          console.error(`❌ Failed to create analytics hypertable ${hypertable.table}:`, error.message);
        }
      }
    }
    
    // Setup data retention policies
    await setupRetentionPolicies(queryRunner);
    
    await queryRunner.release();
    console.log('✅ Analytics TimescaleDB setup completed');
    
  } catch (error) {
    console.error('❌ Analytics TimescaleDB setup failed:', error);
    throw error;
  }
};

// Setup data retention policies
const setupRetentionPolicies = async (queryRunner: any) => {
  const retentionPolicies = [
    {
      table: 'system_logs',
      interval: '1 year'
    },
    {
      table: 'loyalty_points',
      interval: '5 years'
    },
    {
      table: 'payments',
      interval: '7 years'
    }
  ];
  
  for (const policy of retentionPolicies) {
    try {
      await queryRunner.query(`
        SELECT add_retention_policy($1, INTERVAL $2);
      `, [policy.table, policy.interval]);
      
      console.log(`✅ Added retention policy for ${policy.table}: ${policy.interval}`);
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.error(`❌ Failed to add retention policy for ${policy.table}:`, error.message);
      }
    }
  }
};

// Close database connections
export const closeDatabaseConnections = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Main database connection closed');
    }
    
    if (AnalyticsDataSource && AnalyticsDataSource.isInitialized) {
      await AnalyticsDataSource.destroy();
      console.log('✅ Analytics database connection closed');
    }
    
    console.log('✅ All database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

// Legacy compatibility
export const initializeDatabase = initializeDatabases;
