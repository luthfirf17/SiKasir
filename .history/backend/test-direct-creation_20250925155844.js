const bcrypt = require('bcryptjs');
const { createConnection } = require('typeorm');
const { User } = require('./src/models');

async function testUserCreationDirect() {
  console.log('🧪 Testing user creation directly...\n');

  try {
    // Connect to database
    const connection = await createConnection({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'kasirku_db',
      entities: [User],
      synchronize: false,
      logging: false
    });

    console.log('✅ Connected to database');

    const userRepository = connection.getRepository(User);

    // Test data exactly like API
    const testData = {
      username: 'direct_test_' + Date.now(),
      email: 'direct' + Date.now() + '@example.com',
      password: 'testpass123',
      fullName: 'Direct Test User',
      role: 'kasir',
      status: 'active',
      phone: '08123456789',
      isActive: true
    };

    console.log('📨 Test data:', testData);

    // Hash password exactly like UserController
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(testData.password, 10);
    console.log('🔒 Generated hash:', hashedPassword);

    // Create user
    console.log('💾 Creating user...');
    const user = userRepository.create({
      ...testData,
      password: hashedPassword
    });

    const savedUser = await userRepository.save(user);
    console.log('✅ User created:', savedUser.username);

    // Test login
    console.log('🔐 Testing login...');
    const isValid = await bcrypt.compare(testData.password, savedUser.password);
    console.log('✅ Password verification:', isValid);

    // Clean up
    await userRepository.delete(savedUser.id);
    console.log('🧹 Test user cleaned up');

    await connection.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUserCreationDirect();