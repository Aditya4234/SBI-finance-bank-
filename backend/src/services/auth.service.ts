import { UserRole } from '../models/User';
import { AuditAction } from '../models/AuditLog';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generatePasswordResetToken, generateVerificationToken, generateOtp } from '../utils/tokens';
import { AppError, UnauthorizedError } from '../utils/errors';
import { AuthPayload } from '../types';
import { queueService } from './queue.service';
import { getRedis, cacheData, getCachedData } from '../config/redis';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { hashPassword, comparePassword } from '../models/User';
import { getPersonalDb } from '../config/personal-db';
import { eventBus } from '../events/event-bus';
import { DomainEvents } from '../events/events';

export class AuthService {
  async register(userData: { fullName: string; email: string; mobile: string; password: string }) {
    const db = getPersonalDb();

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { mobile: userData.mobile }],
      },
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new AppError('Email already registered', 409);
      }
      throw new AppError('Mobile number already registered', 409);
    }

    const verificationToken = generateVerificationToken();
    const hashed = await hashPassword(userData.password);

    const user = await db.user.create({
      data: {
        fullName: userData.fullName,
        email: userData.email,
        mobile: userData.mobile,
        password: hashed,
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        role: 'PERSONAL_CUSTOMER' as any,
      },
    });

    await queueService.sendEmail({
      type: 'verification',
      to: user.email,
      payload: { token: verificationToken },
    });

    const payload: AuthPayload = {
      userId: user.id,
      role: user.role as unknown as UserRole,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await db.user.update({
      where: { id: user.id },
      data: { refreshTokens: [refreshToken] },
    });

    eventBus.emit(DomainEvents.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string, deviceInfo?: any) {
    const db = getPersonalDb();

    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');

    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new AppError(`Account locked. Try again in ${remainingTime} minutes`, 423);
    }

    if (!user.isActive) throw new AppError('Account is deactivated', 403);

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const loginAttempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts };
      if (loginAttempts >= 5) {
        updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        updateData.loginAttempts = 0;
      }
      await db.user.update({ where: { id: user.id }, data: updateData });
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: AuthPayload = {
      userId: user.id,
      role: user.role as unknown as UserRole,
      companyId: user.companyId || undefined,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const deviceInfoFromUser: any[] = [];
    const refreshTokens = [...(user.refreshTokens as string[]), refreshToken];
    if (refreshTokens.length > 5) {
      refreshTokens.shift();
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
        refreshTokens,
      },
    });

    if (deviceInfo) {
      const existing = Array.isArray(deviceInfoFromUser) ? deviceInfoFromUser.find((d: any) => d.deviceId === deviceInfo.deviceId) : null;
      if (!existing) {
        await db.deviceInfo.create({
          data: {
            userId: user.id,
            deviceId: deviceInfo.deviceId || 'unknown',
            deviceName: deviceInfo.deviceName || 'Unknown Device',
            ip: deviceInfo.ip || 'unknown',
            userAgent: deviceInfo.userAgent || '',
          },
        });
      } else {
        await db.deviceInfo.updateMany({
          where: { userId: user.id, deviceId: deviceInfo.deviceId },
          data: { lastUsed: new Date() },
        });
      }
    }

    eventBus.emit(DomainEvents.USER_LOGGED_IN, {
      userId: user.id,
      email: user.email,
      deviceInfo,
      ipAddress: deviceInfo?.ip,
      userAgent: deviceInfo?.userAgent,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      requiresTwoFactor: user.twoFactorEnabled,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const db = getPersonalDb();
      const user = await db.user.findUnique({ where: { id: decoded.userId } });
      if (!user || !user.isActive) throw new UnauthorizedError('Invalid token');

      const storedTokens = user.refreshTokens as string[];
      const storedToken = storedTokens.find(t => t === refreshToken);
      if (!storedToken) throw new UnauthorizedError('Token not found');

      const newRefreshTokens = storedTokens.filter(t => t !== refreshToken);

      const payload: AuthPayload = {
        userId: user.id,
        role: user.role as unknown as UserRole,
        companyId: user.companyId || undefined,
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshTokenVal = generateRefreshToken(payload);

      newRefreshTokens.push(newRefreshTokenVal);
      await db.user.update({
        where: { id: user.id },
        data: { refreshTokens: newRefreshTokens },
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshTokenVal };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    const db = getPersonalDb();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      const storedTokens = user.refreshTokens as string[];
      const newRefreshTokens = storedTokens.filter(t => t !== refreshToken);
      await db.user.update({
        where: { id: userId },
        data: { refreshTokens: newRefreshTokens },
      });

      eventBus.emit(DomainEvents.USER_LOGGED_OUT, { userId });
    }
  }

  async forgotPassword(email: string) {
    const db = getPersonalDb();
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { message: 'Password reset email sent if account exists' };

    const resetToken = generatePasswordResetToken();
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await queueService.sendEmail({
      type: 'password-reset',
      to: user.email,
      payload: { token: resetToken },
    });
    return { message: 'Password reset email sent if account exists' };
  }

  async resetPassword(token: string, newPassword: string) {
    const db = getPersonalDb();
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    const hashed = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshTokens: [],
      },
    });

    return { message: 'Password reset successful' };
  }

  async verifyEmail(token: string) {
    const db = getPersonalDb();
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() },
      },
    });

    if (!user) throw new AppError('Invalid or expired verification token', 400);

    await db.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async enable2fa(userId: string) {
    const db = getPersonalDb();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'SBI Banking', secret);
    const qrCode = await qrcode.toDataURL(otpauth);

    await db.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, qrCode };
  }

  async verify2fa(userId: string, token: string) {
    const db = getPersonalDb();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new AppError('2FA not set up', 400);
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) throw new AppError('Invalid 2FA token', 400);

    await db.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: '2FA enabled successfully' };
  }

  async verifyOtp(email: string, otp: string) {
    const storedOtp = await getCachedData(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new AppError('Invalid or expired OTP', 400);
    }
    return { message: 'OTP verified successfully' };
  }

  async sendOtp(email: string) {
    const otp = generateOtp();
    await cacheData(`otp:${email}`, otp, 600);
    await queueService.sendEmail({
      type: 'otp',
      to: email,
      payload: { otp },
    });
    return { message: 'OTP sent successfully' };
  }

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isVerified: user.isVerified,
      isKycCompleted: user.isKycCompleted,
      twoFactorEnabled: user.twoFactorEnabled,
      profileImage: user.profileImage,
      companyId: user.companyId,
    };
  }
}

export const authService = new AuthService();
