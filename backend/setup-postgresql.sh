#!/bin/bash

# PostgreSQL Setup Script untuk KasirKu

echo "🔧 Setting up PostgreSQL database for KasirKu..."

# Set database credentials
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="kasirku_db"
DB_USER="postgres"
DB_PASSWORD="1234"

echo "📋 Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

echo ""
echo "🔍 Checking PostgreSQL installation..."

# Check if PostgreSQL is running
if pgrep -x "postgres" > /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running"
    echo "💡 Please start PostgreSQL service first:"
    echo "   - Open PostgreSQL app from Applications"
    echo "   - Or start service manually"
    exit 1
fi

# Try to find psql binary
PSQL_PATH=""
if command -v psql &> /dev/null; then
    PSQL_PATH="psql"
elif [ -f "/usr/local/bin/psql" ]; then
    PSQL_PATH="/usr/local/bin/psql"
elif [ -f "/opt/homebrew/bin/psql" ]; then
    PSQL_PATH="/opt/homebrew/bin/psql"
else
    echo "❌ psql not found in PATH"
    echo "💡 Please add PostgreSQL bin directory to PATH or run:"
    echo "   export PATH=/Applications/PostgreSQL\\ 17/bin:\$PATH"
    exit 1
fi

echo "✅ Found psql at: $PSQL_PATH"

# Test connection
echo ""
echo "🔌 Testing connection to PostgreSQL..."
if $PSQL_PATH -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT version();" 2>/dev/null; then
    echo "✅ Successfully connected to PostgreSQL"
else
    echo "❌ Cannot connect to PostgreSQL"
    echo "💡 Please check:"
    echo "   1. PostgreSQL is running"
    echo "   2. Default password for 'postgres' user"
    echo "   3. Connection settings"
    exit 1
fi

# Create database
echo ""
echo "🗄️  Creating database '$DB_NAME'..."
if $PSQL_PATH -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null; then
    echo "✅ Database '$DB_NAME' created successfully"
else
    echo "ℹ️  Database '$DB_NAME' may already exist"
fi

# Test connection to new database
echo ""
echo "🔌 Testing connection to new database..."
if $PSQL_PATH -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT current_database();" 2>/dev/null; then
    echo "✅ Successfully connected to database '$DB_NAME'"
else
    echo "❌ Cannot connect to database '$DB_NAME'"
    exit 1
fi

echo ""
echo "🎉 PostgreSQL setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Make sure your .env file has the correct database settings"
echo "   2. Run 'npm run dev' to start the backend with PostgreSQL"
echo ""
echo "🔧 Database connection details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USER"
echo "   Password: $DB_PASSWORD"
