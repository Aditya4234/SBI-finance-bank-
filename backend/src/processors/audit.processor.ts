import { Job } from 'bull';
import { auditQueue } from '../queues';
import { AuditJobData } from '../queues/jobTypes';
import { logger } from '../config/logger';
import { getPersonalDb } from '../config/personal-db';

export const processAuditQueue = async () => {
  auditQueue.process(async (job: Job<AuditJobData>) => {
    const data = job.data;
    logger.info(`Processing audit job ${job.id}: ${data.action}`);

    const db = getPersonalDb();
    await db.auditLog.create({
      data: {
        userId: data.userId || 'system',
        action: data.action as any,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
      },
    });
  });

  auditQueue.on('completed', (job) => {
    logger.debug(`Audit job ${job.id} completed`);
  });

  auditQueue.on('failed', (job, err) => {
    logger.error(`Audit job ${job?.id} failed:`, err);
  });
};
