const path = require('path');
const { AppDataSource } = require(path.join(__dirname, 'dist/config/database'));
const { User } = require(path.join(__dirname, 'dist/models/User'));

class TestAuthController {
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async testLogin(loginField, password, role) {
    try {
      console.log(`🔍 [TestAuth] Searching for user with login field: ${loginField}`);

      // Find user by email or username - exact same query as AuthController
      const user = await this.userRepository.findOne({
        where: [
          { email: loginField },
          { username: loginField }
        ]
      });

      console.log(`🔍 [TestAuth] User found: ${user ? 'YES' : 'NO'}`);
      if (user) {
        console.log(`🔍 [TestAuth] Found user: ${user.username}, email: ${user.email}, role: ${user.role}, isActive: ${user.isActive}`);
        console.log(`🔍 [TestAuth] Password hash in DB: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
        console.log(`🔍 [TestAuth] Is demo user: ${this.isDemoUser(user.username, password)}`);
      }

      if (!user) {
        console.log(`❌ [TestAuth] User not found for login field: ${loginField}`);
        return { success: false, message: 'Invalid credentials' };
      }

      // Check if user is active
      if (!user.isActive) {
        console.log(`❌ [TestAuth] User is not active`);
        return { success: false, message: 'Account is deactivated' };
      }

      // For demo users, ensure password is correct
      if (this.isDemoUser(user.username, password)) {
        console.log(`🔧 [TestAuth] Auto-fixing password for demo user: ${user.username}`);
        // Note: Not actually updating DB in test
      }

      // Verify password
      console.log(`🔐 [TestAuth] Verifying password for user: ${user.username}`);
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log(`🔐 [TestAuth] Password verification result: ${isValidPassword}`);

      if (!isValidPassword) {
        console.log(`❌ [TestAuth] Password verification failed for user: ${user.username}`);
        return { success: false, message: 'Invalid credentials' };
      }

      // Check role if specified
      if (role && user.role !== role) {
        console.log(`❌ [TestAuth] Role mismatch: requested ${role}, user has ${user.role}`);
        return { success: false, message: 'Access denied for this role' };
      }

      console.log(`✅ [TestAuth] Login successful for user: ${user.username}`);
      return { success: true, message: 'Login successful', user: user.username };

    } catch (error) {
      console.error('🚨 [TestAuth] Login error:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  isDemoUser(username, password) {
    const demoCredentials = {
      'admin': 'admin123',
      'kasir1': 'kasir123',
      'waiter1': 'waiter123',
      'customer1': 'customer123',
      'nona': 'nona123'
    };

    return demoCredentials[username] === password;
  }
}

async function runAuthTests() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const authController = new TestAuthController();

    // Test cases
    const testCases = [
      { username: 'roni', password: 'roni123', role: 'kasir', description: 'New user roni' },
      { username: 'nona', password: 'nona123', role: 'kasir', description: 'Demo user nona' },
      { username: 'admin', password: 'admin123', role: 'admin', description: 'Demo user admin' },
      { username: 'roni', password: 'wrongpass', role: 'kasir', description: 'roni with wrong password' }
    ];

    for (const test of testCases) {
      console.log(`🧪 Testing: ${test.description}`);
      console.log(`   Input: username=${test.username}, password=***, role=${test.role}`);

      const result = await authController.testLogin(test.username, test.password, test.role);

      console.log(`   Result: ${result.success ? '✅' : '❌'} ${result.message}`);
      if (result.user) {
        console.log(`   User: ${result.user}`);
      }
      console.log('─'.repeat(60));
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

runAuthTests();