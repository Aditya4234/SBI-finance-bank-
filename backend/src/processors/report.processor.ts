import { Job } from 'bull';
import { reportQueue } from '../queues';
import { ReportJobData } from '../queues/jobTypes';
import { logger } from '../config/logger';
import { getPersonalDb } from '../config/personal-db';

export const processReportQueue = async () => {
  reportQueue.process(async (job: Job<ReportJobData>) => {
    const { type, filters } = job.data;
    logger.info(`Processing report job ${job.id}: ${type}`);

    const db = getPersonalDb();
    let data: any[] = [];

    switch (type) {
      case 'customers':
        data = await db.user.findMany({
          where: filters || {},
          select: { id: true, fullName: true, email: true, mobile: true, role: true, createdAt: true },
        });
        break;
      case 'transactions':
        data = await db.transaction.findMany({
          where: filters || {},
          orderBy: { createdAt: 'desc' },
          take: 5000,
        });
        break;
      case 'loans':
        data = await db.loan.findMany({
          where: filters || {},
          include: { user: { select: { fullName: true, email: true } } },
        });
        break;
      case 'kyc':
        data = await db.kycDocument.findMany({
          where: filters || {},
          include: { user: { select: { fullName: true, email: true } } },
        });
        break;
    }

    return { type, recordCount: data.length, generatedAt: new Date(), data };
  });
};
