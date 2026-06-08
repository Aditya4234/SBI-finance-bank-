import { getPersonalDb } from '../config/personal-db';
import { hashPassword, comparePassword } from '../models/User';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors';
import { logger } from '../config/logger';

const SENSITIVE_FIELDS = [
  'password',
  'refreshTokens',
  'twoFactorSecret',
  'passwordResetToken',
  'passwordResetExpires',
  'verificationToken',
  'verificationTokenExpires',
  'loginAttempts',
  'lockUntil',
];

export class ProfileService {
  async getProfile(userId: string) {
    const db = getPersonalDb();
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const sanitized = { ...user } as Record<string, any>;
    for (const field of SENSITIVE_FIELDS) {
      delete sanitized[field];
    }

    return sanitized as typeof user;
  }

  async updateProfile(userId: string, updates: { fullName?: string; mobile?: string; profileImage?: string }) {
    const db = getPersonalDb();

    if (updates.mobile) {
      const existing = await db.user.findFirst({
        where: { mobile: updates.mobile, id: { not: userId } },
      });
      if (existing) {
        throw new ValidationError({ mobile: ['Mobile number already in use'] });
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updates,
    });

    const sanitized = { ...user } as Record<string, any>;
    for (const field of SENSITIVE_FIELDS) {
      delete sanitized[field];
    }

    return sanitized as typeof user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const db = getPersonalDb();

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashed = await hashPassword(newPassword);

    await db.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        passwordChangedAt: new Date(),
      },
    });

    logger.info(`Password changed for user ${userId}`);
  }

  async updateProfileImage(userId: string, imageUrl: string) {
    const db = getPersonalDb();

    const user = await db.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
    });

    const sanitized = { ...user } as Record<string, any>;
    for (const field of SENSITIVE_FIELDS) {
      delete sanitized[field];
    }

    return sanitized as typeof user;
  }
}

export const profileService = new ProfileService();
