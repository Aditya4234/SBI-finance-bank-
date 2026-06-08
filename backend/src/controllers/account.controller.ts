import { Request, Response, NextFunction } from 'express';
import { accountService } from '../services/account.service';
import { AuthenticatedRequest } from '../types';

export class AccountController {
  async openAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const account = await accountService.openPersonalAccount(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Account opened successfully', data: account });
    } catch (error) {
      next(error);
    }
  }

  async getAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accounts = await accountService.getPersonalAccounts(req.user!.userId);
      res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const balance = await accountService.getBalance(req.user!.userId, accountId);
      res.json({ success: true, data: balance });
    } catch (error) {
      next(error);
    }
  }

  async getMiniStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const statement = await accountService.getMiniStatement(req.user!.userId, accountId);
      res.json({ success: true, data: statement });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await accountService.getTransactionHistory(req.user!.userId, accountId, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async closeAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const { reason } = req.body;
      const account = await accountService.closeAccount(req.user!.userId, accountId, reason);
      res.json({ success: true, message: 'Account closed successfully', data: account });
    } catch (error) {
      next(error);
    }
  }

  async getClosedAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accounts = await accountService.getClosedAccounts(req.user!.userId);
      res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }
}

export const accountController = new AccountController();
