import { PrismaClient } from '../../generated/corporate-client';
import { config } from './index';
import { logger } from './logger';

let corporateClient: PrismaClient | null = null;

export const getCorporateDb = (): PrismaClient => {
  if (!corporateClient) {
    process.env.DATABASE_CORPORATE_URL = config.database.corporateUrl;
    corporateClient = new PrismaClient();
  }
  return corporateClient;
};

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectCorporateDb = async (): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getCorporateDb();
      await client.$connect();
      logger.info('Corporate banking database connected');
      return;
    } catch (error) {
      logger.error(`Corporate database connection error (attempt ${attempt}/${MAX_RETRIES}):`, error);
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

export const disconnectCorporateDb = async (): Promise<void> => {
  if (corporateClient) {
    await corporateClient.$disconnect();
    corporateClient = null;
  }
};
