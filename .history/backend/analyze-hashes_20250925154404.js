const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function analyzeStoredHashes() {
  console.log('🔍 Analyzing stored password hashes in database...\n');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'kasirku_db'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get all users
    const result = await client.query('SELECT id, username, password FROM users LIMIT 10');
    console.log(`📊 Found ${result.rows.length} users\n`);

    for (const user of result.rows) {
      console.log(`👤 User: ${user.username} (ID: ${user.id})`);
      console.log(`🔑 Stored hash: ${user.password}`);
      console.log(`📏 Hash length: ${user.password.length}`);
      console.log(`🔢 Hash prefix: ${user.password.substring(0, 4)}`);
      console.log(`⚙️ Salt rounds: ${user.password.split('$')[2]}`);

      // Test common passwords
      const testPasswords = ['admin123', 'kasir123', 'password', '123456'];
      let foundMatch = false;

      for (const testPass of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPass, user.password);
          if (isValid) {
            console.log(`✅ Password match found: "${testPass}"`);
            foundMatch = true;
            break;
          }
        } catch (error) {
          console.log(`❌ Error comparing with "${testPass}": ${error.message}`);
        }
      }

      if (!foundMatch) {
        console.log('❌ No password match found for common passwords');
      }

      console.log('---');
    }

    // Test fresh hash generation
    console.log('\n🆕 Testing fresh hash generation:');
    const freshHash = await bcrypt.hash('admin123', 12);
    console.log(`🔒 Fresh hash: ${freshHash}`);
    console.log(`📏 Fresh hash length: ${freshHash.length}`);
    console.log(`🔢 Fresh hash prefix: ${freshHash.substring(0, 4)}`);

    // Compare fresh hash with itself
    const selfTest = await bcrypt.compare('admin123', freshHash);
    console.log(`✅ Fresh hash self-test: ${selfTest}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

analyzeStoredHashes();