const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 Testing login API...');
    
    const response = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      }),
    });

    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('👤 User:', data.data.user.username);
      console.log('🔑 Token received:', data.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('🚨 Error testing login:', error.message);
  }
}

testLogin();
