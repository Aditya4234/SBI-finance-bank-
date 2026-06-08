import { PrismaClient } from '../../generated/personal-client';
import { config } from './index';
import { logger } from './logger';

let personalClient: PrismaClient | null = null;

export const getPersonalDb = (): PrismaClient => {
  if (!personalClient) {
    process.env.DATABASE_PERSONAL_URL = config.database.personalUrl;
    personalClient = new PrismaClient();
  }
  return personalClient;
};

export const connectPersonalDb = async (): Promise<void> => {
  try {
    const client = getPersonalDb();
    await client.$connect();
    logger.info('Personal banking database connected');
  } catch (error) {
    logger.error('Personal database connection error:', error);
    process.exit(1);
  }
};

export const disconnectPersonalDb = async (): Promise<void> => {
  if (personalClient) {
    await personalClient.$disconnect();
    personalClient = null;
  }
};
