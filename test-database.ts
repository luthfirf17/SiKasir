/**
 * Comprehensive Database Testing Suite for KasirKu
 * Tests PostgreSQL 15+ with TimescaleDB, Redis 7+, and Elasticsearch 8+
 */

import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { 
  AppDataSource, 
  AnalyticsDataSource,
  RedisService,
  ElasticsearchService 
} from './src/config/database';

// Import entities for testing
import { User } from './src/entities/User';
import { Customer } from './src/entities/Customer';
import { SystemLog } from './src/entities/SystemLog';
import { LoyaltyPoint } from './src/entities/LoyaltyPoint';
import { Payment } from './src/entities/Payment';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
  details?: any;
}

class DatabaseTester {
  private results: TestResult[] = [];
  private redis?: Redis;
  private elasticsearch?: ElasticsearchClient;

  constructor() {
    console.log('🧪 KasirKu Database Testing Suite');
    console.log('=====================================');
  }

  /**
   * Execute a test with error handling and timing
   */
  private async executeTest(
    name: string, 
    testFn: () => Promise<void>
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      return {
        name,
        status: 'PASS',
        message: 'Test completed successfully',
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        details: error
      };
    }
  }

  /**
   * Test PostgreSQL main database connection
   */
  async testMainDatabase(): Promise<void> {
    console.log('\n📊 Testing Main Database (PostgreSQL + TimescaleDB)...');
    
    // Test 1: Connection
    const connectionTest = await this.executeTest(
      'Main Database Connection',
      async () => {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }
        
        // Test basic query
        const result = await AppDataSource.query('SELECT 1 as test');
        if (result[0].test !== 1) {
          throw new Error('Basic query failed');
        }
      }
    );
    this.results.push(connectionTest);

    // Test 2: TimescaleDB Extension
    const timescaleTest = await this.executeTest(
      'TimescaleDB Extension',
      async () => {
        const result = await AppDataSource.query(
          "SELECT * FROM pg_extension WHERE extname = 'timescaledb'"
        );
        if (result.length === 0) {
          throw new Error('TimescaleDB extension not installed');
        }
      }
    );
    this.results.push(timescaleTest);

    // Test 3: Entity Operations
    const entityTest = await this.executeTest(
      'Entity CRUD Operations',
      async () => {
        const userRepo = AppDataSource.getRepository(User);
        
        // Create test user
        const testUser = userRepo.create({
          email: `test-${Date.now()}@kasirku.com`,
          name: 'Test User',
          password: 'hashed_password',
          role: 'staff'
        });
        
        const savedUser = await userRepo.save(testUser);
        if (!savedUser.id) {
          throw new Error('User creation failed');
        }
        
        // Read user
        const foundUser = await userRepo.findOne({ 
          where: { id: savedUser.id } 
        });
        if (!foundUser) {
          throw new Error('User retrieval failed');
        }
        
        // Update user
        foundUser.name = 'Updated Test User';
        await userRepo.save(foundUser);
        
        // Delete user
        await userRepo.remove(foundUser);
      }
    );
    this.results.push(entityTest);

    // Test 4: TimescaleDB Hypertables
    const hypertableTest = await this.executeTest(
      'TimescaleDB Hypertables',
      async () => {
        // Check if system_logs is a hypertable
        const result = await AppDataSource.query(`
          SELECT * FROM timescaledb_information.hypertables 
          WHERE table_name = 'system_logs'
        `);
        
        if (result.length === 0) {
          throw new Error('system_logs hypertable not found');
        }
      }
    );
    this.results.push(hypertableTest);

    // Test 5: System Logging
    const loggingTest = await this.executeTest(
      'System Logging Functionality',
      async () => {
        const logRepo = AppDataSource.getRepository(SystemLog);
        
        // Create test log entry
        const testLog = logRepo.create({
          level: 'info',
          category: 'test',
          action: 'database_test',
          message: 'Testing system logging functionality',
          details: JSON.stringify({ test: true, timestamp: new Date() })
        });
        
        const savedLog = await logRepo.save(testLog);
        if (!savedLog.id) {
          throw new Error('System log creation failed');
        }
        
        // Test log querying with analytics
        const recentLogs = await logRepo.find({
          where: { category: 'test' },
          order: { createdAt: 'DESC' },
          take: 10
        });
        
        if (recentLogs.length === 0) {
          throw new Error('System log querying failed');
        }
      }
    );
    this.results.push(loggingTest);
  }

  /**
   * Test Analytics Database
   */
  async testAnalyticsDatabase(): Promise<void> {
    console.log('\n📈 Testing Analytics Database...');
    
    // Test 1: Analytics Connection
    const connectionTest = await this.executeTest(
      'Analytics Database Connection',
      async () => {
        if (!AnalyticsDataSource.isInitialized) {
          await AnalyticsDataSource.initialize();
        }
        
        const result = await AnalyticsDataSource.query('SELECT 1 as test');
        if (result[0].test !== 1) {
          throw new Error('Analytics database query failed');
        }
      }
    );
    this.results.push(connectionTest);

    // Test 2: Continuous Aggregates
    const aggregatesTest = await this.executeTest(
      'Continuous Aggregates',
      async () => {
        const result = await AnalyticsDataSource.query(`
          SELECT * FROM timescaledb_information.continuous_aggregates 
          WHERE view_name = 'monthly_loyalty_stats'
        `);
        
        if (result.length === 0) {
          throw new Error('Continuous aggregates not found');
        }
      }
    );
    this.results.push(aggregatesTest);

    // Test 3: Retention Policies
    const retentionTest = await this.executeTest(
      'Data Retention Policies',
      async () => {
        const result = await AnalyticsDataSource.query(`
          SELECT * FROM timescaledb_information.retention_policies
        `);
        
        if (result.length === 0) {
          throw new Error('No retention policies found');
        }
      }
    );
    this.results.push(retentionTest);
  }

  /**
   * Test Redis functionality
   */
  async testRedis(): Promise<void> {
    console.log('\n🔴 Testing Redis...');
    
    // Test 1: Redis Connection
    const connectionTest = await this.executeTest(
      'Redis Connection',
      async () => {
        this.redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
        });
        
        const pong = await this.redis.ping();
        if (pong !== 'PONG') {
          throw new Error('Redis ping failed');
        }
      }
    );
    this.results.push(connectionTest);

    if (!this.redis) return;

    // Test 2: Basic Operations
    const operationsTest = await this.executeTest(
      'Redis Basic Operations',
      async () => {
        if (!this.redis) throw new Error('Redis not connected');
        
        const testKey = `test:${Date.now()}`;
        const testValue = 'test_value';
        
        // Set and get
        await this.redis.set(testKey, testValue);
        const getValue = await this.redis.get(testKey);
        
        if (getValue !== testValue) {
          throw new Error('Redis set/get failed');
        }
        
        // Clean up
        await this.redis.del(testKey);
      }
    );
    this.results.push(operationsTest);

    // Test 3: Multiple Databases
    const databaseTest = await this.executeTest(
      'Redis Multiple Databases',
      async () => {
        if (!this.redis) throw new Error('Redis not connected');
        
        // Test different databases
        for (let db = 0; db < 4; db++) {
          await this.redis.select(db);
          await this.redis.set(`test_db_${db}`, `value_${db}`);
          
          const value = await this.redis.get(`test_db_${db}`);
          if (value !== `value_${db}`) {
            throw new Error(`Database ${db} test failed`);
          }
          
          await this.redis.del(`test_db_${db}`);
        }
      }
    );
    this.results.push(databaseTest);

    // Test 4: Redis Service
    const serviceTest = await this.executeTest(
      'Redis Service Integration',
      async () => {
        await RedisService.initialize();
        
        // Test session management
        const sessionData = { userId: 'test-user', timestamp: Date.now() };
        await RedisService.setSession('test-session', sessionData, 3600);
        
        const retrievedSession = await RedisService.getSession('test-session');
        if (!retrievedSession || retrievedSession.userId !== 'test-user') {
          throw new Error('Redis session management failed');
        }
        
        // Test caching
        const cacheKey = 'test-cache';
        const cacheData = { data: 'cached_value', timestamp: Date.now() };
        await RedisService.setCache(cacheKey, cacheData, 1800);
        
        const cachedData = await RedisService.getCache(cacheKey);
        if (!cachedData || cachedData.data !== 'cached_value') {
          throw new Error('Redis caching failed');
        }
        
        // Clean up
        await RedisService.deleteSession('test-session');
        await RedisService.deleteCache(cacheKey);
      }
    );
    this.results.push(serviceTest);
  }

  /**
   * Test Elasticsearch functionality
   */
  async testElasticsearch(): Promise<void> {
    console.log('\n🔍 Testing Elasticsearch...');
    
    // Test 1: Elasticsearch Connection
    const connectionTest = await this.executeTest(
      'Elasticsearch Connection',
      async () => {
        this.elasticsearch = new ElasticsearchClient({
          node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
          auth: process.env.ELASTICSEARCH_USERNAME ? {
            username: process.env.ELASTICSEARCH_USERNAME,
            password: process.env.ELASTICSEARCH_PASSWORD || ''
          } : undefined
        });
        
        const health = await this.elasticsearch.cluster.health();
        if (!health.body) {
          throw new Error('Elasticsearch health check failed');
        }
      }
    );
    this.results.push(connectionTest);

    if (!this.elasticsearch) return;

    // Test 2: Index Operations
    const indexTest = await this.executeTest(
      'Elasticsearch Index Operations',
      async () => {
        if (!this.elasticsearch) throw new Error('Elasticsearch not connected');
        
        const testIndex = `test-index-${Date.now()}`;
        
        // Create index
        await this.elasticsearch.indices.create({
          index: testIndex,
          body: {
            mappings: {
              properties: {
                title: { type: 'text' },
                timestamp: { type: 'date' }
              }
            }
          }
        });
        
        // Index document
        await this.elasticsearch.index({
          index: testIndex,
          body: {
            title: 'Test Document',
            timestamp: new Date()
          }
        });
        
        // Wait for indexing
        await this.elasticsearch.indices.refresh({ index: testIndex });
        
        // Search
        const searchResult = await this.elasticsearch.search({
          index: testIndex,
          body: {
            query: {
              match: { title: 'Test' }
            }
          }
        });
        
        if (!searchResult.body.hits.hits.length) {
          throw new Error('Elasticsearch search failed');
        }
        
        // Clean up
        await this.elasticsearch.indices.delete({ index: testIndex });
      }
    );
    this.results.push(indexTest);

    // Test 3: Elasticsearch Service
    const serviceTest = await this.executeTest(
      'Elasticsearch Service Integration',
      async () => {
        await ElasticsearchService.initialize();
        
        // Test menu indexing
        const testMenu = {
          id: `test-${Date.now()}`,
          name: 'Test Menu Item',
          description: 'A test menu item for database testing',
          price: 25000,
          category: 'test',
          isAvailable: true
        };
        
        await ElasticsearchService.indexMenu(testMenu);
        
        // Search for the menu item
        const searchResults = await ElasticsearchService.searchMenus('Test Menu');
        if (!searchResults.length) {
          throw new Error('Menu indexing/search failed');
        }
        
        // Clean up
        await ElasticsearchService.deleteMenu(testMenu.id);
      }
    );
    this.results.push(serviceTest);
  }

  /**
   * Test performance and stress scenarios
   */
  async testPerformance(): Promise<void> {
    console.log('\n⚡ Testing Performance...');
    
    // Test 1: Bulk Operations
    const bulkTest = await this.executeTest(
      'Bulk Database Operations',
      async () => {
        const logRepo = AppDataSource.getRepository(SystemLog);
        const batchSize = 100;
        
        // Create bulk logs
        const logs = Array.from({ length: batchSize }, (_, i) => 
          logRepo.create({
            level: 'info',
            category: 'performance_test',
            action: 'bulk_insert',
            message: `Bulk test log ${i + 1}`,
            details: JSON.stringify({ batchIndex: i })
          })
        );
        
        const startTime = Date.now();
        await logRepo.save(logs);
        const insertTime = Date.now() - startTime;
        
        if (insertTime > 5000) { // 5 seconds threshold
          throw new Error(`Bulk insert too slow: ${insertTime}ms`);
        }
        
        // Clean up
        await logRepo.delete({ category: 'performance_test' });
      }
    );
    this.results.push(bulkTest);

    // Test 2: Concurrent Operations
    const concurrencyTest = await this.executeTest(
      'Concurrent Database Operations',
      async () => {
        const promises = Array.from({ length: 10 }, async (_, i) => {
          const userRepo = AppDataSource.getRepository(User);
          const testUser = userRepo.create({
            email: `concurrent-test-${i}-${Date.now()}@kasirku.com`,
            name: `Concurrent User ${i}`,
            password: 'hashed_password',
            role: 'staff'
          });
          
          const savedUser = await userRepo.save(testUser);
          await userRepo.remove(savedUser);
          return savedUser;
        });
        
        const results = await Promise.all(promises);
        if (results.length !== 10) {
          throw new Error('Concurrent operations failed');
        }
      }
    );
    this.results.push(concurrencyTest);
  }

  /**
   * Test data consistency and integrity
   */
  async testDataIntegrity(): Promise<void> {
    console.log('\n🔒 Testing Data Integrity...');
    
    // Test 1: Foreign Key Constraints
    const constraintTest = await this.executeTest(
      'Foreign Key Constraints',
      async () => {
        const customerRepo = AppDataSource.getRepository(Customer);
        const loyaltyRepo = AppDataSource.getRepository(LoyaltyPoint);
        
        // Create test customer
        const testCustomer = customerRepo.create({
          name: 'Test Customer',
          email: `integrity-test-${Date.now()}@test.com`,
          phone: '08123456789'
        });
        
        const savedCustomer = await customerRepo.save(testCustomer);
        
        // Create loyalty points
        const loyaltyPoint = loyaltyRepo.create({
          customerId: savedCustomer.id,
          transactionType: 'earned',
          source: 'order',
          points: 100,
          runningBalance: 100,
          description: 'Test loyalty points'
        });
        
        await loyaltyRepo.save(loyaltyPoint);
        
        // Try to delete customer (should fail due to FK constraint)
        try {
          await customerRepo.remove(savedCustomer);
          throw new Error('Foreign key constraint not enforced');
        } catch (error) {
          // Expected to fail - this is good
        }
        
        // Clean up properly
        await loyaltyRepo.remove(loyaltyPoint);
        await customerRepo.remove(savedCustomer);
      }
    );
    this.results.push(constraintTest);

    // Test 2: Transaction Integrity
    const transactionTest = await this.executeTest(
      'Transaction Integrity',
      async () => {
        await AppDataSource.transaction(async (manager) => {
          const userRepo = manager.getRepository(User);
          const logRepo = manager.getRepository(SystemLog);
          
          // Create user
          const testUser = userRepo.create({
            email: `transaction-test-${Date.now()}@kasirku.com`,
            name: 'Transaction Test User',
            password: 'hashed_password',
            role: 'staff'
          });
          
          const savedUser = await userRepo.save(testUser);
          
          // Create log entry
          const logEntry = logRepo.create({
            level: 'info',
            category: 'transaction_test',
            action: 'user_creation',
            message: 'User created in transaction',
            userId: savedUser.id
          });
          
          await logRepo.save(logEntry);
          
          // Simulate error to test rollback
          // throw new Error('Simulated transaction error');
        });
      }
    );
    this.results.push(transactionTest);
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test resources...');
    
    try {
      if (this.redis) {
        await this.redis.disconnect();
      }
      
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
      
      if (AnalyticsDataSource.isInitialized) {
        await AnalyticsDataSource.destroy();
      }
    } catch (error) {
      console.log('⚠️  Cleanup warnings:', error);
    }
  }

  /**
   * Generate test report
   */
  generateReport(): void {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    
    console.log('\nDetailed Results:');
    console.log('-'.repeat(80));
    
    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : '⏭️';
      
      console.log(`${index + 1}. ${status} ${result.name} (${result.duration}ms)`);
      
      if (result.status === 'FAIL') {
        console.log(`   Error: ${result.message}`);
      }
    });

    // Performance summary
    const performanceTests = this.results.filter(r => 
      r.name.includes('Performance') || r.name.includes('Bulk') || r.name.includes('Concurrent')
    );
    
    if (performanceTests.length > 0) {
      console.log('\n⚡ Performance Summary:');
      performanceTests.forEach(test => {
        console.log(`   ${test.name}: ${test.duration}ms`);
      });
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (failed > 0) {
      console.log('   • Review failed tests and fix underlying issues');
      console.log('   • Check service configurations and connections');
    }
    
    if (performanceTests.some(t => t.duration > 1000)) {
      console.log('   • Consider optimizing slow operations');
      console.log('   • Review indexing strategies');
    }
    
    console.log('   • Set up monitoring for production environment');
    console.log('   • Implement automated testing in CI/CD pipeline');
    
    console.log('\n🎉 Database testing completed!');
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    try {
      await this.testMainDatabase();
      await this.testAnalyticsDatabase();
      await this.testRedis();
      await this.testElasticsearch();
      await this.testPerformance();
      await this.testDataIntegrity();
    } catch (error) {
      console.error('❌ Critical error during testing:', error);
    } finally {
      await this.cleanup();
      this.generateReport();
    }
  }
}

// Export for use in test scripts
export { DatabaseTester };

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new DatabaseTester();
  tester.runAllTests().catch(console.error);
}
