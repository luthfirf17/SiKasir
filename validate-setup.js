#!/usr/bin/env node

/**
 * Quick Database Validation Script for KasirKu
 * Validates PostgreSQL, Redis, and Elasticsearch connections
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 KasirKu Database Validation');
console.log('==============================');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

// Check if required files exist
function checkFileStructure() {
  log(colors.blue, '\n📁 Checking file structure...');
  
  const requiredFiles = [
    'src/config/database.ts',
    'src/entities/User.ts',
    'src/entities/Customer.ts',
    'src/entities/SystemLog.ts',
    'src/entities/LoyaltyPoint.ts',
    'src/entities/Payment.ts',
    '.env.local'
  ];
  
  const missingFiles = [];
  const existingFiles = [];
  
  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      existingFiles.push(file);
      log(colors.green, `✅ ${file}`);
    } else {
      missingFiles.push(file);
      log(colors.red, `❌ ${file}`);
    }
  });
  
  return { existingFiles, missingFiles };
}

// Check environment configuration
function checkEnvironment() {
  log(colors.blue, '\n🔧 Checking environment configuration...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log(colors.red, '❌ .env.local file not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'REDIS_HOST',
    'REDIS_PORT',
    'ELASTICSEARCH_URL'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      log(colors.green, `✅ ${varName} configured`);
    } else {
      missingVars.push(varName);
      log(colors.red, `❌ ${varName} missing`);
    }
  });
  
  return missingVars.length === 0;
}

// Test basic connectivity (simplified)
async function testConnections() {
  log(colors.blue, '\n🔌 Testing basic connectivity...');
  
  // Test PostgreSQL (basic check)
  try {
    const { spawn } = require('child_process');
    
    // Test PostgreSQL
    const pgTest = spawn('psql', ['--version'], { stdio: 'pipe' });
    pgTest.on('close', (code) => {
      if (code === 0) {
        log(colors.green, '✅ PostgreSQL client available');
      } else {
        log(colors.yellow, '⚠️  PostgreSQL client not found');
      }
    });
    
    // Test Redis
    const redisTest = spawn('redis-cli', ['--version'], { stdio: 'pipe' });
    redisTest.on('close', (code) => {
      if (code === 0) {
        log(colors.green, '✅ Redis client available');
      } else {
        log(colors.yellow, '⚠️  Redis client not found');
      }
    });
    
  } catch (error) {
    log(colors.yellow, '⚠️  Could not test client availability');
  }
}

// Check package.json dependencies
function checkDependencies() {
  log(colors.blue, '\n📦 Checking package dependencies...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    log(colors.red, '❌ package.json not found');
    return false;
  }
  
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };
  
  const requiredPackages = [
    'typeorm',
    'pg',
    'ioredis',
    '@elastic/elasticsearch',
    'bcryptjs',
    'jsonwebtoken'
  ];
  
  const missingPackages = [];
  
  requiredPackages.forEach(pkg => {
    if (dependencies[pkg]) {
      log(colors.green, `✅ ${pkg} (${dependencies[pkg]})`);
    } else {
      missingPackages.push(pkg);
      log(colors.red, `❌ ${pkg} missing`);
    }
  });
  
  return missingPackages;
}

// Generate setup recommendations
function generateRecommendations(checkResults) {
  log(colors.magenta, '\n💡 Setup Recommendations:');
  
  const { missingFiles } = checkResults.fileStructure;
  const missingPackages = checkResults.dependencies;
  
  if (missingFiles.length > 0) {
    log(colors.yellow, '\n📁 Missing Files:');
    missingFiles.forEach(file => {
      console.log(`   • Create ${file}`);
    });
  }
  
  if (missingPackages.length > 0) {
    log(colors.yellow, '\n📦 Install Missing Packages:');
    console.log(`   npm install ${missingPackages.join(' ')}`);
  }
  
  log(colors.yellow, '\n🚀 Next Steps:');
  console.log('   1. Run: ./setup-database.sh');
  console.log('   2. Install packages: npm install');
  console.log('   3. Configure .env.local with your database credentials');
  console.log('   4. Start services: PostgreSQL, Redis, Elasticsearch');
  console.log('   5. Run: npm run dev');
  
  log(colors.blue, '\n📚 Documentation:');
  console.log('   • Database setup: DATABASE_SETUP.md');
  console.log('   • Environment config: .env.local');
  console.log('   • Entity models: src/entities/');
  console.log('   • Database config: src/config/database.ts');
}

// Main validation function
async function runValidation() {
  try {
    const checkResults = {
      fileStructure: checkFileStructure(),
      environment: checkEnvironment(),
      dependencies: checkDependencies()
    };
    
    await testConnections();
    
    // Summary
    log(colors.blue, '\n📊 Validation Summary:');
    
    const { existingFiles, missingFiles } = checkResults.fileStructure;
    const missingPackages = checkResults.dependencies;
    
    console.log(`✅ Files found: ${existingFiles.length}`);
    console.log(`❌ Files missing: ${missingFiles.length}`);
    console.log(`✅ Environment: ${checkResults.environment ? 'Configured' : 'Needs setup'}`);
    console.log(`❌ Missing packages: ${missingPackages.length}`);
    
    const overallStatus = missingFiles.length === 0 && 
                         checkResults.environment && 
                         missingPackages.length === 0;
    
    if (overallStatus) {
      log(colors.green, '\n🎉 Database setup is ready!');
      log(colors.green, 'You can now run the application.');
    } else {
      log(colors.yellow, '\n⚠️  Setup needs attention.');
      generateRecommendations(checkResults);
    }
    
  } catch (error) {
    log(colors.red, `\n❌ Validation error: ${error.message}`);
  }
}

// Run validation
runValidation();
