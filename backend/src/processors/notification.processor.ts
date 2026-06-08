import { Job } from 'bull';
import { notificationQueue } from '../queues';
import { NotificationJobData } from '../queues/jobTypes';
import { logger } from '../config/logger';
import { getPersonalDb } from '../config/personal-db';

export const processNotificationQueue = async () => {
  notificationQueue.process(async (job: Job<NotificationJobData>) => {
    const { userId, type, title, message, metadata } = job.data;
    logger.info(`Processing notification job ${job.id}: ${type}`);

    const db = getPersonalDb();
    await db.notification.create({
      data: { userId, type: type as any, title, message, metadata: metadata || {} },
    });

    const totalUnread = await db.notification.count({ where: { userId, isRead: false } });
    return { totalUnread };
  });

  notificationQueue.on('completed', (job) => {
    logger.debug(`Notification job ${job.id} completed`);
  });
};
