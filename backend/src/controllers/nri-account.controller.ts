import { Response, NextFunction } from 'express';
import { nriAccountService } from '../services/nri-account.service';
import { AuthenticatedRequest } from '../types';

export class NriAccountController {
  async openNriAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const account = await nriAccountService.openNriAccount(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'NRI account opened successfully', data: account });
    } catch (error) {
      next(error);
    }
  }

  async getNriAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accounts = await nriAccountService.getNriAccounts(req.user!.userId);
      res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  async getNriAccountDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const account = await nriAccountService.getNriAccountDetails(accountId, req.user!.userId);
      res.json({ success: true, data: account });
    } catch (error) {
      next(error);
    }
  }

  async updateNriDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const account = await nriAccountService.updateNriDetails(accountId, req.user!.userId, req.body);
      res.json({ success: true, message: 'NRI account details updated successfully', data: account });
    } catch (error) {
      next(error);
    }
  }
}

export const nriAccountController = new NriAccountController();
