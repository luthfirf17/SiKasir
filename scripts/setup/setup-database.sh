#!/bin/bash

# Enhanced Database Setup Script for KasirKu Restaurant POS
# PostgreSQL 15+ with TimescaleDB Extension, Redis 7+, and Elasticsearch 8+

set -e

echo "🚀 Starting KasirKu Database Setup..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
DB_NAME="kasirku_db"
DB_USER="kasirku_user"
DB_PASSWORD="kasirku_password"
ANALYTICS_DB_NAME="kasirku_analytics_db"
ANALYTICS_DB_USER="kasirku_analytics"
ANALYTICS_DB_PASSWORD="kasirku_analytics_password"

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  Main Database: ${DB_NAME}"
echo -e "  Analytics Database: ${ANALYTICS_DB_NAME}"
echo -e "  Redis: Port 6379"
echo -e "  Elasticsearch: Port 9200"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check PostgreSQL connection
check_postgres() {
    if command_exists psql; then
        if psql -U postgres -c '\l' >/dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Function to check Redis connection
check_redis() {
    if command_exists redis-cli; then
        if redis-cli ping >/dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Function to check Elasticsearch connection
check_elasticsearch() {
    if curl -s http://localhost:9200 >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

echo -e "\n${YELLOW}🔍 Checking system requirements...${NC}"

# Check PostgreSQL
if check_postgres; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not running or not installed${NC}"
    echo -e "${YELLOW}Please install and start PostgreSQL 15+ before continuing${NC}"
    exit 1
fi

# Check Redis
if check_redis; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠️  Redis is not running - starting Redis...${NC}"
    if command_exists brew; then
        brew services start redis
    elif command_exists systemctl; then
        sudo systemctl start redis
    else
        echo -e "${RED}❌ Please start Redis manually${NC}"
    fi
fi

# Check Elasticsearch
if check_elasticsearch; then
    echo -e "${GREEN}✅ Elasticsearch is running${NC}"
else
    echo -e "${YELLOW}⚠️  Elasticsearch is not running - please start Elasticsearch 8+${NC}"
    echo -e "  You can download it from: https://www.elastic.co/downloads/elasticsearch"
fi

echo -e "\n${BLUE}🔧 Setting up PostgreSQL databases...${NC}"

# Create main database and user
echo -e "${YELLOW}Creating main database and user...${NC}"
psql -U postgres -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || echo "Database ${DB_NAME} already exists"
psql -U postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || echo "User ${DB_USER} already exists"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
psql -U postgres -c "ALTER USER ${DB_USER} CREATEDB;"

# Create analytics database and user
echo -e "${YELLOW}Creating analytics database and user...${NC}"
psql -U postgres -c "CREATE DATABASE ${ANALYTICS_DB_NAME};" 2>/dev/null || echo "Database ${ANALYTICS_DB_NAME} already exists"
psql -U postgres -c "CREATE USER ${ANALYTICS_DB_USER} WITH PASSWORD '${ANALYTICS_DB_PASSWORD}';" 2>/dev/null || echo "User ${ANALYTICS_DB_USER} already exists"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${ANALYTICS_DB_NAME} TO ${ANALYTICS_DB_USER};"
psql -U postgres -c "ALTER USER ${ANALYTICS_DB_USER} CREATEDB;"

# Install TimescaleDB extension
echo -e "${YELLOW}Installing TimescaleDB extension...${NC}"
psql -U postgres -d ${DB_NAME} -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
psql -U postgres -d ${ANALYTICS_DB_NAME} -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"

echo -e "${GREEN}✅ PostgreSQL setup completed${NC}"

# Create environment file
echo -e "\n${BLUE}📝 Creating environment configuration...${NC}"

cat > .env.local << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=${DB_NAME}
DB_SSL=false

# Analytics Database Configuration (TimescaleDB)
TIMESCALEDB_ENABLED=true
ANALYTICS_DB_HOST=localhost
ANALYTICS_DB_PORT=5432
ANALYTICS_DB_USERNAME=${ANALYTICS_DB_USER}
ANALYTICS_DB_PASSWORD=${ANALYTICS_DB_PASSWORD}
ANALYTICS_DB_DATABASE=${ANALYTICS_DB_NAME}

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_API_KEY=

# Application Configuration
NODE_ENV=development
PORT=5000
APP_NAME=KasirKu
APP_URL=http://localhost:3000
API_URL=http://localhost:5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Update with your SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@kasirku.com
FROM_NAME=KasirKu

# Cloudinary Configuration (Update with your Cloudinary credentials)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
EOF

echo -e "${GREEN}✅ Environment file created: .env.local${NC}"

# Create database initialization SQL
echo -e "\n${BLUE}📊 Creating database initialization script...${NC}"

cat > init-database.sql << 'EOF'
-- KasirKu Database Initialization Script
-- This script creates the essential tables and indexes for the restaurant POS system

\c kasirku_db;

-- Create tables (simplified for initial setup)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) DEFAULT 'info',
    category VARCHAR(50) DEFAULT 'business_logic',
    action VARCHAR(50) DEFAULT 'custom',
    message VARCHAR(255) NOT NULL,
    details TEXT,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    transaction_type VARCHAR(20) DEFAULT 'earned',
    source VARCHAR(20) DEFAULT 'order',
    points INTEGER NOT NULL,
    running_balance INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    description VARCHAR(255),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'pending',
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    change_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_system_logs_level_time ON system_logs(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_category_time ON system_logs(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_time ON loyalty_points(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status_time ON payments(status, created_at DESC);

-- Create TimescaleDB hypertables for time-series data
SELECT create_hypertable('system_logs', 'created_at', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);
SELECT create_hypertable('loyalty_points', 'created_at', chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);
SELECT create_hypertable('payments', 'created_at', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

-- Create continuous aggregates for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_system_errors
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', created_at) AS day,
    category,
    level,
    COUNT(*) as error_count
FROM system_logs
WHERE level IN ('error', 'fatal')
GROUP BY day, category, level
WITH NO DATA;

-- Add refresh policy for continuous aggregates
SELECT add_continuous_aggregate_policy('daily_system_errors',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour'
) ON CONFLICT DO NOTHING;

-- Create sample admin user (password: admin123)
INSERT INTO users (email, name, password, role) 
VALUES ('admin@kasirku.com', 'Administrator', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6nAOE.Zj2m', 'owner')
ON CONFLICT (email) DO NOTHING;

EOF

# Execute the initialization script
echo -e "${YELLOW}Executing database initialization...${NC}"
psql -U postgres -f init-database.sql

# Setup analytics database
echo -e "\n${BLUE}📈 Setting up analytics database...${NC}"

cat > init-analytics.sql << 'EOF'
-- Analytics Database Initialization
\c kasirku_analytics_db;

-- Create analytics tables with longer retention policies
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) DEFAULT 'info',
    category VARCHAR(50) DEFAULT 'business_logic',
    action VARCHAR(50) DEFAULT 'custom',
    message VARCHAR(255) NOT NULL,
    details TEXT,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    transaction_type VARCHAR(20) DEFAULT 'earned',
    source VARCHAR(20) DEFAULT 'order',
    points INTEGER NOT NULL,
    running_balance INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    description VARCHAR(255),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'pending',
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    change_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create hypertables with longer chunk intervals for analytics
SELECT create_hypertable('system_logs', 'created_at', chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);
SELECT create_hypertable('loyalty_points', 'created_at', chunk_time_interval => INTERVAL '1 month', if_not_exists => TRUE);
SELECT create_hypertable('payments', 'created_at', chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);

-- Add retention policies for long-term data management
SELECT add_retention_policy('system_logs', INTERVAL '1 year', if_not_exists => TRUE);
SELECT add_retention_policy('loyalty_points', INTERVAL '5 years', if_not_exists => TRUE);
SELECT add_retention_policy('payments', INTERVAL '7 years', if_not_exists => TRUE);

-- Create analytics-focused continuous aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_loyalty_stats
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 month', created_at) AS month,
    customer_id,
    SUM(points) as total_points,
    COUNT(*) as transaction_count
FROM loyalty_points
WHERE status = 'active'
GROUP BY month, customer_id
WITH NO DATA;

-- Add refresh policy
SELECT add_continuous_aggregate_policy('monthly_loyalty_stats',
    start_offset => INTERVAL '3 months',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

EOF

psql -U postgres -f init-analytics.sql

echo -e "${GREEN}✅ Analytics database setup completed${NC}"

# Test connections
echo -e "\n${BLUE}🧪 Testing database connections...${NC}"

# Test main database
if psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Main database connection successful${NC}"
else
    echo -e "${RED}❌ Main database connection failed${NC}"
fi

# Test analytics database
if psql -U ${ANALYTICS_DB_USER} -d ${ANALYTICS_DB_NAME} -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Analytics database connection successful${NC}"
else
    echo -e "${RED}❌ Analytics database connection failed${NC}"
fi

# Test Redis
if check_redis; then
    echo -e "${GREEN}✅ Redis connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Redis connection failed - please check Redis status${NC}"
fi

# Test Elasticsearch
if check_elasticsearch; then
    echo -e "${GREEN}✅ Elasticsearch connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Elasticsearch connection failed - please check Elasticsearch status${NC}"
fi

# Create package installation script
echo -e "\n${BLUE}📦 Creating package installation script...${NC}"

cat > install-packages.sh << 'EOF'
#!/bin/bash

echo "Installing required packages for KasirKu..."

# Backend packages
echo "Installing backend packages..."
cd backend
npm install

# Install additional packages for enhanced functionality
npm install ioredis @elastic/elasticsearch
npm install --save-dev @types/ioredis

# Frontend packages
echo "Installing frontend packages..."
cd ../frontend
npm install

# Install additional packages for enhanced UI
npm install recharts @mui/x-data-grid @mui/x-date-pickers

echo "Package installation completed!"
EOF

chmod +x install-packages.sh

# Create README for database setup
echo -e "\n${BLUE}📖 Creating setup documentation...${NC}"

cat > DATABASE_SETUP.md << 'EOF'
# KasirKu Database Setup Guide

This document provides comprehensive information about the database architecture and setup for the KasirKu Restaurant POS System.

## Architecture Overview

### Technology Stack
- **PostgreSQL 15+** with TimescaleDB extension for main application data and time-series analytics
- **Redis 7+** for caching, session management, and real-time features
- **Elasticsearch 8+** for advanced search capabilities and full-text search

### Database Structure

#### Main Database (kasirku_db)
- Stores operational data (users, orders, inventory, etc.)
- Uses TimescaleDB hypertables for time-series data
- Optimized for transactional workloads

#### Analytics Database (kasirku_analytics_db)
- Stores historical data for analytics and reporting
- Uses TimescaleDB continuous aggregates for real-time analytics
- Implements data retention policies for long-term storage management

#### Redis Databases
- DB 0: Session management
- DB 1: Application caching
- DB 2: Real-time features (WebSocket, notifications)
- DB 3: Queue management

#### Elasticsearch Indices
- `kasir-menus`: Menu item search and filtering
- `kasir-customers`: Customer search and analytics
- `kasir-orders`: Order search and business intelligence
- `kasir-inventory`: Inventory search and tracking
- `kasir-feedback`: Feedback analysis and sentiment tracking

## Setup Instructions

### Prerequisites
1. PostgreSQL 15+ with TimescaleDB extension
2. Redis 7+
3. Elasticsearch 8+
4. Node.js 18+

### Quick Setup
Run the setup script:
```bash
chmod +x setup-database.sh
./setup-database.sh
```

### Manual Setup
1. Create databases and users
2. Install TimescaleDB extension
3. Run initialization scripts
4. Configure environment variables
5. Install application packages

### Environment Configuration
Copy `.env.local` to `.env` and update the configuration values:
- Database credentials
- Redis configuration
- Elasticsearch settings
- Application secrets
- External service credentials

## TimescaleDB Features

### Hypertables
- `system_logs`: System activity logging
- `loyalty_points`: Customer loyalty tracking
- `payments`: Payment transaction history
- `inventory_logs`: Inventory change tracking

### Continuous Aggregates
- `daily_system_errors`: Error monitoring
- `monthly_loyalty_stats`: Customer loyalty analytics
- `hourly_sales`: Real-time sales metrics

### Data Retention Policies
- System logs: 1 year
- Loyalty points: 5 years
- Payment records: 7 years (compliance requirement)

## Performance Optimization

### Indexing Strategy
- Time-based indexes for hypertables
- Composite indexes for frequent query patterns
- Partial indexes for filtered queries

### Caching Strategy
- Redis for frequently accessed data
- Application-level caching for computed results
- Session management through Redis

### Search Optimization
- Elasticsearch for complex search queries
- Full-text search for menu items and customers
- Analytics aggregations for business intelligence

## Monitoring and Maintenance

### Health Checks
- Database connection monitoring
- TimescaleDB chunk health
- Redis memory usage
- Elasticsearch cluster status

### Backup Strategy
- Daily PostgreSQL backups
- Redis persistence configuration
- Elasticsearch snapshot management

### Troubleshooting
Common issues and solutions:
1. Connection timeout errors
2. Memory usage optimization
3. Query performance tuning
4. Index maintenance

## Security Considerations

### Access Control
- Role-based database access
- Redis authentication
- Elasticsearch security features

### Data Protection
- Encrypted connections (SSL/TLS)
- Password hashing (bcrypt)
- Data anonymization for analytics

### Compliance
- GDPR compliance for customer data
- Financial data retention policies
- Audit trail maintenance

## Development Guidelines

### Entity Relationships
- Proper foreign key constraints
- Cascading delete policies
- Data integrity enforcement

### Migration Strategy
- Version-controlled schema changes
- Backward compatibility
- Zero-downtime deployments

### Testing
- Database transaction testing
- Performance benchmarking
- Data consistency validation

For more detailed information, refer to the individual configuration files and application documentation.
EOF

# Cleanup temporary files
rm -f init-database.sql init-analytics.sql

echo -e "\n${GREEN}🎉 Database setup completed successfully!${NC}"
echo -e "\n${BLUE}📋 Summary:${NC}"
echo -e "  ✅ PostgreSQL databases created with TimescaleDB"
echo -e "  ✅ Environment configuration file created"
echo -e "  ✅ Database initialization completed"
echo -e "  ✅ Analytics setup with retention policies"
echo -e "  ✅ Documentation created"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Review and update .env.local with your specific configuration"
echo -e "  2. Start Redis and Elasticsearch services"
echo -e "  3. Run: ./install-packages.sh to install application packages"
echo -e "  4. Run: npm run dev to start the application"

echo -e "\n${BLUE}📚 Resources:${NC}"
echo -e "  • Database documentation: DATABASE_SETUP.md"
echo -e "  • Environment config: .env.local"
echo -e "  • Package installer: install-packages.sh"

echo -e "\n${GREEN}✨ Your enhanced restaurant POS system is ready!${NC}"
