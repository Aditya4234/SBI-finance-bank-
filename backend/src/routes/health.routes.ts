import { Router, Request, Response } from 'express';
import { getPersonalDb } from '../config/personal-db';
import { getCorporateDb } from '../config/corporate-db';
import { getRedis } from '../config/redis';
import { getAllQueueMetrics } from '../queues';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const checks: Record<string, any> = {};
  let overallStatus = 'healthy';

  checks.uptime = {
    status: 'ok',
    value: process.uptime(),
    human: `${Math.floor(process.uptime() / 86400)}d ${Math.floor((process.uptime() % 86400) / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
  };

  try {
    const db = getPersonalDb();
    await db.$queryRaw`SELECT 1`;
    checks.personalDb = { status: 'ok' };
  } catch (error: any) {
    checks.personalDb = { status: 'error', message: error.message };
    overallStatus = 'degraded';
  }

  try {
    const db = getCorporateDb();
    await db.$queryRaw`SELECT 1`;
    checks.corporateDb = { status: 'ok' };
  } catch (error: any) {
    checks.corporateDb = { status: 'error', message: error.message };
    overallStatus = 'degraded';
  }

  try {
    const redis = getRedis();
    await redis.ping();
    checks.redis = { status: 'ok' };
  } catch (error: any) {
    checks.redis = { status: 'error', message: error.message };
    overallStatus = 'degraded';
  }

  try {
    const queueMetrics = await getAllQueueMetrics();
    checks.queues = { status: 'ok', metrics: queueMetrics };
  } catch (error: any) {
    checks.queues = { status: 'error', message: error.message };
    overallStatus = 'degraded';
  }

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    success: overallStatus === 'healthy',
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;
