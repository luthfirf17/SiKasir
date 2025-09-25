const path = require('path');
const { AppDataSource } = require(path.join(__dirname, 'dist/config/database'));
const { User } = require(path.join(__dirname, 'dist/models/User'));

async function checkUsers() {
  try {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    console.log('🔍 Checking all users in database...');
    const allUsers = await userRepo.find();
    console.log('📊 Total users found:', allUsers.length);

    allUsers.forEach(user => {
      console.log('👤 User:', {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        passwordHash: user.password ? user.password.substring(0, 20) + '...' : 'NULL'
      });
    });

    // Check specific users
    console.log('\n🔍 Checking specific users:');
    const roniUser = await userRepo.findOne({ where: { username: 'roni' } });
    console.log('👤 roni:', roniUser ? 'FOUND' : 'NOT FOUND');

    const nonaUser = await userRepo.findOne({ where: { username: 'nona' } });
    console.log('👤 nona:', nonaUser ? 'FOUND' : 'NOT FOUND');

    const adminUser = await userRepo.findOne({ where: { username: 'admin' } });
    console.log('👤 admin:', adminUser ? 'FOUND' : 'NOT FOUND');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

checkUsers();