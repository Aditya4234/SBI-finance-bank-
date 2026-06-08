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

export const connectCorporateDb = async (): Promise<void> => {
  try {
    const client = getCorporateDb();
    await client.$connect();
    logger.info('Corporate banking database connected');
  } catch (error) {
    logger.error('Corporate database connection error:', error);
    process.exit(1);
  }
};

export const disconnectCorporateDb = async (): Promise<void> => {
  if (corporateClient) {
    await corporateClient.$disconnect();
    corporateClient = null;
  }
};
