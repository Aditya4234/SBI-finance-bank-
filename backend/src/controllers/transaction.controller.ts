import { Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { AuthenticatedRequest } from '../types';

export class TransactionController {
  async transfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionService.transfer({
        ...req.body,
        userId: req.user!.userId,
        ipAddress: req.ipAddress,
        deviceId: req.deviceId,
      });
      res.status(201).json({ success: true, message: 'Transfer successful', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await transactionService.getTransactionHistory(req.user!.userId, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async upiPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionService.upiPayment({
        ...req.body,
        userId: req.user!.userId,
        ipAddress: req.ipAddress,
      });
      res.status(201).json({ success: true, message: 'UPI payment successful', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUpiHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await transactionService.getUpiHistory(req.user!.userId, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
