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

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectPersonalDb = async (): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getPersonalDb();
      await client.$connect();
      logger.info('Personal banking database connected');
      return;
    } catch (error) {
      logger.error(`Personal database connection error (attempt ${attempt}/${MAX_RETRIES}):`, error);
      if (attempt < MAX_RETRIES) {
        logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        logger.error('Max retries reached. Exiting.');
        process.exit(1);
      }
    }
  }
};

export const disconnectPersonalDb = async (): Promise<void> => {
  if (personalClient) {
    await personalClient.$disconnect();
    personalClient = null;
  }
};
