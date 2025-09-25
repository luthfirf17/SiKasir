const bcrypt = require('bcryptjs');

async function testBcryptIssues() {
  console.log('🔐 Testing bcrypt Issues...\n');

  const password = 'roni123';

  try {
    // Test multiple hashing rounds
    console.log('📝 Testing password:', password);

    // Test different salt rounds
    for (let rounds = 10; rounds <= 12; rounds++) {
      const hash = await bcrypt.hash(password, rounds);
      console.log(`Hash with ${rounds} rounds: ${hash}`);

      const verify = await bcrypt.compare(password, hash);
      console.log(`Verification with ${rounds} rounds: ${verify ? '✅' : '❌'}`);
    }

    console.log('\n🔄 Testing hash format consistency...');

    // Test if $2a$ and $2b$ formats are compatible
    const hash2a = await bcrypt.hash(password, 12); // Usually $2a$
    const hash2b = hash2a.replace('$2a$', '$2b$'); // Convert to $2b$

    console.log('Hash 2a format:', hash2a);
    console.log('Hash 2b format:', hash2b);

    const verify2a = await bcrypt.compare(password, hash2a);
    const verify2b = await bcrypt.compare(password, hash2b);

    console.log('Verify 2a format:', verify2a ? '✅' : '❌');
    console.log('Verify 2b format:', verify2b ? '✅' : '❌');

    console.log('\n🔍 Analyzing stored hash format...');

    // Get the actual stored hash from database (from previous test)
    const storedHash = '$2b$12$Zh5SoRRLNmf4784iP5vgHOqre5EqWv8blSHKo2I5pmzgYr4h0CBa2';

    console.log('Stored hash:', storedHash);
    console.log('Stored hash format:', storedHash.substring(0, 4));

    // Test if stored hash can be verified
    const storedVerify = await bcrypt.compare(password, storedHash);
    console.log('Verify stored hash with correct password:', storedVerify ? '✅' : '❌');

    // Test with wrong password
    const wrongVerify = await bcrypt.compare('wrongpass', storedHash);
    console.log('Verify stored hash with wrong password:', wrongVerify ? '✅' : '❌');

    console.log('\n🔧 Testing hash info extraction...');

    // Extract info from stored hash
    const parts = storedHash.split('$');
    if (parts.length >= 4) {
      const version = parts[1];
      const cost = parts[2];
      console.log(`Hash version: ${version}`);
      console.log(`Cost factor: ${cost}`);
    }

    console.log('\n📊 bcrypt version info:');
    console.log('bcryptjs version:', require('bcryptjs/package.json').version);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testBcryptIssues();