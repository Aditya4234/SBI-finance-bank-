import { Response, NextFunction } from 'express';
import { billPaymentService } from '../services/bill-payment.service';
import { AuthenticatedRequest } from '../types';

export class BillPaymentController {
  async payBill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await billPaymentService.payBill(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Bill paid successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async recharge(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await billPaymentService.recharge(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Recharge successful', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await billPaymentService.getBillHistory(req.user!.userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bill = await billPaymentService.getBillById(req.params.id, req.user!.userId);
      res.json({ success: true, data: bill });
    } catch (error) {
      next(error);
    }
  }

  async scheduleBill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await billPaymentService.scheduleBillPayment(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Bill scheduled successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPendingBills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bills = await billPaymentService.getPendingBills(req.user!.userId);
      res.json({ success: true, data: bills });
    } catch (error) {
      next(error);
    }
  }
}

export const billPaymentController = new BillPaymentController();
