const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function testLogin() {
  console.log('🧪 Testing login with fixed passwords...\n');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_DATABASE || 'kasirku_db'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Test cases
    const testCases = [
      { username: 'admin', password: 'admin123' },
      { username: 'kasir1', password: 'kasir123' },
      { username: 'owner', password: 'owner123' },
      { username: 'nona', password: 'nona123' },
      { username: 'roni', password: 'roni123' }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔐 Testing login for: ${testCase.username}`);

      // Get user from database
      const userResult = await client.query('SELECT id, username, password FROM users WHERE username = $1', [testCase.username]);

      if (userResult.rows.length === 0) {
        console.log(`❌ User ${testCase.username} not found`);
        continue;
      }

      const user = userResult.rows[0];
      console.log(`👤 Found user: ${user.username} (ID: ${user.id})`);
      console.log(`🔑 Stored hash: ${user.password.substring(0, 20)}...`);

      // Test password verification
      const isValid = await bcrypt.compare(testCase.password, user.password);
      console.log(`✅ Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);

      if (isValid) {
        console.log(`🎉 Login successful for ${testCase.username}!`);
      } else {
        console.log(`❌ Login failed for ${testCase.username}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

testLogin();
