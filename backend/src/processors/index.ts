import { processEmailQueue } from './email.processor';
import { processTransactionQueue } from './transaction.processor';
import { processAuditQueue } from './audit.processor';
import { processNotificationQueue } from './notification.processor';
import { processKycQueue } from './kyc.processor';
import { processLoanQueue } from './loan.processor';
import { processReportQueue } from './report.processor';
import { logger } from '../config/logger';

export const startAllProcessors = async () => {
  logger.info('Starting all queue processors...');

  await Promise.all([
    processEmailQueue(),
    processTransactionQueue(),
    processAuditQueue(),
    processNotificationQueue(),
    processKycQueue(),
    processLoanQueue(),
    processReportQueue(),
  ]);

  logger.info('All queue processors started successfully');
};
