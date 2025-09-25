const path = require('path');
const { AppDataSource } = require(path.join(__dirname, 'dist/config/database'));
const { User } = require(path.join(__dirname, 'dist/models/User'));
const bcrypt = require('bcryptjs');

async function analyzePasswordHashes() {
  try {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    console.log('🔍 Analyzing Password Hashes in Database...\n');

    // Get specific users
    const users = await userRepo.find({
      where: [
        { username: 'roni' },
        { username: 'nona' },
        { username: 'admin' }
      ]
    });

    for (const user of users) {
      console.log(`👤 User: ${user.username}`);
      console.log(`   Stored hash: ${user.password}`);
      console.log(`   Hash starts with: ${user.password.substring(0, 7)}`);

      // Test expected passwords
      const expectedPasswords = [user.username + '123', user.username + '123']; // roni123, nona123, admin123

      for (const expectedPass of expectedPasswords) {
        const isValid = await bcrypt.compare(expectedPass, user.password);
        console.log(`   Password "${expectedPass}": ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
      }

      // Test what the hash should be
      const correctHash = await bcrypt.hash(user.username + '123', 12);
      console.log(`   Expected hash would be: ${correctHash.substring(0, 20)}...`);
      console.log(`   Current hash matches expected: ${await bcrypt.compare(user.username + '123', user.password) ? '✅' : '❌'}`);

      console.log('─'.repeat(60));
    }

    // Test creating a new hash to see if hashing works
    console.log('🔧 Testing hash creation...');
    const testPassword = 'roni123';
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log(`New hash for "${testPassword}": ${newHash}`);

    const verifyNew = await bcrypt.compare(testPassword, newHash);
    console.log(`Verification of new hash: ${verifyNew ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

analyzePasswordHashes();