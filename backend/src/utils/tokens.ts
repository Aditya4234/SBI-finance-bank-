import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { AuthPayload } from '../types';

export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
};

export const generateRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
};

export const verifyAccessToken = (token: string): AuthPayload => {
  return jwt.verify(token, config.jwt.secret) as AuthPayload;
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as AuthPayload;
};

export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateOtp = (length = 6): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};
