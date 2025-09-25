import 'reflect-metadata';
import { initializeDatabase, AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../models/User';
import bcrypt from 'bcryptjs';

// Utility function to create default users
async function createDefaultUsers() {
  const userRepository = AppDataSource.getRepository(User);

  const defaultUsers = [
    {
      username: 'admin',
      email: 'admin@kasirku.com',
      password: 'admin123',
      fullName: 'Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: '081234567890',
      address: 'Jakarta, Indonesia'
    },
    {
      username: 'owner',
      email: 'owner@kasirku.com',
      password: 'owner123',
      fullName: 'Owner Manager',
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      phone: '081234567891',
      address: 'Jakarta, Indonesia'
    },
    {
      username: 'kasir',
      email: 'kasir@kasirku.com',
      password: 'kasir123',
      fullName: 'Kasir POS',
      role: UserRole.KASIR,
      status: UserStatus.ACTIVE,
      phone: '081234567892',
      address: 'Jakarta, Indonesia'
    },
    {
      username: 'kitchen',
      email: 'kitchen@kasirku.com',
      password: 'kitchen123',
      fullName: 'Kitchen Staff',
      role: UserRole.KITCHEN,
      status: UserStatus.ACTIVE,
      phone: '081234567893',
      address: 'Jakarta, Indonesia'
    }
  ];

  console.log('👥 Creating default users...');

  for (const userData of defaultUsers) {
    try {
      const existingUser = await userRepository.findOne({
        where: { username: userData.username }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const user = userRepository.create({
          ...userData,
          password: hashedPassword,
          isActive: true
        });

        await userRepository.save(user);
        console.log(`✅ Created default user: ${userData.username} (password: ${userData.password})`);
      } else {
        console.log(`ℹ️  User ${userData.username} already exists, skipping...`);
      }
    } catch (error) {
      console.log(`⚠️  Error creating user ${userData.username}:`, error instanceof Error ? error.message : String(error));
    }
  }

  console.log('✅ Default user creation completed');
}

// Main execution
async function main() {
  try {
    await initializeDatabase();
    await createDefaultUsers();
    console.log('🎉 Setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { createDefaultUsers };