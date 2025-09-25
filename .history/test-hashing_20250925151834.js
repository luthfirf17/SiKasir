const bcrypt = require('bcryptjs');

async function testHashingConsistency() {
  console.log('🔐 Testing Password Hashing Consistency...\n');

  const password = 'testpass123';

  try {
    // Test different salt rounds
    console.log('📝 Original password:', password);

    // Hash with salt rounds 10 (used in login auto-fix)
    const hash10 = await bcrypt.hash(password, 10);
    console.log('🔒 Hash with 10 rounds:', hash10);

    // Hash with salt rounds 12 (used in user creation)
    const hash12 = await bcrypt.hash(password, 12);
    console.log('🔒 Hash with 12 rounds:', hash12);

    // Test verification
    console.log('\n✅ Verification tests:');

    // Verify original password against hash10
    const verify10 = await bcrypt.compare(password, hash10);
    console.log('Password vs hash10:', verify10);

    // Verify original password against hash12
    const verify12 = await bcrypt.compare(password, hash12);
    console.log('Password vs hash12:', verify12);

    // Cross verification (should fail)
    const crossVerify1 = await bcrypt.compare(password, hash10); // This should work
    const crossVerify2 = await bcrypt.compare(password, hash12); // This should work
    console.log('Cross verification works:', crossVerify1 && crossVerify2);

    // Test with wrong password
    const wrongVerify = await bcrypt.compare('wrongpass', hash12);
    console.log('Wrong password verification:', wrongVerify);

  } catch (error) {
    console.error('🚨 Hashing test error:', error.message);
  }
}

// Test the actual hashing used in controllers
async function testControllerHashing() {
  console.log('\n🏗️  Testing Controller Hashing Logic...\n');

  const password = 'testpass123';

  try {
    // Simulate UserController.createUser() hashing (12 rounds)
    console.log('📝 UserController.createUser() simulation:');
    const userCreationHash = await bcrypt.hash(password, 12);
    console.log('🔒 Created hash (12 rounds):', userCreationHash);

    // Simulate AuthController login verification
    console.log('\n🔐 AuthController.login() simulation:');
    const isValid = await bcrypt.compare(password, userCreationHash);
    console.log('✅ Direct verification:', isValid);

    // Simulate what happens if auto-fix runs (10 rounds)
    console.log('\n⚠️  Auto-fix simulation (demo users):');
    const autoFixHash = await bcrypt.hash(password, 10);
    console.log('🔒 Auto-fix hash (10 rounds):', autoFixHash);

    const isValidAfterAutoFix = await bcrypt.compare(password, autoFixHash);
    console.log('✅ Verification after auto-fix:', isValidAfterAutoFix);

    // Test if auto-fix breaks original hash verification
    const originalStillValid = await bcrypt.compare(password, userCreationHash);
    console.log('❓ Original hash still valid after auto-fix?', originalStillValid);

  } catch (error) {
    console.error('🚨 Controller test error:', error.message);
  }
}

async function runTests() {
  await testHashingConsistency();
  await testControllerHashing();
}

runTests();