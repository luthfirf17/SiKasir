const { AppDataSource } = require('./backend/src/config/database');
const { User, UserRole, UserStatus } = require('./backend/src/models/User');
const bcrypt = require('bcryptjs');

async function testDatabaseUserCreation() {
  console.log('🗄️  Testing Direct Database User Creation...\n');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);
    const testUsername = 'dbtest_' + Date.now();
    const testPassword = 'dbtest123';

    console.log('👤 Creating test user:', testUsername);
    console.log('🔑 Password:', testPassword);

    // Create user directly in database
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log('🔒 Hashed password (12 rounds):', hashedPassword.substring(0, 20) + '...');

    const newUser = userRepository.create({
      username: testUsername,
      email: `${testUsername}@test.com`,
      password: hashedPassword,
      fullName: 'Database Test User',
      role: UserRole.KASIR,
      status: UserStatus.ACTIVE,
      isActive: true,
      phone: '081234567890'
    });

    const savedUser = await userRepository.save(newUser);
    console.log('✅ User created with ID:', savedUser.id);

    // Test password verification directly
    console.log('\n🔐 Testing direct password verification...');
    const isValid = await bcrypt.compare(testPassword, savedUser.password);
    console.log('✅ Direct bcrypt verification:', isValid);

    // Test wrong password
    const isWrongValid = await bcrypt.compare('wrongpass', savedUser.password);
    console.log('❌ Wrong password verification:', isWrongValid);

    // Test finding user by username
    console.log('\n🔍 Testing user lookup...');
    const foundUser = await userRepository.findOne({
      where: { username: testUsername }
    });

    if (foundUser) {
      console.log('✅ User found by username');
      console.log('👤 User details:', {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        isActive: foundUser.isActive
      });

      // Test password verification on found user
      const foundUserValid = await bcrypt.compare(testPassword, foundUser.password);
      console.log('✅ Password verification on found user:', foundUserValid);

    } else {
      console.log('❌ User not found');
    }

    // Clean up - delete test user
    console.log('\n🧹 Cleaning up test user...');
    await userRepository.delete(savedUser.id);
    console.log('✅ Test user deleted');

  } catch (error) {
    console.error('🚨 Database test error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await AppDataSource.destroy();
  }
}

// Test the isDemoUser logic
function testDemoUserLogic() {
  console.log('\n🎭 Testing Demo User Logic...\n');

  const demoCredentials = {
    'admin': 'admin123',
    'kasir1': 'kasir123',
    'waiter1': 'waiter123',
    'customer1': 'customer123',
    'nona': 'nona123'
  };

  const testCases = [
    { username: 'nona', password: 'nona123', expected: true },
    { username: 'admin', password: 'admin123', expected: true },
    { username: 'nona', password: 'wrongpass', expected: false },
    { username: 'regularuser', password: 'anypass', expected: false },
    { username: 'kasir1', password: 'kasir123', expected: true },
  ];

  testCases.forEach((test, index) => {
    const isDemo = demoCredentials[test.username] === test.password;
    const result = isDemo === test.expected ? '✅' : '❌';
    console.log(`${result} Test ${index + 1}: ${test.username}:${test.password} -> ${isDemo} (expected: ${test.expected})`);
  });
}

async function runAllTests() {
  testDemoUserLogic();
  await testDatabaseUserCreation();
}

runAllTests();