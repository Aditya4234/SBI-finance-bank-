import bcrypt from 'bcryptjs';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  BANK_ADMIN = 'bank_admin',
  CORPORATE_ADMIN = 'corporate_admin',
  FINANCE_MANAGER = 'finance_manager',
  EMPLOYEE = 'employee',
  PERSONAL_CUSTOMER = 'personal_customer',
}

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  isKycCompleted: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  refreshTokens: string[];
  profileImage?: string;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  deviceInfo: IDeviceInfo[];
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IDeviceInfo {
  deviceId: string;
  deviceName: string;
  ip: string;
  userAgent: string;
  lastUsed: Date;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (candidatePassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};
