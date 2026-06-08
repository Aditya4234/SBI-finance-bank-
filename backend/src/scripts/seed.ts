import { connectPersonalDb, disconnectPersonalDb, getPersonalDb } from '../config/personal-db';
import { hashPassword } from '../models/User';
import { logger } from '../config/logger';

const seedSuperAdmin = async () => {
  try {
    await connectPersonalDb();
    logger.info('Connected to Personal Database for seeding');

    const db = getPersonalDb();
    const existingAdmin = await db.user.findUnique({ where: { email: 'superadmin@sbi.com' } });
    if (!existingAdmin) {
      const hashed = await hashPassword('Admin@1234');
      await db.user.create({
        data: {
          fullName: 'Super Admin',
          email: 'superadmin@sbi.com',
          mobile: '9999999999',
          password: hashed,
          role: 'SUPER_ADMIN',
          isVerified: true,
          isKycCompleted: true,
        },
      });
      logger.info('Super admin created');
    } else {
      logger.info('Super admin already exists');
    }

    await disconnectPersonalDb();
    logger.info('Seeding completed');
  } catch (error) {
    logger.error('Seeding error:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
