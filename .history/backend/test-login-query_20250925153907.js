const path = require('path');
const { AppDataSource } = require(path.join(__dirname, 'dist/config/database'));
const { User } = require(path.join(__dirname, 'dist/models/User'));

async function testLoginQuery() {
  try {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    console.log('🔍 Testing login query logic...\n');

    // Test different login scenarios
    const testCases = [
      { input: 'roni', description: 'username roni' },
      { input: 'roni@gmail.com', description: 'email roni@gmail.com' },
      { input: 'nona', description: 'username nona' },
      { input: 'nona@gmail.com', description: 'email nona@gmail.com' },
      { input: 'admin', description: 'username admin' },
      { input: 'admin@kasirku.com', description: 'email admin@kasirku.com' }
    ];

    for (const test of testCases) {
      console.log(`🧪 Testing: ${test.description} (${test.input})`);

      // Simulate AuthController logic
      const loginField = test.input;

      // Test the exact query used in AuthController
      const user = await userRepo.findOne({
        where: [
          { email: loginField },
          { username: loginField }
        ]
      });

      console.log(`   Result: ${user ? '✅ FOUND' : '❌ NOT FOUND'}`);
      if (user) {
        console.log(`   User: ${user.username} (${user.email}) - Role: ${user.role}`);
      }
      console.log('');
    }

    // Test individual queries
    console.log('🔍 Testing individual queries:');
    const roniByUsername = await userRepo.findOne({ where: { username: 'roni' } });
    const roniByEmail = await userRepo.findOne({ where: { email: 'roni@gmail.com' } });

    console.log(`roni by username: ${roniByUsername ? '✅ FOUND' : '❌ NOT FOUND'}`);
    console.log(`roni by email: ${roniByEmail ? '✅ FOUND' : '❌ NOT FOUND'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

testLoginQuery();