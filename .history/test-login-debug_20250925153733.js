const { spawn } = require('child_process');
const fetch = require('node-fetch');

async function startBackendAndTest() {
  console.log('🚀 Starting backend server...\n');

  // Start backend server
  const backend = spawn('npm', ['start'], {
    cwd: '/Users/macbookprom1/Documents/Kuliah/Projek /KasirKu/Kasirku/kasir-modern/backend',
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '3003' }
  });

  let backendReady = false;

  // Listen for backend output
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📝 Backend:', output.trim());

    if (output.includes('Server is running on port 3003') && !backendReady) {
      backendReady = true;
      console.log('\n✅ Backend ready! Starting login tests...\n');
      testLogins();
    }
  });

  backend.stderr.on('data', (data) => {
    console.error('❌ Backend Error:', data.toString().trim());
  });

  // Test login function
  async function testLogins() {
    const baseUrl = 'http://localhost:3003/api/v1';

    // Test cases
    const testCases = [
      { username: 'roni', password: 'roni123', role: 'kasir', description: 'New user created by admin' },
      { username: 'admin', password: 'admin123', role: 'admin', description: 'Demo admin user' },
      { username: 'nona', password: 'nona123', role: 'kasir', description: 'Demo kasir user' }
    ];

    for (const test of testCases) {
      console.log(`🧪 Testing login: ${test.username} (${test.description})`);

      try {
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: test.username,
            password: test.password,
            role: test.role
          }),
        });

        const data = await response.json();
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Result: ${data.success ? '✅ SUCCESS' : '❌ FAILED'} - ${data.message}`);

        if (data.success) {
          console.log(`👤 User: ${data.data?.user?.username} (${data.data?.user?.role})`);
        }

      } catch (error) {
        console.error(`🚨 Error testing ${test.username}:`, error.message);
      }

      console.log('─'.repeat(50));
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🛑 Stopping backend...');
    backend.kill('SIGINT');

    // Wait for backend to stop
    setTimeout(() => {
      console.log('✅ Test completed');
      process.exit(0);
    }, 2000);
  }

  // Timeout if backend doesn't start
  setTimeout(() => {
    if (!backendReady) {
      console.error('⏰ Backend startup timeout');
      backend.kill('SIGINT');
      process.exit(1);
    }
  }, 30000); // 30 seconds timeout
}

startBackendAndTest();