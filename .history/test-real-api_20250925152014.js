const fetch = require('node-fetch');

async function testRealUserCreationAndLogin() {
  const baseUrl = 'http://localhost:3003/api/v1';
  const testUsername = 'testuser_' + Date.now();
  const testPassword = 'testpass123';
  const testEmail = `${testUsername}@test.com`;

  console.log('🧪 Testing Real User Creation and Login...\n');
  console.log('👤 Test User:', testUsername);
  console.log('🔑 Test Password:', testPassword);
  console.log('📧 Test Email:', testEmail);
  console.log();

  try {
    // Step 1: Try to register user (if registration is open)
    console.log('📝 Step 1: Attempting user registration...');
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: testPassword,
        fullName: 'Test User API',
        role: 'kasir',
        phone: '081234567890'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('📊 Register Response:', registerResponse.status);
    console.log('📋 Register Data:', JSON.stringify(registerData, null, 2));

    let userCreated = registerData.success;

    // If registration fails, try admin user creation (this might fail without auth)
    if (!userCreated) {
      console.log('\n📝 Step 1b: Attempting admin user creation...');
      const adminCreateResponse = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: No admin auth token - this will likely fail
        },
        body: JSON.stringify({
          username: testUsername,
          email: testEmail,
          password: testPassword,
          fullName: 'Test User Admin',
          role: 'kasir',
          phone: '081234567890'
        }),
      });

      const adminCreateData = await adminCreateResponse.json();
      console.log('📊 Admin Create Response:', adminCreateResponse.status);
      console.log('📋 Admin Create Data:', JSON.stringify(adminCreateData, null, 2));
      userCreated = adminCreateData.success;
    }

    if (!userCreated) {
      console.log('❌ User creation failed - cannot proceed with login test');
      return;
    }

    // Step 2: Try to login immediately
    console.log('\n🔐 Step 2: Testing immediate login...');
    const loginResponse1 = await fetch(`${baseUrl}/auth/login`, {
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

    const loginData1 = await loginResponse1.json();
    console.log('📊 Login Response:', loginResponse1.status);
    console.log('📋 Login Data:', JSON.stringify(loginData1, null, 2));

    if (loginData1.success) {
      console.log('✅ First login successful!');
    } else {
      console.log('❌ First login failed:', loginData1.message);
    }

    // Step 3: Try to login again (second attempt)
    console.log('\n🔐 Step 3: Testing second login attempt...');
    const loginResponse2 = await fetch(`${baseUrl}/auth/login`, {
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

    const loginData2 = await loginResponse2.json();
    console.log('📊 Second Login Response:', loginResponse2.status);
    console.log('📋 Second Login Data:', JSON.stringify(loginData2, null, 2));

    if (loginData2.success) {
      console.log('✅ Second login successful!');
    } else {
      console.log('❌ Second login failed:', loginData2.message);

      // Step 4: Debug - Check user in database
      console.log('\n🔍 Step 4: Checking user in database...');
      const checkResponse = await fetch(`${baseUrl}/users?search=${testUsername}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const checkData = await checkResponse.json();
      console.log('📊 Check User Response:', checkResponse.status);

      if (checkData.success && checkData.data.users.length > 0) {
        const user = checkData.data.users[0];
        console.log('👤 User found:', {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          status: user.status
        });
      } else {
        console.log('❌ User not found in database');
      }
    }

    // Step 5: Test with wrong password
    console.log('\n🔐 Step 5: Testing with wrong password...');
    const wrongLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUsername,
        password: 'wrongpassword',
        role: 'kasir'
      }),
    });

    const wrongLoginData = await wrongLoginResponse.json();
    console.log('📊 Wrong Password Response:', wrongLoginResponse.status);
    console.log('❌ Wrong password correctly rejected:', !wrongLoginData.success);

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Test existing demo user to see if auto-fix works
async function testDemoUserLogin() {
  console.log('\n🎭 Testing Demo User Login (with auto-fix)...\n');

  const demoUsers = [
    { username: 'nona', password: 'nona123', role: 'kasir' },
    { username: 'admin', password: 'admin123', role: 'admin' }
  ];

  for (const demo of demoUsers) {
    console.log(`👤 Testing demo user: ${demo.username}`);

    try {
      const response = await fetch('http://localhost:3003/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(demo),
      });

      const data = await response.json();
      console.log(`📊 Response: ${response.status} - ${data.success ? '✅' : '❌'} ${data.message || 'Success'}`);

      if (data.success) {
        console.log(`🔑 Token received: ${!!data.data.token}`);
      }

    } catch (error) {
      console.error(`🚨 Error testing ${demo.username}:`, error.message);
    }

    console.log();
  }
}

async function runAllTests() {
  await testDemoUserLogin();
  await testRealUserCreationAndLogin();
}

runAllTests();