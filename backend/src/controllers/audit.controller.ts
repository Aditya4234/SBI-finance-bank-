import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { auditService } from '../services/audit.service';

export class AuditController {
  async getMyLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await auditService.getAuditLogs(req.user!.userId, page, limit);
      res.json({
        success: true,
        message: 'Audit logs fetched',
        data: result.logs,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        userId: req.query.userId as string | undefined,
        action: req.query.action as string | undefined,
        resource: req.query.resource as string | undefined,
      };
      const result = await auditService.getAllAuditLogs(page, limit, filters);
      res.json({
        success: true,
        message: 'All audit logs fetched',
        data: result.logs,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
