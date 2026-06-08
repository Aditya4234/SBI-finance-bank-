import { Response, NextFunction } from 'express';
import { serviceRequestService } from '../services/service-request.service';
import { AuthenticatedRequest } from '../types';

export class ServiceRequestController {
  async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const request = await serviceRequestService.createRequest(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Service request created', data: request });
    } catch (error) {
      next(error);
    }
  }

  async getUserRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requests = await serviceRequestService.getUserRequests(req.user!.userId);
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  }

  async getRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const request = await serviceRequestService.getRequestById(req.params.id, req.user!.userId);
      res.json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }

  async getAllRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const result = await serviceRequestService.getAllRequests(page, limit, status);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateRequestStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, resolution } = req.body;
      const request = await serviceRequestService.updateRequestStatus(req.params.id, req.user!.userId, status, resolution);
      res.json({ success: true, message: 'Request status updated', data: request });
    } catch (error) {
      next(error);
    }
  }
}

export const serviceRequestController = new ServiceRequestController();
