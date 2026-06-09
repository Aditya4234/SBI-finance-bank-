import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    personalUrl: process.env.DATABASE_PERSONAL_URL || 'postgresql://postgres:postgres@localhost:5432/sbi_personal',
    corporateUrl: process.env.DATABASE_CORPORATE_URL || 'postgresql://postgres:postgres@localhost:5432/sbi_corporate',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@sbi.com',
  },
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173,https://sbi-finance-bank.vercel.app').split(',').map(s => s.trim()),
  corsAllowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  corsAllowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-device-id', 'x-device-name', 'x-correlation-id'],
  corsExposedHeaders: ['x-correlation-id', 'x-request-id'],
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-32chr',
};
