const fetch = require('node-fetch');

async function testUserCreationAndLogin() {
  const baseUrl = 'http://localhost:3003/api/v1';
  const testUsername = 'testuser_' + Date.now();
  const testPassword = 'testpass123';
  const testEmail = `${testUsername}@test.com`;

  console.log('🧪 Testing User Creation and Login Flow...\n');

  try {
    // Step 1: Create user via admin endpoint
    console.log('📝 Step 1: Creating user via admin endpoint...');
    const createResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real scenario, this would need admin authentication
      },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: testPassword,
        fullName: 'Test User',
        role: 'kasir',
        phone: '081234567890'
      }),
    });

    const createData = await createResponse.json();
    console.log('📊 Create User Response:', createResponse.status);
    console.log('📋 Create Data:', JSON.stringify(createData, null, 2));

    if (!createData.success) {
      console.log('❌ User creation failed');
      return;
    }

    // Step 2: Try to login with the created user
    console.log('\n🔐 Step 2: Testing login with created user...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUsername,
        password: testPassword,
        role: 'kasir'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('📊 Login Response:', loginResponse.status);
    console.log('📋 Login Data:', JSON.stringify(loginData, null, 2));

    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log('👤 User:', loginData.data.user.username);
      console.log('🔑 Token received:', !!loginData.data.token);
    } else {
      console.log('❌ Login failed:', loginData.message);

      // Step 3: Debug - Check if user exists in database
      console.log('\n🔍 Step 3: Checking if user exists...');
      const checkUserResponse = await fetch(`${baseUrl}/users?search=${testUsername}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const checkData = await checkUserResponse.json();
      console.log('📊 Check User Response:', checkUserResponse.status);
      console.log('📋 Users found:', checkData.data?.users?.length || 0);

      if (checkData.data?.users?.length > 0) {
        const user = checkData.data.users[0];
        console.log('👤 Found user:', {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        });
      }
    }

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Test bcrypt hashing directly
async function testBcryptHashing() {
  console.log('\n🔐 Testing bcrypt hashing directly...');

  try {
    const bcrypt = require('bcryptjs');
    const password = 'testpass123';
    const saltRounds = 12;

    console.log('📝 Original password:', password);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('🔒 Hashed password:', hashedPassword);

    // Verify password
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Password verification:', isValid);

    // Test with wrong password
    const isValidWrong = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log('❌ Wrong password verification:', isValidWrong);

  } catch (error) {
    console.error('🚨 Bcrypt test error:', error.message);
  }
}

async function runAllTests() {
  await testBcryptHashing();
  await testUserCreationAndLogin();
}

runAllTests();