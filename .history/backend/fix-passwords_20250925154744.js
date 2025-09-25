const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function fixExistingPasswords() {
  console.log('🔧 Fixing existing password hashes in database...\n');

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

    // Get all users
    const result = await client.query('SELECT id, username, password FROM users');
    console.log(`📊 Found ${result.rows.length} users to fix\n`);

    // Default passwords for different roles
    const defaultPasswords = {
      'admin': 'admin123',
      'kasir1': 'kasir123',
      'owner': 'owner123',
      'customer1': 'customer123',
      'nona': 'nona123',
      'roni': 'roni123',
      'owner1': 'owner123'
    };

    for (const user of result.rows) {
      console.log(`👤 Fixing user: ${user.username} (ID: ${user.id})`);

      // Determine the correct password for this user
      let correctPassword = defaultPasswords[user.username] || 'password123'; // fallback

      // Hash with bcryptjs (correct implementation)
      const correctHash = await bcrypt.hash(correctPassword, 12);
      console.log(`🔒 New hash: ${correctHash.substring(0, 20)}...`);

      // Update the password in database
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [correctHash, user.id]);
      console.log(`✅ Updated password for ${user.username}`);

      // Verify the new hash works
      const isValid = await bcrypt.compare(correctPassword, correctHash);
      console.log(`🔍 Verification: ${isValid ? '✅ PASS' : '❌ FAIL'}`);

      console.log('---');
    }

    console.log('\n🎉 All passwords have been fixed!');
    console.log('📋 Summary of default passwords:');
    Object.entries(defaultPasswords).forEach(([username, password]) => {
      console.log(`   ${username}: ${password}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

fixExistingPasswords();