import { Response, NextFunction } from 'express';
import { corporateService } from '../services/corporate.service';
import { transactionService } from '../services/transaction.service';
import { accountService } from '../services/account.service';
import { AuthenticatedRequest } from '../types';

export class CorporateController {
  async createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await corporateService.createCompany(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Company registered successfully', data: company });
    } catch (error) {
      next(error);
    }
  }

  async addEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await corporateService.getCompanyByUser(req.user!.userId);
      const employee = await corporateService.addEmployee(company.id.toString(), req.body);
      res.status(201).json({ success: true, message: 'Employee added successfully', data: employee });
    } catch (error) {
      next(error);
    }
  }

  async getCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await corporateService.getCompanyByUser(req.user!.userId);
      res.json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  async openAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await corporateService.getCompanyByUser(req.user!.userId);
      const account = await accountService.openCorporateAccount(company.id.toString(), req.body);
      res.status(201).json({ success: true, message: 'Corporate account opened', data: account });
    } catch (error) {
      next(error);
    }
  }

  async getAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await corporateService.getCompanyByUser(req.user!.userId);
      const accounts = await accountService.getCorporateAccounts(company.id.toString());
      res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  async bulkPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await corporateService.getCompanyByUser(req.user!.userId);
      const { payments, fromAccount } = req.body;
      const result = await transactionService.bulkPayment(company.id.toString(), payments, fromAccount);
      res.status(201).json({ success: true, message: 'Bulk payment processed', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await corporateService.getCompanyByUser(req.user!.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await transactionService.getCorporateTransactions(company.id.toString(), page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const corporateController = new CorporateController();
