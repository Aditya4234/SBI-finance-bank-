import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { loanService } from '../services/loan.service';
import { accountService } from '../services/account.service';
import { AuthenticatedRequest } from '../types';

export class AdminController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'daily' | 'monthly' | 'yearly') || 'monthly';
      const analytics = await adminService.getRevenueAnalytics(period);
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }

  async getFraudAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await adminService.getFraudAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const result = await adminService.getCustomers(page, limit, search);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getPendingKyc(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.getPendingKyc(page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async approveKyc(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const doc = await adminService.approveKyc(documentId, req.user!.userId);
      res.json({ success: true, message: 'KYC approved', data: doc });
    } catch (error) {
      next(error);
    }
  }

  async rejectKyc(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const { remarks } = req.body;
      const doc = await adminService.rejectKyc(documentId, req.user!.userId, remarks);
      res.json({ success: true, message: 'KYC rejected', data: doc });
    } catch (error) {
      next(error);
    }
  }

  async getLoans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await loanService.getAllLoans(page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async approveLoan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { loanId } = req.params;
      const loan = await loanService.approveLoan(loanId, req.user!.userId);
      res.json({ success: true, message: 'Loan approved', data: loan });
    } catch (error) {
      next(error);
    }
  }

  async disburseLoan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { loanId, accountNumber } = req.body;
      const loan = await loanService.disburseLoan(loanId, accountNumber);
      res.json({ success: true, message: 'Loan disbursed', data: loan });
    } catch (error) {
      next(error);
    }
  }

  async rejectLoan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { loanId } = req.params;
      const { remarks } = req.body;
      const loan = await loanService.rejectLoan(loanId, req.user!.userId, remarks);
      res.json({ success: true, message: 'Loan rejected', data: loan });
    } catch (error) {
      next(error);
    }
  }

  async freezeAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId, type } = req.params;
      const account = await accountService.freezeAccount(accountId, type as 'personal' | 'corporate');
      res.json({ success: true, message: 'Account frozen', data: account });
    } catch (error) {
      next(error);
    }
  }

  async unfreezeAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId, type } = req.params;
      const account = await accountService.unfreezeAccount(accountId, type as 'personal' | 'corporate');
      res.json({ success: true, message: 'Account unfrozen', data: account });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const data = await adminService.generateReport(type as any);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
