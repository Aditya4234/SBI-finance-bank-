import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AuditAction } from '../models/AuditLog';
import { queueService } from '../services/queue.service';

export const auditLog = (action: AuditAction, resource: string) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const originalSend = _res.send.bind(_res);

    _res.send = function (body: any) {
      const status = _res.statusCode < 400 ? 'success' : 'failure';

      queueService.logAudit({
        userId: req.user?.userId,
        action,
        resource,
        resourceId: req.params?.id || req.body?.id,
        details: {
          method: req.method,
          path: req.path,
          body: req.method !== 'GET' ? req.body : undefined,
        },
        ipAddress: req.ipAddress || req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || '',
        status,
      }).catch(() => {});

      return originalSend(body);
    };

    next();
  };
};
