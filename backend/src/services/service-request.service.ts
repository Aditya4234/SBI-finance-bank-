import { AppError, NotFoundError } from '../utils/errors';
import { getPersonalDb } from '../config/personal-db';

interface CreateRequestData {
  category: string;
  subject: string;
  description: string;
  priority?: string;
  attachments?: string[];
}

export class ServiceRequestService {
  async createRequest(userId: string, data: CreateRequestData) {
    const db = getPersonalDb();
    return db.serviceRequest.create({
      data: {
        userId,
        category: data.category,
        subject: data.subject,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        attachments: data.attachments || [],
      },
    });
  }

  async getUserRequests(userId: string) {
    const db = getPersonalDb();
    return db.serviceRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getRequestById(requestId: string, userId: string) {
    const db = getPersonalDb();
    const req = await db.serviceRequest.findFirst({ where: { id: requestId, userId } });
    if (!req) throw new NotFoundError('Service Request');
    return req;
  }

  async getAllRequests(page = 1, limit = 20, status?: string) {
    const db = getPersonalDb();
    const where: any = {};
    if (status) where.status = status;

    const [total, requests] = await Promise.all([
      db.serviceRequest.count({ where }),
      db.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { requests, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateRequestStatus(requestId: string, adminId: string, status: string, resolution?: string) {
    const db = getPersonalDb();
    const req = await db.serviceRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundError('Service Request');

    const updateData: any = { status, assignedTo: adminId };
    if (resolution) updateData.resolution = resolution;
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();
    if (status === 'CLOSED') updateData.closedAt = new Date();

    return db.serviceRequest.update({ where: { id: requestId }, data: updateData });
  }
}

export const serviceRequestService = new ServiceRequestService();
