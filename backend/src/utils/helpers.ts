import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { config } from '../config';

export const generateAccountNumber = (): string => {
  const prefix = 'SBIN';
  const random = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return `${prefix}${random}`;
};

export const generateIfscCode = (): string => {
  const prefix = 'SBIN';
  const branchCode = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}0${branchCode}`;
};

export const generateTransactionId = (): string => {
  const prefix = 'TXN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().substring(0, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const generateCardNumber = (network: string): string => {
  const prefix = network === 'VISA' ? '4' : '5';
  const random = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${random}`;
};

export const generateCvv = (): string => {
  return Math.floor(100 + Math.random() * 900).toString();
};

export const generateExpiryDate = (years = 5): Date => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date;
};

export const encryptData = (text: string): string => {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    crypto.scryptSync(config.encryptionKey, 'salt', 32),
    crypto.randomBytes(16)
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateEmi = (principal: number, rate: number, tenure: number): number => {
  const monthlyRate = rate / (12 * 100);
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
};

export const slugify = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};
