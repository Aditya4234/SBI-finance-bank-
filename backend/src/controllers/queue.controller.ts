import { Response, NextFunction } from 'express';
import { queueService } from '../services/queue.service';
import { AuthenticatedRequest } from '../types';
import { emailQueue, transactionQueue, auditQueue, notificationQueue, reportQueue, kycQueue, loanQueue } from '../queues';

export class QueueController {
  async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await queueService.getMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }

  async triggerEmiCollection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await queueService.scheduleLoanEmiCollection();
      res.json({ success: true, message: 'EMI collection job queued' });
    } catch (error) {
      next(error);
    }
  }

  async triggerDefaultCheck(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await queueService.checkLoanDefaults();
      res.json({ success: true, message: 'Default check job queued' });
    } catch (error) {
      next(error);
    }
  }

  async retryFailedJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queues = [
        { name: 'email', queue: emailQueue },
        { name: 'transactions', queue: transactionQueue },
        { name: 'audit', queue: auditQueue },
        { name: 'notifications', queue: notificationQueue },
        { name: 'reports', queue: reportQueue },
        { name: 'kyc', queue: kycQueue },
        { name: 'loans', queue: loanQueue },
      ];

      const results: Array<{ queueName: string; retried: number }> = [];
      let totalRetried = 0;

      for (const { name, queue } of queues) {
        const failedJobs = await queue.getFailed();
        let retried = 0;
        for (const job of failedJobs) {
          await job.retry();
          retried++;
        }
        totalRetried += retried;
        results.push({ queueName: name, retried });
      }

      res.json({
        success: true,
        message: `${totalRetried} failed jobs retried`,
        data: { totalRetried, results },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const queueController = new QueueController();
