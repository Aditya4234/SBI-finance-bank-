import { Response, NextFunction } from 'express';
import { loanService } from '../services/loan.service';
import { AuthenticatedRequest } from '../types';

export class LoanController {
  async applyLoan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const loan = await loanService.applyForLoan(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Loan application submitted', data: loan });
    } catch (error) {
      next(error);
    }
  }

  async getUserLoans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const loans = await loanService.getUserLoans(req.user!.userId);
      res.json({ success: true, data: loans });
    } catch (error) {
      next(error);
    }
  }

  async getLoanStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { loanId } = req.params;
      const loan = await loanService.getLoanStatus(loanId, req.user!.userId);
      res.json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  }

  async calculateEmi(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { amount, rate, tenure } = req.body;
      const { calculateEmi } = require('../utils/helpers');
      const emi = calculateEmi(amount, rate, tenure);
      res.json({
        success: true,
        data: { emi, totalPayable: emi * tenure, totalInterest: emi * tenure - amount },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const loanController = new LoanController();
