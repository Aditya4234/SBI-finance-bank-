import { Response, NextFunction } from 'express';
import { depositService } from '../services/deposit.service';
import { AuthenticatedRequest } from '../types';

export class DepositController {
  async openFixedDeposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId, amount, tenureMonths, interestRate, nominee } = req.body;
      const fd = await depositService.openFixedDeposit(req.user!.userId, accountId, amount, tenureMonths, interestRate, nominee);
      res.status(201).json({ success: true, message: 'Fixed deposit opened successfully', data: fd });
    } catch (error) {
      next(error);
    }
  }

  async getFixedDeposits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const fds = await depositService.getUserFixedDeposits(req.user!.userId);
      res.json({ success: true, data: fds });
    } catch (error) {
      next(error);
    }
  }

  async getFixedDeposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const fd = await depositService.getFixedDepositById(req.params.id, req.user!.userId);
      res.json({ success: true, data: fd });
    } catch (error) {
      next(error);
    }
  }

  async closeFixedDeposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { premature } = req.body;
      const result = await depositService.closeFixedDeposit(req.params.id, req.user!.userId, premature);
      res.json({ success: true, message: 'Fixed deposit closed', data: result });
    } catch (error) {
      next(error);
    }
  }

  async openRecurringDeposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId, monthlyAmount, tenureMonths, interestRate, nominee } = req.body;
      const rd = await depositService.openRecurringDeposit(req.user!.userId, accountId, monthlyAmount, tenureMonths, interestRate, nominee);
      res.status(201).json({ success: true, message: 'Recurring deposit opened successfully', data: rd });
    } catch (error) {
      next(error);
    }
  }

  async getRecurringDeposits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rds = await depositService.getUserRecurringDeposits(req.user!.userId);
      res.json({ success: true, data: rds });
    } catch (error) {
      next(error);
    }
  }

  async getRecurringDeposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rd = await depositService.getRecurringDepositById(req.params.id, req.user!.userId);
      res.json({ success: true, data: rd });
    } catch (error) {
      next(error);
    }
  }

  async makeRdPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await depositService.makeRdPayment(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'RD installment paid', data: result });
    } catch (error) {
      next(error);
    }
  }

  async closeRecurringDeposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { premature } = req.body;
      const result = await depositService.closeRecurringDeposit(req.params.id, req.user!.userId, premature);
      res.json({ success: true, message: 'Recurring deposit closed', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const depositController = new DepositController();
