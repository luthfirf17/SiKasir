const bcrypt = require('bcryptjs');

async function testPasswordHashing() {
  console.log('🧪 Testing password hashing with bcrypt...\n');

  try {
    const testPassword = 'admin123';
    console.log(`🔑 Test password: ${testPassword}`);

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log(`🔒 Generated hash: ${hashedPassword}`);
    console.log(`📏 Hash length: ${hashedPassword.length}`);

    // Verify the hash
    console.log('\n🔍 Verifying hash...');
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`✅ Hash verification: ${isValid}`);

    // Test with wrong password
    console.log('\n🔍 Testing with wrong password...');
    const wrongPassword = 'wrong123';
    const isWrongValid = await bcrypt.compare(wrongPassword, hashedPassword);
    console.log(`❌ Wrong password verification: ${isWrongValid}`);

    // Test hash format
    console.log('\n📋 Hash format analysis:');
    console.log(`Starts with $2b$: ${hashedPassword.startsWith('$2b$')}`);
    console.log(`Salt rounds: ${hashedPassword.split('$')[2]}`);

    console.log('\n✅ Password hashing test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPasswordHashing();