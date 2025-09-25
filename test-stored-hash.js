const bcrypt = require('bcryptjs');

async function testStoredHash() {
  console.log('🔍 Testing Stored Hash Verification...\n');

  // The actual stored hash from database
  const storedHash = '$2b$12$Zh5SoRRLNmf4784iP5vgHOqre5EqWv8blSHKo2I5pmzgYr4h0CBa2';

  // Possible passwords that might have been hashed
  const possiblePasswords = [
    'roni123',      // Expected password
    'roni',         // Just username
    '',             // Empty password
    'password',     // Default password
    '123456',       // Common password
    'roni123 ',     // With trailing space
    ' roni123',     // With leading space
    'RONI123',      // Uppercase
    'roni1234',     // With extra character
    '123roni',      // Reversed
  ];

  console.log('Stored hash:', storedHash);
  console.log('Testing against possible passwords:\n');

  for (const password of possiblePasswords) {
    const isValid = await bcrypt.compare(password, storedHash);
    console.log(`Password "${password}": ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
  }

  console.log('\n🔧 What would the correct hash be for "roni123"?');
  const correctHash = await bcrypt.hash('roni123', 12);
  console.log('Correct hash for "roni123":', correctHash);

  const correctVerify = await bcrypt.compare('roni123', correctHash);
  console.log('Verification of correct hash:', correctVerify ? '✅' : '❌');

  console.log('\n🔍 Comparing hash formats:');
  console.log('Stored hash starts with:', storedHash.substring(0, 7));
  console.log('Correct hash starts with:', correctHash.substring(0, 7));

  console.log('\n❓ Why is stored hash different?');
  console.log('1. Password was hashed with different input');
  console.log('2. Hash was corrupted during storage');
  console.log('3. Different bcrypt version/algorithm used');
  console.log('4. Password was changed after creation');
}

testStoredHash();