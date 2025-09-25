const bcrypt = require('bcryptjs');

async function testSaltRoundsIssue() {
  console.log('🔍 Testing Salt Rounds Consistency Issue...\n');

  const password = 'testpass123';

  try {
    // Simulate user creation (12 rounds)
    console.log('📝 Step 1: User Creation (12 rounds)');
    const creationHash = await bcrypt.hash(password, 12);
    console.log('🔒 Stored hash (12 rounds):', creationHash);

    // Simulate first login (no auto-fix for regular users)
    console.log('\n🔐 Step 2: First Login (Regular User)');
    const firstLoginValid = await bcrypt.compare(password, creationHash);
    console.log('✅ First login success:', firstLoginValid);

    // Simulate demo user login (auto-fix with 10 rounds)
    console.log('\n⚠️  Step 3: Demo User Login (Auto-fix to 10 rounds)');
    const demoHash = await bcrypt.hash(password, 10);
    console.log('🔒 Auto-fixed hash (10 rounds):', demoHash);

    const demoLoginValid = await bcrypt.compare(password, demoHash);
    console.log('✅ Demo login success:', demoLoginValid);

    // Test if original hash still works after demo auto-fix
    console.log('\n❓ Step 4: Cross-verification Test');
    const originalStillWorks = await bcrypt.compare(password, creationHash);
    const demoHashWorks = await bcrypt.compare(password, demoHash);
    console.log('Original 12-round hash still valid:', originalStillWorks);
    console.log('Demo 10-round hash valid:', demoHashWorks);

    // Test the actual issue: what if auto-fix runs on regular user?
    console.log('\n🚨 Step 5: Testing Potential Bug Scenario');
    console.log('What if auto-fix accidentally runs on regular user?');

    // Simulate wrong auto-fix on regular user
    const wrongAutoFixHash = await bcrypt.hash(password, 10); // Wrong rounds!
    const wrongVerification = await bcrypt.compare(password, wrongAutoFixHash);
    console.log('Wrong auto-fix verification:', wrongVerification);

    // But original hash becomes invalid
    const originalNowInvalid = await bcrypt.compare(password, creationHash);
    console.log('Original hash still valid after wrong auto-fix?', originalNowInvalid);

    console.log('\n📊 Summary:');
    console.log('✅ bcrypt itself works correctly');
    console.log('❓ Issue might be in logic, not hashing algorithm');

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Test what happens if we have different bcrypt versions or implementations
async function testBcryptCompatibility() {
  console.log('\n🔧 Testing bcrypt Compatibility...\n');

  const password = 'testpass123';

  try {
    // Test multiple hashes of same password
    const hashes = [];
    for (let i = 0; i < 3; i++) {
      const hash = await bcrypt.hash(password, 12);
      hashes.push(hash);
      console.log(`Hash ${i + 1}:`, hash);
    }

    // Verify all hashes work
    console.log('\n✅ Verification of all hashes:');
    for (let i = 0; i < hashes.length; i++) {
      const valid = await bcrypt.compare(password, hashes[i]);
      console.log(`Hash ${i + 1} valid:`, valid);
    }

    // Test cross-verification (should all work)
    console.log('\n🔄 Cross-verification (all hashes should work with same password):');
    const allValid = hashes.every(hash => bcrypt.compare(password, hash));
    console.log('All hashes valid with same password:', await Promise.all(hashes.map(h => bcrypt.compare(password, h))).then(results => results.every(r => r)));

  } catch (error) {
    console.error('🚨 Compatibility test error:', error.message);
  }
}

async function runAllTests() {
  await testSaltRoundsIssue();
  await testBcryptCompatibility();
}

runAllTests();