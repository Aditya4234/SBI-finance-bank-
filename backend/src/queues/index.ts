import Bull from 'bull';
import { config } from '../config';
import { logger } from '../config/logger';

const redisConfig: Bull.QueueOptions = {
  redis: {
    url: config.redis.url,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
};

const createQueue = (name: string): Bull.Queue => {
  const queue = new Bull(name, redisConfig);

  queue.on('error', (err) => logger.error(`Queue ${name} error:`, err));
  queue.on('waiting', (jobId) => logger.debug(`Queue ${name}: job ${jobId} waiting`));
  queue.on('active', (job) => logger.debug(`Queue ${name}: job ${job.id} active`));
  queue.on('completed', (job) => logger.debug(`Queue ${name}: job ${job.id} completed`));
  queue.on('failed', (job, err) => logger.error(`Queue ${name}: job ${job?.id} failed:`, err));

  return queue;
};

export const emailQueue = createQueue('email');
export const transactionQueue = createQueue('transactions');
export const auditQueue = createQueue('audit');
export const notificationQueue = createQueue('notifications');
export const reportQueue = createQueue('reports');
export const kycQueue = createQueue('kyc');
export const loanQueue = createQueue('loans');

export const addJob = async <T>(queue: Bull.Queue, data: T, options?: Bull.JobOptions) => {
  return queue.add(data, {
    ...options,
    attempts: options?.attempts || 3,
  });
};

export const getQueueMetrics = async (queue: Bull.Queue) => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  return { waiting, active, completed, failed, delayed };
};

export const getAllQueueMetrics = async () => {
  const queues = [emailQueue, transactionQueue, auditQueue, notificationQueue, reportQueue, kycQueue, loanQueue];
  const metrics = await Promise.all(queues.map(async (q) => ({
    name: q.name,
    metrics: await getQueueMetrics(q),
  })));
  return metrics;
};

export const closeAllQueues = async () => {
  const queues = [emailQueue, transactionQueue, auditQueue, notificationQueue, reportQueue, kycQueue, loanQueue];
  await Promise.all(queues.map((q) => q.close()));
};
