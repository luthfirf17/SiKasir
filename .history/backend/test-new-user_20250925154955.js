const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function testNewUserCreation() {
  console.log('🆕 Testing creation of new user...\n');

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

    const testUsername = 'test_admin_' + Date.now();
    const testPassword = 'testpass123';
    const testEmail = `test${Date.now()}@example.com`;

    console.log(`👤 Creating new user: ${testUsername}`);
    console.log(`🔑 Password: ${testPassword}`);

    // Hash password using bcryptjs (same as UserController)
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log(`🔒 Generated hash: ${hashedPassword.substring(0, 20)}...`);

    // Insert user directly (simulating UserController behavior)
    const insertQuery = `
      INSERT INTO users (id, username, email, password, full_name, role, status, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, username, password
    `;

    const insertResult = await client.query(insertQuery, [
      testUsername,
      testEmail,
      hashedPassword,
      'Test Admin User',
      'admin',
      'active',
      true
    ]);

    const newUser = insertResult.rows[0];
    console.log(`✅ User created with ID: ${newUser.id}`);
    console.log(`🔑 Stored hash: ${newUser.password.substring(0, 20)}...`);

    // Test login with the new user
    console.log('\n🔐 Testing login for new user...');
    const isValid = await bcrypt.compare(testPassword, newUser.password);
    console.log(`✅ Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);

    if (isValid) {
      console.log(`🎉 New user login works correctly!`);
    }

    // Clean up
    await client.query('DELETE FROM users WHERE id = $1', [newUser.id]);
    console.log('🧹 Test user cleaned up');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

testNewUserCreation();