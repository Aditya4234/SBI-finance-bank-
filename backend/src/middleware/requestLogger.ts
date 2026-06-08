import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { logger } from '../config/logger';
import { getContext } from '../context/app-context';

export const requestLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ctx = getContext();
    const userId = req.user?.userId || ctx.userId || '-';

    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms [user:${userId}] [correlation:${ctx.correlationId}]`
    );
  });

  next();
};
