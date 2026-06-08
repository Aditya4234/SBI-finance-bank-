import { getPersonalDb } from '../config/personal-db';

export class AuditService {
  async getAuditLogs(userId: string, page = 1, limit = 20) {
    const db = getPersonalDb();
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.auditLog.count({ where: { userId } }),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllAuditLogs(
    page = 1,
    limit = 20,
    filters?: { userId?: string; action?: string; resource?: string }
  ) {
    const db = getPersonalDb();
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.resource) where.resource = { contains: filters.resource, mode: 'insensitive' };

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const auditService = new AuditService();
