const bcrypt = require('bcryptjs');
const { createConnection } = require('typeorm');
const { User } = require('./src/models/User.ts');

async function testUserCreation() {
  console.log('🧪 Testing user creation with password hashing...\n');

  try {
    // Connect to database
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'kasirku_db',
      entities: [User],
      synchronize: false,
      logging: false
    });

    console.log('✅ Connected to database');

    const userRepository = connection.getRepository(User);

    // Test password
    const testPassword = 'admin123';
    console.log(`🔑 Test password: ${testPassword}`);

    // Hash password manually
    console.log('🔐 Hashing password manually...');
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log(`🔒 Manual hash: ${hashedPassword.substring(0, 20)}...`);

    // Verify the hash
    console.log('🔍 Verifying manual hash...');
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`✅ Manual hash verification: ${isValid}`);

    // Create user
    console.log('\n💾 Creating test user...');
    const user = userRepository.create({
      username: 'test_admin_' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: hashedPassword,
      fullName: 'Test Admin',
      role: 'admin',
      status: 'active',
      isActive: true
    });

    const savedUser = await userRepository.save(user);
    console.log(`✅ User created with ID: ${savedUser.id}`);
    console.log(`🔑 Stored hash: ${savedUser.password.substring(0, 20)}...`);

    // Verify stored hash
    console.log('🔍 Verifying stored hash...');
    const storedIsValid = await bcrypt.compare(testPassword, savedUser.password);
    console.log(`✅ Stored hash verification: ${storedIsValid}`);

    // Clean up
    await userRepository.delete(savedUser.id);
    console.log('🧹 Test user cleaned up');

    await connection.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUserCreation();