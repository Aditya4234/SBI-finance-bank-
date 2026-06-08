import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

let redis: Redis | null = null;

export const getRedis = (): Redis => {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        if (times > 5) {
          logger.warn('Redis max retries reached');
          return null;
        }
        return delay;
      },
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.error('Redis error:', err));
  }
  return redis;
};

export const cacheData = async (key: string, data: any, ttl = 300): Promise<void> => {
  const client = getRedis();
  await client.setex(key, ttl, JSON.stringify(data));
};

export const getCachedData = async (key: string): Promise<any> => {
  const client = getRedis();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  const client = getRedis();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(...keys);
  }
};
